from django.urls import path
from . import views

urlpatterns = [
    # Notifications
    path('notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    path('notifications/mark-all-read/', views.mark_all_read, name='mark-all-read'),
    path('notifications/unread-count/', views.unread_count, name='notification-unread-count'),
    
    # Preferences
    path('notifications/preferences/', views.NotificationPreferenceView.as_view(), name='notification-preferences'),
]
