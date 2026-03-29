"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, Heart, MessageCircle, User, Menu, Plus, Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { useAuth } from "@/components/auth-provider"
import { fetchWishlistCount, fetchUnreadMessagesCount } from "@/utils/api"

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()

  const [wishlistCount, setWishlistCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchCounts = async () => {
        try {
          const [wishlistNum, messagesNum] = await Promise.all([
            fetchWishlistCount(),
            fetchUnreadMessagesCount()
          ]);
          setWishlistCount(wishlistNum);
          setUnreadMessages(messagesNum);
        } catch (e) {
          console.error(e)
        }
      };
      fetchCounts();
      const interval = setInterval(fetchCounts, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleSellClick = () => {
    if (isAuthenticated) {
      router.push("/sell")
    } else {
      router.push("/login")
    }
  }

  const ProfileAvatar = ({ size = "h-12 w-12" }) => (
    <div className={`relative ${size} bg-black border-[3px] border-black flex items-center justify-center neo-shadow-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all sticker-rotate-2 group cursor-pointer`}>
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user?.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-[#CCFF00] font-mono font-bold text-lg uppercase">
          {user?.name?.charAt(0) || "U"}
        </span>
      )}
    </div>
  )

  return (
    <header className="sticky top-0 z-40 bg-white border-b-[4px] border-black py-4 px-6 md:px-10 flex justify-between items-center transition-all">
      {/* LEFT: LOGO */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-12 h-12 bg-black flex items-center justify-center border-[3px] border-[#CCFF00] sticker-rotate-1 group-hover:-rotate-3 transition-transform neo-shadow-volt">
            <ShoppingCart className="text-[#CCFF00] h-6 w-6" />
          </div>
          <span className="text-black font-ranchers text-3xl md:text-5xl tracking-wide uppercase whitespace-nowrap">JUgaadu</span>
        </Link>
      </div>

      {/* RIGHT: NAVIGATION */}
      <div className="flex items-center gap-6">
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={handleSellClick}
            className="font-mono bg-[#CCFF00] text-black px-6 py-3 border-[3px] border-black font-extrabold text-sm uppercase neo-shadow-black hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_#000] hover:bg-black hover:text-[#CCFF00] transition-all flex items-center gap-3"
          >
            <Plus className="h-5 w-5 border-2 border-current rounded-full" />
            SHIP IT
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-5 ml-4">
              <Link href="/wishlist" className="relative group">
                <div className="w-12 h-12 bg-white border-[3px] border-black flex items-center justify-center neo-shadow-black group-hover:bg-black group-hover:text-[#CCFF00] transition-colors">
                  <Heart className="h-5 w-5 current-color" />
                </div>
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-3 -right-3 border-[3px] border-black bg-[#CCFF00] text-black font-mono font-bold text-xs px-2 py-1 rounded-none neo-shadow-black">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </Badge>
                )}
              </Link>

              <Link href="/chat" className="relative group">
                <div className="w-12 h-12 bg-white border-[3px] border-black flex items-center justify-center neo-shadow-black group-hover:bg-black group-hover:text-[#CCFF00] transition-colors">
                  <MessageCircle className="h-5 w-5 current-color" />
                </div>
                {unreadMessages > 0 && (
                  <Badge className="absolute -top-3 -right-3 border-[3px] border-black bg-[#CCFF00] text-black font-mono font-bold text-xs px-2 py-1 rounded-none neo-shadow-black">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </Badge>
                )}
              </Link>

              <Link href="/notifications" className="relative group">
                <div className="w-12 h-12 bg-white border-[3px] border-black flex items-center justify-center neo-shadow-black group-hover:bg-black group-hover:text-[#CCFF00] transition-colors">
                  <Bell className="h-5 w-5 current-color" />
                </div>
                <div className="absolute -top-2 -right-2 h-4 w-4 bg-[#CCFF00] border-[3px] border-black rounded-none"></div>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="outline-none focus:outline-none ml-2">
                    <ProfileAvatar />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 font-mono uppercase font-bold border-[4px] border-black rounded-none neo-shadow-black bg-white mt-2 p-0" align="end" sideOffset={8}>
                  <DropdownMenuLabel className="p-4 border-b-[4px] border-black bg-gray-100">
                    <div className="flex flex-col">
                      <span className="text-black text-base truncate">{user?.name}</span>
                      <span className="text-gray-500 text-xs mt-1 truncate">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer p-4 border-b-[4px] border-black hover:bg-[#CCFF00] hover:text-black focus:bg-[#CCFF00] focus:text-black rounded-none flex items-center text-sm">
                    <User className="mr-3 h-5 w-5" /> PROFILE
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/my-listings")} className="cursor-pointer p-4 border-b-[4px] border-black hover:bg-[#CCFF00] hover:text-black focus:bg-[#CCFF00] focus:text-black rounded-none flex items-center text-sm">
                    <ShoppingCart className="mr-3 h-5 w-5" /> LISTINGS
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="cursor-pointer p-4 hover:bg-black hover:text-[#CCFF00] focus:bg-black focus:text-[#CCFF00] rounded-none flex items-center text-sm transition-colors">
                    LOGOUT
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex gap-4 ml-4">
              <Link href="/login" className="font-mono bg-white text-black px-8 py-3 border-[3px] border-black font-extrabold uppercase neo-shadow-black hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all text-sm">
                LOGIN
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="md:hidden w-12 h-12 bg-white border-[3px] border-black flex items-center justify-center neo-shadow-black active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
              <Menu className="h-6 w-6 text-black" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] sm:w-[350px] bg-white border-l-[6px] border-black p-6 flex flex-col font-mono uppercase">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">Mobile Navigation Menu</SheetDescription>
            <div className="font-ranchers text-5xl mb-8 mt-4 tracking-wider text-black">JUgaadu</div>

            <div className="flex flex-col gap-4">
              <button onClick={handleSellClick} className="w-full font-mono bg-[#CCFF00] text-black px-4 py-4 border-[4px] border-black font-bold uppercase neo-shadow-black text-center text-base active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center gap-3">
                <Plus className="h-5 w-5 border-2 border-black rounded-full" /> SHIP IT
              </button>

              <Link href="/marketplace" className="w-full font-mono bg-white text-black px-4 py-4 border-[4px] border-black font-bold uppercase neo-shadow-black text-center text-base active:translate-x-1 active:translate-y-1 active:shadow-none flex justify-center">
                MARKETPLACE
              </Link>

              {isAuthenticated ? (
                <>
                  <Link href="/notifications" className="w-full flex justify-between items-center font-mono bg-white text-black px-4 py-4 border-[4px] border-black font-bold uppercase neo-shadow-black text-base active:translate-x-1 active:translate-y-1 active:shadow-none">
                    <span className="flex items-center gap-3"><Bell className="h-5 w-5" /> NOTIFS</span>
                  </Link>
                  <Link href="/wishlist" className="w-full flex justify-between items-center font-mono bg-white text-black px-4 py-4 border-[4px] border-black font-bold uppercase neo-shadow-black text-base active:translate-x-1 active:translate-y-1 active:shadow-none">
                    <span className="flex items-center gap-3"><Heart className="h-5 w-5" /> WISHLIST</span>
                    {wishlistCount > 0 && <span className="bg-[#CCFF00] px-3 py-1 text-black border-[3px] border-black text-sm">{wishlistCount}</span>}
                  </Link>
                  <Link href="/chat" className="w-full flex justify-between items-center font-mono bg-white text-black px-4 py-4 border-[4px] border-black font-bold uppercase neo-shadow-black text-base active:translate-x-1 active:translate-y-1 active:shadow-none">
                    <span className="flex items-center gap-3"><MessageCircle className="h-5 w-5" /> MESSAGES</span>
                    {unreadMessages > 0 && <span className="bg-[#CCFF00] px-3 py-1 text-black border-[3px] border-black text-sm">{unreadMessages}</span>}
                  </Link>
                  <Link href="/profile" className="w-full flex items-center gap-3 font-mono bg-white text-black px-4 py-4 border-[4px] border-black font-bold uppercase neo-shadow-black text-base active:translate-x-1 active:translate-y-1 active:shadow-none">
                    <User className="h-5 w-5" /> PROFILE
                  </Link>
                  <button onClick={logout} className="w-full font-mono bg-black text-white px-4 py-4 border-[4px] border-black font-bold uppercase mt-6 text-base hover:bg-[#CCFF00] hover:text-black transition-colors">
                    LOGOUT
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-4 mt-6">
                  <Link href="/login" className="w-full text-center flex justify-center font-mono bg-black text-white px-4 py-4 border-[4px] border-black font-bold uppercase neo-shadow-black text-base active:translate-x-1 active:translate-y-1 active:shadow-none">
                    LOGIN
                  </Link>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}