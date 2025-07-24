from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Count, Sum
from .models import User, Review, UserProfile
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    ReviewSerializer, UserProfileSerializer, UserStatsSerializer
)
from products.models import Product
from django.utils import timezone



class UserRegistrationView(generics.CreateAPIView):
    """User registration endpoint"""
    
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class UserLoginView(generics.GenericAPIView):
    """User login endpoint"""
    
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Update last active
        user.last_active = timezone.now()
        user.save(update_fields=['last_active'])
        
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })


class UserProfileView(generics.RetrieveUpdateAPIView):
    """User profile endpoint"""
    
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserDetailView(generics.RetrieveAPIView):
    """Public user detail endpoint"""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class UserListView(generics.ListAPIView):
    """User list endpoint"""
    
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ['college', 'is_verified']
    search_fields = ['username', 'first_name', 'last_name', 'college']
    ordering_fields = ['created_at', 'rating', 'review_count']
    ordering = ['-created_at']


class UserReviewListView(generics.ListCreateAPIView):
    """User reviews endpoint"""
    
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return Review.objects.filter(reviewed_user_id=user_id)
    
    def perform_create(self, serializer):
        user_id = self.kwargs.get('user_id')
        serializer.save(
            reviewer=self.request.user,
            reviewed_user_id=user_id
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats(request):
    """Get user statistics"""
    
    user = request.user
    
    # Product statistics
    products = Product.objects.filter(seller=user)
    total_listings = products.count()
    active_listings = products.filter(is_sold=False).count()
    sold_listings = products.filter(is_sold=True).count()
    
    # Engagement statistics
    total_views = products.aggregate(Sum('views_count'))['views_count__sum'] or 0
    total_likes = products.aggregate(Sum('likes_count'))['likes_count__sum'] or 0
    
    # Message statistics (you'll need to implement this based on your chat model)
    total_messages = 0  # Placeholder
    
    # Profile statistics
    profile = user.profile
    total_sales = profile.total_sales
    total_purchases = profile.total_purchases
    
    stats = {
        'total_listings': total_listings,
        'active_listings': active_listings,
        'sold_listings': sold_listings,
        'total_views': total_views,
        'total_likes': total_likes,
        'total_messages': total_messages,
        'total_sales': total_sales,
        'total_purchases': total_purchases,
    }
    
    serializer = UserStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_avatar(request):
    """Upload user avatar"""
    
    if 'avatar' not in request.FILES:
        return Response(
            {'error': 'No avatar file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = request.user
    user.avatar = request.FILES['avatar']
    user.save()
    
    return Response({
        'avatar': user.avatar.url if user.avatar else None
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """Change user password"""
    
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response(
            {'error': 'Both old and new passwords are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = request.user
    
    if not user.check_password(old_password):
        return Response(
            {'error': 'Invalid old password'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user.set_password(new_password)
    user.save()
    
    return Response({'message': 'Password changed successfully'})

class MyProfileView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return UserProfile.objects.get(user=self.request.user)
