from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
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


# Utility functions for creating notifications
def create_notification(recipient, notification_type, title, message, sender=None, product=None, conversation=None):
    """Create a new notification"""
    
    notification = Notification.objects.create(
        recipient=recipient,
        sender=sender,
        notification_type=notification_type,
        title=title,
        message=message,
        product=product,
        conversation=conversation
    )
    
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
    
    create_notification(
        recipient=product.seller,
        sender=liker,
        notification_type='product_like',
        title='Product Liked',
        message=f'{liker.get_full_name() or liker.username} liked your product "{product.title}"',
        product=product
    )


def notify_product_sold(product):
    """Create notification for product sold"""
    
    create_notification(
        recipient=product.seller,
        notification_type='product_sold',
        title='Product Sold',
        message=f'Congratulations! Your product "{product.title}" has been marked as sold.',
        product=product
    )
