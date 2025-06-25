import { v4 as uuidv4 } from 'uuid';

import { supabase } from '@/lib/supabaseClient';

export const addProjectAction = async (projectData, currentUser, siteSettings, toastFunc) => {
  if (!currentUser || currentUser.role !== 'customer') {
    toastFunc({ title: "Error", description: "You must be logged in as a customer to post a project.", variant: "destructive" });
    return Promise.reject(new Error("User not logged in or not a customer"));
  }

  const projectFee = parseFloat(siteSettings?.projectPostingFee || 0);
  const currentWalletBalance = parseFloat(currentUser.wallet_balance || 0);

  if (projectFee > 0 && currentWalletBalance < projectFee) {
    toastFunc({ title: "Insufficient Balance", description: `Your wallet balance (₾${currentWalletBalance.toFixed(2)}) is too low. Project fee: ₾${projectFee.toFixed(2)}. This check is a final safeguard.`, variant: "destructive", duration: 7000 });
    return Promise.reject(new Error("Insufficient balance (final check)"));
  }

  const newProject = {
    id: uuidv4(),
    ...projectData,
    user_id: currentUser.id,
    customer_id: currentUser.id,
    customer_numeric_id: currentUser.numericId,
    created_at: new Date().toISOString(),
    status: 'open',
    payment_status: projectFee > 0 ? 'paid' : 'not_applicable',
    // Remove bids field as it does not exist in DB schema
    // bids: [],
    awarded_supplier_id: null,
    awarded_bid_id: null,
    awarded_amount: null,
    review_id: null,
  };

  const { data, error } = await supabase
    .from('projects')
    .insert([newProject])
    .select()
    .single();

  if (error) {
    toastFunc({ title: "Error", description: "Failed to post project.", variant: "destructive" });
    return Promise.reject(error);
  }

  toastFunc({ title: "Project Posted!", description: `Your project "${data.title}" is now live. ${projectFee > 0 ? `Fee of ₾${projectFee.toFixed(2)} was processed.` : ''}`, variant: "default" });
  return data;
};

export const addBidAction = async (projectId, bidData, currentUser, siteSettings, toastFunc) => {
  if (!currentUser || currentUser.role !== 'supplier') {
    toastFunc({ title: "Error", description: "Only suppliers can place bids.", variant: "destructive" });
    return Promise.reject(new Error("Only suppliers can place bids."));
  }
  if (currentUser.verification_status !== 'verified') {
    toastFunc({ title: "Account Not Verified", description: "Your supplier account must be verified to place bids.", variant: "destructive" });
    return Promise.reject(new Error("Account not verified"));
  }
  if (currentUser.accountStatus === 'blocked') {
    toastFunc({ title: "Account Blocked", description: "Your account is blocked. You cannot place bids.", variant: "destructive" });
    return Promise.reject(new Error("Account blocked"));
  }

  const bidFee = parseFloat(siteSettings?.bidFee || '0');
  const currentBalance = parseFloat(currentUser.bid_balance || 0);

  if (bidFee > 0 && currentBalance < bidFee) {
    toastFunc({ title: "Insufficient Bid Balance", description: `You need at least ₾${bidFee.toFixed(2)}. Current: ₾${currentBalance.toFixed(2)}. This is a final check.`, variant: "destructive" });
    return Promise.reject(new Error("Insufficient bid balance (final check)"));
  }

  const newBid = {
    id: uuidv4(),
    project_id: projectId,
    bidder_id: currentUser.id,
    amount: bidData.amount,
    created_at: new Date().toISOString(),
    supplier_name: currentUser.companyName || currentUser.name,
    supplier_profile_photo_url: currentUser.profilePhoto || null,
    message: bidData.message || '',
    supplier_numeric_id: currentUser.numericId,
  };

  const { data, error } = await supabase
    .from('bids')
    .insert([newBid])
    .select()
    .single();

  if (error) {
    toastFunc({ title: "Error", description: "Failed to place bid.", variant: "destructive" });
    return Promise.reject(error);
  }

  toastFunc({ title: "Bid Placed!", description: bidFee > 0 ? `Bid fee of ₾${bidFee.toFixed(2)} was processed.` : undefined, variant: "default" });
  return { newBid: data };
};

