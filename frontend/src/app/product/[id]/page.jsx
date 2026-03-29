"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import {
  fetchProductById,
  addToWishlist,
  removeFromWishlist,
  startConversation,
} from "@/utils/api";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {
  Heart,
  MessageCircle,
  Share2,
  ArrowLeft,
  Star,
  MapPin,
  Shield,
  CreditCard,
  CheckCircle,
  Package,
  User,
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const isAuthenticated = !!user;

  useEffect(() => {
    async function loadProduct() {
      if (!params.id) return;
      try {
        setLoading(true);
        const productData = await fetchProductById(params.id);
        setProduct(productData);
        if (isAuthenticated) {
          setIsWishlisted(productData.is_in_wishlist || false);
        }
      } catch (err) {
        setError("DATA CORRUPTED OR ITEM SECURED.");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [params.id, isAuthenticated]);

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist(params.id);
        toast({ title: "CLEARED", description: "REMOVED FROM WISHLIST." });
      } else {
        await addToWishlist(params.id);
        toast({ title: "SECURED", description: "ADDED TO WISHLIST." });
      }
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      toast({ title: "ERROR", description: "WISHLIST OPERATION FAILED.", variant: "destructive" });
    }
  };

  const handleContactSeller = async (e) => {
    e.stopPropagation();

    if (!user) {
      toast({ title: "AUTH FAILED", description: "LOGIN REQUIRED." });
      router.push('/login');
      return;
    }

    if (user.id === product.seller.id) {
      toast({ title: "INVALID COMMAND", description: "CANNOT COMMS SELF." });
      return;
    }

    try {
      const conversation = await startConversation(product.seller.id, product.id);
      router.push(`/chat?chatId=${conversation.id}`);
    } catch (error) {
      if (error.response?.data?.chat_id) {
        router.push(`/chat?chatId=${error.response.data.chat_id}`);
      } else {
        toast({ title: "COMMS FAILED", description: "SIGNAL DROPPED.", variant: "destructive" });
      }
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      router.push('/login');
      toast({ title: "AUTH REQUIRED", description: "LOGIN TO PURCHASE." });
      return;
    }
    const queryParams = new URLSearchParams({
      productId: product.id,
      amount: product.price,
      name: product.name,
      image: product.images?.[0]?.image || ''
    });
    router.push(`/payment?${queryParams.toString()}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `CHECK OUT: ${product.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "LINK COPIED", description: "COPIED TO CLIPBOARD." });
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#121212] font-jakarta selection:bg-[#CCFF00] selection:text-black">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-16 flex items-center justify-center min-h-[50vh]">
          <div className="bg-[#CCFF00] border-[6px] border-black p-8 neo-shadow-black sticker-rotate-1 inline-flex items-center gap-4">
            <div className="w-6 h-6 border-4 border-black border-t-transparent animate-spin rounded-full"></div>
            <h2 className="font-ranchers text-4xl uppercase text-black">ACCESSING DATABANKS...</h2>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#121212] font-jakarta selection:bg-[#CCFF00] selection:text-black">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="bg-white border-[6px] border-black p-12 neo-shadow-volt max-w-2xl mx-auto">
            <div className="bg-black text-[#CCFF00] w-24 h-24 mx-auto border-[4px] border-[#CCFF00] flex items-center justify-center mb-6 sticker-rotate-2 pointer-events-none">
              <h1 className="font-ranchers text-5xl">404</h1>
            </div>
            <h1 className="text-4xl font-ranchers text-black mb-4 uppercase">ASSET UNREACHABLE</h1>
            <p className="font-mono text-gray-500 font-bold uppercase mb-8 border-l-[4px] border-black pl-3 text-left">
              {error || "THE ITEM HAS BEEN SCRUBBED OR SECURED BY ANOTHER BUYER."}
            </p>
            <Link href="/marketplace" passHref>
              <button className="bg-[#CCFF00] text-black border-[4px] border-black px-6 py-3 font-mono font-bold uppercase transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none neo-shadow-black inline-flex items-center">
                <ArrowLeft className="h-5 w-5 mr-3" /> RETURN TO MARKET
              </button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const productImages = product.images?.length > 0 ? product.images : [{ image: "https://placehold.co/600x600/000000/CCFF00?text=NO+IMAGE" }];

  return (
    <div className="min-h-screen bg-[#121212] font-jakarta selection:bg-[#CCFF00] selection:text-black pb-12">
      <Header />

      {/* Breadcrumb Brutalist */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4">
        <div className="bg-black text-[#CCFF00] inline-block border-[3px] border-[#CCFF00] px-3 py-1 font-mono text-[10px] font-bold uppercase">
          <Link href="/marketplace" className="hover:text-white transition-colors">MARKET</Link>
          <span className="mx-2 text-white">//</span>
          <span className="text-white truncate max-w-[200px] inline-block align-bottom">{product.name}</span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mt-4">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* LEFT: Product Images Box */}
          <div className="w-full lg:w-5/12 shrink-0 space-y-4">
            {/* Main Image */}
            <div className="bg-white border-[6px] border-black p-2 neo-shadow-vault relative group">
              <div className="border-[4px] border-black bg-black h-[400px] md:h-[500px] relative overflow-hidden">
                <img
                  src={productImages[selectedImageIndex]?.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 opacity-90 hover:opacity-100"
                />

                {/* Action overlays */}
                <div className="absolute top-4 right-4 flex flex-col gap-3">
                  <button
                    onClick={toggleWishlist}
                    className={`w-12 h-12 flex items-center justify-center border-[4px] border-black transition-colors ${isWishlisted ? "bg-red-500 text-white shadow-[4px_4px_0_0_#000]" : "bg-white text-black hover:bg-[#CCFF00] neo-shadow-black"
                      }`}
                  >
                    <Heart className={`h-6 w-6 ${isWishlisted ? "fill-current" : ""}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-12 h-12 flex items-center justify-center bg-white border-[4px] border-black text-black hover:bg-[#CCFF00] transition-colors neo-shadow-black"
                  >
                    <Share2 className="h-6 w-6" />
                  </button>
                </div>

                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <div className="bg-[#CCFF00] text-black border-[3px] border-black px-2 py-1 font-mono font-bold text-xs uppercase shadow-[4px_4px_0_0_#000]">
                    {product.condition}
                  </div>
                  {product.is_sold && (
                    <div className="bg-red-600 text-white border-[3px] border-black px-2 py-1 font-mono font-bold text-xs uppercase shadow-[4px_4px_0_0_#FFF]">
                      SOLD OUT
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`shrink-0 w-24 h-24 border-[4px] border-black bg-black overflow-hidden transition-all ${selectedImageIndex === index ? 'shadow-[4px_4px_0_0_#CCFF00] -translate-y-1' : 'hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#FFF]'
                      }`}
                  >
                    <img src={img.image} className="w-full h-full object-cover opacity-80 hover:opacity-100" alt="thumb" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Info Box */}
          <div className="flex-1 w-full space-y-6">

            {/* Core Info */}
            <div className="bg-white border-[6px] border-black p-6 md:p-10 neo-shadow-black">
              <div className="flex justify-between items-start gap-4 flex-col sm:flex-row mb-6 pb-6 border-b-[4px] border-black">
                <div>
                  <h1 className="font-ranchers text-4xl md:text-6xl text-black uppercase leading-none mb-3">{product.name}</h1>
                  <p className="font-mono text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                    <Package className="h-4 w-4 shrink-0" /> POSTED REGISTRY
                  </p>
                </div>

                <div className="shrink-0 text-left sm:text-right">
                  <div className="font-ranchers text-5xl text-black">₹{product.price}</div>
                  <div className="font-mono text-xs font-bold text-black border-[2px] border-black px-2 py-1 bg-[#CCFF00] inline-flex items-center shadow-[3px_3px_0_0_#000] mt-1">
                    <CheckCircle className="h-3 w-3 mr-1" /> CLEARED
                  </div>
                </div>
              </div>

              <div className="border-l-[4px] border-[#CCFF00] pl-4 mb-8">
                <h2 className="font-mono font-bold text-sm text-black uppercase mb-2">ASSET DESCRIPTION</h2>
                <p className="font-jakarta whitespace-pre-line text-black leading-relaxed text-base font-medium">
                  {product.description}
                </p>
              </div>

              {user?.id !== product.seller?.id ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t-[4px] border-black mt-auto">
                  <button
                    onClick={handleBuyNow}
                    disabled={product.is_sold}
                    className={`flex justify-center items-center py-4 border-[4px] border-black font-ranchers text-2xl uppercase tracking-widest transition-all ${product.is_sold ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#CCFF00] text-black hover:translate-y-1 hover:translate-x-1 neo-shadow-black hover:shadow-none hover:bg-black hover:text-[#CCFF00]"
                      }`}
                  >
                    {product.is_sold ? 'SECURED' : <><CreditCard className="h-6 w-6 mr-3" /> BUY ASSET</>}
                  </button>

                  <button
                    onClick={handleContactSeller}
                    disabled={product.is_sold}
                    className={`flex justify-center items-center py-4 border-[4px] border-black font-ranchers text-2xl uppercase tracking-widest transition-all ${product.is_sold ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-black text-white hover:translate-y-1 hover:translate-x-1 neo-shadow-volt hover:shadow-none hover:bg-[#CCFF00] hover:text-black"
                      }`}
                  >
                    {product.is_sold ? 'LOCKED' : <><MessageCircle className="h-6 w-6 mr-3" /> PING COMMS</>}
                  </button>
                </div>
              ) : (
                <div className="bg-black text-[#CCFF00] border-[4px] border-[#CCFF00] p-4 text-center mt-6">
                  <p className="font-mono font-bold uppercase text-sm">✓ SELLER AUTHENTICATED. YOU OWN THIS REGISTRY.</p>
                </div>
              )}
            </div>

            {/* Grid Bottom: Seller & Safety */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Seller Panel */}
              <div className="bg-white border-[6px] border-black p-6 neo-shadow-vault">
                <h3 className="font-mono font-bold text-xs uppercase mb-4 pb-2 border-b-[4px] border-black text-black">SELLER DATAFILE</h3>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#CCFF00] border-[4px] border-black shrink-0 relative sticker-rotate-2 flex items-center justify-center">
                    {product.seller?.avatar ? (
                      <img src={product.seller.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-black" />
                    )}
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-black rounded-full border-[2px] border-white"></div>
                  </div>
                  <div>
                    <h4 className="font-ranchers text-2xl text-black uppercase leading-none mb-1">{product.seller?.first_name}</h4>
                    <p className="font-mono text-[10px] font-bold text-gray-600 uppercase mb-2">JADAVPUR ALUMNI/STUDENT</p>
                    <div className="flex bg-[#CCFF00] border-[2px] border-black px-2 py-0.5 w-max font-mono text-[10px] font-bold text-black items-center shadow-[2px_2px_0_0_#000]">
                      <Star className="h-3 w-3 mr-1 fill-current" /> TRUST: {product.seller?.rating || 'NEW'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Safety Panel */}
              <div className="bg-[#CCFF00] border-[6px] border-black p-6 neo-shadow-black">
                <h3 className="font-mono font-bold text-xs uppercase mb-4 text-black border-b-[4px] border-black pb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" /> PROTOCOL SAFETY
                </h3>

                <ul className="space-y-3 font-mono text-[10px] font-bold text-black uppercase">
                  <li className="flex items-start gap-2">
                    <div className="w-3 h-3 bg-black mt-0.5 shrink-0" />
                    ONLY USE INTERNAL COMMS CHANNEL.
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-3 h-3 bg-black mt-0.5 shrink-0" />
                    PHYSICAL EXCHANGE @ CAMPUS ZONES.
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-3 h-3 bg-black mt-0.5 shrink-0" />
                    REPORT ANOMALIES TO ADMIN.
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
}