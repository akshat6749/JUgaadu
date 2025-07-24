"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Star, Trash2, ShoppingCart, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { fetchWishlist, removeFromWishlist, startConversation } from "@/utils/api"

export default function WishlistPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    loadWishlist()
  }, [isAuthenticated, router])

  const loadWishlist = async () => {
    try {
      setLoading(true)
      const data = await fetchWishlist()
      setWishlistItems(data.results || data)
    } catch (error) {
      console.error("Failed to load wishlist:", error)
      toast({
        title: "Error",
        description: "Failed to load your wishlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      await removeFromWishlist(itemId)
      setWishlistItems((prev) => prev.filter((item) => item.product.id !== itemId))
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleContactSeller = async (item) => {
    try {
      const conversation = await startConversation(item.product.seller.id, item.product.id)
      router.push(`/chat?conversation=${conversation.id}`)
    } catch (error) {
      // Fallback to basic chat route
      router.push(`/chat?seller=${item.product.seller.id}&product=${item.product.id}`)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Heart className="h-8 w-8 mr-3 text-red-500" />
              My Wishlist
            </h1>
            <p className="text-gray-600">Items you're interested in buying ({wishlistItems.length})</p>
          </div>
          <Button onClick={() => router.push("/marketplace")} variant="outline">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
        </div>

        {wishlistItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-500">
                <Heart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl font-medium mb-2">Your wishlist is empty</p>
                <p className="text-gray-400 mb-6">Start adding items you're interested in to keep track of them</p>
                <Button onClick={() => router.push("/marketplace")}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Browse Marketplace
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <WishlistCard
                key={item.id}
                item={item}
                onRemove={handleRemoveFromWishlist}
                onContact={handleContactSeller}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

function WishlistCard({ item, onRemove, onContact }) {
  const router = useRouter()
  const product = item.product

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative">
        <img
          src={product.images?.[0]?.image || "/placeholder.svg?height=200&width=200"}
          alt={product.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
          onClick={() => router.push(`/product/${product.id}`)}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(product.id)}
          className="absolute top-3 right-3 bg-white/80 hover:bg-white shadow-md"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
        <Badge className="absolute top-3 left-3 bg-green-500 text-white">{product.condition}</Badge>
        {product.is_sold && <Badge className="absolute bottom-3 left-3 bg-red-500 text-white">SOLD</Badge>}
      </div>

      <CardContent className="p-4">
        <h3
          className="font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600"
          onClick={() => router.push(`/product/${product.id}`)}
        >
          {product.title}
        </h3>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-green-600">${product.price}</span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-sm text-gray-500 line-through">${product.original_price}</span>
            )}
          </div>
          {product.seller.rating && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">{product.seller.rating}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>
            {product.seller.first_name} {product.seller.last_name}
          </span>
          <span>{product.seller.college || "Campus"}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{product.likes_count || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{product.messages_count || 0}</span>
            </div>
          </div>
          <span>Added {new Date(item.created_at).toLocaleDateString()}</span>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={() => onContact(item)}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            size="sm"
            disabled={product.is_sold}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {product.is_sold ? "Sold" : "Contact"}
          </Button>
          <Button onClick={() => router.push(`/product/${product.id}`)} variant="outline" size="sm" className="flex-1">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
