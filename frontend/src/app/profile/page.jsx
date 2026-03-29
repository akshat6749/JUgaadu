"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { getCurrentUser, fetchUserListings } from "@/utils/api";
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
            title: "SYSTEM ERROR",
            description: "COULD NOT LOAD PROFILE DATA.",
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
      <div className="min-h-screen bg-[#121212] selection:bg-[#CCFF00] selection:text-black">
        <Header />
        <div className="flex justify-center items-center h-[70vh]">
          <div className="bg-[#CCFF00] border-[6px] border-black neo-shadow-black p-10 flex items-center gap-6 sticker-rotate-2">
            <div className="animate-spin h-10 w-10 border-4 border-black border-t-transparent rounded-full"></div>
            <h2 className="font-ranchers text-4xl text-black tracking-widest uppercase">LOADING...</h2>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#121212] selection:bg-[#CCFF00] selection:text-black">
        <Header />
        <div className="flex justify-center items-center h-[70vh] px-4">
          <div className="bg-white border-[6px] border-black neo-shadow-volt p-12 text-center max-w-lg w-full">
            <User className="h-16 w-16 mx-auto mb-6 text-black" />
            <h2 className="font-ranchers text-5xl text-black mb-4 uppercase">404 NOT FOUND</h2>
            <p className="font-mono font-bold uppercase text-gray-500 mb-8 border-l-[4px] border-[#CCFF00] pl-4 text-left">
              PROFILE DATA UNREACHABLE. RE-AUTHENTICATE.
            </p>
            <button onClick={() => router.push('/login')} className="w-full bg-[#CCFF00] text-black border-[4px] border-black py-4 font-mono font-extrabold uppercase neo-shadow-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              RETURN TO LOGIN
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { first_name, last_name, email } = profile;

  const profileStats = [
    { label: 'LISTINGS', value: listings?.length || 0, color: 'bg-[#CCFF00]' },
    { label: 'VIEWS', value: '24', color: 'bg-white' },
    { label: 'MEMBER SINCE', value: 'JAN 2024', color: 'bg-white' },
    { label: 'TRUST', value: '4.8', color: 'bg-[#CCFF00]' },
  ];

  const tabs = [
    { id: 'listings', label: 'INVENTORY', icon: Package },
    { id: 'wishlist', label: 'WISHLIST', icon: Heart },
    { id: 'messages', label: 'COMMS', icon: MessageCircle },
    { id: 'settings', label: 'SYSTEM', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#121212] selection:bg-[#CCFF00] selection:text-black">
      <Header />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        {/* Profile Header */}
        <div className="bg-white border-[6px] border-black neo-shadow-vault mb-12 relative">
          <div className="h-32 bg-black border-b-[6px] border-black flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: "radial-gradient(#CCFF00 2px, transparent 2px)", backgroundSize: "20px 20px" }}></div>
            <div className="font-ranchers text-[100px] text-white opacity-10 absolute -bottom-8 pointer-events-none tracking-widest">JUGAADU_ID</div>
          </div>

          <div className="px-6 md:px-10 pb-8 mt-[-60px] relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
              <div className="relative">
                <div className="w-32 h-32 bg-white border-[6px] border-black neo-shadow-black flex items-center justify-center shrink-0 overflow-hidden sticker-rotate-1 group">
                  <img
                    src={`https://ui-avatars.com/api/?name=${first_name}+${last_name}&background=CCFF00&color=000&size=128&bold=true`}
                    alt="Avatar"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 bg-black text-[#CCFF00] border-[3px] border-white p-2 neo-shadow-black">
                  <Award className="h-5 w-5" />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
                <h1 className="font-ranchers text-5xl md:text-6xl text-black uppercase mb-1">{first_name} {last_name}</h1>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-6 font-mono font-bold text-sm uppercase text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#CCFF00] border-[1px] border-black"></div>
                    {email}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-black"></div>
                    JADAVPUR UNIVERSITY
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 justify-center md:justify-start font-mono font-extrabold text-[10px] uppercase">
                  <span className="px-3 py-1 bg-[#CCFF00] text-black border-[3px] border-black shadow-[3px_3px_0px_#000]">
                    VERIFIED STUDENT
                  </span>
                  <span className="px-3 py-1 bg-black text-white border-[3px] border-black shadow-[3px_3px_0px_#CCFF00]">
                    ACTIVE SELLER
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 mt-6 md:mt-0">
                <button className="bg-[#CCFF00] text-black border-[4px] border-black px-6 py-3 font-mono font-bold uppercase hover:-translate-y-1 hover:-translate-x-1 shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] transition-all flex items-center justify-center gap-2">
                  <Edit3 className="h-4 w-4" /> EDIT
                </button>
                <button className="bg-white text-black border-[4px] border-black p-3 hover:bg-black hover:text-[#CCFF00] transition-colors flex items-center justify-center">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {profileStats.map((stat, index) => (
            <div key={index} className={`${stat.color} border-[4px] border-black p-6 flex flex-col items-center justify-center text-center neo-shadow-${stat.color === 'bg-[#CCFF00]' ? 'black' : 'volt'} hover:-translate-y-1 transition-transform`}>
              <p className="font-ranchers text-4xl text-black leading-none mb-1">{stat.value}</p>
              <p className="font-mono text-xs font-bold uppercase text-black border-t-[2px] border-black pt-2 mt-2 w-full">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b-[6px] border-black mb-8 gap-2 pb-[-6px] scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-mono font-bold text-sm uppercase transition-all whitespace-nowrap border-t-[4px] border-l-[4px] border-r-[4px] border-black ${isActive
                    ? 'bg-[#CCFF00] text-black translate-y-[6px] pb-5'
                    : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-black mt-2'
                  }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {activeTab === 'listings' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-l-[6px] border-[#CCFF00] bg-white p-4">
                <h2 className="font-ranchers text-4xl text-black uppercase tracking-wide">
                  INVENTORY <span className="text-gray-400">[{listings?.length || 0}]</span>
                </h2>
                <Link href="/sell" passHref>
                  <button className="bg-black text-[#CCFF00] px-6 py-3 font-mono font-bold uppercase text-sm flex items-center gap-2 border-[3px] border-transparent hover:border-[#CCFF00] hover:-translate-y-1 transition-all">
                    <Plus className="h-4 w-4" /> LIST NEW ITEM
                  </button>
                </Link>
              </div>

              {listings && listings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((product) => (
                    <div key={product.id} className="bg-white border-[4px] border-black p-4 neo-shadow-volt hover:-translate-y-1 hover:-translate-x-1 hover:shadow-none transition-all group flex flex-col">
                      <div className="relative border-[4px] border-black mb-4 overflow-hidden h-48">
                        <img
                          src={product.images?.[0]?.image || 'https://placehold.co/600x400/000000/CCFF00?text=NO+IMAGE'}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 bg-[#CCFF00] text-black border-[3px] border-black px-2 py-0.5 font-mono text-xs font-bold uppercase">
                          ACTIVE
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-mono font-extrabold text-black text-lg mb-2 uppercase line-clamp-2 leading-tight">
                            {product.title}
                          </h3>
                          <p className="font-ranchers text-4xl text-black mb-4 tracking-wide">₹{product.price}</p>
                        </div>

                        <div className="flex gap-3 mt-auto pt-4 border-t-[4px] border-black">
                          <Link href={`/product/${product.id}`} passHref className="flex-1">
                            <button className="w-full bg-white hover:bg-[#CCFF00] text-black border-[3px] border-black py-2 font-mono font-bold text-sm uppercase transition-colors flex items-center justify-center gap-2">
                              <Eye className="h-4 w-4" /> VIEW
                            </button>
                          </Link>
                          <button className="bg-black text-white hover:bg-white hover:text-black border-[3px] border-black px-4 transition-colors flex items-center justify-center">
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border-[6px] border-black p-12 text-center neo-shadow-volt">
                  <div className="w-20 h-20 bg-black border-[4px] border-[#CCFF00] flex items-center justify-center mx-auto mb-6 sticker-rotate-2">
                    <ShoppingBag className="h-10 w-10 text-[#CCFF00]" />
                  </div>
                  <h3 className="font-ranchers text-5xl text-black uppercase mb-4">EMPTY INVENTORY</h3>
                  <p className="font-mono text-gray-500 font-bold uppercase tracking-widest text-sm mb-8">
                    START SELLING. GET PAID.
                  </p>
                  <Link href="/sell" passHref>
                    <button className="bg-[#CCFF00] text-black border-[4px] border-black px-8 py-4 font-mono font-extrabold uppercase text-lg neo-shadow-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all inline-flex items-center gap-3">
                      <Plus className="h-5 w-5 border-2 border-black rounded-full" /> INITIALIZE LISTING
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab !== 'listings' && (
            <div className="bg-white border-[6px] border-black p-12 text-center neo-shadow-volt h-full flex flex-col items-center justify-center">
              <h3 className="font-ranchers text-5xl text-black uppercase mb-4 tracking-wide">MODULE OFFLINE</h3>
              <p className="font-mono text-gray-500 font-bold uppercase border-l-[4px] border-black pl-4">
                THIS COMPONENT IS CURRENTLY UNDER CONSTRUCTION.
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}