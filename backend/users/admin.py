from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Review, UserProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for User model"""
    
    list_display = ['username', 'email', 'first_name', 'last_name', 'college', 'rating', 'is_verified', 'created_at']
    list_filter = ['is_verified', 'college', 'created_at', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'college']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('avatar', 'college', 'phone', 'bio', 'location')
        }),
        ('Ratings', {
            'fields': ('rating', 'review_count')
        }),
        ('Verification', {
            'fields': ('is_verified', 'verification_token')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_active'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'last_active', 'rating', 'review_count']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """Admin configuration for Review model"""
    
    list_display = ['reviewer', 'reviewed_user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['reviewer__username', 'reviewed_user__username']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Admin configuration for UserProfile model"""
    
    list_display = ['user', 'total_sales', 'total_purchases', 'email_notifications']
    list_filter = ['email_notifications', 'push_notifications', 'marketing_emails']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
