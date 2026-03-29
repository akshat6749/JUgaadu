import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t-[6px] border-[#CCFF00]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-10">

        {/* Top Grid: 3 equal columns for L/C/R alignment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Left: Brand */}
          <div className="flex flex-col space-y-3 justify-start items-start md:items-start">
            <h3 className="text-4xl md:text-5xl font-ranchers uppercase tracking-wide leading-none">
              JUGAADU
            </h3>
            <div className="inline-block border-[2px] border-[#CCFF00] px-2 py-0.5 bg-white sticker-rotate-1">
              <span className="font-mono text-black font-black text-[10px] tracking-widest uppercase">
                #1 JADAVPUR HUB
              </span>
            </div>
            <p className="font-mono font-medium text-gray-400 text-[10px] leading-snug max-w-[250px] uppercase">
              THE TRUSTED MARKETPLACE TO BUY AND SELL ITEMS SAFELY WITHIN THE CAMPUS COMMUNITY.
            </p>

            <div className="flex space-x-3 pt-2">
              <a href="#" className="w-8 h-8 bg-white flex items-center justify-center border-[2px] border-[#CCFF00] text-black hover:bg-[#CCFF00] hover:-translate-y-1 transition-all shadow-[2px_2px_0_0_#CCFF00]">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-white flex items-center justify-center border-[2px] border-[#CCFF00] text-black hover:bg-[#CCFF00] hover:-translate-y-1 transition-all shadow-[2px_2px_0_0_#CCFF00]">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-white flex items-center justify-center border-[2px] border-[#CCFF00] text-black hover:bg-[#CCFF00] hover:-translate-y-1 transition-all shadow-[2px_2px_0_0_#CCFF00]">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Center: Quick Links */}
          <div className="flex flex-col space-y-4 md:items-center">
            <div className="flex flex-col space-y-3 w-max">
              <h4 className="font-mono text-sm font-black uppercase tracking-widest border-b-[3px] border-white inline-block pb-1">
                CRITICAL LINKS
              </h4>
              <div className="space-y-2 font-mono font-bold text-[11px] uppercase flex flex-col items-start mt-2">
                <Link href="/marketplace" className="text-[#CCFF00] hover:text-black hover:bg-[#CCFF00] px-2 py-0.5 transition-colors">
                  [ MARKETPLACE ]
                </Link>
                <Link href="/categories" className="text-white hover:text-black hover:bg-white px-2 py-0.5 transition-colors">
                  [ CATEGORIES ]
                </Link>
                <Link href="/how-it-works" className="text-white hover:text-black hover:bg-white px-2 py-0.5 transition-colors">
                  [ HOW IT WORKS ]
                </Link>
                <Link href="/safety" className="text-white hover:text-black hover:bg-white px-2 py-0.5 transition-colors">
                  [ SAFETY ]
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Contact */}
          <div className="flex flex-col space-y-4 md:items-end text-left sm:text-right">
            <div className="flex flex-col space-y-3 w-full max-w-[280px]">
              <h4 className="font-mono text-sm font-black uppercase tracking-widest border-b-[3px] border-white inline-block pb-1 self-start md:self-end text-left md:text-right">
                TERMINAL
              </h4>
              <div className="space-y-2 font-mono text-[10px] uppercase font-bold text-gray-300 w-full mt-2">
                <div className="flex items-center space-x-3 bg-[#121212] p-2 border-[2px] border-gray-800">
                  <Mail className="h-3 w-3 text-[#CCFF00] shrink-0" />
                  <span className="truncate">ADMIN@JU.EDU</span>
                </div>
                <div className="flex items-center space-x-3 bg-[#121212] p-2 border-[2px] border-gray-800">
                  <Phone className="h-3 w-3 text-[#CCFF00] shrink-0" />
                  <span>+91 7439 587 602</span>
                </div>
                <div className="flex items-center space-x-3 bg-[#121212] p-2 border-[2px] border-gray-800">
                  <MapPin className="h-3 w-3 text-[#CCFF00] shrink-0" />
                  <span className="truncate">JADAVPUR UNIVERSITY</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom Marquee / Legal */}
        <div className="mt-8 pt-6 border-t-[3px] border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-ranchers text-2xl text-gray-800 tracking-wider">
            JU V-2.0
          </div>

          <div className="font-mono text-[9px] font-bold uppercase text-gray-500 text-center md:text-right flex flex-wrap justify-center md:justify-end gap-3 items-center">
            <span>© 2026 JU SECURE PROTOCOL</span>
            <span className="hidden sm:inline text-gray-700">|</span>
            <Link href="/privacy" className="hover:text-[#CCFF00] transition-colors">PRIVACY</Link>
            <span className="hidden sm:inline text-gray-700">|</span>
            <Link href="/terms" className="hover:text-[#CCFF00] transition-colors">TERMS</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
