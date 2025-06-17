import { v4 as uuidv4 } from 'uuid';

export const topUpUserBalanceAction = (userId, amount, type = 'deposit', description = 'Admin top-up') => {
  const numericAmount = parseFloat(amount);

  if (isNaN(numericAmount) || numericAmount <= 0) {
    return { success: false, mapUser: (u) => u, updatedUser: null, error: "Invalid Amount" };
  }

  let userThatWasUpdated = null;

  const mapUser = (u) => {
    if (u.id === userId) {
      // Use consistent field names
      const currentBalanceField = u.role === 'customer' ? 'wallet_balance' : 'balance';
      const currentBalance = parseFloat(u[currentBalanceField] || 0);
      const newBalance = currentBalance + numericAmount;
        
      const newTransaction = {
        id: uuidv4(),
        date: new Date().toISOString(),
        amount: numericAmount,
        type: type, 
        description: description,
      };
      
      userThatWasUpdated = {
        ...u,
        [currentBalanceField]: newBalance,
        walletBalance: u.role === 'customer' ? newBalance : u.walletBalance, // Keep both fields in sync
        transactionHistory: [...(u.transactionHistory || []), newTransaction],
      };
      return userThatWasUpdated;
    }
    return u;
  };
  
  return { success: true, mapUser, updatedUser: userThatWasUpdated };
};

export const deductProjectFeeAction = (user, fee, projectRef) => {
  const numericFee = parseFloat(fee);
  if (!user || user.role !== 'customer') {
    return { success: false, updatedUser: user, error: "Invalid user for project fee." };
  }

  const currentWalletBalance = parseFloat(user.walletBalance || 0);
  if (currentWalletBalance < numericFee) {
    return { success: false, updatedUser: user, error: "Insufficient balance." };
  }

  const newBalance = currentWalletBalance - numericFee;
  const newTransaction = {
    id: uuidv4(),
    date: new Date().toISOString(),
    amount: -numericFee,
    type: 'project_fee',
    description: `Fee for project: ${projectRef}`,
  };
  
  const updatedUser = {
    ...user,
    walletBalance: newBalance,
    transactionHistory: [...(user.transactionHistory || []), newTransaction],
  };
  
  return { success: true, updatedUser };
};

export const deductBidFeeAction = (user, fee, projectRef) => {
  const numericFee = parseFloat(fee);
  if (!user || user.role !== 'supplier') {
    return { success: false, updatedUser: user, error: "Invalid user for bid fee." };
  }

  const currentSupplierBalance = parseFloat(user.balance || 0);
  if (currentSupplierBalance < numericFee) {
    return { success: false, updatedUser: user, error: "Insufficient bid balance." };
  }

  const newBalance = currentSupplierBalance - numericFee;
  const newTransaction = {
    id: uuidv4(),
    date: new Date().toISOString(),
    amount: -numericFee,
    type: 'bid_fee_deduction',
    description: `Bid fee for project: ${projectRef}`,
  };

  const updatedUser = {
    ...user,
    balance: newBalance,
    transactionHistory: [...(user.transactionHistory || []), newTransaction],
  };

  return { success: true, updatedUser };
};


export const updateUserAction = (userId, updatedUserDataPartial) => {
  let userThatWasUpdated = null;
  const mapUser = (u) => {
    if (u.id === userId) {
      userThatWasUpdated = { ...u, ...updatedUserDataPartial };
      return userThatWasUpdated;
    }
    return u;
  };
  return { mapUser, updatedUser: userThatWasUpdated };
};

export const updateSupplierVerificationAction = (supplierId, status, adminNotes = "") => {
  let userThatWasUpdated = null;
  const mapUser = (u) => {
    if (u.id === supplierId && u.role === 'supplier') {
      userThatWasUpdated = { 
        ...u, 
        verificationStatus: status, 
        adminVerificationNotes: adminNotes,
        accountStatus: status === 'rejected' ? 'blocked' : (status === 'verified' ? 'active' : u.accountStatus) 
      };
      return userThatWasUpdated;
    }
    return u;
  };
  return { mapUser, updatedUser: userThatWasUpdated };
};

export const deleteUserAction = (userId) => {
  if (userId === 'admin001') {
    return { success: false, filterUsers: (u) => u, mapProjects: (p) => p, error: "Admin user cannot be deleted." }; 
  }
  
  const filterUsers = (u) => u.id !== userId;
  const mapProjects = (p) => {
    if (p.customerId === userId) return { ...p, customerId: 'deleted_user', customerNumericId: '0000000', status: 'cancelled' };
    return { ...p, bids: p.bids.filter(b => b.supplierId !== userId) };
  };
  
  return { success: true, filterUsers, mapProjects };
};

export const changePasswordAction = (user, newPassword, currentPassword, isAdminChange = false) => {
  if (!user) {
    return { success: false, updatedUser: null, error: "User not found." };
  }
  if (!isAdminChange && user.password !== currentPassword) {
    return { success: false, updatedUser: user, error: "Current password incorrect." };
  }
  
  const updatedUser = {
    ...user,
    password: newPassword,
  };
  
  return { success: true, updatedUser };
};