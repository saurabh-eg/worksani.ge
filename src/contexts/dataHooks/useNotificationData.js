import { useState, useEffect, useCallback } from 'react';
import { initialNotifications } from '@/lib/initialData';
import { addNotificationAction, markNotificationReadAction, clearUserNotificationsAction } from '@/contexts/dataActions/notificationActions';

export const useNotificationData = (initialData = initialNotifications) => {
  const [notifications, setNotifications] = useState(() => {
    const localData = localStorage.getItem('notifications_worksani');
    return localData ? JSON.parse(localData) : initialData;
  });

  useEffect(() => {
    localStorage.setItem('notifications_worksani', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((notificationData) => {
    setNotifications(prev => addNotificationAction(prev, notificationData));
  }, []);

  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications(prev => markNotificationReadAction(prev, notificationId));
  }, []);
  
  const clearReadNotificationsForUser = useCallback((userId) => {
    setNotifications(prev => clearUserNotificationsAction(prev, userId));
  }, []);

  return {
    notifications,
    addNotification,
    markNotificationAsRead,
    clearReadNotificationsForUser,
  };
};