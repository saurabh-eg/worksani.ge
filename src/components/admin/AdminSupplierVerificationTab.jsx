import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Clock, FileText, Search, Edit, UserCheck, UserX } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { translations } from '@/lib/translations';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

const AdminSupplierVerificationTab = () => {
  const { users, updateSupplierVerification, updateUser } = useData();
  const { language, user: adminUser } = useAuth();
  const t = translations[language].adminPage.supplierVerification;
  const tCommon = translations[language].common;
  const { toast } = useToast();

  const [adminNotes, setAdminNotes] = useState({}); 
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  const allUsers = useMemo(() => {
    return users; // Now includes customers as well for general user management
  }, [users]);

  const filteredUsers = useMemo(() => {
     return allUsers.filter(u => 
        (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
         u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (u.company_name && u.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
         (u.numeric_id && u.numeric_id.includes(searchTerm)) ||
         (u.role && u.role.toLowerCase().includes(searchTerm.toLowerCase()))
        )
     );
  }, [allUsers, searchTerm]);

  const handleVerification = (userId, status, userRole) => {
    if (userRole !== 'supplier') {
        toast({ title: "Action Not Applicable", description: "Verification is only for supplier accounts.", variant: "info"});
        return;
    }
    const notes = adminNotes[userId] || "";
    updateSupplierVerification(userId, status, notes, adminUser?.name || 'Admin');
    toast({ title: `Supplier ${status}`, description: `Supplier account has been ${status}.`});
    setAdminNotes(prev => ({...prev, [userId]: ''})); 
  };

  const handleNoteChange = (userId, value) => {
    setAdminNotes(prev => ({...prev, [userId]: value}));
  };

  const handleUserEdit = (user) => {
    setEditingUser({ ...user });
  };

  const handleUserSave = () => {
    if (!editingUser) return;
    // Ensure JSON fields are properly formatted if they are part of editingUser
    const dataToSave = {...editingUser};
    if (dataToSave.transaction_history && typeof dataToSave.transaction_history === 'string') {
        try { dataToSave.transaction_history = JSON.parse(dataToSave.transaction_history); } catch(e) { dataToSave.transaction_history = []; }
    }
    if (dataToSave.past_projects_gallery && typeof dataToSave.past_projects_gallery === 'string') {
        try { dataToSave.past_projects_gallery = JSON.parse(dataToSave.past_projects_gallery); } catch(e) { dataToSave.past_projects_gallery = []; }
    }
     if (dataToSave.supplier_reviews && typeof dataToSave.supplier_reviews === 'string') {
        try { dataToSave.supplier_reviews = JSON.parse(dataToSave.supplier_reviews); } catch(e) { dataToSave.supplier_reviews = []; }
    }

    updateUser(editingUser.id, dataToSave); 
    toast({ title: "User Updated", description: `Details for ${editingUser.name} updated.`, variant: "default" });
    setEditingUser(null);
  };
  
  const handleToggleBlockUser = (user) => {
    const newStatus = user.account_status === 'blocked' ? 'active' : 'blocked';
    const updatedUserData = { account_status: newStatus };
    updateUser(user.id, updatedUserData);
    toast({ title: newStatus === 'blocked' ? tCommon.userBlocked : tCommon.userUnblocked, description: `User ${user.name} is now ${newStatus}.`});
  };


  const getStatusBadge = (status, role) => {
    if (role === 'customer') {
        return <Badge variant="outline">N/A</Badge>; // Customers don't have verification status
    }
    switch(status) {
      case 'verified': return <Badge variant="default" className="bg-green-500 text-white flex items-center"><UserCheck size={14} className="mr-1"/> {t.statusVerified || "Verified"}</Badge>;
      case 'pending': return <Badge variant="secondary" className="bg-yellow-500 text-black flex items-center"><Clock size={14} className="mr-1"/> {t.statusPending || "Pending"}</Badge>;
      case 'rejected': return <Badge variant="destructive" className="flex items-center"><XCircle size={14} className="mr-1"/> {t.statusRejected || "Rejected"}</Badge>;
      default: return <Badge variant="outline">{status || (t.statusNotApplicable || "N/A")}</Badge>;
    }
  };
  
  const getAccountStatusBadge = (status) => {
    switch(status) {
      case 'active': return <Badge className="bg-green-100 text-green-700">{tCommon.statusActive || "Active"}</Badge>;
      case 'blocked': return <Badge className="bg-red-100 text-red-700">{tCommon.statusBlocked || "Blocked"}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><UserCheck className="mr-2 text-primary" /> {t.title || "User Account Management"} ({filteredUsers.length})</CardTitle>
          <CardDescription>{t.description || "Review and manage user accounts. Approve/reject suppliers and block/unblock any user."}</CardDescription>
          <Input 
            type="text" 
            placeholder={t.searchPlaceholder || "Search users (name, email, company, ID, role)..."} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-2 max-w-md"
          />
        </CardHeader>
        <CardContent>
          {filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.userName || "User Name"} (ID)</TableHead>
                  <TableHead>{t.role || "Role"}</TableHead>
                  <TableHead>{t.email || "Email"}</TableHead>
                  <TableHead>{t.verificationStatus || "Verification (Suppliers)"}</TableHead>
                  <TableHead>{t.accountStatus || "Account Status"}</TableHead>
                  <TableHead>{t.adminNotes || "Admin Notes"}</TableHead>
                  <TableHead className="text-right">{t.actions || "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => (
                  <TableRow key={user.id} className={`${user.role === 'supplier' && user.verification_status === 'pending' ? 'bg-yellow-50 hover:bg-yellow-100' : user.account_status === 'blocked' ? 'bg-red-50 hover:bg-red-100 line-through' : 'hover:bg-slate-50'}`}>
                    <TableCell>
                      {user.name}
                      <span className="block text-xs text-gray-500">ID: {user.numeric_id || 'N/A'}</span>
                    </TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getStatusBadge(user.verification_status, user.role)}</TableCell>
                    <TableCell>{getAccountStatusBadge(user.account_status)}</TableCell>
                    <TableCell className="max-w-xs">
                      <Textarea 
                        placeholder={t.notesPlaceholder || "Notes for action..."}
                        value={adminNotes[user.id] || user.admin_verification_notes || ''}
                        onChange={(e) => handleNoteChange(user.id, e.target.value)}
                        rows={1}
                        className="text-xs"
                        disabled={user.role !== 'supplier'}
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                       <Dialog open={editingUser?.id === user.id} onOpenChange={(isOpen) => !isOpen && setEditingUser(null)}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleUserEdit(user)} className="text-blue-600 border-blue-600 hover:bg-blue-50">
                                <Edit className="h-3 w-3"/>
                            </Button>
                        </DialogTrigger>
                        {editingUser && editingUser.id === user.id && (
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                <DialogTitle>{t.editUserTitle || "Edit User"}: {editingUser.name}</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                   <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="userNameAdminEdit" className="text-right">{t.userName || "Name"}</Label>
                                        <Input id="userNameAdminEdit" value={editingUser.name || ''} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="col-span-3" />
                                    </div>
                                    {editingUser.role === 'supplier' && (
                                      <>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="userCompanyNameAdminEdit" className="text-right">{t.companyName || "Company"}</Label>
                                            <Input id="userCompanyNameAdminEdit" value={editingUser.company_name || ''} onChange={(e) => setEditingUser({...editingUser, company_name: e.target.value})} className="col-span-3" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="userBidBalanceAdminEdit" className="text-right">{t.bidBalance || "Bid Balance"} (₾)</Label>
                                            <Input id="userBidBalanceAdminEdit" type="number" value={editingUser.bid_balance || 0} onChange={(e) => setEditingUser({...editingUser, bid_balance: parseFloat(e.target.value)})} className="col-span-3" />
                                        </div>
                                      </>
                                    )}
                                    {editingUser.role === 'customer' && (
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="userWalletBalanceAdminEdit" className="text-right">{t.walletBalance || "Wallet Balance"} (₾)</Label>
                                            <Input id="userWalletBalanceAdminEdit" type="number" value={editingUser.wallet_balance || 0} onChange={(e) => setEditingUser({...editingUser, wallet_balance: parseFloat(e.target.value)})} className="col-span-3" />
                                        </div>
                                    )}
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild><Button variant="outline" onClick={() => setEditingUser(null)}>{tCommon.cancel || "Cancel"}</Button></DialogClose>
                                    <Button type="button" onClick={handleUserSave}>{tCommon.save || "Save"}</Button>
                                </DialogFooter>
                            </DialogContent>
                        )}
                      </Dialog>
                      
                      {user.role === 'supplier' && user.verification_status === 'pending' && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleVerification(user.id, 'verified', user.role)} className="text-green-600 hover:bg-green-100">
                            <CheckCircle className="h-4 w-4 mr-1"/> {t.approveButton}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleVerification(user.id, 'rejected', user.role)} className="text-red-600 hover:bg-red-100">
                            <XCircle className="h-4 w-4 mr-1"/> {t.rejectButton}
                          </Button>
                        </>
                      )}
                       {user.role === 'supplier' && user.verification_status === 'rejected' && (
                         <Button variant="ghost" size="sm" onClick={() => handleVerification(user.id, 'verified', user.role)} className="text-green-600 hover:bg-green-100">
                            <CheckCircle className="h-4 w-4 mr-1"/> {t.approveButton}
                          </Button>
                       )}
                       {user.role === 'supplier' && user.verification_status === 'verified' && (
                         <Button variant="ghost" size="sm" onClick={() => handleVerification(user.id, 'pending', user.role)} className="text-yellow-600 hover:bg-yellow-100">
                            <Clock className="h-4 w-4 mr-1"/> {t.revertToPendingButton || "Revert to Pending"}
                          </Button>
                       )}
                       <Button 
                          variant={user.account_status === 'blocked' ? "outline" : "destructive"} 
                          size="sm" 
                          onClick={() => handleToggleBlockUser(user)}
                          className={user.account_status === 'blocked' ? 'text-green-600 border-green-600 hover:bg-green-50' : 'text-red-600 border-red-600 hover:bg-red-50'}
                        >
                          {user.account_status === 'blocked' ? <UserCheck className="h-3 w-3"/> : <UserX className="h-3 w-3"/>}
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500 py-4">{t.noUsersFound || "No users found matching your criteria."}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSupplierVerificationTab;