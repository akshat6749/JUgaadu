"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { ArrowRight, BookOpen, Smartphone, FileText, Users, Shield, Zap, Star, TrendingUp, Heart } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 text-white">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute top-20 right-16 w-1 h-1 bg-pink-300 rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-blue-300 rounded-full animate-ping animation-delay-1000"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-green-400 rounded-full animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
          <div className="text-center space-y-10">
            {/* Enhanced Logo/Title */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-black leading-tight animate-fade-in-up">
                <span className="block text-white drop-shadow-lg">JU Campus</span>
                <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent animate-gradient">
                  Marketplace
                </span>
              </h1>
              
              {/* Main Bengali Tagline */}
              <div className="relative">
                <p className="text-2xl md:text-4xl font-bold text-yellow-300 mb-2 drop-shadow-md">
                  "Jadavpur ka asli Jugaad"
                </p>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
              </div>
            </div>

            {/* Secondary Taglines */}
            <div className="space-y-4">
              <p className="text-xl md:text-2xl text-indigo-100 font-medium">
                "Becho, Kharido, JUgaadu bano"
              </p>
              <p className="text-lg md:text-xl text-purple-200 max-w-3xl mx-auto leading-relaxed">
                Buy and sell textbooks, gadgets, and study materials with fellow JU students. Safe, easy, and affordable - JUlog ke liye, JUgaadu ready hai!
              </p>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/marketplace"
                className="group relative bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-10 py-5 rounded-full font-bold text-lg hover:from-yellow-300 hover:to-orange-400 transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/25"
              >
                <span className="flex items-center justify-center">
                  Browse Items
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 rounded-full bg-white opacity-20 group-hover:animate-ping"></div>
              </Link>
              
              <Link
                href="/signup"
                className="group relative border-3 border-white bg-white/10 backdrop-blur-sm text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white hover:text-purple-700 transform hover:scale-110 transition-all duration-300 shadow-xl"
              >
                <span className="flex items-center justify-center">
                  Start Jugaad
                  <Zap className="ml-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                </span>
              </Link>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-yellow-300">2K+</div>
                <div className="text-sm text-purple-200">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-green-300">5K+</div>
                <div className="text-sm text-purple-200">Items Sold</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-300">₹2L+</div>
                <div className="text-sm text-purple-200">Saved</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Floating Elements */}
        <div className="absolute top-20 left-10">
          <div className="bg-yellow-400/20 p-3 rounded-full backdrop-blur-sm">
            <BookOpen className="h-12 w-12 text-yellow-300" />
          </div>
        </div>
        <div className="absolute top-40 right-20">
          <div className="bg-pink-400/20 p-3 rounded-full backdrop-blur-sm">
            <Smartphone className="h-10 w-10 text-pink-300" />
          </div>
        </div>
        <div className="absolute bottom-20 left-20">
          <div className="bg-blue-400/20 p-3 rounded-full backdrop-blur-sm">
            <FileText className="h-8 w-8 text-blue-300" />
          </div>
        </div>
        <div className="absolute top-32 right-1/3">
          <div className="bg-green-400/20 p-2 rounded-full backdrop-blur-sm">
            <Star className="h-6 w-6 text-green-300" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6">
              Why Choose JU Marketplace?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for Jadavpur University students, by JU students - where every transaction is a jugaad success story!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl w-20 h-20 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl group-hover:shadow-blue-500/25">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Heart className="h-3 w-3 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">JU Community</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Connect only with verified JU students. Safe and trusted transactions within our beloved campus community.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl w-20 h-20 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl group-hover:shadow-green-500/25">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                  <Star className="h-3 w-3 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure & Safe</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Built-in chat system, verified profiles, and safety guidelines to ensure secure transactions every time.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl w-20 h-20 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl group-hover:shadow-purple-500/25">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Quick Jugaad</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                List items in seconds, chat instantly with buyers, and complete transactions with just a few taps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Popular Categories
            </h2>
            <p className="text-xl text-gray-600">Find exactly what you need for your JU journey</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: "Textbooks", icon: BookOpen, color: "from-blue-500 to-blue-600", count: "1,234", bgColor: "bg-blue-50" },
              { name: "Electronics", icon: Smartphone, color: "from-purple-500 to-purple-600", count: "567", bgColor: "bg-purple-50" },
              { name: "Study Notes", icon: FileText, color: "from-green-500 to-green-600", count: "890", bgColor: "bg-green-50" },
              { name: "Furniture", icon: Users, color: "from-orange-500 to-orange-600", count: "234", bgColor: "bg-orange-50" },
            ].map((category, index) => (
              <Link
                key={category.name}
                href={`/category/${category.name.toLowerCase()}`}
                className={`group ${category.bgColor} rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-500 border border-white/50`}
              >
                <div className="text-center">
                  <div
                    className={`bg-gradient-to-br ${category.color} p-4 rounded-xl w-16 h-16 mx-auto mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 shadow-lg`}
                  >
                    <category.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{category.name}</h3>
                  <p className="text-sm text-gray-600 font-semibold">{category.count} items</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-16 right-20 w-2 h-2 bg-pink-300 rounded-full animate-ping"></div>
          <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-blue-300 rounded-full animate-pulse animation-delay-1000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready for the Ultimate Jugaad?</h2>
          <p className="text-xl mb-4 text-indigo-100">
            Join thousands of JU students already using our marketplace to buy and sell items safely.
          </p>
          <p className="text-2xl mb-10 text-yellow-300 font-bold">
            "JUlog ke liye, Jugaadu ready hai!"
          </p>
          
          <Link
            href="/signup"
            className="group relative bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-12 py-6 rounded-full font-bold text-xl hover:from-yellow-300 hover:to-orange-400 transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/30 inline-flex items-center"
          >
            <span className="mr-3">Start Your Jugaad Today</span>
            <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
            <div className="absolute inset-0 rounded-full bg-white opacity-20 group-hover:animate-ping"></div>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}