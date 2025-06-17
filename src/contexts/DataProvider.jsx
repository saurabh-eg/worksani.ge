import React, { useEffect, useState, useCallback } from 'react';
import { DataContext } from './DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from './dataHooks/useUserData';
import { useProjectData } from './dataHooks/useProjectData';
import { useMessageData } from './dataHooks/useMessageData';
import { useNotificationData } from './dataHooks/useNotificationData';
import { useSiteSettingsData } from './dataHooks/useSiteSettingsData';
import { supabase } from '@/lib/supabaseClient';

export const DataProvider = ({ children }) => {
  const { user: currentUser, updateUserContextProfile } = useAuth();
  const [loadingData, setLoadingData] = useState(true);

  const { siteSettings, updateSiteSettingsData, loading: siteSettingsLoading } = useSiteSettingsData();
  const { notifications, addNotification, markNotificationAsRead, clearReadNotificationsForUser, loading: notificationsLoading } = useNotificationData();

  const {
    usersData,
    topUpUserBalance,
    deductProjectFee,
    deductBidFee,
    updateUser,
    updateSupplierVerification,
    deleteUserData,
    getUserById,
    getUserByEmail,
    changePassword,
    loading: usersLoading,
    setUsersData,
  } = useUserData();

  const {
    projects,
    setProjects,
    addProject,
    updateProject,
    deleteProjectData: deleteProject,
    addBid,
    acceptBid,
    addReview,
    deleteReviewByProjectId,
    getProjectById,
    getSupplierProjects,
    getCustomerProjects,
    mapProjectsForDeletedUser,
    loading: projectsLoading,
  } = useProjectData(
    undefined,
    usersData,
    siteSettings,
    addNotification,
    deductProjectFee,
    deductBidFee,
    updateUser,
    updateUserContextProfile
  );

  const {
    messages,
    flaggedMessages,
    sendMessage,
    markMessagesAsRead,
    getMessagesForChat,
    canUsersChat,
    getChatPartners,
    markFlaggedMessageAsReviewed,
    loading: messagesLoading,
    setMessages,
  } = useMessageData(undefined, undefined, addNotification, usersData, projects);

  useEffect(() => {
    if (!usersLoading && !projectsLoading && !messagesLoading && !siteSettingsLoading && !notificationsLoading) {
      setLoadingData(false);
    }
  }, [usersLoading, projectsLoading, messagesLoading, siteSettingsLoading, notificationsLoading]);

  // Real-time subscription for profiles
  useEffect(() => {
    // console.log('DataProvider: useEffect for realtime subscription started');
    let isSubscribed = true;
    const channelRef = { current: null };

    const setupRealtimeSubscription = async () => {
      try {
        // console.log('DataProvider: setupRealtimeSubscription called');
        if (channelRef.current) {
          // console.log('DataProvider: already subscribed, skipping');
          return;
        }

        channelRef.current = supabase
          .channel('profiles')
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
          }, (payload) => {
            if (!isSubscribed) return;

            // console.log('DataProvider: received realtime update payload', payload);
            const updatedData = payload.new;
            setUsersData(prevUsers =>
              prevUsers.map(user =>
                user.id === updatedData.id
                  ? { ...user, ...updatedData }
                  : user
              )
            );

            if (currentUser?.id === updatedData.id) {
              updateUserContextProfile({ ...currentUser, ...updatedData });
            }
          })
          .subscribe();

        // console.log('DataProvider: subscription created', channelRef.current);

      } catch (error) {
        // console.error('Error setting up real-time subscription:', error);
      }
    };

    setupRealtimeSubscription();

    return () => {
      // console.log('DataProvider: cleaning up realtime subscription');
      isSubscribed = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [currentUser, updateUserContextProfile]);

  const handleDeleteUser = useCallback((userId) => {
    deleteUserData(userId, mapProjectsForDeletedUser);
  }, [deleteUserData, mapProjectsForDeletedUser]);

  const handleUpdateSupplierVerification = useCallback((supplierId, status, adminNotes) => {
    updateSupplierVerification(supplierId, status, adminNotes, addNotification);
  }, [updateSupplierVerification, addNotification]);

  const handleTopUpUserBalance = useCallback((userId, amount, type, description) => {
    topUpUserBalance(userId, amount, type, description, addNotification);
  }, [topUpUserBalance, addNotification]);

  return (
    <DataContext.Provider value={{
      projects,
      users: usersData,
      messages,
      flaggedMessages,
      siteSettings,
      notifications,
      loadingData,

      addProject,
      updateProject,
      deleteProject,
      getProjectById,

      addBid,
      acceptBid,
      addReview,
      deleteReviewByProjectId,

      sendMessage,
      markMessagesAsRead,
      getMessagesForChat,
      getChatPartners,
      canUsersChat,

      updateUser,
      deleteUser: handleDeleteUser,
      getUserById,
      getUserByEmail,
      updateSupplierVerification: handleUpdateSupplierVerification,
      changePassword,

      getSupplierProjects,
      getCustomerProjects,

      getFlaggedMessages: () => flaggedMessages,
      markFlaggedMessageAsReviewed,

      topUpUserBalance: handleTopUpUserBalance,
      deductProjectFee,
      deductBidFee,

      updateSiteSettingsData,

      addNotification,
      markNotificationAsRead,
      clearReadNotificationsForUser,
    }}>
      {!loadingData ? children : <div>Loading application data...</div>}
    </DataContext.Provider>
  );
};
