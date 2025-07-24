from rest_framework import serializers
from django.db import transaction
from django.contrib.auth import get_user_model
from .models import (
    Product, ProductImage, Category, ProductTag, Wishlist, 
    ProductLike, ProductTagRelation, ProductReport, Payment
)

# It's better practice to import serializers rather than redefine them
from users.serializers import UserSerializer

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon']

class ProductImageSerializer(serializers.ModelSerializer):
    """
    Serializer for ProductImage model.
    This now correctly returns the full image URL from Cloudinary.
    """
    # The 'image' field is now a method field to ensure it returns the full URL.
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary']

    def get_image(self, obj):
        """
        Returns the absolute URL of the image from Cloudinary.
        """
        if obj.image and hasattr(obj.image, 'url'):
            return obj.image.url
        return None

class ProductTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductTag
        fields = ['id', 'name']

class ProductSerializer(serializers.ModelSerializer):
    seller = UserSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    tags = serializers.SerializerMethodField()
    is_in_wishlist = serializers.BooleanField(read_only=True)
    is_liked = serializers.BooleanField(read_only=True)
    category = serializers.CharField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'description', 'price', 'original_price', 'discount_percentage',
            'category', 'condition', 'brand', 'seller', 'is_sold', 'is_featured',
            'views_count', 'likes_count', 'location', 'images', 'tags',
            'is_in_wishlist', 'is_liked', 'created_at',
        ]

    def get_tags(self, obj):
        return [relation.tag.name for relation in obj.product_tags.all()]

class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    images = serializers.ListField(
        child=serializers.ImageField(use_url=False),
        write_only=True, required=False
    )
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        write_only=True, required=False
    )
    category = serializers.CharField(max_length=100)

    class Meta:
        model = Product
        fields = [
            'title', 'description', 'price', 'original_price', 'category',
            'condition', 'brand', 'location', 'images', 'tags'
        ]

    def _handle_tags(self, product, tags_data):
        if tags_data is None:
            return
        product.product_tags.all().delete()
        tag_relations = [
            ProductTagRelation(product=product, tag=ProductTag.objects.get_or_create(name=tag_name.strip().lower())[0])
            for tag_name in set(tags_data)
        ]
        ProductTagRelation.objects.bulk_create(tag_relations)

    def _handle_images(self, product, images_data):
        if images_data is None:
            return
        product.images.all().delete()
        image_instances = [
            ProductImage(product=product, image=image_data, is_primary=(i == 0), order=i)
            for i, image_data in enumerate(images_data)
        ]
        ProductImage.objects.bulk_create(image_instances)

    @transaction.atomic
    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        tags_data = validated_data.pop('tags', [])
        product = Product.objects.create(**validated_data)
        self._handle_images(product, images_data)
        self._handle_tags(product, tags_data)
        return product

    @transaction.atomic
    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)
        tags_data = validated_data.pop('tags', None)
        instance = super().update(instance, validated_data)
        if images_data is not None:
            self._handle_images(instance, images_data)
        if tags_data is not None:
            self._handle_tags(instance, tags_data)
        return instance

class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['id', 'product']

class ProductReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductReport
        fields = ['id', 'reason', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
