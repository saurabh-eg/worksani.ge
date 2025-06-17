import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { MessageCircle, Users } from 'lucide-react';

const AdminMessagesTab = ({ allUsers, messages, getUserById }) => {
  const [viewingMessagesUser, setViewingMessagesUser] = useState(null);
  const [userMessages, setUserMessages] = useState([]);

  const handleViewMessages = (user) => {
    setViewingMessagesUser(user);
    const allRelatedMessages = messages.filter(
      msg => msg.senderId === user.id || msg.receiverId === user.id
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    setUserMessages(allRelatedMessages);
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible">
      <Card>
        <CardHeader>
          <CardTitle>View User Messages</CardTitle>
          <CardDescription>Select a user to view their conversations. This is a simplified view for admin oversight.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h3 className="font-semibold mb-2 text-purple-700">Select User:</h3>
              <ul className="max-h-96 overflow-y-auto border border-purple-200 rounded-md bg-white shadow">
                {allUsers.map(user => (
                  <li key={user.id} 
                      className={`p-3 cursor-pointer hover:bg-purple-100 transition-colors duration-150 border-b border-purple-50 last:border-b-0 ${viewingMessagesUser?.id === user.id ? 'bg-purple-200 font-semibold' : ''}`}
                      onClick={() => handleViewMessages(user)}>
                    {user.name} <span className="text-xs text-gray-500">({user.role})</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2">
                {viewingMessagesUser ? (
                    <>
                        <h3 className="font-semibold mb-2 text-purple-700">Messages for {viewingMessagesUser.name}:</h3>
                        {userMessages.length > 0 ? (
                            <div className="max-h-96 overflow-y-auto border border-purple-200 rounded-md p-4 space-y-3 bg-white shadow-inner">
                                {userMessages.map(msg => {
                                    const senderIsSelectedUser = msg.senderId === viewingMessagesUser.id;
                                    const sender = getUserById(msg.senderId);
                                    const receiver = getUserById(msg.receiverId);
                                    
                                    return (
                                        <div key={msg.id} className={`p-3 rounded-lg shadow-sm ${senderIsSelectedUser ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-green-50 border-l-4 border-green-400'}`}>
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-xs font-semibold">
                                                    <span className={senderIsSelectedUser ? "text-blue-700" : "text-green-700"}>{sender?.name || 'Unknown User'}</span> to <span className={!senderIsSelectedUser ? "text-blue-700" : "text-green-700"}>{receiver?.name || 'Unknown User'}</span>
                                                </p>
                                                <p className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleString()}</p>
                                            </div>
                                            <p className="text-sm text-gray-800">{msg.text}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                <MessageCircle size={40} className="mx-auto mb-2"/>
                                <p>No messages found for this user.</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        <Users size={40} className="mx-auto mb-2"/>
                        <p>Select a user from the list to view their messages.</p>
                    </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminMessagesTab;