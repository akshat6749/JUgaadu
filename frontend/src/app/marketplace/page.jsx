"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import {
  Filter, Grid, List, Heart, MessageCircle, Star, Search, BookOpen, Smartphone, FileText, Sofa, Loader2, X
} from "lucide-react"
import { fetchProducts, fetchCategories, addToWishlist, removeFromWishlist, startConversation } from "@/utils/api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

// Debounce hook for search input
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value) }, delay)
    return () => { clearTimeout(handler) }
  }, [value, delay])
  return debouncedValue
}

// Currency formatter for Indian Rupees
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function MarketplacePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, user } = useAuth()

  const [viewMode, setViewMode] = useState("grid")
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "")
  const debouncedSearch = useDebounce(searchInput, 500)

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "all",
    condition: [],
    priceRange: [0, 100000],
    sortBy: "-created_at",
  })

  const conditions = ["New", "Like New", "Good", "Fair"]

  const sortOptions = [
    { value: "-created_at", label: "NEWEST FIRST" },
    { value: "price", label: "PRICE: LOW TO HIGH" },
    { value: "-price", label: "PRICE: HIGH TO LOW" },
    { value: "-views", label: "MOST POPULAR" },
    { value: "-likes", label: "MOST LIKED" },
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

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await fetchCategories();
        const processedCategories = [
          { id: "all", name: "ALL RESOURCES", icon: Grid },
          ...categoriesData.map((cat) => ({
            id: cat.slug || cat.id,
            name: cat.name.toUpperCase(),
            icon: getIconForCategory(cat.slug),
          })),
        ];
        setCategories(processedCategories);
      } catch (error) {
        setCategories([{ id: "all", name: "ALL RESOURCES", icon: Grid }]);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch }))
  }, [debouncedSearch])

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

      const response = await fetchProducts(apiFilters)

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
      toast({
        title: "SYSTEM ERROR",
        description: "FAILED TO LOAD MARKET DATA.",
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
      toast({ title: "ACCESS DENIED", description: "LOGIN REQUIRED TO UPDATE WISHLIST." })
      router.push("/login")
      return
    }
    try {
      if (isInWishlist) {
        await removeFromWishlist(productId)
        toast({ title: "REMOVED", description: "ITEM SCRUBBED FROM WISHLIST." })
      } else {
        await addToWishlist(productId)
        toast({ title: "BOOKMARKED", description: "ITEM ADDED TO WISHLIST." })
      }
      setProducts((prev) =>
        prev.map((product) => (product.id === productId ? { ...product, is_in_wishlist: !isInWishlist } : product)),
      )
    } catch (error) {
      toast({ title: "ERROR", description: "WISHLIST OPERATION FAILED." })
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
      <div className="min-h-screen bg-[#121212] selection:bg-[#CCFF00] selection:text-black">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center min-h-[60vh]">
          <div className="bg-[#CCFF00] border-[6px] border-black neo-shadow-black p-8 flex items-center gap-4 sticker-rotate-2">
            <Loader2 className="h-10 w-10 animate-spin text-black" />
            <h2 className="font-ranchers text-4xl text-black uppercase tracking-widest">LOADING ENGINE...</h2>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212] selection:bg-[#CCFF00] selection:text-black font-jakarta">
      <Header />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10">

        {/* Hedaer Row */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 pb-6 border-b-[8px] border-black">
          <div>
            <h1 className="font-ranchers text-6xl md:text-8xl text-white uppercase tracking-wide leading-none mb-2">
              MARKET<span className="text-[#CCFF00]">PLACE</span>
            </h1>
            <p className="font-mono text-gray-400 font-bold uppercase tracking-widest text-sm border-l-[4px] border-[#CCFF00] pl-3">
              {totalCount} ITEMS CURRENTLY INDEXED IN THE SYSTEM.
            </p>
          </div>

          <div className="flex items-center gap-4 mt-6 lg:mt-0">
            {activeFiltersCount > 0 && (
              <button onClick={clearAllFilters} className="bg-black text-red-500 border-[3px] border-red-500 px-4 py-2 font-mono font-bold text-xs uppercase hover:bg-red-500 hover:text-black transition-colors flex items-center gap-2">
                <X className="h-4 w-4" /> WIPE FILTERS [{activeFiltersCount}]
              </button>
            )}
            <div className="flex bg-white border-[4px] border-black neo-shadow-volt">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 border-r-[4px] border-black hover:bg-[#CCFF00] transition-colors ${viewMode === 'grid' ? 'bg-[#CCFF00]' : ''}`}
              >
                <Grid className="h-5 w-5 text-black" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 hover:bg-[#CCFF00] transition-colors ${viewMode === 'list' ? 'bg-[#CCFF00]' : ''}`}
              >
                <List className="h-5 w-5 text-black" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* SIDEBAR FILTERS */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white border-[6px] border-black p-6 sticky top-24 neo-shadow-vault">
              <h3 className="font-ranchers text-4xl text-black uppercase mb-6 flex items-center border-b-[4px] border-black pb-2">
                <Filter className="h-6 w-6 mr-3 text-black" />
                FILTERS
              </h3>

              {/* SEARCH */}
              <div className="mb-8">
                <label className="font-mono font-bold text-black uppercase text-sm mb-2 block">QUERY DB</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full bg-gray-50 border-[4px] border-black py-3 pl-10 pr-10 font-mono font-bold text-sm uppercase outline-none focus:bg-[#CCFF00] text-black"
                    placeholder="SEARCH ITEMS..."
                  />
                  {searchInput && (
                    <button onClick={() => setSearchInput("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="h-5 w-5 text-black" />
                    </button>
                  )}
                </div>
              </div>

              {/* CATEGORIES */}
              <div className="mb-8">
                <label className="font-mono font-bold text-black uppercase text-sm mb-3 block border-b-[2px] border-black pb-1">CATEGORIES</label>
                <div className="flex flex-col gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setFilters(prev => ({ ...prev, category: cat.id }))}
                      className={`w-full text-left flex items-center px-4 py-3 font-mono font-bold text-xs uppercase border-[3px] border-black hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_#000] transition-all ${filters.category === cat.id ? 'bg-[#CCFF00] text-black shadow-[4px_4px_0px_#000] translate-x-[-2px] translate-y-[-2px]' : 'bg-white text-black hover:bg-black hover:text-[#CCFF00]'
                        }`}
                    >
                      <cat.icon className="h-4 w-4 mr-3" />
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* CONDITION */}
              <div className="mb-4">
                <label className="font-mono font-bold text-black uppercase text-sm mb-3 block border-b-[2px] border-black pb-1">ASSET CONDITION</label>
                <div className="space-y-3">
                  {conditions.map(condition => (
                    <label key={condition} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.condition.includes(condition)}
                        onChange={(e) => handleConditionChange(condition, e.target.checked)}
                        className="appearance-none w-5 h-5 border-[3px] border-black checked:bg-[#CCFF00] relative checked:after:content-['✓'] checked:after:absolute checked:after:text-black checked:after:font-bold checked:after:text-xs checked:after:top-[-2px] checked:after:left-[2px]"
                      />
                      <span className="font-mono font-bold text-xs text-gray-700 uppercase group-hover:text-black transition-colors">{condition.toUpperCase()}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="flex-1">
            {/* Sort Select */}
            <div className="flex justify-end mb-6">
              <div className="bg-white border-[4px] border-black neo-shadow-black">
                <select
                  className="appearance-none bg-transparent py-3 px-6 pr-12 font-mono font-bold text-xs uppercase outline-none cursor-pointer"
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {/* Custom Arrow */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">▼</div>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="bg-black border-[6px] border-[#CCFF00] p-16 text-center neo-shadow-volt">
                <Search className="h-16 w-16 text-[#CCFF00] mx-auto mb-6" />
                <h3 className="font-ranchers text-5xl text-white uppercase mb-4">NO MATCHES FOUND</h3>
                <p className="font-mono text-gray-400 font-bold uppercase text-sm tracking-widest mb-8">
                  THE DATABASE RETURNED ZERO RESULTS FOR YOUR QUERY.
                </p>
                {activeFiltersCount > 0 && (
                  <button onClick={clearAllFilters} className="bg-[#CCFF00] text-black border-[4px] border-black px-8 py-4 font-mono font-bold uppercase text-sm neo-shadow-volt hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                    RESET PROTOCOL
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid'
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "flex flex-col gap-6"
                }>
                  {products.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                      onWishlistToggle={handleWishlistToggle}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-16 text-center">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="bg-black text-white border-[4px] border-[#CCFF00] px-10 py-5 font-ranchers text-3xl uppercase tracking-widest neo-shadow-volt hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-[#CCFF00] hover:text-black transition-all flex items-center justify-center gap-3 mx-auto"
                    >
                      {loadingMore ? (
                        <><Loader2 className="h-6 w-6 animate-spin" /> RETRIEVING...</>
                      ) : (
                        <>
                          LOAD MORE <span className="font-mono font-bold text-xs bg-white text-black px-2 py-1 ml-2 border-[2px] border-black align-middle">[{totalCount - products.length} LEFT]</span>
                        </>
                      )}
                    </button>
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
  const { user } = useAuth()
  const { toast } = useToast()

  const handleProductClick = () => { router.push(`/product/${product.id}`) }

  const handleContactSeller = async (e) => {
    e.stopPropagation()
    if (!user) {
      toast({ title: "ACCESS DENIED", description: "LOGIN REQUIRED." })
      router.push('/login')
      return
    }
    if (user.id === product.seller.id) {
      toast({ title: "INVALID TARGET", description: "CANNOT MESSAGE YOURSELF." })
      return
    }
    try {
      const conversation = await startConversation(product.seller.id, product.id)
      router.push(`/chat?chatId=${conversation.id}`)
    } catch (error) {
      if (error.response?.data?.chat_id) {
        router.push(`/chat?chatId=${error.response.data.chat_id}`)
      } else {
        toast({ title: "COMMS FAILURE", description: "FAILED TO ESTABLISH LINK." })
      }
    }
  }

  const handleWishlistClick = (e) => {
    e.stopPropagation()
    onWishlistToggle(product.id, product.is_in_wishlist)
  }

  const isList = viewMode === 'list'

  return (
    <div
      onClick={handleProductClick}
      className={`bg-white border-[4px] border-black neo-shadow-vault flex hover:-translate-y-2 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_#CCFF00] transition-all cursor-pointer ${isList ? 'flex-row' : 'flex-col h-full'}`}
    >
      {/* Image Box */}
      <div className={`relative border-black bg-black overflow-hidden ${isList ? 'w-48 md:w-64 border-r-[4px] shrink-0' : 'w-full h-56 border-b-[4px]'}`}>
        <img
          src={product.images?.[0]?.image || 'https://placehold.co/600x400/000000/CCFF00?text=NO+IMAGE'}
          alt={product.title}
          className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
        />
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 bg-white border-[3px] border-black w-10 h-10 flex items-center justify-center hover:bg-[#CCFF00] transition-colors neo-shadow-black"
        >
          <Heart className={`h-5 w-5 ${product.is_in_wishlist ? 'fill-red-500 text-red-500' : 'text-black'}`} />
        </button>

        <div className="absolute top-3 left-3 bg-[#CCFF00] text-black border-[3px] border-black px-2 py-0.5 font-mono text-[10px] font-bold uppercase sticker-rotate-1">
          {product.condition}
        </div>
        {product.is_sold && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white border-[4px] border-black px-4 py-2 font-ranchers text-4xl uppercase -rotate-12 shadow-[4px_4px_0_0_#000]">
            SOLD OUT
          </div>
        )}
      </div>

      {/* Content Box */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-mono font-black text-black text-lg mb-4 uppercase leading-tight line-clamp-2">
            {product.title}
          </h3>
          <div className="flex items-end gap-3 mb-4">
            <span className="font-ranchers text-4xl text-black leading-none">{formatCurrency(product.price)}</span>
            {product.original_price > product.price && (
              <span className="font-mono text-xs font-bold text-gray-500 line-through bg-gray-100 px-1 border border-black mb-1">
                {formatCurrency(product.original_price)}
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto pt-4 border-t-[4px] border-black">
          <div className="flex justify-between items-center mb-4">
            <div className="font-mono text-[10px] font-bold text-gray-600 uppercase">
              SELLER: {product.seller?.first_name}
            </div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-black border-[2px] border-black px-2 bg-[#CCFF00]">
              <Star className="h-3 w-3 fill-current" /> {product.seller?.rating || 'NEW'}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex bg-black text-white border-[3px] border-black font-mono font-bold text-[10px] px-2 items-center gap-3 shrink-0">
              <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{product.likes_count || 0}</span>
              <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{product.messages_count || 0}</span>
            </div>
            <button
              onClick={handleContactSeller}
              disabled={product.is_sold}
              className={`flex-1 border-[3px] border-black font-mono font-bold text-xs uppercase py-2 transition-colors ${product.is_sold ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#CCFF00] text-black hover:bg-black hover:text-[#CCFF00]'
                }`}
            >
              {product.is_sold ? 'UNAVAILABLE' : 'CONTACT SELLER'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}