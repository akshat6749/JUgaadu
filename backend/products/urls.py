from django.urls import path
from . import views

urlpatterns = [
    path('products/', views.ProductListView.as_view(), name='product-list'),
    path('products/create/', views.ProductCreateView.as_view(), name='product-create'),
    path('products/my-listings/', views.UserProductsView.as_view(), name='user-products'),
    path('products/<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('products/<int:pk>/update/', views.ProductUpdateView.as_view(), name='product-update'),
    path('products/<int:pk>/delete/', views.ProductDeleteView.as_view(), name='product-delete'),
    path('products/<int:pk>/like/', views.ProductLikeToggleView.as_view(), name='product-like-toggle'),
    
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    
    path('wishlist/<int:pk>/toggle/', views.WishlistToggleView.as_view(), name='wishlist-toggle'),
    path('products/wishlist/count/', views.WishlistCountView.as_view(), name='wishlist-count'),
    path('products/<int:pk>/create-payment-order/', views.CreatePaymentOrderView.as_view(), name='create-payment-order'),
    path('products/verify-payment/', views.VerifyPaymentView.as_view(), name='verify-payment'),
    path('wishlist/', views.WishlistView.as_view(), name='wishlist'),
     path('products/generate-description/', views.generate_description_view, name='generate_description'),
]
