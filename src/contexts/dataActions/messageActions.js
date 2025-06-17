import { v4 as uuidv4 } from 'uuid';

export const sendMessageAction = (messageData, currentUser, toastFunc) => {
  if (!currentUser) {
    toastFunc({ title: "Error", description: "You must be logged in to send messages.", variant: "destructive" });
    return { error: "User not logged in." };
  }

  const phoneRegex = /(\+?995\s?)?(\(?\d{3}\)?[\s.-]?)?[\d\s.-]{7,14}/g;
  let messageText = messageData.text;
  const containsPhone = phoneRegex.test(messageText);
  let flaggedMessageObject = null;

  if (containsPhone) {
    flaggedMessageObject = {
      id: uuidv4(),
      messageContent: messageText,
      senderId: currentUser.id,
      senderNumericId: currentUser.numericId,
      senderName: currentUser.name,
      receiverId: messageData.receiverId,
      timestamp: new Date().toISOString(),
      reason: 'Contains phone number',
      reviewedByAdmin: null, 
      status: 'pending_review', 
    };
    messageText = messageText.replace(phoneRegex, '******** (Number Hidden)');
    toastFunc({ title: "Message Sent (Moderated)", description: "Potential contact info was redacted. Admin will be notified.", variant: "default" });
  }

  const newMessage = {
    id: uuidv4(),
    senderId: currentUser.id,
    senderNumericId: currentUser.numericId,
    senderName: currentUser.name,
    senderRole: currentUser.role,
    ...messageData,
    text: messageText,
    timestamp: new Date().toISOString(),
    read: false,
  };

  return { newMessage, flaggedMessageObject };
};