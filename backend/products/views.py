from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly,AllowAny
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Exists, OuterRef, Value, BooleanField
from .models import Product, Category, Wishlist, ProductLike, ProductReport
from .serializers import (
    ProductSerializer, ProductCreateUpdateSerializer, CategorySerializer, 
    WishlistSerializer, ProductReportSerializer
)
from django.conf import settings
import razorpay
from .models import Payment
from .serializers import PaymentSerializer
# Note: We are now handling filtering manually, so ProductFilter is no longer used here.

class ProductListView(generics.ListAPIView):
    """
    Lists products with manual filtering to ensure correct database queries.
    """
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    # We will use SearchFilter and OrderingFilter, but handle other filters manually.
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'brand', 'category']
    ordering_fields = ['created_at', 'price', 'views_count', 'likes_count']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = Product.objects.filter(is_active=True, is_sold=False).select_related('seller').prefetch_related('images', 'product_tags__tag')

        # Manually apply filters from query parameters to bypass the previous FieldError.
        
        # Category Filter
        category_param = self.request.query_params.get('category', None)
        if category_param and category_param.lower() != 'all':
            # Filter directly on the 'category' CharField with a case-insensitive match.
            queryset = queryset.filter(category__iexact=category_param)

        # --- FIX APPLIED ---
        # Condition Filter (handles multiple values)
        condition_params = self.request.query_params.getlist('condition', [])
        if condition_params:
            # The frontend sends display names (e.g., "Like New"), but the DB stores values (e.g., "like_new").
            # We need to map the display names to the values before filtering.
            condition_map = {display: value for value, display in Product.CONDITION_CHOICES}
            db_conditions = [condition_map.get(c) for c in condition_params if c in condition_map]
            
            if db_conditions:
                queryset = queryset.filter(condition__in=db_conditions)
            
        # Price Range Filter
        min_price = self.request.query_params.get('min_price', None)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        
        max_price = self.request.query_params.get('max_price', None)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # Annotate queryset with user-specific data (wishlist and likes)
        if user.is_authenticated:
            wishlist_subquery = Wishlist.objects.filter(user=user, product=OuterRef('pk'))
            likes_subquery = ProductLike.objects.filter(user=user, product=OuterRef('pk'))
            queryset = queryset.annotate(
                is_in_wishlist=Exists(wishlist_subquery),
                is_liked=Exists(likes_subquery)
            )
        else:
            queryset = queryset.annotate(
                is_in_wishlist=Value(False, output_field=BooleanField()), 
                is_liked=Value(False, output_field=BooleanField())
            )
            
        return queryset

