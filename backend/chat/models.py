from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone # Corrected timezone import
from products.models import Product
from cloudinary.models import CloudinaryField # Import CloudinaryField

User = get_user_model()


class Conversation(models.Model):
    """Conversation model for chat"""
    
    participants = models.ManyToManyField(User, related_name='conversations')
    product = models.ForeignKey(
        Product, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='conversations'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        # Removed db_table to follow Django conventions
        ordering = ['-updated_at']
    
    def __str__(self):
        participant_names = ", ".join([p.username for p in self.participants.all()[:2]])
        return f"Conversation: {participant_names}"
    
    @property
    def last_message(self):
        """Get the last message in this conversation"""
        return self.messages.order_by('-timestamp').first()
    
    def get_other_participant(self, user):
        """Get the other participant in the conversation"""
        return self.participants.exclude(id=user.id).first()


class Message(models.Model):
    """Message model for chat"""
    
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    
    # Message status
    is_read = models.BooleanField(default=False)
    is_edited = models.BooleanField(default=False)
    
    # Timestamps
    timestamp = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        # Removed db_table to follow Django conventions
        ordering = ['timestamp']
    
    def __str__(self):
        return f"Message from {self.sender.username}: {self.content[:50]}..."
    
    def mark_as_read(self):
        """Mark message as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])


class MessageAttachment(models.Model):
    """Message attachment model"""
    
    ATTACHMENT_TYPES = [
        ('image', 'Image'),
        ('document', 'Document'),
        ('other', 'Other'),
    ]
    
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='attachments')
    # Changed to CloudinaryField for consistency with the rest of the project
    file = CloudinaryField('chat_attachments')
    file_type = models.CharField(max_length=20, choices=ATTACHMENT_TYPES)
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField()  # in bytes
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        # Removed db_table to follow Django conventions
        pass
    
    def __str__(self):
        return f"Attachment: {self.file_name}"
