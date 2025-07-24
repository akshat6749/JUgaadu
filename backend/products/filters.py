import django_filters
from .models import Product

class ProductFilter(django_filters.FilterSet):
    """
    FilterSet for filtering Products based on various criteria.
    """
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr='lte')
    
    # --- FIX APPLIED ---
    # The filter was trying to perform a relational lookup (category__slug) on a non-relational CharField.
    # This has been corrected to filter directly on the 'category' field using a case-insensitive match.
    category = django_filters.CharFilter(field_name='category', lookup_expr='iexact')
    
    condition = django_filters.ChoiceFilter(choices=Product.CONDITION_CHOICES)
    
    class Meta:
        model = Product
        fields = ['category', 'condition', 'brand', 'is_sold', 'is_featured', 'location']
