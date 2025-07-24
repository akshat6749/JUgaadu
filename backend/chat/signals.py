from django.db.models.signals import post_save
from django.dispatch import receiver
import pusher
from django.conf import settings
from .models import Message
from .serializers import MessageSerializer

@receiver(post_save, sender=Message)
def message_created(sender, instance, created, **kwargs):
    """
    Signal handler to send a new message to Pusher when it's created.
    """
    if created:
        try:
            pusher_client = pusher.Pusher(
                app_id=settings.CHANNEL_LAYERS['default']['CONFIG']['app_id'],
                key=settings.CHANNEL_LAYERS['default']['CONFIG']['key'],
                secret=settings.CHANNEL_LAYERS['default']['CONFIG']['secret'],
                cluster=settings.CHANNEL_LAYERS['default']['CONFIG']['cluster'],
                ssl=True
            )

            # Serialize the message data to send to the frontend
            serializer = MessageSerializer(instance)
            
            # The channel name must be consistent with the frontend
            channel_name = f'private-conversation-{instance.conversation.id}'
            
            # Trigger the 'new-message' event
            pusher_client.trigger(channel_name, 'new-message', serializer.data)
            
        except Exception as e:
            # It's good practice to log errors
            print(f"Error sending message to Pusher: {e}")