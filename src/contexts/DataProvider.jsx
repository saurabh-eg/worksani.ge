import React, { useEffect, useState, useCallback } from 'react';
import { DataContext } from './DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from './dataHooks/useUserData';
import { useProjectData } from './dataHooks/useProjectData';
import { useMessageData } from './dataHooks/useMessageData';
import { useNotificationData } from './dataHooks/useNotificationData';
import { useSiteSettingsData } from './dataHooks/useSiteSettingsData';

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

  // Map member_since to memberSince for all users
  const mappedUsersData = usersData
    ? usersData.map(u => ({
        ...u,
        memberSince: u.memberSince || u.member_since || u.created_at || null,
      }))
    : [];

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
      users: mappedUsersData,
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
