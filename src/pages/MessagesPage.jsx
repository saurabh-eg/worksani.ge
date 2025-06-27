import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Send, UserCircle, MessageSquare, Users, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { translations } from '@/lib/translations';

const MessagesPage = () => {
  const { user, language } = useAuth();
  const {
    users,
    getMessagesForChat,
    sendMessage,
    markMessagesAsRead,
    getChatPartners,
    canUsersChat,
    messages,
  } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const t = translations[language].messagesPage;

  const [selectedChatPartner, setSelectedChatPartner] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  // const [chatPartners, setChatPartners] = useState([]);
  const chatPartners = getChatPartners();
  const messagesEndRef = useRef(null);

  // Update chat partners when user/messages change
  // useEffect(() => {
  //   if (user) {
  //     const chatPartners = getChatPartners();
  //     setChatPartners(chatPartners);
  //   }
  // }, [user, getChatPartners]);

  // Prefill chat if navigated with state
  useEffect(() => {
    if (location.state?.prefillChatWith) {
      const partner = users.find(u => u.id === location.state.prefillChatWith);
      if (partner) {
        handleSelectChatPartner(partner);
      }
    }
  }, [location.state, users]);

  // Update current messages when chat partner or user changes
  const currentMessages = selectedChatPartner && user
    ? getMessagesForChat(user.id, selectedChatPartner.id)
    : [];
  useEffect(() => {
    if (selectedChatPartner && user) {
      markMessagesAsRead(selectedChatPartner.id);
    }
  }, [selectedChatPartner, user, markMessagesAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const handleSelectChatPartner = (partner) => {
    setSelectedChatPartner(partner);
    navigate(location.pathname, { replace: true, state: {} });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChatPartner || !user) return;

    if (!canUsersChat(user.id, selectedChatPartner.id)) {
      toast({
        title: t.messageBlockedTitle,
        description: t.messageBlockedDesc,
        variant: "destructive",
      });
      return;
    }

    sendMessage({
      receiverId: selectedChatPartner.id,
      text: newMessage,
    });
    setNewMessage('');
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-red-600">{translations[language].common.errors.accessDeniedTitle}</h1>
          <p className="text-gray-700">{translations[language].common.errors.pleaseLogin}</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-slate-50 to-green-50">
      <Header />
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)] flex"
        >
          <div className={`w-full md:w-1/3 lg:w-1/4 border-r border-purple-200 bg-white rounded-l-xl shadow-lg flex flex-col
            ${selectedChatPartner && 'hidden md:flex'}`}>
            <CardHeader className="p-4 border-b border-purple-100">
              <CardTitle className="text-xl font-semibold text-purple-700 flex items-center">
                <Users size={24} className="mr-2 text-green-500" /> Chats
              </CardTitle>
            </CardHeader>
            <div className="flex-grow overflow-y-auto">
              {chatPartners.length > 0 ? (
                chatPartners.map(partner => (
                  <div
                    key={partner.id}
                    onClick={() => handleSelectChatPartner(partner)}
                    className={`p-3 flex items-center space-x-3 cursor-pointer hover:bg-purple-50 transition-colors border-b border-purple-50
                      ${selectedChatPartner?.id === partner.id ? 'bg-purple-100' : ''}`}
                  >
                    <Avatar className="h-10 w-10 border-2 border-purple-200">
                      <AvatarImage src={partner.profilePhoto || `https://avatar.vercel.sh/${partner.email}.png?size=40`} alt={partner.name} />
                      <AvatarFallback className="bg-purple-200 text-purple-700">{partner.name?.charAt(0).toUpperCase() || <UserCircle />}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-800">{partner.name}</p>
                      <p className="text-xs text-gray-500">{translations[language].common.roles[partner.role]}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-4 text-center text-gray-500">{t.noContacts}</p>
              )}
            </div>
          </div>

          <div className={`w-full md:w-2/3 lg:w-3/4 bg-slate-50 rounded-r-xl shadow-lg flex flex-col
            ${!selectedChatPartner && 'hidden md:flex'}`}>
            {selectedChatPartner ? (
              <>
                <CardHeader className="p-4 border-b border-purple-200 bg-white flex flex-row items-center space-x-3">
                  <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setSelectedChatPartner(null)}>
                    <ArrowLeft size={20} />
                  </Button>
                  <Avatar className="h-10 w-10 border-2 border-green-300">
                    <AvatarImage src={selectedChatPartner.profilePhoto || `https://avatar.vercel.sh/${selectedChatPartner.email}.png?size=40`} alt={selectedChatPartner.name} />
                    <AvatarFallback className="bg-green-200 text-green-700">{selectedChatPartner.name?.charAt(0).toUpperCase() || <UserCircle />}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg font-semibold text-purple-700">{selectedChatPartner.name}</CardTitle>
                    <p className="text-xs text-gray-500">{translations[language].common.roles[selectedChatPartner.role]}</p>
                  </div>
                </CardHeader>
                <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-gradient-to-br from-purple-50 to-green-50">
                  {currentMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl shadow ${msg.sender_id === user.id ? 'bg-purple-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-purple-100'}`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.sender_id === user.id ? 'text-purple-200 text-right' : 'text-gray-400 text-left'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="p-4 border-t border-purple-200 bg-white flex items-center space-x-3">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t.sendMessagePlaceholder}
                    className="flex-grow resize-none focus:ring-purple-500 focus:border-purple-500"
                    rows={1}
                    disabled={!canUsersChat(user.id, selectedChatPartner.id)}
                    onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
                  />
                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3"
                    disabled={!canUsersChat(user.id, selectedChatPartner.id) || !newMessage.trim()}
                  >
                    <Send size={20} />
                  </Button>
                </form>
                {!canUsersChat(user.id, selectedChatPartner.id) && (
                  <div className="p-2 text-center text-red-500 text-sm">
                    {t.messageBlockedDesc}
                  </div>
                )}
              </>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-8 text-gray-500">
                <MessageSquare size={64} className="mb-4 opacity-50" />
                <h2 className="text-xl font-semibold">{t.selectConversation}</h2>
                <p>Choose a conversation from the list to start messaging.</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default MessagesPage;