from django.contrib import admin
from .models import (
    Category, Product, ProductImage, ProductTag, 
    Wishlist, ProductLike, ProductReport
)
from django.utils import timezone


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin configuration for Category model"""
    
    list_display = ['name', 'slug', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at']


class ProductImageInline(admin.TabularInline):
    """Inline admin for product images"""
    
    model = ProductImage
    extra = 1
    fields = ['image', 'alt_text', 'is_primary', 'order']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin configuration for Product model"""
    
    list_display = [
        'title', 'seller', 'category', 'price', 'condition', 
        'is_sold', 'views_count', 'likes_count', 'created_at'
    ]
    list_filter = [
        'category', 'condition', 'is_sold', 'is_featured', 
        'is_active', 'created_at'
    ]
    search_fields = ['title', 'description', 'seller__username', 'brand']
    ordering = ['-created_at']
    readonly_fields = [
        'views_count', 'likes_count', 'created_at', 
        'updated_at', 'sold_at'
    ]
    inlines = [ProductImageInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'seller')
        }),
        ('Pricing', {
            'fields': ('price', 'original_price')
        }),
        ('Categorization', {
            'fields': ('category', 'condition', 'brand')
        }),
        ('Status', {
            'fields': ('is_sold', 'is_featured', 'is_active')
        }),
        ('Metrics', {
            'fields': ('views_count', 'likes_count'),
            'classes': ('collapse',)
        }),
        ('Location', {
            'fields': ('location',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'sold_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ProductTag)
class ProductTagAdmin(admin.ModelAdmin):
    """Admin configuration for ProductTag model"""
    
    list_display = ['name', 'slug', 'created_at']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at']


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    """Admin configuration for Wishlist model"""
    
    list_display = ['user', 'product', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'product__title']
    readonly_fields = ['created_at']


@admin.register(ProductReport)
class ProductReportAdmin(admin.ModelAdmin):
    """Admin configuration for ProductReport model"""
    
    list_display = [
        'product', 'reporter', 'reason', 'is_resolved', 'created_at'
    ]
    list_filter = ['reason', 'is_resolved', 'created_at']
    search_fields = ['product__title', 'reporter__username']
    readonly_fields = ['created_at', 'resolved_at']
    
    actions = ['mark_resolved']
    
    def mark_resolved(self, request, queryset):
        """Mark reports as resolved"""
        queryset.update(
            is_resolved=True,
            resolved_by=request.user,
            resolved_at=timezone.now()
        )
    mark_resolved.short_description = "Mark selected reports as resolved"
