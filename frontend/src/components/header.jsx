"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, ShoppingCart, Heart, MessageCircle, User, Menu, Plus, Bell, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/components/auth-provider"
import { fetchWishlistCount, fetchUnreadMessagesCount } from "@/utils/api"

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  
  // State for notification counts
  const [wishlistCount, setWishlistCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    // Fetch counts only if the user is authenticated
    if (isAuthenticated) {
      const fetchCounts = async () => {
        const [wishlistNum, messagesNum] = await Promise.all([
          fetchWishlistCount(),
          fetchUnreadMessagesCount()
        ]);
        setWishlistCount(wishlistNum);
        setUnreadMessages(messagesNum);
      };
      fetchCounts();
      
      // Optional: Poll for new messages periodically
      const interval = setInterval(fetchCounts, 30000); // every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleSellClick = () => {
    if (isAuthenticated) {
      router.push("/sell")
    } else {
      router.push("/login")
    }
  }

  // Creative profile avatar component
  const ProfileAvatar = ({ size = "h-8 w-8" }) => (
    <div className="relative group">
      <div className={`${size} rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 p-0.5 group-hover:from-violet-400 group-hover:via-purple-400 group-hover:to-indigo-500 transition-all duration-300`}>
        <div className={`${size} rounded-full bg-white flex items-center justify-center relative overflow-hidden`}>
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user?.name} 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="relative w-full h-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
              <span className="text-violet-600 font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-3 w-3 text-violet-400 animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Status indicator */}
      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 border-2 border-white rounded-full group-hover:bg-green-300 transition-colors duration-300"></div>
    </div>
  )

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-2 rounded-xl transform group-hover:scale-110 transition-all duration-300 group-hover:rotate-3 shadow-lg group-hover:shadow-xl group-hover:shadow-violet-200">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-violet-500 group-hover:to-indigo-500 transition-all duration-300">
              JUgaadu
            </span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative w-full group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-violet-500 transition-colors duration-200" />
              <Input
                type="text"
                placeholder="Search for books, gadgets, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 rounded-full focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 hover:shadow-md focus:shadow-lg focus:shadow-violet-100 border-gray-200 hover:border-violet-200"
              />
            </form>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Button
              onClick={handleSellClick}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl hover:shadow-green-200 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4 mr-2" />
              Sell Item
            </Button>

            <Link href="/marketplace">
              <Button variant="ghost" className="text-gray-700 hover:text-violet-600 hover:bg-violet-50 transition-all duration-200">
                Marketplace
              </Button>
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/wishlist" className="relative">
                  <Button variant="ghost" size="icon" className="hover:bg-red-50 transition-all duration-200">
                    <Heart className="h-5 w-5 text-gray-700 hover:text-red-500 transition-colors duration-200" />
                  </Button>
                  {wishlistCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full animate-pulse shadow-lg">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </Badge>
                  )}
                </Link>

                <Link href="/chat" className="relative">
                  <Button variant="ghost" size="icon" className="hover:bg-green-50 transition-all duration-200">
                    <MessageCircle className="h-5 w-5 text-gray-700 hover:text-green-500 transition-colors duration-200" />
                  </Button>
                  {unreadMessages > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full animate-bounce shadow-lg">
                      {unreadMessages > 99 ? '99+' : unreadMessages}
                    </Badge>
                  )}
                </Link>

                <Button variant="ghost" size="icon" className="hover:bg-violet-50 transition-all duration-200 relative">
                  <Bell className="h-5 w-5 text-gray-700 hover:text-violet-500 transition-colors duration-200" />
                  {/* Notification pulse dot */}
                  <div className="absolute top-2 right-2 h-2 w-2 bg-violet-400 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute top-2 right-2 h-2 w-2 bg-violet-500 rounded-full"></div>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative rounded-full p-1 hover:bg-violet-50 transition-all duration-300">
                      <ProfileAvatar />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 shadow-xl border-0 bg-white/95 backdrop-blur-md" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal p-4">
                      <div className="flex items-center space-x-3">
                        <ProfileAvatar size="h-12 w-12" />
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-semibold leading-none text-gray-800">{user?.name}</p>
                          <p className="text-xs leading-none text-violet-600 bg-violet-100 px-2 py-1 rounded-full w-fit">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-violet-200 to-transparent" />
                    <DropdownMenuItem onClick={() => router.push("/profile")} className="hover:bg-violet-50 transition-colors duration-200 cursor-pointer">
                      <User className="mr-3 h-4 w-4 text-violet-500" />
                      <span className="text-gray-700">Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/my-listings")} className="hover:bg-violet-50 transition-colors duration-200 cursor-pointer">
                      <ShoppingCart className="mr-3 h-4 w-4 text-violet-500" />
                      <span className="text-gray-700">My Listings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/settings")} className="hover:bg-violet-50 transition-colors duration-200 cursor-pointer">
                      <Sparkles className="mr-3 h-4 w-4 text-violet-500" />
                      <span className="text-gray-700">Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-violet-200 to-transparent" />
                    <DropdownMenuItem onClick={logout} className="hover:bg-red-50 text-red-600 transition-colors duration-200 cursor-pointer">
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link href="/login">
                  <Button variant="ghost" className="text-violet-600 hover:text-violet-800 hover:bg-violet-50 transition-all duration-200">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl hover:shadow-violet-200 transition-all duration-300 transform hover:-translate-y-0.5">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden hover:bg-violet-50">
                <Menu className="h-6 w-6 text-gray-700" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white/95 backdrop-blur-md border-l border-violet-100">
              <div className="flex flex-col space-y-4 mt-4">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 focus:ring-violet-500 focus:border-violet-500"
                  />
                </form>

                <Button onClick={handleSellClick} className="w-full justify-start bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Sell Item
                </Button>

                <Link href="/marketplace">
                  <Button variant="ghost" className="w-full justify-start hover:bg-violet-50">
                    Marketplace
                  </Button>
                </Link>

                {isAuthenticated ? (
                  <>
                    <Link href="/wishlist">
                      <Button variant="ghost" className="w-full justify-start hover:bg-red-50">
                        <Heart className="mr-2 h-4 w-4 text-red-500" />
                        Wishlist
                        {wishlistCount > 0 && (
                          <Badge className="ml-auto bg-red-500">{wishlistCount}</Badge>
                        )}
                      </Button>
                    </Link>
                    <Link href="/chat">
                      <Button variant="ghost" className="w-full justify-start hover:bg-green-50">
                        <MessageCircle className="mr-2 h-4 w-4 text-green-500" />
                        Messages
                        {unreadMessages > 0 && (
                          <Badge className="ml-auto bg-green-500">{unreadMessages}</Badge>
                        )}
                      </Button>
                    </Link>
                    <Link href="/profile">
                      <Button variant="ghost" className="w-full justify-start hover:bg-violet-50">
                        <User className="mr-2 h-4 w-4 text-violet-500" />
                        Profile
                      </Button>
                    </Link>
                    <Button onClick={logout} variant="ghost" className="w-full justify-start hover:bg-red-50 text-red-600">
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" className="w-full justify-start hover:bg-violet-50 text-violet-600">
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="w-full justify-start bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}