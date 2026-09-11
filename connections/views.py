from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q

from connections.models import Connection, Delivery
from connections.serializers import ConnectionSerializer, DeliverySerializer
from accounts.permissions import IsAdmin
from donations.models import Donation
from services.notification_service import NotificationService
from dashboard.models import ActivityLog

class ConnectionListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        queryset = Connection.objects.all().select_related(
            'donation', 'donation__category', 'donation__donor', 'donor', 'receiver', 'delivery'
        ).prefetch_related('donation__images')

        if user.role == 'DONOR':
            queryset = queryset.filter(donor=user)
        elif user.role == 'RECEIVER':
            queryset = queryset.filter(receiver=user)

        filter_type = request.query_params.get('filter', 'ALL').upper()
        if filter_type == 'UPCOMING':
            queryset = queryset.exclude(status__in=['COMPLETED', 'CANCELLED'])
        elif filter_type == 'COMPLETED':
            queryset = queryset.filter(status='COMPLETED')

        serializer = ConnectionSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

class ConnectionDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            connection = Connection.objects.select_related(
                'donation', 'donation__category', 'donation__donor', 'donor', 'receiver', 'delivery'
            ).prefetch_related('donation__images').get(pk=pk)
        except Connection.DoesNotExist:
            return Response({'error': 'Connection not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role != 'ADMIN' and connection.donor_id != request.user.id and connection.receiver_id != request.user.id:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        return Response(ConnectionSerializer(connection, context={'request': request}).data)

    def patch(self, request, pk):
        try:
            connection = Connection.objects.get(pk=pk)
        except Connection.DoesNotExist:
            return Response({'error': 'Connection not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role != 'ADMIN' and connection.donor_id != request.user.id and connection.receiver_id != request.user.id:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        # Allow updating scheduled date/time slot
        if 'scheduled_date' in request.data:
            connection.scheduled_date = request.data['scheduled_date']
        if 'pickup_time_slot' in request.data:
            connection.pickup_time_slot = request.data['pickup_time_slot']
        if 'courier_notes' in request.data:
            connection.courier_notes = request.data['courier_notes']

        connection.save()
        return Response(ConnectionSerializer(connection, context={'request': request}).data)

class ConnectionCompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            connection = Connection.objects.select_related('donation', 'donor', 'receiver', 'delivery').get(pk=pk)
        except Connection.DoesNotExist:
            return Response({'error': 'Connection not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role != 'ADMIN' and connection.donor_id != request.user.id and connection.receiver_id != request.user.id:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        connection.status = Connection.Status.COMPLETED
        connection.completed_at = timezone.now()
        connection.save(update_fields=['status', 'completed_at', 'updated_at'])

        # Update donation status
        donation = connection.donation
        donation.status = Donation.Status.COMPLETED
        donation.save(update_fields=['status', 'updated_at'])

        # Update delivery timeline
        if hasattr(connection, 'delivery'):
            delivery = connection.delivery
            delivery.status = Delivery.DeliveryStatus.DELIVERED
            steps = delivery.timeline_steps or []
            now_str = timezone.now().strftime("%b %d, %Y %I:%M %p")
            for s in steps:
                s['status'] = 'COMPLETED'
            steps.append({"step": "Impact Confirmed", "status": "COMPLETED", "timestamp": now_str})
            delivery.timeline_steps = steps
            delivery.save()

        # Send completion notifications
        NotificationService.send(
            user=connection.donor,
            title="Donation Completed! 🎉",
            message=f"'{donation.title}' has been delivered to {connection.receiver.name}. Thank you for making an impact!",
            notif_type="DONATION_DELIVERED",
            link=f"/donor/connections/{connection.id}"
        )
        NotificationService.send(
            user=connection.receiver,
            title="Exchange Completed! 💚",
            message=f"You successfully received '{donation.title}' from {connection.donor.name}. Give it a second life!",
            notif_type="DONATION_DELIVERED",
            link=f"/receiver/connections/{connection.id}"
        )

        ActivityLog.objects.create(
            user=request.user,
            action="CONNECTION_COMPLETED",
            description=f"Exchange completed for donation #{donation.id} '{donation.title}' between {connection.donor.name} and {connection.receiver.name}."
        )

        return Response({
            'message': 'Exchange marked as completed! Social & ecological impact recorded.',
            'connection': ConnectionSerializer(connection, context={'request': request}).data
        })

class AdminConnectionListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        queryset = Connection.objects.all().select_related(
            'donation', 'donation__category', 'donor', 'receiver', 'delivery'
        )
        status_param = request.query_params.get('status')
        if status_param and status_param.upper() != 'ALL':
            queryset = queryset.filter(status=status_param.upper())

        serializer = ConnectionSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
