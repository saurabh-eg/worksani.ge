import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Edit, Trash2, Search, UserX, UserCheck, KeyRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { translations } from '@/lib/translations';
import { Badge } from '@/components/ui/badge';

// setManagedUsers prop is removed as users are now directly from useData context (Supabase)
const AdminUsersTab = ({ users, onUpdateUser, onDeleteUser, onChangePassword }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [changingPasswordUser, setChangingPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const { toast } = useToast();
  const { language } = useAuth();
  const t = translations[language].adminPage.usersTab;

  const handleUserEdit = (user) => {
    setEditingUser({ ...user });
  };

  const handleUserSave = () => {
    if (!editingUser) return;
    // Remove fields that Supabase might auto-manage or that are not directly updatable this way
    const { created_at, updated_at, member_since, ...updatableUser } = editingUser;
    onUpdateUser(updatableUser.id, updatableUser);
    toast({ title: "User Updated", description: `User ${updatableUser.name} has been updated.`, variant: "default" });
    setEditingUser(null);
  };

  const handleUserDelete = (userId, userName) => {
    if (window.confirm(t.confirmDeleteUser.replace('{userName}', userName))) {
      onDeleteUser(userId);
      // No local state update needed, Supabase listener in DataContext will handle it
    }
  };

  const handleToggleBlockUser = (user) => {
    const newStatus = user.account_status === 'blocked' ? 'active' : 'blocked';
    const updatedUser = { account_status: newStatus };
    onUpdateUser(user.id, updatedUser);
    toast({ title: newStatus === 'blocked' ? t.userBlocked : t.userUnblocked, description: `User ${user.name} is now ${newStatus}.`});
  };

  const handleChangePassword = (user) => {
    setChangingPasswordUser(user);
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handlePasswordSave = async () => {
    if (!changingPasswordUser) return;
    if (newPassword.length < 6) {
      toast({ title: "Password Too Short", description: "New password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Passwords Don't Match", description: "New password and confirmation do not match.", variant: "destructive" });
      return;
    }
    
    // Admin changing password for a user is a sensitive operation.
    // Supabase client-side updateUser can't change other users' passwords.
    // This requires a server-side function (Edge Function) with service_role key.
    // For now, this will likely fail or do nothing without such a backend function.
    const success = await onChangePassword(changingPasswordUser.id, newPassword, null, true); 
    if (success) {
      toast({ title: "Password Change Initiated", description: `Password change process for ${changingPasswordUser.name} initiated. (Requires server-side logic for completion)`, variant: "default" });
      setChangingPasswordUser(null);
    } else {
      toast({ title: "Password Change Failed", description: "Could not update password. This action typically requires server-side permissions.", variant: "destructive" });
    }
  };

  const filterUsersByRole = (role) => {
    return users.filter(user => user.role === role &&
      (
        (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.numeric_id?.toString() || '').includes(searchTerm)
      )
    );
  };

  const customers = useMemo(() => filterUsersByRole('customer'), [users, searchTerm]);
  const suppliers = useMemo(() => filterUsersByRole('supplier'), [users, searchTerm]);

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const renderUserTable = (userList, userType) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t.fullName}</TableHead>
          <TableHead>{t.email}</TableHead>
          <TableHead>{t.userId}</TableHead>
          <TableHead>{t.accountStatus}</TableHead>
          {userType === 'customer' && <TableHead>{t.balance}</TableHead>}
          {userType === 'supplier' && <TableHead>{t.verificationStatus}</TableHead>}
          <TableHead className="text-right">{t.actions}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {userList.length > 0 ? userList.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.numeric_id}</TableCell>
            <TableCell>
              <Badge variant={user.account_status === 'active' ? 'default' : 'destructive'} className={user.account_status === 'active' ? 'bg-green-500' : 'bg-red-500'}>
                {user.account_status === 'active' ? t.statusActive : t.statusBlocked}
              </Badge>
            </TableCell>
            {userType === 'customer' && <TableCell>₾{(user.wallet_balance || 0).toFixed(2)}</TableCell>}
            {userType === 'supplier' && 
              <TableCell>
                <Badge variant={
                  user.verification_status === 'verified' ? 'default' : 
                  user.verification_status === 'pending' ? 'secondary' : 'destructive'
                } className={
                  user.verification_status === 'verified' ? 'bg-green-500' : 
                  user.verification_status === 'pending' ? 'bg-yellow-500 text-black' : 'bg-red-500'
                }>
                  {t[user.verification_status] || user.verification_status}
                </Badge>
              </TableCell>
            }
            <TableCell className="text-right space-x-1">
              <Dialog open={editingUser?.id === user.id} onOpenChange={(isOpen) => !isOpen && setEditingUser(null)}>
                  <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => handleUserEdit(user)} className="text-blue-600 border-blue-600 hover:bg-blue-50">
                          <Edit className="h-3 w-3"/>
                      </Button>
                  </DialogTrigger>
                  {editingUser && editingUser.id === user.id && (
                      <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                          <DialogTitle>Edit User: {editingUser.name}</DialogTitle>
                          <DialogDescription>Make changes to the user's profile here. Click save when you're done.</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="name" className="text-right">Name</Label>
                                  <Input id="name" value={editingUser.name || ''} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="col-span-3" />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="email_edit_admin" className="text-right">Email</Label>
                                  <Input id="email_edit_admin" type="email" value={editingUser.email || ''} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="col-span-3" />
                              </div>
                              {editingUser.role === 'supplier' && (
                                  <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="bid_balance" className="text-right">Bid Balance (₾)</Label>
                                      <Input id="bid_balance" type="number" step="0.01" value={editingUser.bid_balance || 0} onChange={(e) => setEditingUser({...editingUser, bid_balance: parseFloat(e.target.value)})} className="col-span-3" />
                                  </div>
                              )}
                              {editingUser.role === 'customer' && (
                                  <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="wallet_balance" className="text-right">Wallet Balance (₾)</Label>
                                      <Input id="wallet_balance" type="number" step="0.01" value={editingUser.wallet_balance || 0} onChange={(e) => setEditingUser({...editingUser, wallet_balance: parseFloat(e.target.value)})} className="col-span-3" />
                                  </div>
                              )}
                          </div>
                          <DialogFooter>
                              <DialogClose asChild><Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button></DialogClose>
                              <Button type="button" onClick={handleUserSave}>Save changes</Button>
                          </DialogFooter>
                      </DialogContent>
                  )}
              </Dialog>
              <Dialog open={changingPasswordUser?.id === user.id} onOpenChange={(isOpen) => !isOpen && setChangingPasswordUser(null)}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => handleChangePassword(user)} className="text-orange-600 border-orange-600 hover:bg-orange-50">
                    <KeyRound className="h-3 w-3"/>
                  </Button>
                </DialogTrigger>
                {changingPasswordUser && changingPasswordUser.id === user.id && (
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Change Password for {changingPasswordUser.name}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-1">
                        <Label htmlFor="newPasswordAdmin">New Password</Label>
                        <Input id="newPasswordAdmin" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="confirmNewPasswordAdmin">Confirm New Password</Label>
                        <Input id="confirmNewPasswordAdmin" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild><Button variant="outline" onClick={() => setChangingPasswordUser(null)}>Cancel</Button></DialogClose>
                      <Button type="button" onClick={handlePasswordSave}>Set New Password</Button>
                    </DialogFooter>
                  </DialogContent>
                )}
              </Dialog>
              <Button 
                variant={user.account_status === 'blocked' ? "outline" : "destructive"} 
                size="sm" 
                onClick={() => handleToggleBlockUser(user)}
                className={user.account_status === 'blocked' ? 'text-green-600 border-green-600 hover:bg-green-50' : ''}
              >
                {user.account_status === 'blocked' ? <UserCheck className="h-3 w-3"/> : <UserX className="h-3 w-3"/>}
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleUserDelete(user.id, user.name)}>
                <Trash2 className="h-3 w-3"/>
              </Button>
            </TableCell>
          </TableRow>
        )) : (
          <TableRow><TableCell colSpan={userType === 'customer' ? 6 : 6} className="text-center">{t.noUsers}</TableCell></TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible">
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>View, edit, or delete user accounts. Filter by customers or suppliers.</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="customers" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="customers">{t.customersTab} ({customers.length})</TabsTrigger>
              <TabsTrigger value="suppliers">{t.suppliersTab} ({suppliers.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="customers">
              {renderUserTable(customers, 'customer')}
            </TabsContent>
            <TabsContent value="suppliers">
              {renderUserTable(suppliers, 'supplier')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminUsersTab;