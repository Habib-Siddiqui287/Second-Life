import uuid
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError, PermissionDenied

from donations.models import Donation
from item_requests.models import DonationRequest
from connections.models import Connection, Delivery
from dashboard.models import ActivityLog
from services.notification_service import NotificationService

class ConnectionService:
    @staticmethod
    @transaction.atomic
    def approve_request(donation_request_id: int, donor_user, scheduled_date="Tomorrow, 10:00 AM", pickup_time_slot="10:00 AM - 12:00 PM", notes=""):
        req = DonationRequest.objects.select_for_update().get(id=donation_request_id)
        donation = Donation.objects.select_for_update().get(id=req.donation_id)

        # Permission check: Only the donor of this donation or an admin can approve
        if donor_user.role != 'ADMIN' and donation.donor_id != donor_user.id:
            raise PermissionDenied("You do not have permission to approve requests for this donation.")

        if req.status != DonationRequest.Status.PENDING:
            raise ValidationError(f"Request cannot be approved because its status is {req.status}.")

        # Update Request
        req.status = DonationRequest.Status.APPROVED
        req.save(update_fields=['status', 'updated_at'])

        # Update Donation status
        donation.status = Donation.Status.MATCHED
        donation.save(update_fields=['status', 'updated_at'])

        # Create Connection
        connection = Connection.objects.create(
            donation=donation,
            donor=donation.donor,
            receiver=req.receiver,
            request=req,
            status=Connection.Status.ACCEPTED,
            scheduled_date=scheduled_date or "Tomorrow, 10:00 AM",
            pickup_time_slot=pickup_time_slot or "10:00 AM - 12:00 PM",
            pickup_address=donation.location,
            courier_notes=notes or ""
        )

        # Create Delivery timeline
        tracking_num = f"SL-{uuid.uuid4().hex[:8].upper()}"
        initial_steps = [
            {"step": "Request Approved", "status": "COMPLETED", "timestamp": timezone.now().strftime("%b %d, %Y %I:%M %p")},
            {"step": "Connection Scheduled", "status": "COMPLETED", "timestamp": timezone.now().strftime("%b %d, %Y %I:%M %p")},
            {"step": "Processing & Prep", "status": "IN_PROGRESS", "timestamp": "Estimated " + (scheduled_date or "Tomorrow")},
            {"step": "Handover & Delivery", "status": "PENDING", "timestamp": "Pending pickup"},
            {"step": "Impact Recorded", "status": "PENDING", "timestamp": "Pending completion"},
        ]

        delivery = Delivery.objects.create(
            connection=connection,
            tracking_code=tracking_num,
            status=Delivery.DeliveryStatus.SCHEDULED,
            estimated_arrival=f"{scheduled_date} ({pickup_time_slot})",
            timeline_steps=initial_steps
        )

        # Notify Receiver
        NotificationService.send(
            user=req.receiver,
            title="Request Approved! 🎉",
            message=f"Your request for '{donation.title}' has been accepted by {donation.donor.name}. Scheduled for {scheduled_date}.",
            notif_type="REQUEST_APPROVED",
            link=f"/receiver/connections/{connection.id}"
        )

        # Notify Donor
        NotificationService.send(
            user=donation.donor,
            title="Match Confirmed",
            message=f"You agreed to hand over '{donation.title}' to {req.receiver.name}. Pickup scheduled for {scheduled_date}.",
            notif_type="CONNECTION_CREATED",
            link=f"/donor/connections/{connection.id}"
        )

        # Log Activity
        ActivityLog.objects.create(
            user=donor_user,
            action="REQUEST_APPROVED",
            description=f"{donor_user.name} approved request #{req.id} for donation '{donation.title}'. Connection #{connection.id} established."
        )

        return connection

    @staticmethod
    @transaction.atomic
    def reject_request(donation_request_id: int, donor_user, reason=""):
        req = DonationRequest.objects.select_for_update().get(id=donation_request_id)
        donation = req.donation

        if donor_user.role != 'ADMIN' and donation.donor_id != donor_user.id:
            raise PermissionDenied("You do not have permission to reject this request.")

        if req.status != DonationRequest.Status.PENDING:
            raise ValidationError(f"Request cannot be rejected because its status is {req.status}.")

        req.status = DonationRequest.Status.REJECTED
        req.rejection_reason = reason or "Item is no longer available or was matched with another recipient."
        req.save(update_fields=['status', 'rejection_reason', 'updated_at'])

        NotificationService.send(
            user=req.receiver,
            title="Request Update",
            message=f"Your request for '{donation.title}' could not be fulfilled at this time: {req.rejection_reason}",
            notif_type="REQUEST_REJECTED",
            link="/receiver/requests"
        )

        ActivityLog.objects.create(
            user=donor_user,
            action="REQUEST_REJECTED",
            description=f"{donor_user.name} declined request #{req.id} for donation '{donation.title}'."
        )

        return req

    @staticmethod
    @transaction.atomic
    def update_delivery_status(connection_id: int, new_status: str, admin_or_courier_user=None):
        connection = Connection.objects.select_for_update().get(id=connection_id)
        delivery = connection.delivery

        valid_transitions = {
            'SCHEDULED': ['PROCESSING', 'TRANSIT', 'CANCELLED'],
            'PROCESSING': ['TRANSIT', 'ARRIVING'],
            'TRANSIT': ['ARRIVING', 'DELIVERED'],
            'ARRIVING': ['DELIVERED'],
            'DELIVERED': ['COMPLETED'],
        }

        delivery.status = new_status
        now_str = timezone.now().strftime("%b %d, %Y %I:%M %p")

        # Update timeline step
        steps = delivery.timeline_steps or []
        for s in steps:
            if new_status in s['step'].upper():
                s['status'] = 'COMPLETED'
                s['timestamp'] = now_str
        delivery.timeline_steps = steps
        delivery.save()

        if new_status == 'DELIVERED':
            connection.status = Connection.Status.DELIVERED
            connection.donation.status = Donation.Status.DELIVERED
            connection.donation.save(update_fields=['status', 'updated_at'])
            connection.save(update_fields=['status', 'updated_at'])

            NotificationService.send(
                user=connection.receiver,
                title="Item Delivered! 📦",
                message=f"'{connection.donation.title}' has been successfully delivered/received.",
                notif_type="DELIVERY_UPDATE",
                link=f"/receiver/connections/{connection.id}"
            )
            NotificationService.send(
                user=connection.donor,
                title="Handover Complete!",
                message=f"'{connection.donation.title}' was successfully delivered to {connection.receiver.name}.",
                notif_type="DONATION_DELIVERED",
                link=f"/donor/connections/{connection.id}"
            )

        return connection
