"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Zap, Plus, View, Star, MessageSquare, Trash2, Eye, CircleDollarSign } from "lucide-react"
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
      toast({ title: "SYNC ERROR", description: "DATA RETRIEVAL FAILED.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteListing = async (id) => {
    try {
      await deleteProduct(id)
      setListings((prev) => prev.filter((listing) => listing.id !== id))
      setStats((prev) => ({
        ...prev,
        total_listings: prev.total_listings - 1,
        active_listings: prev.active_listings - 1,
      }))
      toast({ title: "ASSET PURGED", description: "LISTING DELETED." })
    } catch (error) {
      toast({ title: "ERROR", description: "PURGE FAILED.", variant: "destructive" })
    }
  }

  const handleMarkAsSold = async (id) => {
    try {
      await markProductAsSold(id)
      setListings((prev) => prev.map((listing) => (listing.id === id ? { ...listing, is_sold: true } : listing)))
      setStats((prev) => ({
        ...prev,
        active_listings: prev.active_listings - 1,
        sold_listings: prev.sold_listings + 1,
      }))
      toast({ title: "ASSET SECURED", description: "MARKED AS SOLD." })
    } catch (error) {
      toast({ title: "ERROR", description: "STATE UPDATE FAILED.", variant: "destructive" })
    }
  }

  const getFilteredListings = (filter) => {
    switch (filter) {
      case "active": return listings.filter((listing) => !listing.is_sold)
      case "sold": return listings.filter((listing) => listing.is_sold)
      default: return listings
    }
  }

  const activeListings = getFilteredListings("active")
  const soldListings = getFilteredListings("sold")

  if (!isAuthenticated) return null

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] font-jakarta selection:bg-[#CCFF00] selection:text-black">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-16 flex items-center justify-center min-h-[50vh]">
          <div className="bg-[#CCFF00] border-[6px] border-black p-8 neo-shadow-black sticker-rotate-1 inline-flex items-center gap-4">
            <div className="w-6 h-6 border-4 border-black border-t-transparent animate-spin rounded-full"></div>
            <h2 className="font-ranchers text-4xl uppercase text-black">SYNCING DATA...</h2>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212] font-jakarta selection:bg-[#CCFF00] selection:text-black pb-16">
      <Header />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <div className="inline-flex bg-[#CCFF00] border-[3px] border-black px-2 py-1 font-mono font-bold uppercase text-[10px] mb-3 sticker-rotate-2 shadow-[3px_3px_0_0_#000]">
              <Zap className="h-3 w-3 mr-1" /> COMMAND CENTER
            </div>
            <h1 className="font-ranchers text-6xl md:text-8xl text-white uppercase drop-shadow-[5px_5px_0_#CCFF00] leading-none">
              MY ASSETS
            </h1>
          </div>
          <button onClick={() => router.push("/sell")} className="bg-white text-black border-[4px] border-black py-3 px-6 font-mono font-extrabold uppercase text-sm neo-shadow-vault hover:bg-[#CCFF00] hover:translate-y-1 hover:translate-x-1 hover:shadow-[3px_3px_0_0_#000] transition-all flex items-center">
            <Plus className="h-5 w-5 mr-2" /> NEW DEPLOYMENT
          </button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          {[
            { label: "TOTAL ENTRIES", value: stats.total_listings, color: "bg-white", text: "text-black" },
            { label: "ACTIVE", value: stats.active_listings, color: "bg-[#CCFF00]", text: "text-black" },
            { label: "SECURED (SOLD)", value: stats.sold_listings, color: "bg-black text-white border-white", text: "text-white" },
            { label: "TOTAL VIEWS", value: stats.total_views, color: "bg-white", text: "text-black" }
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} border-[4px] ${stat.color.includes('border-white') ? 'border-white' : 'border-black'} p-4 md:p-6 neo-shadow-black`}>
              <p className={`font-mono text-[10px] font-bold uppercase mb-2 ${stat.text === 'text-white' ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
              <p className={`font-ranchers text-4xl md:text-5xl ${stat.text}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-8">
          {[
            { id: "all", label: `ALL (${listings.length})` },
            { id: "active", label: `ACTIVE (${activeListings.length})` },
            { id: "sold", label: `SOLD (${soldListings.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 font-mono font-bold uppercase text-xs md:text-sm border-[4px] border-black transition-all ${activeTab === tab.id
                  ? "bg-[#CCFF00] text-black shadow-[4px_4px_0_0_#000] translate-y-0"
                  : "bg-white text-black hover:bg-gray-200"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <TabsContent currentTab={activeTab} listings={activeTab === "all" ? listings : activeTab === "active" ? activeListings : soldListings} onDelete={handleDeleteListing} onMarkAsSold={handleMarkAsSold} router={router} />
      </div>

      <Footer />
    </div>
  )
}

function TabsContent({ currentTab, listings, onDelete, onMarkAsSold, router }) {
  if (listings.length === 0) {
    return (
      <div className="bg-white border-[6px] border-black p-12 text-center neo-shadow-vault max-w-2xl mt-8">
        <Zap className="h-16 w-16 mx-auto mb-6 text-black" />
        <h2 className="font-ranchers text-4xl uppercase text-black mb-2">NO ASSETS FOUND</h2>
        <p className="font-mono text-xs font-bold uppercase text-gray-500 mb-8">INITIATE DEPLOYMENT TO POPULATE THIS SECTOR.</p>
        <button onClick={() => router.push("/sell")} className="bg-[#CCFF00] text-black border-[4px] border-black py-3 px-8 font-mono font-bold uppercase text-sm neo-shadow-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all mx-auto min-w-[200px]">
          DEPLOY NOW
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <div key={listing.id} className="bg-white border-[6px] border-black neo-shadow-vault group flex flex-col relative overflow-hidden transition-all hover:-translate-y-2">

          {/* Image container */}
          <div className="h-48 border-b-[4px] border-black relative bg-black">
            <img
              src={listing.images?.[0]?.image || "https://placehold.co/400x300/121212/CCFF00?text=ASSET"}
              alt={listing.title}
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute top-2 left-2 flex gap-2">
              {listing.is_sold ? (
                <div className="bg-red-600 border-[3px] border-black text-white font-mono text-[10px] font-black uppercase px-2 py-1 shadow-[3px_3px_0_0_#000]">
                  SOLD OUT
                </div>
              ) : (
                <div className="bg-[#CCFF00] border-[3px] border-black text-black font-mono text-[10px] font-black uppercase px-2 py-1 shadow-[3px_3px_0_0_#000]">
                  ACTIVE
                </div>
              )}
            </div>
          </div>

          <div className="p-4 flex flex-col flex-1">
            <h3 className="font-mono font-bold text-black uppercase text-sm line-clamp-2 mb-3 leading-tight min-h-[40px]">{listing.title}</h3>

            <div className="font-ranchers text-3xl text-black mb-4">
              ₹{listing.price}
              {listing.original_price && listing.original_price > listing.price && (
                <span className="font-mono text-xs font-bold text-red-500 line-through ml-2 align-middle">
                  ₹{listing.original_price}
                </span>
              )}
            </div>

            {/* Stats Bar */}
            <div className="flex gap-4 font-mono text-[10px] font-bold text-black border-t-[3px] border-black pt-3 pb-3">
              <span className="flex items-center"><Eye className="h-3 w-3 mr-1" />{listing.views_count || 0}</span>
              <span className="flex items-center"><Star className="h-3 w-3 mr-1" />{listing.likes_count || 0}</span>
              <span className="flex items-center"><MessageSquare className="h-3 w-3 mr-1" />{listing.messages_count || 0}</span>
            </div>

            {/* Action Buttons Row */}
            <div className="grid grid-cols-2 gap-2 mt-auto border-t-[4px] border-black pt-4">
              <button onClick={() => router.push(`/product/${listing.id}`)} className="bg-white text-black border-[3px] border-black py-2 text-[10px] font-mono font-bold uppercase hover:bg-[#CCFF00] hover:shadow-[3px_3px_0_0_#000] hover:-translate-y-1 transition-all flex items-center justify-center delay-75">
                <View className="h-3 w-3 mr-1" /> VIEW
              </button>
              <button onClick={() => {
                if (confirm("DELETE THIS ASSET?")) onDelete(listing.id)
              }} className="bg-white text-red-600 border-[3px] border-black py-2 text-[10px] font-mono font-bold uppercase hover:bg-black hover:text-red-500 hover:shadow-[3px_3px_0_0_#000] hover:-translate-y-1 transition-all flex items-center justify-center delay-75">
                <Trash2 className="h-3 w-3 mr-1" /> PURGE
              </button>

              {!listing.is_sold && (
                <button onClick={() => {
                  if (confirm("MARK AS SOLD?")) onMarkAsSold(listing.id)
                }} className="col-span-2 bg-[#CCFF00] text-black border-[3px] border-black py-2 text-[10px] font-mono font-bold uppercase hover:bg-black hover:text-[#CCFF00] hover:shadow-[3px_3px_0_0_#000] hover:-translate-y-1 transition-all flex items-center justify-center mt-1 font-black">
                  <CircleDollarSign className="h-4 w-4 mr-1" /> MARK AS SECURED
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
