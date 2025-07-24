from rest_framework import serializers
from .models import Notification, NotificationPreference
from users.serializers import UserSerializer
from products.serializers import ProductSerializer


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications"""
    
    sender = UserSerializer(read_only=True)
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'sender', 'notification_type', 'title', 'message',
            'product', 'conversation', 'is_read', 'created_at', 'read_at'
        ]
        read_only_fields = ['created_at', 'read_at']


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for notification preferences"""
    
    class Meta:
        model = NotificationPreference
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']
