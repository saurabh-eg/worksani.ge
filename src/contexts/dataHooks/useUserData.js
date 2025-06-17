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

      const { data: updatedUser, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select('*')
        .single();

      if (error) {
        console.error('Update error:', error);
        toast({ title: "Update Failed", description: error.message, variant: "destructive" });
        return false;
      }

      if (updatedUser) {
        // Update local state
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
      }
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
    // First, delete from auth.users - this requires admin privileges for Supabase client
    // This is typically done via a trusted server-side function or with service_role key.
    // Client-side admin.deleteUser might be restricted.
    // For now, we'll attempt it, but it might fail if RLS/permissions don't allow.
    // Consider an Edge Function for this.
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError && authError.message !== 'User not found' && authError.message !== 'No user found with that UID') {
      toast({ title: "Auth Deletion Error", description: `Could not delete user from authentication system: ${authError.message}. Profile deletion will still be attempted.`, variant: "warning" });
    }

    const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId);
    if (profileError) {
      toast({ title: "Profile Deletion Error", description: profileError.message, variant: "destructive" });
    } else {
      setUsersData(prevUsers => prevUsers.filter(u => u.id !== userId));
      if (mapProjectsFunc) mapProjectsFunc(userId);
      toast({ title: "User Deleted", description: "User profile has been deleted. Associated auth user deletion might require server-side action if failed.", variant: "default" });
    }
  }, [toast]);

  const changePassword = useCallback(async (userId, newPassword, currentPasswordInput, isAdminChange = false) => {
    if (!isAdminChange) { // User changing their own password
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast({ title: "Password Change Failed", description: error.message, variant: "destructive" });
        return false;
      }
      toast({ title: "Password Changed", description: "Your password has been updated successfully.", variant: "default" });
      return true;
    } else { // Admin attempting to change another user's password
      // This requires Supabase Admin API, typically via an Edge Function for security.
      // supabase.auth.admin.updateUserById(userId, { password: newPassword })
      toast({ title: "Admin Password Change Not Implemented", description: "Changing other users' passwords requires a secure server-side function. This feature is not available from the client.", variant: "info" });
      return false;
    }
  }, [toast]);

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
