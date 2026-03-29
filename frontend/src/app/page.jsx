"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { Search, ShoppingCart, User, ArrowRight, BookOpen, Smartphone, FileText, Zap } from "lucide-react"

export default function HomePage() {
  const categories = [
    { name: "TEXTBOOKS", icon: BookOpen, bgColor: "bg-white", count: "1,234", rot: "sticker-rotate-1" },
    { name: "ELECTRONICS", icon: Smartphone, bgColor: "bg-[#CCFF00]", count: "567", rot: "sticker-rotate-2" },
    { name: "STUDY NOTES", icon: FileText, bgColor: "bg-white", count: "890", rot: "sticker-rotate-3" },
    { name: "FURNITURE", icon: User, bgColor: "bg-[#CCFF00]", count: "234", rot: "sticker-rotate-1" },
  ]

  return (
    <div className="min-h-screen bg-[#121212] overflow-x-hidden selection:bg-[#CCFF00] selection:text-black">
      <Header />

      <main>
        {/* HERO SECTION */}
        <section className="relative px-4 py-12 md:px-8 md:py-20 border-b-[6px] border-black bg-[#121212] flex flex-col items-center justify-center overflow-hidden">
          {/* Background Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-ranchers text-[90px] md:text-[130px] text-white opacity-[0.02] select-none pointer-events-none whitespace-nowrap">
            JUGAAD
          </div>

          <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center">
            <div className="inline-block border-[3px] border-[#CCFF00] px-3 py-1.5 mb-6 bg-black sticker-rotate-2">
              <span className="font-mono text-[#CCFF00] font-bold text-xs tracking-widest uppercase">
                #1 Jadavpur Marketplace
              </span>
            </div>

            <h1 className="font-ranchers text-5xl md:text-[70px] leading-[0.85] text-white uppercase mb-6 tracking-wide drop-shadow-2xl">
              campus <br />
              <span className="text-[#CCFF00]">market</span>
            </h1>

            <p className="font-mono text-sm md:text-lg text-gray-300 mb-8 max-w-2xl uppercase font-bold tracking-tight">
              "Jadavpur ka asli Jugaad"<br />
              <span className="text-[#475569] text-xs md:text-sm relative block mt-2">
                Buy and sell textbooks, gadgets, and study materials safely.
              </span>
            </p>

            {/* Brutalist Waitlist / Search Form */}
            <form className="w-full max-w-2xl flex flex-col md:flex-row hover:scale-105 transition-transform duration-300">
              <div className="flex-1 flex flex-col md:flex-row border-[4px] border-black neo-shadow-volt">
                <input
                  type="text"
                  placeholder="WHAT DO YOU NEED?"
                  className="flex-1 px-6 py-5 font-mono text-lg outline-none uppercase bg-white text-black placeholder:text-gray-400 font-bold"
                />
                <button
                  type="button"
                  className="bg-[#CCFF00] text-black px-10 py-5 font-ranchers text-2xl hover:bg-black hover:text-[#CCFF00] transition-colors border-t-[4px] md:border-t-0 md:border-l-[4px] border-black flex items-center justify-center gap-2"
                >
                  SEARCH <Search className="h-6 w-6" />
                </button>
              </div>
            </form>
            <p className="mt-5 font-mono text-[10px] font-bold uppercase text-[#CCFF00] tracking-widest bg-black px-3 py-1.5">
              * EXCLUSIVE ACCESS TO .EDU DOMAINS
            </p>
          </div>
        </section>

        {/* COMPARISON SECTION */}
        <section className="border-b-[6px] border-black">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 bg-[#121212] p-6 md:p-10 flex flex-col justify-center border-b-[6px] md:border-b-0 md:border-r-[6px] border-black">
              <span className="font-mono text-[#475569] text-sm font-bold mb-2 uppercase">THE OLD WAY</span>
              <h3 className="font-ranchers text-[#475569] text-4xl md:text-5xl uppercase leading-none opacity-50 line-through">
                GROUP <br /> CHATS
              </h3>
              <p className="font-jakarta text-[#475569] mt-3 text-sm">Scam links, spam messages, and lost chats.</p>
            </div>
            <div className="w-full md:w-1/2 bg-[#CCFF00] p-6 md:p-10 flex flex-col justify-center">
              <span className="font-mono text-black text-sm font-bold mb-2 uppercase">THE BETTER WAY</span>
              <h3 className="font-ranchers text-black text-4xl md:text-5xl w-full uppercase leading-none break-words">
                JUGAADU <br /> ENGINE
              </h3>
              <p className="font-jakarta text-black font-semibold mt-3 text-sm">Verified students, instant chat, secure deals.</p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS / PROCESS STEPS */}
        <section className="bg-white px-4 py-12 md:px-8 md:py-16 border-b-[6px] border-black">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-ranchers text-black text-4xl md:text-5xl uppercase mb-10 text-center">
              SYSTEM <span className="text-white border-[3px] border-black bg-black px-3 font-mono font-bold text-3xl md:text-4xl align-middle shadow-[4px_4px_0px_#CCFF00]">PROTOCOL</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
              {/* Step 1 */}
              <div className="bg-white p-5 border-[4px] border-black neo-shadow-black relative overflow-hidden group hover:-translate-y-1 transition-transform">
                <div className="bg-[#CCFF00] text-black font-mono font-bold px-2 py-1 absolute top-0 left-0 border-b-[3px] border-r-[3px] border-black sticker-rotate-1 z-10 text-[10px]">
                  STEP 01
                </div>
                <div className="absolute -right-2 -bottom-6 font-ranchers text-[100px] text-black opacity-[0.03] select-none pointer-events-none group-hover:opacity-[0.08] transition-opacity">
                  1
                </div>
                <h4 className="font-ranchers text-black text-2xl uppercase mb-2 mt-3">SYNC</h4>
                <p className="text-black font-jakarta font-semibold text-xs leading-relaxed">
                  Connect your .edu credentials to verify your presence on campus instantly. No outsiders allowed.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-[#CCFF00] p-5 border-[4px] border-black neo-shadow-black relative overflow-hidden group hover:-translate-y-1 transition-transform sticker-rotate-2">
                <div className="bg-black text-[#CCFF00] font-mono font-bold px-2 py-1 absolute top-0 left-0 border-b-[3px] border-r-[3px] border-black sticker-rotate-3 z-10 text-[10px]">
                  STEP 02
                </div>
                <div className="absolute -right-2 -bottom-6 font-ranchers text-[100px] text-black opacity-[0.05] select-none pointer-events-none group-hover:opacity-[0.1] transition-opacity">
                  2
                </div>
                <h4 className="font-ranchers text-black text-2xl uppercase mb-2 mt-3">LIST</h4>
                <p className="text-black font-jakarta font-semibold text-xs leading-relaxed">
                  Snap a pic, set your price, and drop it in the market engine. Takes less than 30 seconds.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-black text-white p-5 border-[4px] border-[#CCFF00] neo-shadow-volt relative overflow-hidden group hover:-translate-y-1 transition-transform sticker-rotate-1">
                <div className="bg-[#CCFF00] text-black font-mono font-bold px-2 py-1 absolute top-0 left-0 border-b-[3px] border-r-[3px] border-[#CCFF00] sticker-rotate-1 z-10 text-[10px]">
                  STEP 03
                </div>
                <div className="absolute -right-2 -bottom-6 font-ranchers text-[100px] text-[#CCFF00] opacity-[0.05] select-none pointer-events-none group-hover:opacity-[0.15] transition-opacity">
                  3
                </div>
                <h4 className="font-ranchers text-[#CCFF00] text-2xl uppercase mb-2 mt-3">DEAL</h4>
                <p className="text-white font-jakarta text-xs leading-relaxed">
                  Chat securely within the app and meet up on campus to secure the bag.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES GRID */}
        <section className="bg-black px-4 py-12 md:px-8 md:py-16 border-b-[6px] border-[#CCFF00]">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-end mb-8">
              <h2 className="font-ranchers text-white text-4xl md:text-5xl uppercase leading-none">
                HOT <br /><span className="text-[#CCFF00]">DROPS</span>
              </h2>
              <Link href="/marketplace" className="hidden border-[3px] border-[#CCFF00] bg-transparent text-[#CCFF00] font-mono font-bold px-3 py-2 text-xs uppercase hover:bg-[#CCFF00] hover:text-black transition-colors neo-shadow-volt md:flex items-center gap-2">
                VIEW ALL <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((cat, idx) => (
                <Link key={idx} href={`/marketplace?category=${cat.name}`} className={`group block border-[3px] border-[#CCFF00] ${cat.bgColor} p-4 neo-shadow-volt hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all ${cat.rot}`}>
                  <div className="border-[2px] border-black w-10 h-10 bg-white flex items-center justify-center mb-3 group-hover:rotate-12 transition-transform z-10 relative">
                    <cat.icon className="h-5 w-5 text-black" />
                  </div>
                  <h3 className="font-ranchers text-xl text-black uppercase mb-1 leading-none relative z-10">{cat.name}</h3>
                  <div className="font-mono text-black font-bold uppercase text-[10px] border-t-[2px] border-black pt-2 mt-2 relative z-10">
                    {cat.count} LISTINGS ACTIVE
                  </div>
                </Link>
              ))}
            </div>

            <Link href="/marketplace" className="mt-6 w-full md:hidden border-[3px] border-[#CCFF00] bg-[#CCFF00] text-black font-mono font-bold px-3 py-2 text-xs uppercase text-center flex justify-center items-center gap-2 neo-shadow-volt">
              VIEW ALL MARKETPLACE DROPS <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </section>

        {/* SOCIAL PROOF TICKER */}
        <section className="bg-[#121212] py-12 overflow-hidden border-b-[6px] border-black">
          <div className="flex space-x-4 animate-marquee whitespace-nowrap px-4 pb-4">
            {/* Ticker Item 1 */}
            <div className="bg-white border-[3px] border-black p-4 w-60 sticker-rotate-2 neo-shadow-black shrink-0 hover:z-10 hover:scale-105 transition-transform">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-[#CCFF00] border-[2px] border-black flex items-center justify-center">
                  <Zap className="text-black h-4 w-4" />
                </div>
                <div className="font-mono font-bold text-black border-b-[2px] border-black pb-1 text-sm">@DORM_KING</div>
              </div>
              <p className="font-mono text-black text-[10px] uppercase leading-tight font-bold whitespace-normal">
                "SOLD MY ENTIRE GAMING RIG IN   12 MINUTES. NO WEIRDOS. 10/10."
              </p>
            </div>

            {/* Ticker Item 2 */}
            <div className="bg-[#CCFF00] border-[3px] border-black p-4 w-60 sticker-rotate-3 neo-shadow-black shrink-0 hover:z-10 hover:scale-105 transition-transform">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-white border-[2px] border-black flex items-center justify-center">
                  <BookOpen className="text-black h-4 w-4" />
                </div>
                <div className="font-mono font-bold text-black border-b-[2px] border-black pb-1 text-sm">@CS_NERD</div>
              </div>
              <p className="font-mono text-black text-[10px] uppercase leading-tight font-bold whitespace-normal">
                "COPped CHEAP SEMESTER NOTES. GPA SAVED."
              </p>
            </div>

            {/* Ticker Item 3 */}
            <div className="bg-black border-[3px] border-[#CCFF00] p-4 w-60 sticker-rotate-1 neo-shadow-volt shrink-0 hover:z-10 hover:scale-105 transition-transform">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-white border-[2px] border-black flex items-center justify-center">
                  <ShoppingCart className="text-black h-4 w-4" />
                </div>
                <div className="font-mono font-bold text-white border-b-[2px] border-[#CCFF00] pb-1 text-sm">@HUSTLER99</div>
              </div>
              <p className="font-mono text-white text-[10px] uppercase leading-tight font-bold whitespace-normal">
                "SECURED A MINI FRIDGE FOR HALF PRICE. W APP."
              </p>
            </div>

            {/* Ticker Item 4 (Duplicate for seamless loop) */}
            <div className="bg-white border-[3px] border-black p-4 w-60 sticker-rotate-2 neo-shadow-black shrink-0 hover:z-10 hover:scale-105 transition-transform">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-[#CCFF00] border-[2px] border-black flex items-center justify-center">
                  <Zap className="text-black h-4 w-4" />
                </div>
                <div className="font-mono font-bold text-black border-b-[2px] border-black pb-1 text-sm">@DORM_KING</div>
              </div>
              <p className="font-mono text-black text-[10px] uppercase leading-tight font-bold whitespace-normal">
                "SOLD MY ENTIRE GAMING RIG IN 12 MINUTES. NO WEIRDOS. 10/10."
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </main>

      {/* Required for marquee animation - put this inside globals.css or keep it here */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
          width: fit-content;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>
  )
}