"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, MoreVertical, Edit, Trash2, Eye, MessageCircle, Heart, DollarSign, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { fetchUserListings, deleteProduct, markProductAsSold, fetchUserStats } from "@/utils/api"

export default function MyListingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const [listings, setListings] = useState([])
  const [stats, setStats] = useState({
    total_listings: 0,
    active_listings: 0,
    sold_listings: 0,
    total_views: 0,
    total_likes: 0,
    total_messages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    loadData()
  }, [isAuthenticated, router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [listingsData, statsData] = await Promise.all([fetchUserListings(), fetchUserStats()])

      setListings(listingsData.results || listingsData)
      setStats(statsData)
    } catch (error) {
      console.error("Failed to load data:", error)
      toast({
        title: "Error",
        description: "Failed to load your listings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteListing = async (id) => {
    try {
      await deleteProduct(id)
      setListings((prev) => prev.filter((listing) => listing.id !== id))

      // Update stats
      setStats((prev) => ({
        ...prev,
        total_listings: prev.total_listings - 1,
        active_listings: prev.active_listings - 1,
      }))

      toast({
        title: "Listing deleted",
        description: "Your listing has been removed successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete listing. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleMarkAsSold = async (id) => {
    try {
      await markProductAsSold(id)
      setListings((prev) => prev.map((listing) => (listing.id === id ? { ...listing, is_sold: true } : listing)))

      // Update stats
      setStats((prev) => ({
        ...prev,
        active_listings: prev.active_listings - 1,
        sold_listings: prev.sold_listings + 1,
      }))

      toast({
        title: "Marked as sold",
        description: "Your listing has been marked as sold.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update listing. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getFilteredListings = (filter) => {
    switch (filter) {
      case "active":
        return listings.filter((listing) => !listing.is_sold)
      case "sold":
        return listings.filter((listing) => listing.is_sold)
      default:
        return listings
    }
  }

  const activeListings = getFilteredListings("active")
  const soldListings = getFilteredListings("sold")

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Listings</h1>
            <p className="text-gray-600">Manage your products and track their performance</p>
          </div>
          <Button onClick={() => router.push("/sell")} className="bg-gradient-to-r from-green-600 to-emerald-600">
            <Plus className="h-4 w-4 mr-2" />
            Add New Listing
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_listings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_listings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sold</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sold_listings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_views}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Listings ({listings.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeListings.length})</TabsTrigger>
            <TabsTrigger value="sold">Sold ({soldListings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <ListingGrid listings={listings} onDelete={handleDeleteListing} onMarkAsSold={handleMarkAsSold} />
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            <ListingGrid listings={activeListings} onDelete={handleDeleteListing} onMarkAsSold={handleMarkAsSold} />
          </TabsContent>

          <TabsContent value="sold" className="space-y-6">
            <ListingGrid listings={soldListings} onDelete={handleDeleteListing} onMarkAsSold={handleMarkAsSold} />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}

function ListingGrid({ listings, onDelete, onMarkAsSold }) {
  const router = useRouter()

  function getStatusBadge(listing) {
    if (listing.is_sold) {
      return <Badge className="bg-gray-100 text-gray-800">Sold</Badge>
    }
    return <Badge className="bg-green-100 text-green-800">Active</Badge>
  }

  if (listings.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="text-gray-500 mb-4">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No listings found</p>
            <p className="text-sm">Start selling your items to see them here</p>
          </div>
          <Button onClick={() => router.push("/sell")} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Listing
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <div className="relative">
            <img
              src={listing.images?.[0]?.image || "/placeholder.svg?height=200&width=300"}
              alt={listing.title}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-2 left-2">{getStatusBadge(listing)}</div>
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="bg-white/80 hover:bg-white">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/product/${listing.id}`)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Listing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/sell/${listing.id}/edit`)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  {!listing.is_sold && (
                    <DropdownMenuItem onClick={() => onMarkAsSold(listing.id)}>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Mark as Sold
                    </DropdownMenuItem>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your listing.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(listing.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{listing.title}</h3>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-green-600">${listing.price}</span>
                {listing.original_price && listing.original_price > listing.price && (
                  <span className="text-sm text-gray-500 line-through">${listing.original_price}</span>
                )}
              </div>
              <Badge variant="outline" className="capitalize">
                {listing.condition}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{listing.views_count || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>{listing.likes_count || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{listing.messages_count || 0}</span>
                </div>
              </div>
              <span>{new Date(listing.created_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
