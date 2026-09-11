from rest_framework import serializers
from dashboard.models import ActivityLog, ContactMessage

class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', default='System', read_only=True)
    user_role = serializers.CharField(source='user.role', default='SYSTEM', read_only=True)

    class Meta:
        model = ActivityLog
        fields = ['id', 'user_name', 'user_role', 'action', 'description', 'ip_address', 'created_at']

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'is_resolved', 'admin_notes', 'created_at']
        read_only_fields = ['id', 'is_resolved', 'created_at']
