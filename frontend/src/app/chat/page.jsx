"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { useAuth } from '@/components/auth-provider';
import { getMyChats, getChatMessages, createMessage } from '@/utils/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Pusher from 'pusher-js';
import { Send, MessageSquare, Zap, ArrowRight, Activity, Terminal } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/header';
import Link from 'next/link';

function ChatPageContent() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const messagesEndRef = useRef(null);
    const pusherRef = useRef(null);
    const channelRef = useRef(null);
    const tempMessageId = useRef(null);

    // [Rest of logic remains identical - only UI rewrites]
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            const fetchChatsAndSelect = async () => {
                try {
                    setLoadingChats(true);
                    const response = await getMyChats();

                    const fetchedChats = Array.isArray(response.data) ? response.data : response.data.results;

                    if (Array.isArray(fetchedChats)) {
                        setChats(fetchedChats);

                        const chatIdFromUrl = searchParams.get('chatId');
                        if (chatIdFromUrl) {
                            const chatToSelect = fetchedChats.find(c => c.id === parseInt(chatIdFromUrl));
                            if (chatToSelect) {
                                handleSelectChat(chatToSelect);
                            }
                        }
                    } else {
                        setChats([]);
                        toast({ title: "SYS ERROR", description: "DATA MALFORMED.", variant: "destructive" });
                    }
                } catch (error) {
                    toast({ title: "SYNC ERROR", description: "COULD NOT LOAD COMMS.", variant: "destructive" });
                } finally {
                    setLoadingChats(false);
                }
            };
            fetchChatsAndSelect();
        }
    }, [user, authLoading, router, searchParams]);

    useEffect(() => {
        if (!user || !selectedChat) return;

        if (channelRef.current) {
            pusherRef.current.unsubscribe(channelRef.current.name);
        }

        if (!pusherRef.current) {
            pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
                authEndpoint: 'http://localhost:8000/api/pusher/auth/',
                auth: {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("auth_token")}`
                    }
                }
            });
        }

        const channelName = `private-conversation-${selectedChat.id}`;
        channelRef.current = pusherRef.current.subscribe(channelName);

        channelRef.current.bind('new-message', (data) => {
            if (data.sender.id === user.id) {
                setMessages(prev => prev.map(msg => msg.id === tempMessageId.current ? data : msg));
            } else {
                if (!messages.some(msg => msg.id === data.id)) {
                    setMessages(prevMessages => [...prevMessages, data]);
                }
            }
        });

        return () => {
            if (pusherRef.current && channelRef.current) {
                pusherRef.current.unsubscribe(channelRef.current.name);
                channelRef.current = null;
            }
        };
    }, [selectedChat, user]);

    const handleSelectChat = async (chat) => {
        if (selectedChat?.id === chat.id) return;

        setSelectedChat(chat);
        setMessages([]);
        try {
            setLoadingMessages(true);
            const response = await getChatMessages(chat.id);

            let fetchedMessages = [];
            if (response && response.data) {
                if (Array.isArray(response.data)) {
                    fetchedMessages = response.data;
                } else if (response.data.results && Array.isArray(response.data.results)) {
                    fetchedMessages = response.data.results;
                } else {
                    toast({ title: "SYS ERROR", description: "DATA MALFORMED.", variant: "destructive" });
                }
            }
            setMessages(fetchedMessages);

        } catch (error) {
            toast({ title: "SYNC ERROR", description: "COULD NOT LOAD COMM HISTORY.", variant: "destructive" });
            setMessages([]);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        tempMessageId.current = `temp-${Date.now()}-${Math.random()}`;

        const messageData = {
            conversation: selectedChat.id,
            content: newMessage,
        };

        const optimisticMessage = {
            id: tempMessageId.current,
            content: newMessage,
            sender: user,
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');

        try {
            await createMessage(messageData);
        } catch (error) {
            toast({ title: "TX ERROR", description: "PACKET DROPPED.", variant: "destructive" });
            setMessages(prev => prev.filter(m => m.id !== tempMessageId.current));
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (authLoading || loadingChats) {
        return (
            <div className="flex h-screen bg-[#121212] font-jakarta selection:bg-[#CCFF00] selection:text-black">
                <Header />
                <div className="flex-1 flex justify-center items-center mt-20">
                    <div className="bg-[#CCFF00] border-[6px] border-black p-8 neo-shadow-vault text-black flex items-center gap-4 sticker-rotate-1">
                        <Terminal className="h-8 w-8 animate-pulse" />
                        <h2 className="font-ranchers text-4xl uppercase">ESTABLISHING CONNECTION...</h2>
                    </div>
                </div>
            </div>
        );
    }

    const getOtherParticipant = (chat) => {
        return chat.participants.find(p => p.id !== user?.id);
    };

    return (
        <div className="flex flex-col h-screen bg-[#121212] font-jakarta selection:bg-[#CCFF00] selection:text-black overflow-hidden relative z-50">
            <Header absolute={false} />

            <div className="flex flex-1 overflow-hidden lg:pl-[120px] max-w-full">

                {/* SIDEBAR: CHAT CHANNELS */}
                <aside className={`w-full md:w-[350px] lg:w-[400px] border-r-[4px] border-black bg-white flex flex-col shrink-0 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>

                    <div className="p-4 border-b-[4px] border-black bg-[#CCFF00]">
                        <div className="flex items-center gap-3">
                            <div className="bg-black text-[#CCFF00] p-2 border-[2px] border-black shadow-[3px_3px_0_0_#FFF]">
                                <Activity className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-ranchers text-3xl text-black uppercase leading-none">COMMS</h2>
                                <p className="font-mono text-[10px] font-bold text-black uppercase">{chats.length} ACTIVE CHANNELS</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-gray-50 hide-scrollbar p-2 space-y-2">
                        {chats.length > 0 ? (
                            chats.map(chat => {
                                const otherUser = getOtherParticipant(chat);
                                const isSelected = selectedChat?.id === chat.id;
                                return (
                                    <div
                                        key={chat.id}
                                        onClick={() => handleSelectChat(chat)}
                                        className={`p-3 border-[3px] border-black cursor-pointer transition-all ${isSelected
                                                ? 'bg-black text-white shadow-[4px_4px_0_0_#CCFF00] translate-x-1'
                                                : 'bg-white text-black hover:bg-[#CCFF00] hover:shadow-[3px_3px_0_0_#000]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`relative shrink-0 w-12 h-12 border-[3px] border-black bg-gray-200 overflow-hidden ${isSelected ? 'border-[#CCFF00]' : ''}`}>
                                                {otherUser?.avatar ? (
                                                    <img src={otherUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center font-ranchers text-xl text-black">
                                                        {otherUser?.first_name?.[0]}
                                                    </div>
                                                )}
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#CCFF00] border-l-[2px] border-t-[2px] border-black z-10" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-mono font-bold uppercase text-xs truncate">
                                                    {otherUser?.first_name} {otherUser?.last_name}
                                                </p>
                                                <p className={`font-mono text-[10px] uppercase truncate ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    {chat.last_message?.content || 'AWAITING TRANSMISSION'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-4 text-center opacity-50">
                                <Terminal className="h-10 w-10 text-black mb-2" />
                                <p className="font-mono font-bold text-xs text-black uppercase">NO ACTIVE CHANNELS FINDINGS</p>
                            </div>
                        )}
                    </div>
                </aside>

                {/* MAIN CHAT AREA */}
                <main className={`flex-1 flex flex-col bg-white overflow-hidden relative ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>

                    {selectedChat ? (
                        <>
                            {/* Chat Header */}
                            <header className="p-4 bg-black border-b-[4px] border-white flex items-center justify-between shrink-0 shadow-[0_4px_0_0_#CCFF00] z-10">
                                <div className="flex items-center gap-4">
                                    <button
                                        className="md:hidden bg-white text-black p-1 border-[2px] border-black"
                                        onClick={() => setSelectedChat(null)}
                                    >
                                        <ArrowRight className="h-5 w-5 rotate-180" />
                                    </button>

                                    <div className="relative w-10 h-10 border-[3px] border-[#CCFF00] bg-gray-600 overflow-hidden shrink-0">
                                        {getOtherParticipant(selectedChat)?.avatar ? (
                                            <img src={getOtherParticipant(selectedChat)?.avatar} alt="avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-ranchers text-xl text-white">
                                                {getOtherParticipant(selectedChat)?.first_name?.[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="font-ranchers text-2xl text-white uppercase leading-none truncate">
                                            {getOtherParticipant(selectedChat)?.first_name} {getOtherParticipant(selectedChat)?.last_name}
                                        </h2>
                                        <p className="font-mono text-[9px] font-bold text-[#CCFF00] uppercase tracking-widest flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-[#CCFF00] inline-block animate-pulse rounded-full" /> LINK SECURE
                                        </p>
                                    </div>
                                </div>
                            </header>

                            {/* Messages Container */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-gray-50 pb-24" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "40px 40px" }}>
                                {loadingMessages ? (
                                    <div className="flex justify-center items-center h-full">
                                        <div className="bg-[#CCFF00] border-[4px] border-black py-2 px-4 font-mono font-bold text-black uppercase flex items-center gap-2 sticker-rotate-2">
                                            <Zap className="h-4 w-4 animate-bounce" /> DECRYPTING LOGS...
                                        </div>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <div className="bg-white border-[4px] border-black p-6 py-4 font-mono font-bold text-xs uppercase neo-shadow-vault">
                                            COMM LINK ESTABLISHED. INITIATE TRANSMISSION.
                                        </div>
                                    </div>
                                ) : (
                                    messages.map((msg, index) => {
                                        const isCurrentUser = msg.sender.id === user.id;
                                        return (
                                            <div key={msg.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                                                    <div className={`p-4 border-[3px] border-black font-mono font-bold text-sm leading-relaxed whitespace-pre-line ${isCurrentUser
                                                            ? 'bg-[#CCFF00] text-black rounded-bl-xl rounded-tl-xl rounded-tr-xl shadow-[4px_4px_0_0_#000]'
                                                            : 'bg-white text-black rounded-br-xl rounded-tr-xl rounded-tl-xl shadow-[4px_4px_0_0_#000]'
                                                        }`}>
                                                        {msg.content}
                                                    </div>
                                                    <span className="font-mono text-[9px] font-bold text-gray-500 uppercase mt-2 px-1 tracking-widest bg-white border-[1px] border-black px-1.5 py-0.5">
                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Builder */}
                            <div className="p-4 bg-white border-t-[4px] border-black absolute bottom-0 right-0 left-0">
                                <form onSubmit={handleSendMessage} className="flex gap-2 max-w-5xl mx-auto">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="TERMINAL INPUT..."
                                        className="flex-1 bg-gray-50 border-[3px] border-black px-4 py-3 font-mono font-bold text-sm text-black placeholder:text-gray-400 focus:outline-none focus:bg-[#CCFF00] uppercase transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="bg-black text-[#CCFF00] px-6 border-[3px] border-black border-l-0 hover:bg-[#CCFF00] hover:text-black transition-colors disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400"
                                    >
                                        <Send className="h-6 w-6" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col justify-center items-center bg-[#121212] bg-opacity-95 p-6">
                            <div className="bg-[#CCFF00] border-[6px] border-black p-10 neo-shadow-volt text-center max-w-md sticker-rotate-2">
                                <Terminal className="h-16 w-16 mx-auto mb-6 text-black" />
                                <h3 className="font-ranchers text-4xl text-black uppercase mb-4">AWAITING CHANNEL SELECTION</h3>
                                <p className="font-mono text-xs font-bold text-gray-800 uppercase mb-8 border-l-[4px] border-black pl-3 text-left">
                                    SELECT A CHANNEL FROM THE LEFT PANEL TO ESTABLISH COMMS.
                                </p>
                                <Link href="/marketplace">
                                    <button className="bg-black text-[#CCFF00] border-[4px] border-black px-6 py-3 font-mono font-bold uppercase text-sm hover:-translate-y-1 shadow-[4px_4px_0_0_#FFF] transition-all w-full">
                                        RETURN TO MARKET
                                    </button>
                                </Link>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={
            <div className="h-screen bg-[#121212] flex items-center justify-center">
                <div className="w-16 h-16 border-[6px] border-[#CCFF00] border-t-black animate-spin rounded-full"></div>
            </div>
        }>
            <ChatPageContent />
        </Suspense>
    );
}