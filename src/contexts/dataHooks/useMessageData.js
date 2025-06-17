import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { sendMessageAction } from '@/contexts/dataActions/messageActions';
import { translations } from '@/lib/translations';

export const useMessageData = (initialMessages = [], initialFlagged = [], addNotificationFunc, usersData, projects) => {
  const [messages, setMessages] = useState(() => {
    const localData = localStorage.getItem('messages_worksani');
    return localData ? JSON.parse(localData) : initialMessages;
  });

  const [flaggedMessages, setFlaggedMessages] = useState(() => {
    const localData = localStorage.getItem('flagged_messages_worksani');
    return localData ? JSON.parse(localData) : initialFlagged;
  });

  const { user: currentUser, language } = useAuth();
  const { toast } = useToast();
  const t = translations[language] || translations.en;

  useEffect(() => { localStorage.setItem('messages_worksani', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem('flagged_messages_worksani', JSON.stringify(flaggedMessages)); }, [flaggedMessages]);

  const sendMessage = useCallback((messageData) => {
    const { newMessage, flaggedMessageObject } = sendMessageAction(messageData, currentUser, toast);
    if (newMessage) {
      setMessages(prevMessages => [...prevMessages, newMessage]);
      if (newMessage.receiverId !== currentUser.id && addNotificationFunc) {
          addNotificationFunc({
              userId: newMessage.receiverId,
              type: 'new_message',
              message: t.common.notifications.newMessageDesc.replace('{senderName}', newMessage.senderName),
              relatedEntityId: newMessage.senderId, 
              link: '/messages', 
          });
      }
    }
    if (flaggedMessageObject) setFlaggedMessages(prev => [...prev, flaggedMessageObject]);
  }, [currentUser, toast, addNotificationFunc, t, language]);

  const markFlaggedMessageAsReviewed = useCallback((messageId, adminId) => {
    setFlaggedMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, status: 'reviewed', reviewedByAdmin: adminId } : msg
    ));
    toast({title: "Message Reviewed", description: "Flagged message marked as reviewed."});
  }, [toast]);

  const markMessagesAsRead = useCallback((chatPartnerId) => {
    if (!currentUser) return;
    setMessages(prevMessages => prevMessages.map(msg => {
        if (msg.receiverId === currentUser.id && msg.senderId === chatPartnerId && !msg.read) {
            return { ...msg, read: true };
        }
        return msg;
    }));
  }, [currentUser]);

  const getMessagesForChat = useCallback((user1Id, user2Id) => {
    return messages.filter(msg => 
        (msg.senderId === user1Id && msg.receiverId === user2Id) ||
        (msg.senderId === user2Id && msg.receiverId === user1Id)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [messages]);

  const canUsersChat = useCallback((user1Id, user2Id) => {
    const user1 = usersData.find(u => u.id === user1Id);
    const user2 = usersData.find(u => u.id === user2Id);
    if (!user1 || !user2) return false;
    if (user1.role === 'admin' || user2.role === 'admin') return true;

    const customer = user1.role === 'customer' ? user1 : (user2.role === 'customer' ? user2 : null);
    const supplier = user1.role === 'supplier' ? user1 : (user2.role === 'supplier' ? user2 : null);

    if (customer && supplier && projects) {
      const bidAcceptedProject = projects.find(p =>
        (p.customerId === customer.id && p.awardedSupplierId === supplier.id && (p.status === 'awarded' || p.status === 'In Progress'))
      );
      return !!bidAcceptedProject;
    }
    return false; 
  }, [usersData, projects]);

  const getChatPartners = useCallback(() => {
    if (!currentUser || !usersData) return [];
    const partnerIds = new Set();
    messages.forEach(msg => {
      if (msg.senderId === currentUser.id) partnerIds.add(msg.receiverId);
      if (msg.receiverId === currentUser.id) partnerIds.add(msg.senderId);
    });
    if (projects) {
        projects.forEach(p => {
            if (p.customerId === currentUser.id && p.awardedSupplierId && (p.status === 'awarded' || p.status === 'In Progress')) {
                partnerIds.add(p.awardedSupplierId);
            } else if (p.awardedSupplierId === currentUser.id && p.customerId && (p.status === 'awarded' || p.status === 'In Progress')) {
                partnerIds.add(p.customerId);
            }
        });
    }
    return Array.from(partnerIds).map(id => usersData.find(u => u.id === id)).filter(Boolean);
  }, [currentUser, messages, projects, usersData]);

  return {
    messages,
    flaggedMessages,
    sendMessage,
    markMessagesAsRead,
    getMessagesForChat,
    canUsersChat,
    getChatPartners,
    markFlaggedMessageAsReviewed,
  };
};