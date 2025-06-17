import { v4 as uuidv4 } from 'uuid';

export const addNotificationAction = (currentNotifications, notificationData) => {
  const newNotification = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    read: false,
    ...notificationData, // Should include userId, type, message, relatedEntityId (optional), link (optional)
  };
  return [newNotification, ...currentNotifications];
};

export const markNotificationReadAction = (currentNotifications, notificationId) => {
  return currentNotifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  );
};

export const clearUserNotificationsAction = (currentNotifications, userId) => {
  // This could be to clear all notifications or just read ones for a user
  // For now, let's assume it clears all *read* notifications for the user
  return currentNotifications.filter(n => !(n.userId === userId && n.read));
};