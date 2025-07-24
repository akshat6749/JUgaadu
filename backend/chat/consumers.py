# chat/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from jwt import decode as jwt_decode
from django.conf import settings
from .models import Conversation, Message

User = get_user_model()

@database_sync_to_async
def get_user_from_token(token_string):
    """
    Authenticates a user from a JWT token string with debugging.
    """
    print(f"Attempting to validate token: {token_string[:30]}...") # Print first 30 chars
    try:
        UntypedToken(token_string)

        decoded_data = jwt_decode(token_string, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = decoded_data.get('user_id')
        print(f"Token decoded successfully. User ID: {user_id}")

        if user_id:
            user = User.objects.get(id=user_id)
            print(f"User found: {user.username}")
            return user

        print("User ID not in token.")
        return AnonymousUser()

    except (InvalidToken, TokenError, User.DoesNotExist) as e:
        # Print the specific error!
        print(f"❌ TOKEN VALIDATION FAILED: {e}") 
        return AnonymousUser()
    """
    Authenticates a user from a JWT token string.
    """
    try:
        # This will validate the token's signature and expiration
        UntypedToken(token_string)
        
        # Decode the token to get the user_id
        decoded_data = jwt_decode(token_string, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = decoded_data.get('user_id')
        
        if user_id:
            return User.objects.get(id=user_id)
        return AnonymousUser()
        
    except (InvalidToken, TokenError, User.DoesNotExist):
        return AnonymousUser()

class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time chat"""
    
    async def connect(self):
        """Handle WebSocket connection"""
        # Get token from query string
        query_string = self.scope['query_string'].decode()
        params = dict(p.split('=') for p in query_string.split('&'))
        token = params.get('token')

        if token:
            self.user = await get_user_from_token(token)
        else:
            self.user = self.scope.get('user', AnonymousUser())
        
        if not self.user.is_authenticated:
            await self.close()
            return
        
        self.user_group_name = f"user_{self.user.id}"
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if hasattr(self, 'user_group_name'):
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )
        
        if hasattr(self, 'conversation_group_name'):
            await self.channel_layer.group_discard(
                self.conversation_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'join_conversation':
                await self.join_conversation(data.get('conversation_id'))
            
            elif message_type == 'leave_conversation':
                await self.leave_conversation()

            elif message_type == 'send_message':
                await self.send_message_handler(data)
            
            elif message_type == 'typing':
                await self.handle_typing(data)
            
            elif message_type == 'mark_read':
                await self.mark_message_read_handler(data.get('message_id'))
        
        except json.JSONDecodeError:
            await self.send_error('Invalid JSON')
    
    async def join_conversation(self, conversation_id):
        """Join a conversation room"""
        if not conversation_id:
            await self.send_error('Conversation ID not provided')
            return
        
        is_participant = await self.is_conversation_participant(conversation_id)
        if not is_participant:
            await self.send_error('Not authorized for this conversation')
            return
        
        # Leave previous conversation group if exists
        await self.leave_conversation()
        
        # Join new conversation group
        self.conversation_group_name = f"conversation_{conversation_id}"
        await self.channel_layer.group_add(
            self.conversation_group_name,
            self.channel_name
        )
        
        await self.send(text_data=json.dumps({
            'type': 'joined_conversation',
            'conversation_id': conversation_id
        }))
    
    async def leave_conversation(self):
        """Leave the current conversation room"""
        if hasattr(self, 'conversation_group_name'):
            await self.channel_layer.group_discard(
                self.conversation_group_name,
                self.channel_name
            )
            delattr(self, 'conversation_group_name')

    async def send_message_handler(self, data):
        """Handle sending a message."""
        print(f"✅ Message received by consumer: {data}")

        conversation_id = data.get('conversation_id')
        content = data.get('content')
        
        if not all([conversation_id, content]):
            await self.send_error('Missing conversation_id or content')
            return
        
        # Save message to DB
        message = await self.save_message(conversation_id, content)
        
        if message:
            # Broadcast the new message to the conversation group
            await self.channel_layer.group_send(
                f"conversation_{conversation_id}",
                {
                    'type': 'new_message',
                    'message': {
                        'id': message.id,
                        'conversation': conversation_id,
                        'sender': {
                            'id': self.user.id,
                            'username': self.user.username,
                            'name': self.user.get_full_name(),
                        },
                        'content': message.content,
                        'created_at': message.timestamp.isoformat(),
                        'is_read': False
                    }
                }
            )

    async def handle_typing(self, data):
        """Handle typing indicators."""
        if hasattr(self, 'conversation_group_name'):
            await self.channel_layer.group_send(
                self.conversation_group_name,
                {
                    'type': 'typing_indicator',
                    'user': {
                        'id': self.user.id,
                        'name': self.user.get_full_name()
                    },
                    'is_typing': data.get('is_typing', False)
                }
            )
    
    async def mark_message_read_handler(self, message_id):
        """Mark a message as read."""
        if not message_id:
            return

        message = await self.db_mark_message_read(message_id)
        if message:
            # Notify the other user in the conversation
            other_user = await database_sync_to_async(message.conversation.get_other_participant)(self.user)
            if other_user:
                await self.channel_layer.group_send(
                    f"user_{other_user.id}",
                    {
                        'type': 'message_read_receipt',
                        'message_id': message_id,
                        'conversation_id': message.conversation.id
                    }
                )

    # WebSocket Event Handlers
    async def new_message(self, event):
        """Send a new_message event to the client."""
        await self.send(text_data=json.dumps(event))

    async def typing_indicator(self, event):
        """Send a typing_indicator event to the client."""
        if event['user']['id'] != self.user.id:
            await self.send(text_data=json.dumps(event))

    async def message_read_receipt(self, event):
        """Send a message_read_receipt event to the client."""
        await self.send(text_data=json.dumps(event))

    async def send_error(self, message):
        """Send an error message to the client."""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message
        }))

    # Database Operations
    @database_sync_to_async
    def is_conversation_participant(self, conversation_id):
        return Conversation.objects.filter(id=conversation_id, participants=self.user).exists()

    @database_sync_to_async
    def save_message(self, conversation_id, content):
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            if self.user in conversation.participants.all():
                message = Message.objects.create(
                    conversation=conversation,
                    sender=self.user,
                    content=content
                )
                conversation.save() # To update the `updated_at` timestamp
                return message
            return None
        except Conversation.DoesNotExist:
            return None

    @database_sync_to_async
    def db_mark_message_read(self, message_id):
        try:
            message = Message.objects.select_related('conversation').get(id=message_id)
            if self.user in message.conversation.participants.all() and message.sender != self.user:
                message.mark_as_read()
                return message
            return None
        except Message.DoesNotExist:
            return None