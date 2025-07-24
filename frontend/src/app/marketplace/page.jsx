"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Filter,
  Grid,
  List,
  Heart,
  MessageCircle,
  Star,
  Search,
  BookOpen,
  Smartphone,
  FileText,
  Sofa,
  Loader2,
  IndianRupee,
  X,
} from "lucide-react"
import { fetchProducts, fetchCategories, addToWishlist, removeFromWishlist,startConversation } from "@/utils/api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

// Debounce hook for search input
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Currency formatter for Indian Rupees
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function MarketplacePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()

  const [viewMode, setViewMode] = useState("grid")
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Separate search state to prevent constant reloading
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "")
  const debouncedSearch = useDebounce(searchInput, 500) // 500ms delay

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "all",
    condition: [],
    priceRange: [0, 100000],
    sortBy: "-created_at",
  })

  const conditions = ["New", "Like New", "Good", "Fair"]

  const sortOptions = [
    { value: "-created_at", label: "Newest First" },
    { value: "price", label: "Price: Low to High" },
    { value: "-price", label: "Price: High to Low" },
    { value: "-views", label: "Most Popular" },
    { value: "-likes", label: "Most Liked" },
  ]

  const getIconForCategory = (slug) => {
    const iconMap = {
      books: BookOpen,
      electronics: Smartphone,
      notes: FileText,
      furniture: Sofa,
    }
    return iconMap[slug] || Grid
  }

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log("🔍 Loading categories...");
        const categoriesData = await fetchCategories();
        console.log("✅ Categories loaded:", categoriesData);

        const processedCategories = [
          { id: "all", name: "All Items", icon: Grid },
          ...categoriesData.map((cat) => ({
            id: cat.slug || cat.id,
            name: cat.name,
            icon: getIconForCategory(cat.slug),
          })),
        ];

        setCategories(processedCategories);
      } catch (error) {
        console.error("❌ Failed to process categories:", error);
        setCategories([{ id: "all", name: "All Items", icon: Grid }]);
      }
    };

    loadCategories();
  }, []);

  // Update filters when debounced search changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch }))
  }, [debouncedSearch])

  // Load products when filters change (but not search input)
  useEffect(() => {
    loadProducts(true)
  }, [filters.category, filters.condition, filters.priceRange, filters.sortBy, filters.search])

  const loadProducts = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setCurrentPage(1)
      } else {
        setLoadingMore(true)
      }

      const page = reset ? 1 : currentPage + 1
      const apiFilters = {
        search: filters.search || undefined,
        category: filters.category !== "all" ? filters.category : undefined,
        condition: filters.condition.length > 0 ? filters.condition : undefined,
        min_price: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
        max_price: filters.priceRange[1] < 100000 ? filters.priceRange[1] : undefined,
        ordering: filters.sortBy,
        page: page,
        page_size: 12,
      }

      console.log("🔍 Loading products with filters:", apiFilters)
      const response = await fetchProducts(apiFilters)
      console.log("✅ Products loaded:", response)

      // Handle different response formats
      let results, count, next
      if (response.results) {
        results = response.results
        count = response.count
        next = response.next
      } else if (Array.isArray(response)) {
        results = response
        count = response.length
        next = null
      } else {
        results = []
        count = 0
        next = null
      }

      if (reset) {
        setProducts(results)
      } else {
        setProducts((prev) => [...prev, ...results])
      }

      setTotalCount(count)
      setHasMore(next !== null)
      setCurrentPage(page)
    } catch (error) {
      console.error("❌ Failed to load products:", error)
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [filters, currentPage, toast])

  const handleConditionChange = (condition, checked) => {
    setFilters((prev) => ({
      ...prev,
      condition: checked ? [...prev.condition, condition] : prev.condition.filter((c) => c !== condition),
    }))
  }

  const handleWishlistToggle = async (productId, isInWishlist) => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to add items to your wishlist.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    try {
      if (isInWishlist) {
        await removeFromWishlist(productId)
        toast({
          title: "Removed from wishlist",
          description: "Item has been removed from your wishlist.",
        })
      } else {
        await addToWishlist(productId)
        toast({
          title: "Added to wishlist",
          description: "Item has been added to your wishlist.",
        })
      }

      // Update the product in the list
      setProducts((prev) =>
        prev.map((product) => (product.id === productId ? { ...product, is_in_wishlist: !isInWishlist } : product)),
      )
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      })
    }
  }

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      loadProducts(false)
    }
  }

  const clearAllFilters = () => {
    setSearchInput("")
    setFilters({
      search: "",
      category: "all",
      condition: [],
      priceRange: [0, 100000],
      sortBy: "-created_at",
    })
  }

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.category !== "all") count++
    if (filters.condition.length > 0) count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) count++
    return count
  }, [filters])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Loading marketplace...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="relative">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Marketplace
            </h1>
            <p className="text-gray-600 text-lg">
              {totalCount > 0 ? (
                <span className="flex items-center gap-2">
                  <span>{totalCount} items available</span>
                </span>
              ) : (
                "Discover great deals from fellow students"
              )}
            </p>
            {/* Decorative element */}
            <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse" />
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters ({activeFiltersCount})
              </Button>
            )}
            <div className="flex bg-white rounded-lg shadow-md border border-gray-200">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Sidebar Filters */}
          <div className="lg:w-72 space-y-6">
            <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center text-lg">
                <Filter className="h-5 w-5 mr-2 text-blue-600" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 bg-blue-100 text-blue-700">
                    {activeFiltersCount}
                  </Badge>
                )}
              </h3>

              {/* Enhanced Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Search Products</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="What are you looking for?"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                  {searchInput && (
                    <button
                      onClick={() => setSearchInput("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {debouncedSearch !== searchInput && (
                  <div className="mt-2 text-xs text-blue-600 flex items-center">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Searching...
                  </div>
                )}
              </div>

              {/* Enhanced Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">Categories</label>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={filters.category === category.id ? "default" : "ghost"}
                      className={`w-full justify-start transition-all duration-200 ${
                        filters.category === category.id
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => setFilters((prev) => ({ ...prev, category: category.id }))}
                    >
                      <category.icon className="h-4 w-4 mr-3" />
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Enhanced Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">Price Range</label>
                <div className="space-y-4">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, priceRange: value }))}
                    max={100000}
                    step={1000}
                    className="w-full"
                  />
                  <div className="flex justify-between items-center">
                    <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium text-gray-700">
                      ₹{filters.priceRange[0].toLocaleString('en-IN')}
                    </div>
                    <span className="text-gray-400">to</span>
                    <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium text-gray-700">
                      {filters.priceRange[1] >= 1000 ? "₹1,00,000+" : `₹${filters.priceRange[1].toLocaleString('en-IN')}`}
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Enhanced Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Condition</label>
                <div className="space-y-3">
                  {conditions.map((condition) => (
                    <div key={condition} className="flex items-center space-x-3">
                      <Checkbox
                        id={condition}
                        checked={filters.condition.includes(condition)}
                        onCheckedChange={(checked) => handleConditionChange(condition, checked)}
                        className="border-gray-300"
                      />
                      <label htmlFor={condition} className="text-sm text-gray-700 cursor-pointer font-medium">
                        {condition}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <p className="text-gray-600 font-medium">
                  Showing {products.length} of {totalCount} items
                </p>
                {filters.search && (
                  <Badge variant="outline" className="border-blue-200 text-blue-700">
                    "{filters.search}"
                  </Badge>
                )}
              </div>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value }))}
              >
                <SelectTrigger className="w-56 border-gray-300 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {products.length === 0 ? (
              <Card className="text-center py-16 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent>
                  <div className="text-gray-500">
                    <Search className="h-16 w-16 mx-auto mb-6 opacity-30" />
                    <p className="text-xl font-medium mb-2">No products found</p>
                    <p className="text-sm mb-4">Try adjusting your filters or search terms</p>
                    {activeFiltersCount > 0 && (
                      <Button onClick={clearAllFilters} variant="outline" className="mt-2">
                        Clear all filters
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                  }`}
                >
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                      onWishlistToggle={handleWishlistToggle}
                    />
                  ))}
                </div>

                {/* Enhanced Load More Button */}
                {hasMore && (
                  <div className="text-center mt-12">
                    <Button
                      onClick={loadMore}
                      disabled={loadingMore}
                      variant="outline"
                      size="lg"
                      className="px-8 py-3 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 transition-all duration-200"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Loading more products...
                        </>
                      ) : (
                        <>
                          Load More Products
                          <span className="ml-2 text-xs bg-blue-100 px-2 py-1 rounded-full">
                            {totalCount - products.length} remaining
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

function ProductCard({ product, viewMode, onWishlistToggle }) {
  const router = useRouter()
  const { user } = useAuth();
  const { toast } = useToast()
  const handleProductClick = () => {
    router.push(`/product/${product.id}`)
  }

  const handleContactSeller = async (e) => {
    e.stopPropagation();

    if (!user) {
        toast({
            title: "Please log in",
            description: "You need to be logged in to contact a seller.",
        });
        router.push('/login');
        return;
    }

    if (user.id === product.seller.id) {
        toast({
            title: "This is your listing",
            description: "You cannot start a conversation with yourself.",
        });
        return;
    }

    try {
        const conversation = await startConversation(product.seller.id, product.id);
        // The API returns the conversation object which has an 'id'
        router.push(`/chat?chatId=${conversation.id}`);
    } catch (error) {
        // Handle cases where the conversation might already exist and the API returns an error
        if (error.response && error.response.data && error.response.data.chat_id) {
            router.push(`/chat?chatId=${error.response.data.chat_id}`);
        } else {
             console.error("Failed to start conversation:", error);
            toast({
                title: "Error",
                description: "Could not start the chat. Please try again later.",
                variant: "destructive",
            });
        }
    }
  };
  const handleWishlistClick = (e) => {
    e.stopPropagation()
    onWishlistToggle(product.id, product.is_in_wishlist)
  }

  return (
    <Card
      className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group cursor-pointer border-0 bg-white/90 backdrop-blur-sm min-h-[420px] flex flex-col"
      onClick={handleProductClick}
    >
      <div className="relative flex-shrink-0">
        <img
          src={product.images?.[0]?.image || "/placeholder.svg?height=200&width=200"}
          alt={product.title}
          className={`w-full object-cover group-hover:scale-110 transition-transform duration-500 ${
            viewMode === "list" ? "h-40" : "h-56"
          }`}
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm border-0"
          onClick={handleWishlistClick}
        >
          <Heart className={`h-5 w-5 transition-colors ${product.is_in_wishlist ? "text-red-500 fill-current" : "text-gray-400 hover:text-red-400"}`} />
        </Button>
        <Badge className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
          {product.condition}
        </Badge>
        {product.is_sold && (
          <Badge className="absolute bottom-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg">
            SOLD
          </Badge>
        )}
        {/* Price overlay for better visibility */}
        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-bold backdrop-blur-sm">
          {formatCurrency(product.price)}
        </div>
      </div>

      <CardContent className="p-6 flex-1 flex flex-col justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-4 line-clamp-2 text-lg leading-tight min-h-[3.5rem]">
            {product.title}
          </h3>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-green-600">{formatCurrency(product.price)}</span>
              {product.original_price && product.original_price > product.price && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 line-through">{formatCurrency(product.original_price)}</span>
                  <span className="text-xs text-green-600 font-medium">
                    Save {formatCurrency(product.original_price - product.price)}
                  </span>
                </div>
              )}
            </div>
            {product.seller?.rating && (
              <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-lg">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-yellow-700">{product.seller.rating}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
            <span className="font-medium">
              {product.seller?.first_name} {product.seller?.last_name}
            </span>
            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
              {product.seller?.college || "Campus"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span className="font-medium">{product.likes_count || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span className="font-medium">{product.messages_count || 0}</span>
            </div>
          </div>
          <Button
            size="default"
            className={`px-6 py-2 transition-all duration-200 ${
              product.is_sold
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg"
            }`}
            onClick={handleContactSeller}
            disabled={product.is_sold}
          >
            {product.is_sold ? "Sold" : "Contact Seller"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}