import { Plus_Jakarta_Sans, Space_Mono, Ranchers } from "next/font/google";
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/sonner"
import Chatbot from "@/components/chatbot"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

const ranchers = Ranchers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-ranchers",
});

export const metadata = {
  title: "JUgaadu",
  description: "Becho, Kharido, JUgaadu bano",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-[#121212] font-jakarta text-white ${jakarta.variable} ${spaceMono.variable} ${ranchers.variable} overflow-x-hidden pt-0 lg:pr-[120px]`}>
        {/* RIGHT SIDEBAR (Desktop Only) - GLOBAL */}
        <aside className="hidden lg:flex fixed right-0 top-0 bottom-0 w-[120px] bg-black border-l-[6px] border-black z-30 cursor-default">
          <div className="flex-1 bg-white border-r-[3px] border-black flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] font-ranchers text-4xl leading-none text-black break-words p-2 pointer-events-none">
              CAMPUS MARKET
            </div>
            <div className="writing-v-rl font-mono font-bold text-xl tracking-[0.2em] text-black py-10 relative z-10 whitespace-nowrap">
              BECHO. KHARIDO. JUGAADU.
            </div>
          </div>
          <div className="w-10 bg-[#CCFF00] flex items-center justify-center">
            <div className="writing-v-rl font-ranchers text-2xl tracking-widest text-black whitespace-nowrap">
              MARKET_ACCESS_ENABLED
            </div>
          </div>
          <div className="w-2 bg-black"></div>
        </aside>

        <AuthProvider>
          {children}
          <Chatbot />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
