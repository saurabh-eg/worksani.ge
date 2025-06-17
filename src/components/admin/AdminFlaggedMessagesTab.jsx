import React from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { AlertTriangle, User, Users, CheckSquare } from 'lucide-react';
import { translations } from '@/lib/translations';
import { Badge } from '@/components/ui/badge';

const AdminFlaggedMessagesTab = () => {
  const { flaggedMessages, getUserById, markFlaggedMessageAsReviewed } = useData();
  const { user: adminUser, language } = useAuth();
  const t = translations[language].adminPage.flaggedMessagesTab;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const handleMarkReviewed = (messageId) => {
    markFlaggedMessageAsReviewed(messageId, adminUser.id);
  };

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-6 w-6 text-yellow-500" /> {t.title} ({flaggedMessages.filter(m => m.status !== 'reviewed').length})
          </CardTitle>
          <CardDescription>
            {t.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {flaggedMessages.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.sender}</TableHead>
                  <TableHead>{t.receiver}</TableHead>
                  <TableHead>{t.reason}</TableHead>
                  <TableHead>{t.timestamp}</TableHead>
                  <TableHead>{t.messageSnippet}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead className="text-right">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flaggedMessages.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map((msg) => {
                  const sender = getUserById(msg.senderId);
                  const receiver = getUserById(msg.receiverId);
                  const reviewerAdmin = msg.reviewedByAdmin ? getUserById(msg.reviewedByAdmin) : null;
                  return (
                    <TableRow key={msg.id} className={`hover:bg-yellow-50/50 ${msg.status === 'reviewed' ? 'opacity-60' : ''}`}>
                      <TableCell className="font-medium">{sender?.name || msg.senderId} ({sender?.numericId})</TableCell>
                      <TableCell>{receiver?.name || msg.receiverId} ({receiver?.numericId})</TableCell>
                      <TableCell>
                        <span className="text-yellow-700 font-semibold">{msg.reason}</span>
                      </TableCell>
                      <TableCell>{new Date(msg.timestamp).toLocaleString()}</TableCell>
                      <TableCell className="italic text-gray-600">"{msg.messageContent.substring(0, 50)}{msg.messageContent.length > 50 ? '...' : ''}"</TableCell>
                      <TableCell>
                        {msg.status === 'reviewed' ? 
                          <Badge variant="default" className="bg-green-500 text-white">{t.statusReviewed} {reviewerAdmin ? `by ${reviewerAdmin.name}` : ''}</Badge> : 
                          <Badge variant="secondary" className="bg-yellow-500 text-white">{t.statusPending}</Badge>
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        {msg.status !== 'reviewed' && (
                          <Button variant="outline" size="sm" onClick={() => handleMarkReviewed(msg.id)}>
                            <CheckSquare size={16} className="mr-1"/> {t.markReviewed}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <Users size={40} className="mx-auto mb-2 opacity-70" />
              <p>{t.noFlagged}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminFlaggedMessagesTab;