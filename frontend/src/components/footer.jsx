import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              JUgaadu
            </h3>
            <p className="text-gray-400 text-sm">
              The trusted marketplace for college students to buy and sell used items safely within Jadavpur campus
              community.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transform hover:scale-110 transition-all duration-200"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transform hover:scale-110 transition-all duration-200"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-pink-400 transform hover:scale-110 transition-all duration-200"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/marketplace" className="block text-gray-400 hover:text-white transition-colors duration-200">
                Marketplace
              </Link>
              <Link href="/categories" className="block text-gray-400 hover:text-white transition-colors duration-200">
                Categories
              </Link>
              <Link
                href="/how-it-works"
                className="block text-gray-400 hover:text-white transition-colors duration-200"
              >
                How It Works
              </Link>
              <Link href="/safety" className="block text-gray-400 hover:text-white transition-colors duration-200">
                Safety Tips
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Categories</h4>
            <div className="space-y-2">
              <Link
                href="/category/books"
                className="block text-gray-400 hover:text-white transition-colors duration-200"
              >
                Textbooks
              </Link>
              <Link
                href="/category/electronics"
                className="block text-gray-400 hover:text-white transition-colors duration-200"
              >
                Electronics
              </Link>
              <Link
                href="/category/notes"
                className="block text-gray-400 hover:text-white transition-colors duration-200"
              >
                Study Notes
              </Link>
              <Link
                href="/category/furniture"
                className="block text-gray-400 hover:text-white transition-colors duration-200"
              >
                Furniture
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-400">
                <Mail className="h-4 w-4" />
                <span className="text-sm">akshatj.cse.ug@jadavpuruniversity.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+91 7439587602</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Jadavpur Univerity</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 JUgaadu. All rights reserved. |
            <Link href="/privacy" className="hover:text-white transition-colors duration-200 ml-1">
              Privacy Policy
            </Link>{" "}
            |
            <Link href="/terms" className="hover:text-white transition-colors duration-200 ml-1">
              Terms of Service | Created By Akshat
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
