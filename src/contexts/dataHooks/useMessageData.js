import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { sendMessageAction } from '@/contexts/dataActions/messageActions';
import { translations } from '@/lib/translations';
import { supabase } from '@/lib/supabaseClient';

export const useMessageData = (
  initialMessages = [],
  initialFlagged = [],
  addNotificationFunc,
  usersData,
  projects
) => {
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

  // Polling effect for messages
  useEffect(() => {
    if (!currentUser) return;
    let isMounted = true;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: true });
      if (!error && data && isMounted) {
        setMessages(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(data)) {
            localStorage.setItem('messages_worksani', JSON.stringify(data));
            return data;
          }
          return prev;
        });
      }
    };

    fetchMessages(); // Initial fetch
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('messages_worksani', JSON.stringify(messages));
  }, [messages]);
  useEffect(() => {
    localStorage.setItem('flagged_messages_worksani', JSON.stringify(flaggedMessages));
  }, [flaggedMessages]);

  // Fetch messages function for after sending
  const fetchMessages = useCallback(async () => {
    if (!currentUser) return;
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
      .order('created_at', { ascending: true });
    if (!error && data) {
      setMessages(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(data)) {
          localStorage.setItem('messages_worksani', JSON.stringify(data));
          return data;
        }
        return prev;
      });
    }
  }, [currentUser]);

  // Send message: insert into Supabase, then fetch
  const sendMessage = useCallback(
    async (messageData) => {
      const { newMessage, flaggedMessageObject } = sendMessageAction(messageData, currentUser, toast);
      if (newMessage) {
        // Insert into Supabase using your schema
        const { error } = await supabase.from('messages').insert([{
          id: newMessage.id, // uuid
          sender_id: newMessage.senderId,
          receiver_id: newMessage.receiverId,
          project_id: newMessage.projectId,
          text: newMessage.text,
          created_at: newMessage.timestamp,
          read: false,
        }]);
        if (!error) {
          await fetchMessages();
        } else {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        }

        if (newMessage.receiverId !== currentUser.id && addNotificationFunc) {
          const notificationText =
            (t?.common?.notifications?.newMessageDesc ||
              translations.en?.common?.notifications?.newMessageDesc ||
              "You have a new message from {senderName}.")
              .replace('{senderName}', newMessage.senderName || "User");
          addNotificationFunc({
            userId: newMessage.receiverId,
            type: 'new_message',
            message: notificationText,
            relatedEntityId: newMessage.senderId,
            link: '/messages',
          });
        }
      }
      if (flaggedMessageObject) setFlaggedMessages(prev => [...prev, flaggedMessageObject]);
    },
    [currentUser, toast, addNotificationFunc, t, language, fetchMessages]
  );

  const markFlaggedMessageAsReviewed = useCallback((messageId, adminId) => {
    setFlaggedMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, status: 'reviewed', reviewedByAdmin: adminId } : msg
    ));
    toast({ title: "Message Reviewed", description: "Flagged message marked as reviewed." });
  }, [toast]);

  const markMessagesAsRead = useCallback((chatPartnerId) => {
    if (!currentUser) return;
    setMessages(prevMessages => prevMessages.map(msg => {
      if (msg.receiver_id === currentUser.id && msg.sender_id === chatPartnerId && !msg.read) {
        return { ...msg, read: true };
      }
      return msg;
    }));
  }, [currentUser]);

  const getMessagesForChat = useCallback((user1Id, user2Id) => {
    return messages.filter(msg =>
      (msg.sender_id === user1Id && msg.receiver_id === user2Id) ||
      (msg.sender_id === user2Id && msg.receiver_id === user1Id)
    ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
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

    // Only add partners from awarded/in progress projects
    if (projects) {
      projects.forEach(p => {
        if (
          (p.customerId === currentUser.id && p.awardedSupplierId && (p.status === 'awarded' || p.status === 'In Progress'))
        ) {
          partnerIds.add(p.awardedSupplierId);
        } else if (
          (p.awardedSupplierId === currentUser.id && p.customerId && (p.status === 'awarded' || p.status === 'In Progress'))
        ) {
          partnerIds.add(p.customerId);
        }
      });
    }

    // Optionally, also add partners from existing messages (if you want to show old chats)
    messages.forEach(msg => {
      if (msg.sender_id === currentUser.id) partnerIds.add(msg.receiver_id);
      if (msg.receiver_id === currentUser.id) partnerIds.add(msg.sender_id);
    });

    // Only return users who exist in usersData
    return Array.from(partnerIds)
      .map(id => usersData.find(u => u.id === id))
      .filter(Boolean);
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