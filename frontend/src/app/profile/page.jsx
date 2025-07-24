"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { getCurrentUser, fetchUserListings } from "@/utils/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {
  User,
  Mail,
  Package,
  Plus,
  Eye,
  Edit3,
  Star,
  Calendar,
  MapPin,
  ShoppingBag,
  Heart,
  MessageCircle,
  Settings,
  Award,
  TrendingUp,
} from "lucide-react";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchProfileAndListings = async () => {
      if (user) {
        try {
          setLoading(true);
          const profileData = await getCurrentUser();
          setProfile(profileData);

          const listingsData = await fetchUserListings();
          setListings(listingsData);

        } catch (error) {
          console.error("Failed to fetch profile or listings", error);
          toast({
            title: "Error",
            description: "Failed to load your profile. Please try again later.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfileAndListings();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <Header />
        <div className="flex justify-center items-center h-[70vh]">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-orange-400"></div>
            <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-lg"></div>
            <p className="text-white mt-6 text-center font-medium">Loading your profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <Header />
        <div className="flex justify-center items-center h-[70vh]">
          <div className="text-center text-white">
            <User className="h-16 w-16 mx-auto mb-4 text-white/60" />
            <p className="text-xl font-semibold mb-2">Profile not found</p>
            <p className="text-white/80">Please try logging in again</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { first_name, last_name, email } = profile;

  const profileStats = [
    { label: 'Total Listings', value: listings?.length || 0, icon: Package, color: 'text-blue-400' },
    { label: 'Profile Views', value: '24', icon: Eye, color: 'text-green-400' },
    { label: 'Member Since', value: 'Jan 2024', icon: Calendar, color: 'text-purple-400' },
    { label: 'Trust Score', value: '4.8', icon: Star, color: 'text-yellow-400' },
  ];

  const tabs = [
    { id: 'listings', label: 'My Listings', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl mb-8">
          <div className="relative overflow-hidden rounded-t-3xl">
            <div className="h-32 bg-gradient-to-r from-orange-500/20 to-yellow-500/20"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
          
          <div className="px-8 pb-8 -mt-16 relative">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white/20 shadow-2xl">
                  <AvatarImage 
                    src={`https://ui-avatars.com/api/?name=${first_name}+${last_name}&background=6366f1&color=fff&size=128`} 
                    alt={`${first_name} ${last_name}`}
                  />
                  <AvatarFallback className="text-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                    {first_name?.[0]}{last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-white/20 shadow-lg">
                  <Award className="h-4 w-4 text-white" />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-white mb-2">{first_name} {last_name}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2 text-white/80 mb-4">
                  <Mail className="h-4 w-4" />
                  <span>{email}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-white/70 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>Jadavpur University</span>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium border border-green-400/20">
                    Verified Student
                  </span>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-400/20">
                    Trusted Seller
                  </span>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-400/20">
                    Active Member
                  </span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 hover:border-white/40 px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {profileStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl text-center">
                <Icon className={`h-8 w-8 ${stat.color} mx-auto mb-3`} />
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-white/70 text-sm">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl mb-8">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 rounded-t-2xl transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl p-8">
          {activeTab === 'listings' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Package className="h-6 w-6 text-orange-400" />
                  My Listings ({listings?.length || 0})
                </h2>
                <Link href="/sell" passHref>
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200">
                    <Plus className="h-4 w-4 mr-2" />
                    Sell New Item
                  </Button>
                </Link>
              </div>

              {listings && listings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((product) => (
                    <div key={product.id} className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                      <div className="relative group">
                        <img
                          src={product.images?.[0]?.image || 'https://placehold.co/600x400/6366f1/ffffff?text=Product'}
                          alt={product.name || product.title}
                          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          Active
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">{product.name || product.title}</h3>
                        <p className="text-2xl font-bold text-orange-400 mb-4">₹{product.price}</p>
                        
                        <div className="flex gap-2">
                          <Link href={`/product/${product.id}`} passHref className="flex-1">
                            <Button className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-lg transition-all duration-200">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </Link>
                          <Button className="px-4 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-400/30 rounded-lg transition-all duration-200">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-white/5 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="h-12 w-12 text-white/40" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">No listings yet</h3>
                  <p className="text-white/70 mb-8 max-w-md mx-auto">
                    Start selling your items to fellow JU students and earn some extra money!
                  </p>
                  <Link href="/sell" passHref>
                    <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold">
                      <Plus className="h-5 w-5 mr-2" />
                      List Your First Item
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="text-center py-16">
              <div className="bg-white/5 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Heart className="h-12 w-12 text-white/40" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Wishlist coming soon!</h3>
              <p className="text-white/70 max-w-md mx-auto">
                Save your favorite items and get notified when prices drop.
              </p>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="text-center py-16">
              <div className="bg-white/5 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-12 w-12 text-white/40" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">No messages yet</h3>
              <p className="text-white/70 max-w-md mx-auto">
                Your conversations with buyers and sellers will appear here.
              </p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="text-center py-16">
              <div className="bg-white/5 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Settings className="h-12 w-12 text-white/40" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Account settings</h3>
              <p className="text-white/70 max-w-md mx-auto">
                Manage your account preferences, notifications, and privacy settings.
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-lg rounded-2xl p-6 border border-orange-400/30 shadow-xl">
            <TrendingUp className="h-8 w-8 text-orange-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Boost Your Sales</h3>
            <p className="text-white/80 mb-4">Learn tips to sell faster and earn more on JUgaadu</p>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg">
              Learn More
            </Button>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-400/30 shadow-xl">
            <Award className="h-8 w-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Earn Rewards</h3>
            <p className="text-white/80 mb-4">Complete challenges and earn badges for being an active member</p>
            <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg">
              View Rewards
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}