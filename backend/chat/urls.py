from django.urls import path
from . import views

urlpatterns = [
    # Conversations
    path('chat/conversations/', views.MyChatsView.as_view(), name='conversation-list'),
    path('chat/conversations/<int:chat_id>/messages/', views.ChatMessagesView.as_view(), name='conversation-messages'),
    
    # This is the corrected path for starting a conversation
    path('chat/conversations/start/', views.start_conversation, name='start-conversation'),
    
    path('chat/conversations/<int:conversation_id>/mark-read/', views.mark_messages_read, name='mark-messages-read'),
    path('messages/unread-count/', views.unread_count, name='unread-count'),
    
    # Messages
    path('chat/messages/create/', views.CreateMessageView.as_view(), name='message-create'),
    path('chat/messages/unread-count/', views.unread_count, name='unread-count'),
]
