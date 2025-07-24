from rest_framework import serializers
from .models import Conversation, Message, MessageAttachment
from users.serializers import UserSerializer
from products.serializers import ProductSerializer


class MessageAttachmentSerializer(serializers.ModelSerializer):
    """Serializer for message attachments"""
    # Use a SerializerMethodField to ensure the full URL is always returned
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = MessageAttachment
        fields = ['id', 'file_url', 'file_type', 'file_name', 'file_size', 'created_at']

    def get_file_url(self, obj):
        if obj.file and hasattr(obj.file, 'url'):
            return obj.file.url
        return None


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for messages"""
    
    sender = UserSerializer(read_only=True)
    attachments = MessageAttachmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'content', 'is_read', 'is_edited',
            'timestamp', 'edited_at', 'read_at', 'attachments'
        ]
        read_only_fields = ['sender', 'timestamp', 'edited_at', 'read_at']


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer for conversations"""
    
    participants = UserSerializer(many=True, read_only=True)
    product = ProductSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'participants', 'product', 'created_at', 'updated_at',
            'last_message', 'unread_count'
        ]
    
    def get_last_message(self, obj):
        """Get the last message in the conversation"""
        last_message = obj.last_message
        if last_message:
            return {
                'id': last_message.id,
                'content': last_message.content,
                'timestamp': last_message.timestamp,
                'sender_id': last_message.sender.id,
                'is_read': last_message.is_read
            }
        return None
    
    def get_unread_count(self, obj):
        """Get unread message count for the current user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(
                is_read=False
            ).exclude(sender=request.user).count()
        return 0


class ConversationCreateSerializer(serializers.Serializer):
    """Serializer for creating conversations"""
    
    seller_id = serializers.IntegerField()
    product_id = serializers.IntegerField(required=False)
    
    def validate_seller_id(self, value):
        """Validate seller exists"""
        from users.models import User
        try:
            User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Seller not found")
        return value
    
    def validate_product_id(self, value):
        """Validate product exists"""
        if value:
            from products.models import Product
            try:
                Product.objects.get(id=value)
            except Product.DoesNotExist:
                raise serializers.ValidationError("Product not found")
        return value
