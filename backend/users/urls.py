from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    # Authentication
    path('auth/register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('auth/login/', views.UserLoginView.as_view(), name='user-login'),
    
    # User profile
    path('auth/user/', views.UserProfileView.as_view(), name='user-profile'),
    path('auth/user/avatar/', views.upload_avatar, name='upload-avatar'),
    path('auth/change-password/', views.change_password, name='change-password'),
    
    # User management
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('users/<int:user_id>/reviews/', views.UserReviewListView.as_view(), name='user-reviews'),
    path('profile/', views.MyProfileView.as_view(), name='my-profile'),
    
    # Statistics
    path('users/stats/', views.user_stats, name='user-stats'),
]
