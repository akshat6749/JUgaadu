from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django.conf import settings
import pusher
from .models import Notification, NotificationPreference
from .serializers import NotificationSerializer, NotificationPreferenceSerializer


class NotificationListView(generics.ListAPIView):
    """List user notifications"""
    
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(
            recipient=self.request.user
        ).select_related('sender', 'product').order_by('-created_at')


class NotificationDetailView(generics.RetrieveUpdateAPIView):
    """Notification detail and mark as read"""
    
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        """Mark notification as read when retrieved"""
        instance = self.get_object()
        instance.mark_as_read()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_read(request):
    """Mark all notifications as read"""
    
    notifications = Notification.objects.filter(
        recipient=request.user,
        is_read=False
    )
    
    count = notifications.count()
    notifications.update(
        is_read=True,
        read_at=timezone.now()
    )
    
    return Response({
        'message': f'{count} notifications marked as read'
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def unread_count(request):
    """Get unread notification count"""
    
    count = Notification.objects.filter(
        recipient=request.user,
        is_read=False
    ).count()
    
    return Response({'unread_count': count})


class NotificationPreferenceView(generics.RetrieveUpdateAPIView):
    """User notification preferences"""
    
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        preferences, created = NotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return preferences


# ============ Pusher Push Helper ============

def _get_pusher_client():
    """Get a configured Pusher client instance."""
    config = settings.PUSHER_CONFIG
    return pusher.Pusher(
        app_id=config['app_id'],
        key=config['key'],
        secret=config['secret'],
        cluster=config['cluster'],
        ssl=True
    )


def _push_notification(notification):
    """Push a notification to the user via Pusher."""
    try:
        pusher_client = _get_pusher_client()
        channel_name = f'private-notifications-{notification.recipient.id}'
        
        data = {
            'id': notification.id,
            'type': notification.notification_type,
            'title': notification.title,
            'message': notification.message,
            'sender': {
                'id': notification.sender.id,
                'username': notification.sender.username,
                'name': notification.sender.get_full_name(),
            } if notification.sender else None,
            'product_id': notification.product_id,
            'conversation_id': notification.conversation_id,
            'created_at': notification.created_at.isoformat(),
        }
        
        pusher_client.trigger(channel_name, 'new-notification', data)
    except Exception as e:
        print(f"Error pushing notification via Pusher: {e}")


# ============ Notification Creation Utilities ============

def create_notification(recipient, notification_type, title, message, sender=None, product=None, conversation=None):
    """Create a new notification and push it via Pusher."""
    
    notification = Notification.objects.create(
        recipient=recipient,
        sender=sender,
        notification_type=notification_type,
        title=title,
        message=message,
        product=product,
        conversation=conversation
    )
    
    # Push real-time notification via Pusher
    _push_notification(notification)
    
    return notification


def notify_new_message(conversation, sender, message_content):
    """Create notification for new message"""
    
    # Get other participants
    other_participants = conversation.participants.exclude(id=sender.id)
    
    for participant in other_participants:
        create_notification(
            recipient=participant,
            sender=sender,
            notification_type='message',
            title='New Message',
            message=f'{sender.get_full_name() or sender.username} sent you a message: {message_content[:50]}...',
            conversation=conversation
        )


def notify_product_liked(product, liker):
    """Create notification for product like"""
    
    if product.seller.id == liker.id:
        return  # Don't notify if user likes their own product
    
    create_notification(
        recipient=product.seller,
        sender=liker,
        notification_type='product_like',
        title='Product Liked',
        message=f'{liker.get_full_name() or liker.username} liked your product "{product.title}"',
        product=product
    )


def notify_product_sold(product, buyer=None):
    """Create notification for product sold"""
    
    create_notification(
        recipient=product.seller,
        sender=buyer,
        notification_type='product_sold',
        title='Product Sold',
        message=f'Your product "{product.title}" has been sold!',
        product=product
    )
