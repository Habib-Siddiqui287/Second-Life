from rest_framework import serializers
from connections.models import Connection, Delivery
from donations.serializers import DonationListSerializer
from accounts.serializers import UserSerializer

class DeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = Delivery
        fields = [
            'id', 'tracking_code', 'status', 'courier_name', 'courier_phone',
            'vehicle_info', 'estimated_arrival', 'timeline_steps', 'created_at'
        ]

class ConnectionSerializer(serializers.ModelSerializer):
    donation = DonationListSerializer(read_only=True)
    donor = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    delivery = DeliverySerializer(read_only=True)

    class Meta:
        model = Connection
        fields = [
            'id', 'donation', 'donor', 'receiver', 'status',
            'scheduled_date', 'pickup_time_slot', 'pickup_address',
            'courier_notes', 'delivery', 'completed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'completed_at', 'created_at', 'updated_at']
