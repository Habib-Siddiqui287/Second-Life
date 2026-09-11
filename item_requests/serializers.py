from rest_framework import serializers
from item_requests.models import DonationRequest
from donations.models import Donation
from donations.serializers import DonationListSerializer
from accounts.serializers import UserSerializer
from services.notification_service import NotificationService
from dashboard.models import ActivityLog

class DonationRequestSerializer(serializers.ModelSerializer):
    donation = DonationListSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    connection_id = serializers.SerializerMethodField()

    class Meta:
        model = DonationRequest
        fields = [
            'id', 'donation', 'receiver', 'message', 'status',
            'rejection_reason', 'connection_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'rejection_reason', 'created_at', 'updated_at']

    def get_connection_id(self, obj):
        if hasattr(obj, 'connection'):
            return obj.connection.id
        return None

class DonationRequestCreateSerializer(serializers.ModelSerializer):
    donation_id = serializers.IntegerField(required=True)

    class Meta:
        model = DonationRequest
        fields = ['id', 'donation_id', 'message']

    def validate(self, attrs):
        user = self.context['request'].user
        donation_id = attrs.get('donation_id')

        try:
            donation = Donation.objects.get(id=donation_id)
        except Donation.DoesNotExist:
            raise serializers.ValidationError({"donation_id": "Specified donation does not exist."})

        if donation.donor_id == user.id:
            raise serializers.ValidationError({"donation_id": "You cannot request your own donation."})

        if donation.status != Donation.Status.AVAILABLE:
            raise serializers.ValidationError({"donation_id": f"This item is no longer available (Status: {donation.status})."})

        # Check if already requested and pending
        if DonationRequest.objects.filter(donation=donation, receiver=user, status__in=['PENDING', 'APPROVED']).exists():
            raise serializers.ValidationError({"donation_id": "You already have an active request for this item."})

        attrs['donation_obj'] = donation
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        donation = validated_data.pop('donation_obj')
        validated_data.pop('donation_id')

        req = DonationRequest.objects.create(
            donation=donation,
            receiver=user,
            **validated_data
        )

        # Notify Donor
        NotificationService.send(
            user=donation.donor,
            title="New Item Request! 📬",
            message=f"{user.name} submitted a request for your donation '{donation.title}'.",
            notif_type="REQUEST_RECEIVED",
            link=f"/donor/requests"
        )

        # Activity log
        ActivityLog.objects.create(
            user=user,
            action="REQUEST_SUBMITTED",
            description=f"Receiver {user.name} requested item '{donation.title}' from donor {donation.donor.name}."
        )

        return req
