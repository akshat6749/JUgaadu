from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from django.conf import settings
import pusher

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer, ConversationCreateSerializer
from users.models import User
from products.models import Product


class MyChatsView(generics.ListAPIView):
    """
    List all conversations for the currently authenticated user.
    """
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.conversations.prefetch_related('participants', 'product').order_by('-updated_at')

class ChatMessagesView(generics.ListAPIView):
    """
    List all messages within a specific conversation.
    """
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        chat_id = self.kwargs['chat_id']
        # Ensure the user is a participant before allowing them to view messages
        if not self.request.user.conversations.filter(id=chat_id).exists():
            return Message.objects.none()
        return Message.objects.filter(conversation__id=chat_id).order_by('timestamp')

class CreateMessageView(generics.CreateAPIView):
    """
    Create a new message in a conversation.
    """
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        conversation = serializer.validated_data['conversation']
        if self.request.user not in conversation.participants.all():
            raise permissions.PermissionDenied("You are not a participant in this conversation.")
        serializer.save(sender=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_conversation(request):
    """
    Start a new conversation or return an existing one between two users for a specific product.
    """
    serializer = ConversationCreateSerializer(data=request.data)
    if serializer.is_valid():
        seller_id = serializer.validated_data['seller_id']
        product_id = serializer.validated_data.get('product_id')

        if request.user.id == seller_id:
            return Response({"error": "You cannot start a conversation with yourself."}, status=status.HTTP_400_BAD_REQUEST)

        seller = get_object_or_404(User, id=seller_id)
        
        # Find if a conversation already exists
        conversation_qs = Conversation.objects.filter(participants=request.user).filter(participants=seller)
        if product_id:
            product = get_object_or_404(Product, id=product_id)
            conversation_qs = conversation_qs.filter(product=product)
        
        conversation = conversation_qs.first()

        if conversation:
            # If conversation exists, return it
            serializer = ConversationSerializer(conversation, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            # Otherwise, create a new one
            product_instance = get_object_or_404(Product, id=product_id) if product_id else None
            new_conversation = Conversation.objects.create(product=product_instance)
            new_conversation.participants.add(request.user, seller)
            serializer = ConversationSerializer(new_conversation, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def unread_count(request):
    """
    Get the total count of unread messages across all conversations for the current user.
    """
    count = Message.objects.filter(
        conversation__participants=request.user,
        is_read=False
    ).exclude(sender=request.user).count()
    return Response({'unread_count': count})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_messages_read(request, conversation_id):
    """
    Mark all unread messages in a conversation as read for the current user.
    """
    conversation = get_object_or_404(Conversation, id=conversation_id, participants=request.user)
    
    Message.objects.filter(
        conversation=conversation, 
        is_read=False
    ).exclude(
        sender=request.user
    ).update(is_read=True, read_at=timezone.now())
    
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def unread_count(request):
    """
    Get the total count of unread messages across all conversations for the current user.
    """
    count = Message.objects.filter(
        conversation__participants=request.user,
        is_read=False
    ).exclude(sender=request.user).count()
    return Response({'unread_count': count})


class PusherAuthView(APIView):
    """
    Authenticates the current user for a private Pusher channel.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        pusher_client = pusher.Pusher(
            app_id=settings.CHANNEL_LAYERS['default']['CONFIG']['app_id'],
            key=settings.CHANNEL_LAYERS['default']['CONFIG']['key'],
            secret=settings.CHANNEL_LAYERS['default']['CONFIG']['secret'],
            cluster=settings.CHANNEL_LAYERS['default']['CONFIG']['cluster'],
            ssl=True
        )

        channel_name = request.data.get('channel_name')
        socket_id = request.data.get('socket_id')

        if not channel_name or not socket_id:
            return Response({'error': 'channel_name and socket_id are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if channel_name.startswith('private-conversation-'):
            try:
                conversation_id = int(channel_name.split('-')[-1])
                conversation = Conversation.objects.get(id=conversation_id)

                if request.user not in conversation.participants.all():
                    return Response({'error': 'You are not authorized for this channel.'}, status=status.HTTP_403_FORBIDDEN)

                auth = pusher_client.authenticate(
                    channel=channel_name,
                    socket_id=socket_id
                )
                return Response(auth)
            except (Conversation.DoesNotExist, ValueError):
                return Response({'error': 'Conversation not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({'error': 'Invalid channel name.'}, status=status.HTTP_400_BAD_REQUEST)
