"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { Bell, Heart, MessageCircle, AlertCircle, CheckCircle2 } from "lucide-react"

export default function NotificationsPage() {
    const notifications = [
        {
            id: 1,
            type: "message",
            title: "NEW MESSAGE",
            time: "2 MINS AGO",
            content: "Yo, is the gaming rig still available? Willing to do ₹40,000.",
            icon: MessageCircle,
            color: "bg-[#CCFF00]",
            read: false
        },
        {
            id: 2,
            type: "system",
            title: "SYSTEM ALERT",
            time: "1 HOUR AGO",
            content: "Your listing 'Calculus 101 Book' got verified and is now live on the market engine.",
            icon: CheckCircle2,
            color: "bg-white",
            read: false
        },
        {
            id: 3,
            type: "wishlist",
            title: "PRICE DROP DETECTED",
            time: "5 HOURS AGO",
            content: "The iPhone 13 you liked just dropped by ₹5,000. Cop it now before it's gone.",
            icon: AlertCircle,
            color: "bg-white",
            read: true
        },
        {
            id: 4,
            type: "like",
            title: "NEW INTEREST",
            time: "1 DAY AGO",
            content: "@NEARD_BOY bookmarked your listing 'Mini Fridge'.",
            icon: Heart,
            color: "bg-[#CCFF00]",
            read: true
        }
    ]

    return (
        <div className="min-h-screen bg-[#121212] selection:bg-[#CCFF00] selection:text-black flex flex-col">
            <Header />

            <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-6 py-8 md:py-16">
                <div className="flex items-center justify-between mb-8 border-b-[6px] border-black pb-6">
                    <h1 className="font-ranchers text-white text-4xl md:text-6xl uppercase tracking-wider">
                        NOTIF<span className="text-[#CCFF00]">ICATIONS</span>
                    </h1>
                    <div className="hidden md:flex items-center gap-3">
                        <span className="font-mono text-white text-sm">
                            <span className="bg-[#CCFF00] text-black px-2 py-1 font-bold neo-shadow-volt border-[3px] border-black text-xs">2 UNREAD</span>
                        </span>
                    </div>
                </div>

                <div className="space-y-6">
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`bg-${notif.read ? '[#121212]' : 'white'} ${notif.read ? 'border-[3px] border-gray-700 text-gray-400' : 'border-[4px] border-black text-black'} p-4 md:p-6 flex flex-col md:flex-row gap-4 relative ${!notif.read ? 'neo-shadow-black sticker-rotate-0 hover:-translate-y-1 hover:shadow-none transition-transform' : 'opacity-70'}`}
                        >
                            {!notif.read && (
                                <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none z-10 overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-[#CCFF00] text-black font-mono font-bold text-[8px] uppercase py-0.5 px-6 translate-x-3 translate-y-1 rotate-45 border-b-[2px] border-black border-l-[2px]">
                                        NEW
                                    </div>
                                </div>
                            )}

                            <div className={`w-12 h-12 shrink-0 border-[3px] border-black ${!notif.read ? notif.color : 'bg-gray-800 border-gray-600'} flex items-center justify-center ${!notif.read ? 'sticker-rotate-1' : ''}`}>
                                <notif.icon className={`h-5 w-5 ${!notif.read ? 'text-black' : 'text-gray-400'}`} />
                            </div>

                            <div className="flex-1 flex flex-col justify-center">
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-1 gap-1">
                                    <h3 className="font-mono text-lg md:text-xl font-bold uppercase tracking-wide">
                                        {notif.title}
                                    </h3>
                                    <span className="font-mono text-[10px] font-bold bg-black text-[#CCFF00] px-2 py-0.5 w-fit border-[2px] border-white">
                                        {notif.time}
                                    </span>
                                </div>
                                <p className={`font-jakarta text-sm ${!notif.read ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                                    {notif.content}
                                </p>
                            </div>
                        </div>
                    ))}

                    {notifications.length === 0 && (
                        <div className="bg-black border-[4px] border-[#CCFF00] p-8 text-center neo-shadow-volt">
                            <Bell className="h-10 w-10 text-[#CCFF00] mx-auto mb-4" />
                            <h3 className="font-ranchers text-white text-3xl uppercase mb-3">NO ALERTS</h3>
                            <p className="font-mono text-gray-400 text-xs font-bold">ALL CAUGHT UP. YOU'RE GOOD TO GO.</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
