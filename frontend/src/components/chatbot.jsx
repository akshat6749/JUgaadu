"use client"
import { useState, useRef, useEffect } from "react"
import { Bot, X, Send, Loader2 } from "lucide-react"
import { sendChatbotMessage } from "@/utils/api"

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { id: 1, text: "YO! I'M YOUR JUGAADU AI. NEED HELP FINDING SOMETHING ON CAMPUS?", sender: "ai" }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef(null)

    const toggleChat = () => setIsOpen(!isOpen)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage = { id: Date.now(), text: input, sender: "user" }
        setMessages(prev => [...prev, userMessage])
        const currentInput = input
        setInput("")
        setIsLoading(true)

        try {
            // Send message + history to backend
            const history = messages.map(m => ({ text: m.text, sender: m.sender }))
            const data = await sendChatbotMessage(currentInput, history)

            const aiMessage = {
                id: Date.now() + 1,
                text: data.reply || "SORRY, I COULDN'T PROCESS THAT. TRY AGAIN.",
                sender: "ai"
            }
            setMessages(prev => [...prev, aiMessage])
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                text: "CONNECTION INTERRUPTED. THE AI ENGINE IS OFFLINE. TRY AGAIN LATER.",
                sender: "ai"
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            {/* Floating Chat Button */}
            <button
                onClick={toggleChat}
                className={`fixed bottom-6 right-6 ${isOpen ? 'hidden' : 'flex'} w-16 h-16 bg-[#CCFF00] border-[4px] border-black items-center justify-center neo-shadow-black hover:-translate-y-1 hover:-translate-x-1 shadow-[12px_12px_0px_0px_#000000] hover:shadow-[16px_16px_0px_0px_#000000] transition-all z-50 group sticker-rotate-2`}
            >
                <Bot className="h-8 w-8 text-black group-hover:animate-bounce" />
                <div className="absolute -top-2 -right-2 bg-black text-[#CCFF00] border-2 border-white px-2 py-0.5 text-[10px] font-mono font-bold animate-pulse">
                    AI
                </div>
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[90vw] md:w-[400px] h-[600px] max-h-[85vh] bg-white border-[6px] border-black neo-shadow-black z-50 flex flex-col font-mono text-black shadow-[16px_16px_0px_0px_#000000] animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-black border-b-[4px] border-black flex justify-between items-center p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#CCFF00] border-[3px] border-white flex items-center justify-center sticker-rotate-2">
                                <Bot className="text-black h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-ranchers text-[#CCFF00] text-3xl tracking-wide uppercase leading-none">JUGAADU AI</h3>
                                <div className="text-[10px] font-bold text-white flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 border border-black rounded-full animate-ping"></div>
                                    ONLINE
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={toggleChat}
                            className="w-10 h-10 bg-white border-[4px] border-black flex items-center justify-center hover:bg-[#CCFF00] transition-colors neo-shadow-black active:translate-x-1 active:translate-y-1 active:shadow-none"
                        >
                            <X className="h-6 w-6 text-black" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.sender === 'ai' && (
                                    <div className="w-8 h-8 bg-black shrink-0 border-[2px] border-[#CCFF00] flex items-center justify-center mr-2 mt-1">
                                        <Bot className="h-4 w-4 text-[#CCFF00]" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] p-4 border-[4px] border-black font-bold uppercase text-sm ${msg.sender === 'user'
                                        ? 'bg-[#CCFF00] text-black neo-shadow-black sticker-rotate-1'
                                        : 'bg-white text-black neo-shadow-volt sticker-rotate-3'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="w-8 h-8 bg-black shrink-0 border-[2px] border-[#CCFF00] flex items-center justify-center mr-2 mt-1">
                                    <Bot className="h-4 w-4 text-[#CCFF00]" />
                                </div>
                                <div className="max-w-[80%] p-4 border-[4px] border-black bg-white text-black neo-shadow-volt font-bold uppercase text-sm flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> THINKING...
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="bg-black p-4 border-t-[4px] border-black">
                        <form onSubmit={handleSend} className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="ASK AI..."
                                disabled={isLoading}
                                className="flex-1 bg-white border-[4px] border-[#CCFF00] text-black px-4 py-3 font-mono font-bold uppercase outline-none focus:bg-gray-100 placeholder:text-gray-400 disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-[#CCFF00] border-[4px] border-[#CCFF00] text-black px-4 py-3 font-bold hover:bg-white hover:border-white transition-colors flex items-center justify-center neo-shadow-volt active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
                            >
                                <Send className="h-6 w-6" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
