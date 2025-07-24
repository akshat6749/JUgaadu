from django.contrib import admin
from .models import Conversation, Message, MessageAttachment


class MessageInline(admin.TabularInline):
    """Inline admin for messages"""
    
    model = Message
    extra = 0
    readonly_fields = ['timestamp', 'read_at']
    fields = ['sender', 'content', 'is_read', 'timestamp']


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    """Admin configuration for Conversation model"""
    
    list_display = ['id', 'get_participants', 'product', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['participants__username', 'product__title']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [MessageInline]
    
    def get_participants(self, obj):
        return ", ".join([p.username for p in obj.participants.all()])
    get_participants.short_description = 'Participants'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    """Admin configuration for Message model"""
    
    list_display = ['id', 'conversation', 'sender', 'content_preview', 'is_read', 'timestamp']
    list_filter = ['is_read', 'timestamp']
    search_fields = ['sender__username', 'content']
    readonly_fields = ['timestamp', 'edited_at', 'read_at']
    
    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'


@admin.register(MessageAttachment)
class MessageAttachmentAdmin(admin.ModelAdmin):
    """Admin configuration for MessageAttachment model"""
    
    list_display = ['id', 'message', 'file_name', 'file_type', 'file_size', 'created_at']
    list_filter = ['file_type', 'created_at']
    search_fields = ['file_name', 'message__content']
    readonly_fields = ['created_at']
