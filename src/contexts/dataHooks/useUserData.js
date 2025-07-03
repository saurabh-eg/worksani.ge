import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { translations } from '@/lib/translations';
import { generateNumericId } from '@/lib/utils';

export const useUserData = () => {
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser, updateUserContextProfile, language } = useAuth();
  const { toast } = useToast();
  const t = translations[language] || translations.en;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      toast({ title: t.common?.dataFetchErrorTitle || "Error fetching data", description: error.message, variant: "destructive" });
      setUsersData([]);
    } else {
      setUsersData(data || []);
    }
    setLoading(false);
  }, [toast, t.common]);

  useEffect(() => {
    fetchUsers();
    // Polling for real-time updates
    const interval = setInterval(fetchUsers, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [fetchUsers]);

  // Update the topUpUserBalance function
  const topUpUserBalance = useCallback(async (userId, amount, type = 'deposit', description) => {
    try {
      const userToUpdate = usersData.find(u => u.id === userId);
      if (!userToUpdate) {
        toast({ title: "Error", description: "User not found.", variant: "destructive" });
        return false;
      }

      const numericAmount = parseFloat(amount);
      const balanceField = userToUpdate.role === 'supplier' ? 'bid_balance' : 'wallet_balance';
      const currentBalance = parseFloat(userToUpdate[balanceField] || 0);
      const newBalance = currentBalance + numericAmount;

      const newTransaction = {
        id: generateNumericId(),
        date: new Date().toISOString(),
        amount: numericAmount,
        type: type,
        description: description || `${userToUpdate.role === 'supplier' ? 'Bid' : 'Wallet'} top-up`
      };

      // Always use transaction_history for database
      const currentTransactionHistory = Array.isArray(userToUpdate.transaction_history) 
        ? userToUpdate.transaction_history 
        : [];

      const updateData = {
        [balanceField]: newBalance,
        transaction_history: [...currentTransactionHistory, newTransaction]
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.error('Update error:', error);
        toast({ title: "Update Failed", description: error.message, variant: "destructive" });
        return false;
      }

      // Always update local state instantly after successful update
      setUsersData(prev => prev.map(u => u.id === userId ? {
        ...u,
        [balanceField]: newBalance,
        transaction_history: [...currentTransactionHistory, newTransaction]
      } : u));

      // Update user context if it's the current user
      if (currentUser && currentUser.id === userId) {
        updateUserContextProfile({
          ...currentUser,
          [balanceField]: newBalance,
          transaction_history: [...currentTransactionHistory, newTransaction]
        });
      }

      toast({ 
        title: "Balance Updated", 
        description: `Successfully added ₾${numericAmount.toFixed(2)} to ${userToUpdate.role === 'supplier' ? 'bid' : 'wallet'} balance.` 
      });
      return true;
    } catch (error) {
      console.error('TopUp error:', error);
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
      return false;
    }
    return false;
  }, [usersData, currentUser, updateUserContextProfile, toast]);

  const deductProjectFee = useCallback(async (customerId, fee, projectRef) => {
    const userToCharge = usersData.find(u => u.id === customerId);
    if (!userToCharge) {
      toast({ title: "Error", description: "Customer not found for fee deduction.", variant: "destructive" });
      return false;
    }
    if ((userToCharge.wallet_balance || 0) < fee) {
      toast({ title: "Insufficient Balance", description: `Wallet balance (₾${(userToCharge.wallet_balance || 0).toFixed(2)}) is too low for project fee ₾${fee.toFixed(2)}.`, variant: "destructive" });
      return false;
    }
    const newBalance = (userToCharge.wallet_balance || 0) - fee;
    const transaction = {
      id: generateNumericId(),
      date: new Date().toISOString(),
      amount: -fee,
      type: 'fee',
      description: `Project posting fee for: ${projectRef}`
    };
    const currentTransactionHistory = Array.isArray(userToCharge.transaction_history) ? userToCharge.transaction_history : [];
    const updatedTransactionHistory = [...currentTransactionHistory, transaction];

    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update({ wallet_balance: newBalance, transaction_history: updatedTransactionHistory })
      .eq('id', customerId)
      .select()
      .single();

    if (error) {
      toast({ title: "Fee Deduction Failed", description: error.message, variant: "destructive" });
      return false;
    } else if (updatedUser) {
      setUsersData(prev => prev.map(u => u.id === customerId ? updatedUser : u));
      if (currentUser && currentUser.id === customerId) {
        updateUserContextProfile(updatedUser);
      }
      return true;
    }
    return false;
  }, [usersData, currentUser, updateUserContextProfile, toast]);

  const deductBidFee = useCallback(async (supplierId, fee, projectRef) => {
    const userToCharge = usersData.find(u => u.id === supplierId);
    if (!userToCharge) {
      toast({ title: "Error", description: "Supplier not found for fee deduction.", variant: "destructive" });
      return false;
    }
    if ((userToCharge.bid_balance || 0) < fee) {
      toast({ title: "Insufficient Bid Balance", description: `Bid balance (₾${(userToCharge.bid_balance || 0).toFixed(2)}) is too low for bid fee ₾${fee.toFixed(2)}.`, variant: "destructive" });
      return false;
    }
    const newBalance = (userToCharge.bid_balance || 0) - fee;
    const transaction = {
      id: generateNumericId(),
      date: new Date().toISOString(),
      amount: -fee,
      type: 'bid_fee',
      description: `Bid fee for: ${projectRef}`
    };
    const currentTransactionHistory = Array.isArray(userToCharge.transaction_history) ? userToCharge.transaction_history : [];
    const updatedTransactionHistory = [...currentTransactionHistory, transaction];

    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update({ bid_balance: newBalance, transaction_history: updatedTransactionHistory })
      .eq('id', supplierId)
      .select()
      .single();

    if (error) {
      toast({ title: "Bid Fee Deduction Failed", description: error.message, variant: "destructive" });
      return false;
    } else if (updatedUser) {
      setUsersData(prev => prev.map(u => u.id === supplierId ? updatedUser : u));
      if (currentUser && currentUser.id === supplierId) {
        updateUserContextProfile(updatedUser);
      }
      return true;
    }
    return false;
  }, [usersData, currentUser, updateUserContextProfile, toast]);

  const updateUser = useCallback(async (userId, updatedUserDataPartial) => {
    const dataToUpdate = { ...updatedUserDataPartial };

    // Remove fields that do not exist in the DB schema
    delete dataToUpdate.memberSince;

    // Ensure JSONB fields are correctly formatted as arrays
    ['transaction_history', 'past_projects_gallery', 'supplier_reviews'].forEach(field => {
      if (dataToUpdate[field] && typeof dataToUpdate[field] === 'string') {
        try {
          dataToUpdate[field] = JSON.parse(dataToUpdate[field]);
          if (!Array.isArray(dataToUpdate[field])) dataToUpdate[field] = []; // Ensure it's an array after parsing
        } catch (e) {
          console.error(`Error parsing ${field} for update, defaulting to empty array.`, e);
          dataToUpdate[field] = [];
        }
      } else if (dataToUpdate[field] === undefined) {
        // If field is not in partial update, try to get existing value or default to empty array
        const existingUser = usersData.find(u => u.id === userId);
        dataToUpdate[field] = Array.isArray(existingUser?.[field]) ? existingUser[field] : [];
      } else if (!Array.isArray(dataToUpdate[field])) {
        // If it's provided but not an array (e.g. null, object), default to empty array
        dataToUpdate[field] = [];
      }
    });

    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update(dataToUpdate)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } else if (updatedUser) {
      setUsersData(prevUsers => prevUsers.map(u => u.id === userId ? updatedUser : u));
      if (currentUser && currentUser.id === userId) {
        updateUserContextProfile(updatedUser);
      }
      toast({ title: "Profile Updated", description: "User profile information has been saved.", variant: "default" });
    }
  }, [currentUser, updateUserContextProfile, toast, usersData]);

  const updateSupplierVerification = useCallback(async (supplierId, status, adminNotes = "", addNotificationFunc) => {
    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update({ verification_status: status, admin_verification_notes: adminNotes })
      .eq('id', supplierId)
      .eq('role', 'supplier') // Ensure we only update suppliers
      .select()
      .single();

    if (error) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } else if (updatedUser) {
      setUsersData(prevUsers => prevUsers.map(u => u.id === supplierId ? updatedUser : u));
      toast({ title: "Supplier Verification Updated", description: `Supplier status set to ${status}.`, variant: "default" });

      if (addNotificationFunc) {
        if (status === 'verified') {
          addNotificationFunc({
            userId: supplierId,
            type: 'supplier_verified',
            message: t.common?.notifications?.supplierVerifiedDesc || "Your account is verified!",
          });
        } else if (status === 'rejected') {
          addNotificationFunc({
            userId: supplierId,
            type: 'supplier_rejected',
            message: t.common?.notifications?.supplierRejectedDesc || "Account verification update.",
          });
        }
      }
    } else {
      toast({ title: "Update Info", description: "No supplier found or no changes made.", variant: "info" });
    }
  }, [toast, t, language]);

  const deleteUserData = useCallback(async (userId, mapProjectsFunc) => {
    // Use Supabase Edge Function for admin delete
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const jwt = session?.access_token;
      if (!jwt) throw new Error("No admin session found.");
      const response = await fetch('https://rvqfqneuvwggcnsmpcpw.supabase.co/functions/v1/admin-delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({ userId })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete user.');
      }
      setUsersData(prevUsers => prevUsers.filter(u => u.id !== userId));
      if (mapProjectsFunc) mapProjectsFunc(userId);
      toast({ title: "User Deleted", description: "User profile and authentication have been deleted.", variant: "default" });
    } catch (err) {
      toast({ title: "Delete User Failed", description: err.message, variant: "destructive" });
    }
  }, [toast]);

  const changePassword = useCallback(async (userId, newPassword, currentPasswordInput, isAdminChange = false) => {
    // If the current user is changing their own password
    if (currentUser && currentUser.id === userId && !isAdminChange) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast({ title: "Password Change Failed", description: error.message, variant: "destructive" });
        return false;
      }
      toast({ title: "Password Changed", description: "Your password has been updated successfully.", variant: "default" });
      return true;
    }
    // If an admin is changing another user's password
    if (currentUser && currentUser.role === 'admin' && (isAdminChange || currentUser.id !== userId)) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const jwt = session?.access_token;
        if (!jwt) throw new Error("No admin session found.");
        const response = await fetch('https://rvqfqneuvwggcnsmpcpw.supabase.co/functions/v1/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
          body: JSON.stringify({ userId, newPassword })
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to change password.');
        }
        toast({ title: "Password Changed", description: "Password updated for user.", variant: "default" });
        return true;
      } catch (err) {
        toast({ title: "Admin Password Change Failed", description: err.message, variant: "destructive" });
        return false;
      }
    }
    // If not allowed
    toast({ title: "Permission Denied", description: "You are not authorized to change this password.", variant: "destructive" });
    return false;
  }, [toast, currentUser]);

  const getUserById = useCallback((userId) => usersData.find(u => u.id === userId), [usersData]);
  const getUserByEmail = useCallback((email) => usersData.find(u => u.email === email), [usersData]);

  return {
    usersData,
    setUsersData,
    loading,
    topUpUserBalance,
    deductProjectFee,
    deductBidFee,
    updateUser,
    updateSupplierVerification,
    deleteUserData,
    getUserById,
    getUserByEmail,
    changePassword,
  };
};