export const acceptBidAction = async (project, bidId, currentUser, toastFunc) => {
  if (!currentUser || currentUser.role !== 'customer') {
    toastFunc({ title: "Error", description: "Only customers can accept bids.", variant: "destructive" });
    return Promise.reject(new Error("Only customers can accept bids."));
  }
  if (!project) {
    toastFunc({ title: "Error", description: "Project not found.", variant: "destructive" });
    return Promise.reject(new Error("Project not found."));
  }
  if (project.customerId !== currentUser.id) {
    toastFunc({ title: "Error", description: "You are not the owner of this project.", variant: "destructive" });
    return Promise.reject(new Error("Not project owner."));
  }

  const bidToAccept = project.bids.find(b => b.id === bidId);
  if (!bidToAccept) {
    toastFunc({ title: "Error", description: "Bid not found.", variant: "destructive" });
    return Promise.reject(new Error("Bid not found."));
  }

  // --- NEW: Update Supabase ---
  const { data, error } = await supabase
    .from('projects')
    .update({
      status: 'awarded',
      awarded_supplier_id: bidToAccept.supplierId,
      awarded_bid_id: bidId,
      awarded_amount: bidToAccept.amount,
    })
    .eq('id', project.id)
    .select()
    .single();

  if (error) {
    toastFunc({ title: "Error", description: error.message, variant: "destructive" });
    return Promise.reject(error);
  }

  // --- Return the updated project (snake_case and camelCase for frontend) ---
  const updatedProject = {
    ...project,
    ...data,
    status: 'awarded',
    awardedSupplierId: data.awarded_supplier_id,
    awardedBidId: data.awarded_bid_id,
    awardedAmount: data.awarded_amount,
    awarded_supplier_id: data.awarded_supplier_id,
    awarded_bid_id: data.awarded_bid_id,
    awarded_amount: data.awarded_amount,
  };

  toastFunc({ title: "Bid Accepted!", description: `Project "${project.title}" is now Awarded and In Progress.`, variant: "default" });
  return Promise.resolve(updatedProject);
};

export const addReviewAction = (reviewData, currentUser, project, toastFunc) => {
  if (!currentUser || currentUser.role !== 'customer') {
    toastFunc({ title: "Error", description: "Only customers can leave reviews.", variant: "destructive" });
    return Promise.reject(new Error("Only customers can leave reviews."));
  }
  if (!project || !project.awardedSupplierId) {
    toastFunc({ title: "Error", description: "Cannot review project without an assigned supplier.", variant: "destructive" });
    return Promise.reject(new Error("Cannot review project without an assigned supplier."));
  }
  if (project.customerId !== currentUser.id) {
    toastFunc({ title: "Error", description: "You can only review projects you posted.", variant: "destructive" });
    return Promise.reject(new Error("Not project owner."));
  }
  if (project.status !== 'Completed') {
    toastFunc({ title: "Error", description: "Project must be completed to leave a review.", variant: "destructive" });
    return Promise.reject(new Error("Project not completed."));
  }

  const newReview = {
    id: uuidv4(),
    reviewerId: currentUser.id,
    reviewerNumericId: currentUser.numericId,
    reviewerName: currentUser.name,
    projectId: project.id,
    supplierId: project.awardedSupplierId,
    ratings: reviewData.ratings,
    comment: reviewData.comment,
    date: new Date().toISOString(),
    status: 'pending', 
  };
  toastFunc({ title: "Review Submitted!", description: "Thank you for your feedback. It will be reviewed by an admin.", variant: "default" });
  return Promise.resolve(newReview);
};