class ProductCreateView(generics.CreateAPIView):
    """
    Handles the creation of a new product. This view remains unchanged
    as the issue was with listing/filtering, not creation logic itself.
    """
    queryset = Product.objects.all()
    serializer_class = ProductCreateUpdateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset().select_related('seller').prefetch_related('images', 'product_tags__tag')
        if user.is_authenticated:
            wishlist_subquery = Wishlist.objects.filter(user=user, product=OuterRef('pk'))
            likes_subquery = ProductLike.objects.filter(user=user, product=OuterRef('pk'))
            queryset = queryset.annotate(is_in_wishlist=Exists(wishlist_subquery), is_liked=Exists(likes_subquery))
        else:
            queryset = queryset.annotate(
                is_in_wishlist=Value(False, output_field=BooleanField()), 
                is_liked=Value(False, output_field=BooleanField())
            )
        return queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class ProductUpdateView(generics.UpdateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductCreateUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(seller=self.request.user)

class ProductDeleteView(generics.DestroyAPIView):
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(seller=self.request.user)

class UserProductsView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        wishlist_subquery = Wishlist.objects.filter(user=user, product=OuterRef('pk'))
        likes_subquery = ProductLike.objects.filter(user=user, product=OuterRef('pk'))
        
        return Product.objects.filter(seller=user).select_related('seller').prefetch_related('images', 'product_tags__tag').annotate(
            is_in_wishlist=Exists(wishlist_subquery),
            is_liked=Exists(likes_subquery)
        ).order_by('-created_at')

class CategoryListView(generics.ListAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer

class WishlistToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        wishlist_item, created = Wishlist.objects.get_or_create(user=request.user, product=product)
        if not created:
            wishlist_item.delete()
            return Response({'status': 'removed'}, status=status.HTTP_200_OK)
        return Response({'status': 'added'}, status=status.HTTP_201_CREATED)

class ProductLikeToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        like, created = ProductLike.objects.get_or_create(user=request.user, product=product)
        if created:
            product.likes_count += 1
            message, liked_status = 'Product liked', True
        else:
            like.delete()
            product.likes_count = max(0, product.likes_count - 1)
            message, liked_status = 'Product unliked', False
        product.save(update_fields=['likes_count'])
        return Response({'message': message, 'liked': liked_status, 'likes_count': product.likes_count})

class ProductReportView(generics.CreateAPIView):
    serializer_class = ProductReportSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        product = get_object_or_404(Product, pk=self.kwargs['pk'])
        serializer.save(reporter=self.request.user, product=product)

    def create(self, request, *args, **kwargs):
        product = get_object_or_404(Product, pk=self.kwargs['pk'])
        if ProductReport.objects.filter(reporter=request.user, product=product).exists():
            return Response(
                {'error': 'You have already reported this product.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)
    



client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

class CreatePaymentOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        amount = int(product.price * 100)  # Amount in paise

        order_data = {
            "amount": amount,
            "currency": "INR",
            "receipt": f"order_rcptid_{product.id}",
            "payment_capture": 1
        }

        try:
            order = client.order.create(data=order_data)
            payment = Payment.objects.create(
                product=product,
                user=request.user,
                razorpay_order_id=order['id'],
                amount=product.price
            )
            return Response({"order_id": order['id'], "amount": amount, "currency": "INR", "key": settings.RAZORPAY_KEY_ID})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        razorpay_order_id = request.data.get("razorpay_order_id")
        razorpay_payment_id = request.data.get("razorpay_payment_id")
        razorpay_signature = request.data.get("razorpay_signature")

        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }

        try:
            payment = Payment.objects.get(razorpay_order_id=razorpay_order_id)
        except Payment.DoesNotExist:
            return Response({"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            client.utility.verify_payment_signature(params_dict)
            payment.razorpay_payment_id = razorpay_payment_id
            payment.razorpay_signature = razorpay_signature
            payment.status = 'paid'
            payment.save()
            product = payment.product
            product.is_sold = True
            product.save()
            return Response({"status": "Payment successful"})
        except Exception as e:
            payment.status = 'failed'
            payment.save()
            return Response({"error": "Payment verification failed"}, status=status.HTTP_400_BAD_REQUEST)

class WishlistView(generics.ListAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)
    
class WishlistCountView(APIView):
    """
    Provides the count of items in the user's wishlist.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        count = Wishlist.objects.filter(user=request.user).count()
        return Response({'count': count}, status=status.HTTP_200_OK)

# yourapp/views.py

import os
import json
import google.generativeai as genai
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt

# Configure the Gemini client using the API key from your .env file
try:
    genai.configure(api_key="AIzaSyAx9SOHenRf9T-ZvnRrhhLH3EJIWqju6_s")
except TypeError:
    raise Exception("GEMINI_API_KEY not found in environment variables.")


@csrf_exempt
@require_http_methods(["POST"])
def generate_description_view(request):
    """
    Handles a POST request with rich product data to generate a description using Gemini.
    """
    try:
        # Parse the JSON data from the request body
        data = json.loads(request.body)
        title = data.get('title')

        # The only required field is the title
        if not title:
            return JsonResponse({'error': 'Title is required to generate a description.'}, status=400)

        # Initialize the Gemini model
        model = genai.GenerativeModel('gemini-1.5-flash')

        # --- Build a dynamic, detailed prompt ---
        prompt_parts = [
            "You are an expert copywriter for a student marketplace website.",
            "Your task is to write a clear, friendly, and compelling product description (about 3-4 sentences long).",
            "Use the following details to create the description. Be engaging and highlight the key features.",
            "\n--- Item Details ---",
            f"Product Title: \"{title}\""
        ]

        # Add other details to the prompt only if they exist
        if data.get('category'):
            prompt_parts.append(f"Category: {data.get('category')}")
        
        if data.get('condition'):
            prompt_parts.append(f"Condition: {data.get('condition')}")

        if data.get('brand'):
            prompt_parts.append(f"Brand: {data.get('brand')}")

        if data.get('tags'):
            # The component sends tags as a comma-separated string
            prompt_parts.append(f"Tags: {data.get('tags')}")
        
        prompt_parts.append("--------------------")

        prompt = "\n".join(prompt_parts)

        # Call the Gemini API to generate content
        response = model.generate_content(prompt)
        description_text = response.text.strip()

        # Return the generated description as a JSON response
        return JsonResponse({'description': description_text})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON in request body.'}, status=400)
    except Exception as e:
        # Log the error for debugging
        print(f"An unexpected error occurred: {e}")
        return JsonResponse({'error': 'An internal server error occurred.'}, status=500)

