"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { useAuth } from '@/components/auth-provider';
import { getMyChats, getChatMessages, createMessage } from '@/utils/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Pusher from 'pusher-js';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageCircle, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
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
                        console.error("Fetched chats is not an array:", response.data);
                        toast({ title: "Error", description: "Could not load your chats due to an unexpected format.", variant: "destructive" });
                    }
                } catch (error) {
                    console.error("Failed to fetch chats", error);
                    toast({ title: "Error", description: "Could not load your chats.", variant: "destructive" });
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
                    console.error("Fetched messages is not in a recognized format:", response.data);
                    toast({ title: "Error", description: "Could not load messages due to an unexpected format.", variant: "destructive" });
                }
            }
            setMessages(fetchedMessages);

        } catch (error) {
            console.error(`Failed to fetch messages for chat ${chat.id}`, error);
            toast({ title: "Error", description: "Could not load messages.", variant: "destructive" });
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
            console.error("Failed to send message", error);
            toast({ title: "Error", description: "Could not send message.", variant: "destructive" });
            setMessages(prev => prev.filter(m => m.id !== tempMessageId.current));
        }
    };
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (authLoading || loadingChats) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="text-slate-600 font-medium">Loading your conversations...</p>
                </div>
            </div>
        );
    }

    const getOtherParticipant = (chat) => {
        return chat.participants.find(p => p.id !== user?.id);
    };

    return (
        <div className="flex h-screen bg-white">
            {/* Sidebar */}
            <aside className="w-full md:w-1/3 bg-gradient-to-b from-slate-50 to-slate-100 border-r border-slate-200 flex flex-col">
                <div className="p-6 bg-white/80 backdrop-blur-sm border-b border-slate-200/60">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <MessageCircle className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Messages</h2>
                            <p className="text-sm text-slate-500">{chats.length} conversation{chats.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {chats.length > 0 ? (
                        <div className="p-3 space-y-1">
                            {chats.map(chat => {
                                const otherUser = getOtherParticipant(chat);
                                const isSelected = selectedChat?.id === chat.id;
                                return (
                                    <div 
                                        key={chat.id} 
                                        onClick={() => handleSelectChat(chat)} 
                                        className={`p-4 cursor-pointer rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${
                                            isSelected 
                                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                                                : 'bg-white/60 backdrop-blur-sm hover:bg-white/80 border border-slate-200/50'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                <Avatar className="h-12 w-12 ring-2 ring-white/20">
                                                    <AvatarImage src={otherUser?.avatar} />
                                                    <AvatarFallback className={`text-sm font-semibold ${isSelected ? 'bg-white/20 text-white' : 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700'}`}>
                                                        {otherUser?.first_name?.[0] || <User className="h-4 w-4" />}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 border-2 border-white rounded-full"></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                                    {otherUser?.first_name} {otherUser?.last_name}
                                                </p>
                                                <p className={`text-sm truncate mt-1 ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                                                    {chat.last_message?.content || 'No messages yet'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                            <div className="p-4 bg-slate-200/50 rounded-full mb-4">
                                <MessageCircle className="h-8 w-8 text-slate-400" />
                            </div>
                            <p className="text-slate-600 font-medium mb-2">No conversations yet</p>
                            <p className="text-sm text-slate-500">Start browsing products to connect with sellers</p>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="hidden md:flex w-2/3 flex-col bg-white">
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <header className="p-6 bg-gradient-to-r from-white to-slate-50 border-b border-slate-200/60 backdrop-blur-sm">
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Avatar className="h-12 w-12 ring-2 ring-slate-200">
                                        <AvatarImage src={getOtherParticipant(selectedChat)?.avatar} />
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 font-semibold">
                                            {getOtherParticipant(selectedChat)?.first_name?.[0] || <User className="h-5 w-5" />}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 border-2 border-white rounded-full"></div>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">
                                        {getOtherParticipant(selectedChat)?.first_name} {getOtherParticipant(selectedChat)?.last_name}
                                    </h2>
                                    <p className="text-sm text-green-600 font-medium">Active now</p>
                                </div>
                            </div>
                        </header>

                        {/* Messages Area */}
                        <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-slate-50/30 to-white">
                            {loadingMessages ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                                        <p className="text-slate-500">Loading messages...</p>
                                    </div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <div className="p-4 bg-blue-100 rounded-full mb-4">
                                        <MessageCircle className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <p className="text-slate-600 font-medium mb-2">Start the conversation</p>
                                    <p className="text-sm text-slate-500">Send a message to begin chatting</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {messages.map((msg, index) => {
                                        const isCurrentUser = msg.sender.id === user.id;
                                        const showAvatar = index === 0 || messages[index - 1]?.sender.id !== msg.sender.id;
                                        
                                        return (
                                            <div key={msg.id} className={`flex items-end space-x-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                                {!isCurrentUser && (
                                                    <Avatar className={`h-8 w-8 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                                                        <AvatarImage src={msg.sender?.avatar} />
                                                        <AvatarFallback className="bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 text-xs">
                                                            {msg.sender?.first_name?.[0] || <User className="h-3 w-3" />}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                
                                                <div className={`max-w-sm lg:max-w-md ${isCurrentUser ? 'order-first' : ''}`}>
                                                    <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                                                        isCurrentUser 
                                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-md' 
                                                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md'
                                                    }`}>
                                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                                    </div>
                                                    <p className={`text-xs mt-2 ${isCurrentUser ? 'text-right text-slate-400' : 'text-left text-slate-500'}`}>
                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                
                                                {isCurrentUser && (
                                                    <Avatar className={`h-8 w-8 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                                                        <AvatarImage src={user?.avatar} />
                                                        <AvatarFallback className="bg-gradient-to-br from-indigo-200 to-purple-300 text-indigo-700 text-xs">
                                                            {user?.first_name?.[0] || <User className="h-3 w-3" />}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-200/60">
                            <div className="flex items-end space-x-4">
                                <div className="flex-1 relative">
                                    <Input 
                                        value={newMessage} 
                                        onChange={(e) => setNewMessage(e.target.value)} 
                                        placeholder="Type your message..." 
                                        className="w-full px-4 py-3 pr-12 bg-slate-50 border-slate-200 rounded-xl focus:bg-white                                         focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                                <Button 
                                    type="submit" 
                                    disabled={!newMessage.trim()}
                                    className="h-12 w-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    <Send className="h-5 w-5" />
                                </Button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col justify-center items-center bg-gradient-to-b from-slate-50/30 to-white">
                        <div className="text-center max-w-md mx-auto px-6">
                            <div className="p-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                                <MessageCircle className="h-12 w-12 text-indigo-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-3">Welcome to Messages</h3>
                            <p className="text-slate-600 mb-6 leading-relaxed">Select a conversation from the sidebar to start chatting, or browse our marketplace to connect with sellers.</p>
                            <Link href="/marketplace" passHref>
                                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                                    Browse Marketplace
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="text-slate-600 font-medium">Loading...</p>
                </div>
            </div>
        }>
            <ChatPageContent />
        </Suspense>
    );
}