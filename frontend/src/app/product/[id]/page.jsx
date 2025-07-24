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
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Share2,
  ArrowLeft,
  Star,
  MapPin,
  Shield,
  AlertTriangle,
  CreditCard,
  CheckCircle,
  Clock,
  Package,
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
        console.error("Failed to load product:", err);
        setError("Failed to load product details. Please try again.");
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
        toast({
          title: "Removed from wishlist",
          description: "Item has been removed from your wishlist.",
        });
      } else {
        await addToWishlist(params.id);
        toast({
          title: "Added to wishlist",
          description: "Item has been added to your wishlist.",
        });
      }
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      router.push('/login');
      toast({
          title: "Authentication Required",
          description: "Please log in to purchase an item.",
      });
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
        text: `Check out this item: ${product.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link Copied!", description: "Product link copied to clipboard." });
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-white/20 rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl h-96 border border-white/20"></div>
              <div className="space-y-6">
                <div className="h-8 bg-white/20 rounded-lg w-3/4"></div>
                <div className="h-6 bg-white/20 rounded-lg w-1/4"></div>
                <div className="h-24 bg-white/20 rounded-lg"></div>
                <div className="h-10 bg-white/20 rounded-lg w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 shadow-2xl">
            <AlertTriangle className="h-20 w-20 text-orange-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Product Not Found</h1>
            <p className="text-white/80 mb-8 text-lg">
              {error || "The product you're looking for doesn't exist or has been removed."}
            </p>
            <Link href="/marketplace" passHref>
               <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg">
                  <ArrowLeft className="h-5 w-5 inline mr-2" />
                  Back to Marketplace
               </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const productImages = product.images?.length > 0 ? product.images : [{ image: "https://placehold.co/600x600/eee/ccc?text=Product" }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <Header />
      
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center space-x-2 text-white/70 text-sm">
          <Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
          <span>/</span>
          <span className="text-white">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
              <div className="relative group">
                <img
                  src={productImages[selectedImageIndex]?.image}
                  alt={product.name}
                  className="w-full h-[500px] object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-6 right-6 flex flex-col space-y-3">
                  <button
                    onClick={toggleWishlist}
                    className={`p-4 rounded-full backdrop-blur-lg transition-all duration-300 transform hover:scale-110 shadow-xl border-2 ${
                      isWishlisted 
                        ? "bg-red-500 text-white border-red-400 shadow-red-500/50" 
                        : "bg-white/90 text-gray-700 hover:bg-white border-white/50 shadow-black/20"
                    }`}
                  >
                    <Heart className={`h-7 w-7 ${isWishlisted ? "fill-current" : ""}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-4 bg-white/90 backdrop-blur-lg rounded-full text-gray-700 hover:bg-white border-2 border-white/50 transition-all duration-300 transform hover:scale-110 shadow-xl shadow-black/20"
                  >
                    <Share2 className="h-7 w-7" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Image thumbnails */}
            {productImages.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      selectedImageIndex === index 
                        ? "border-orange-400 shadow-lg" 
                        : "border-white/20 hover:border-white/40"
                    }`}
                  >
                    <img
                      src={img.image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
              <h1 className="text-4xl font-bold text-white mb-4 leading-tight">{product.name}</h1>
              
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl font-bold text-orange-400">₹{product.price}</span>
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Available</span>
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-center">
                  <Shield className="h-6 w-6 text-green-400 mx-auto mb-2" />
                  <p className="text-white/80 text-sm">Verified</p>
                </div>
                <div className="text-center">
                  <Package className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-white/80 text-sm">Safe Deal</p>
                </div>
                <div className="text-center">
                  <Clock className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-white/80 text-sm">Quick Chat</p>
                </div>
              </div>

              <div className="border-t border-white/20 pt-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-orange-400" />
                  Description
                </h2>
                <p className="text-white/90 whitespace-pre-line leading-relaxed text-lg">{product.description}</p>
              </div>
            </div>

            {/* Seller Info & Actions */}
            {user?.id !== product.seller.id && (
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-orange-400" />
                  Seller Information
                </h2>
                
                <div className="flex items-center space-x-4 mb-8">
                  <div className="relative">
                    <img
                      src={product.seller.avatar || `https://ui-avatars.com/api/?name=${product.seller.first_name}+${product.seller.last_name}&background=6366f1&color=fff`}
                      alt={product.seller.first_name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white/20 shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white/20"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{product.seller.first_name} {product.seller.last_name}</h3>
                    <p className="text-white/70">JU Student</p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-white/70 text-sm ml-1">(Trusted)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <Button 
                     onClick={handleBuyNow} 
                     size="lg" 
                     className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                   >
                      <CreditCard className="h-5 w-5 mr-2" />
                      Buy Now
                   </Button>
                   <Button 
                     onClick={handleContactSeller} 
                     size="lg" 
                     className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 hover:border-white/40 font-semibold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                   >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Chat with Seller
                   </Button>
                </div>
              </div>
            )}

            {/* Owner Message */}
            {user?.id === product.seller.id && (
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg border border-blue-400/30 rounded-3xl p-6 text-center shadow-2xl">
                    <CheckCircle className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                    <p className="font-semibold text-blue-100 text-lg">This is your listing</p>
                    <p className="text-blue-200/80 mt-2">You can manage it from your profile dashboard</p>
                </div>
            )}

            {/* Login CTA */}
            {!isAuthenticated && (
                <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-lg border border-orange-400/30 rounded-3xl p-8 text-center shadow-2xl">
                    <h3 className="text-xl font-semibold text-white mb-4">Ready to make a deal?</h3>
                    <p className="text-white/80 mb-6">Join JUgaadu to buy this item or chat with the seller</p>
                    <Link href="/login" passHref>
                        <Button 
                          size="lg" 
                          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          Login to Continue
                        </Button>
                    </Link>
                </div>
            )}
          </div>
        </div>

        {/* Safety Information */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl mt-12">
          <div className="text-center mb-8">
            <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Safe Trading Tips</h2>
            <p className="text-white/70">Your safety is our priority at JUgaadu</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
              <MessageCircle className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Chat First</h3>
              <p className="text-white/70 text-sm">Always communicate through our platform before meeting</p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
              <MapPin className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Meet Safe</h3>
              <p className="text-white/70 text-sm">Meet in public places within the JU campus</p>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
              <Shield className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Stay Protected</h3>
              <p className="text-white/70 text-sm">Report any suspicious activity to our team</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}