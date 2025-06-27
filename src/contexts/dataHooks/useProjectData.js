import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { initialProjects } from '@/lib/initialData';
import { addProjectAction, addBidAction, acceptBidAction, addReviewAction } from '@/contexts/dataActions/projectActions';
import { translations } from '@/lib/translations';
import { supabase } from '@/lib/supabaseClient';


export const useProjectData = (
    initialData = initialProjects, 
  usersData,
  siteSettings,
  addNotificationFunc,
  deductProjectFeeFunc,
  deductBidFeeFunc,
  updateUserFuncForReview,
  updateUserContextProfileFunc
) => {
  const [projects, setProjects] = useState(() => {
    const localData = localStorage.getItem('projects_worksani');
    return localData ? JSON.parse(localData) : initialData;
  });

  // Fetch projects from Supabase on mount
  useEffect(() => {
  const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            bids: bids (
              id,
              project_id,
              bidder_id,
              amount,
              created_at,
              supplier_name,
              supplier_profile_photo_url,
              message,
              supplier_numeric_id
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching projects from Supabase:', error);
          toast({ title: "Error", description: error.message || "Failed to fetch projects.", variant: "destructive" });
          return;
        }

        if (data) {
          // Map created_at to postedDate for frontend consistency
          const mappedData = data.map(project => ({
            ...project,
            postedDate: project.created_at,
            customerId: project.user_id,  // map user_id to customerId for UI compatibility
            customerNumericId: project.customer_numeric_id,
            awardedSupplierId: project.awarded_supplier_id,
            awardedBidId: project.awarded_bid_id,
            awardedAmount: project.awarded_amount,
            // Map bids fields to camelCase and supplierId
            bids: (project.bids || []).map(bid => ({
              id: bid.id,
              projectId: bid.project_id,
              supplierId: bid.bidder_id, // <--- use bidder_id as supplierId
              amount: bid.amount,
              date: bid.created_at,
              supplierName: bid.supplier_name,
              supplierProfilePhoto: bid.supplier_profile_photo_url,
              message: bid.message,
              supplierNumericId: bid.supplier_numeric_id,
            })),
          }));
          setProjects(mappedData);
          localStorage.setItem('projects_worksani', JSON.stringify(mappedData));
        }
      } catch (err) {
        console.error('Unexpected error fetching projects:', err);
        toast({ title: "Error", description: err.message || "Unexpected error fetching projects.", variant: "destructive" });
      }
    };

    fetchProjects();
  }, []);

  const { user: currentUser, language } = useAuth();
  const { toast } = useToast();
  const t = translations[language] || translations.en;

  useEffect(() => {
    localStorage.setItem('projects_worksani', JSON.stringify(projects));
  }, [projects]);

  const addProject = useCallback(async (projectData) => {
    if (!currentUser || currentUser.role !== 'customer') {
      toast({ title: "Error", description: "You must be logged in as a customer to post a project.", variant: "destructive" });
      throw new Error("User not logged in or not a customer");
    }

    const projectFee = parseFloat(siteSettings?.projectPostingFee || 0);
    
    if (projectFee > 0) {
      const feeDeductionSuccessful = deductProjectFeeFunc(currentUser.id, projectFee, projectData.title);
      if (!feeDeductionSuccessful) {
        throw new Error("Fee deduction failed. Project not posted.");
      }
    }
    
    let newProject = await addProjectAction(projectData, currentUser, siteSettings, toast);
    // Map user_id to customerId for UI compatibility
    newProject = {
      ...newProject,
      customerId: newProject.user_id,
    };
    setProjects(prevProjects => [newProject, ...prevProjects]);
    return newProject;
  }, [currentUser, siteSettings, deductProjectFeeFunc, toast]);

  const updateProject = useCallback(async (projectId, updatedProjectData) => {
    try {
      // Map camelCase keys to snake_case for Supabase update
      const mappedData = {
        ...updatedProjectData,
        user_id: updatedProjectData.userId || updatedProjectData.user_id,
        title: updatedProjectData.title,
        description: updatedProjectData.description,
        budget: updatedProjectData.budget,
        created_at: undefined,
        customer_id: updatedProjectData.customerId || updatedProjectData.user_id,
        customer_numeric_id: updatedProjectData.customerNumericId,
        category: updatedProjectData.category,
        location: updatedProjectData.location,
        photos: updatedProjectData.photos,
        status: updatedProjectData.status,
        payment_status: updatedProjectData.paymentStatus,
        awarded_supplier_id: updatedProjectData.awardedSupplierId,
        awarded_bid_id: updatedProjectData.awardedBidId,
        awarded_amount: updatedProjectData.awardedAmount,
        userId: undefined,
        awardedSupplierId: undefined,
        awardedBidId: undefined,
        awardedAmount: undefined,
        customerId: undefined,
        customerNumericId: undefined,
        paymentStatus: undefined,
        bids: undefined,
        postedDate: undefined,
        id: undefined,
      };

      // Remove undefined keys
      Object.keys(mappedData).forEach(key => mappedData[key] === undefined && delete mappedData[key]);

      // Update project in Supabase
      const { data, error } = await supabase
        .from('projects')
        .update(mappedData)
        .eq('id', projectId)
        .select()
        .single();

      if (error) {
        console.error('Error updating project in Supabase:', error);
        toast({ title: "Error", description: error.message || "Failed to update project.", variant: "destructive" });
        return null;
      }

      // Update local state with updated project data
      setProjects(prevProjects =>
        prevProjects.map(p => (p.id === projectId ? { ...p, ...data } : p))
      );

      return data;
    } catch (err) {
      console.error('Unexpected error updating project:', err);
      toast({ title: "Error", description: err.message || "Unexpected error updating project.", variant: "destructive" });
      return null;
    }
  }, [toast]);

  const deleteProjectData = useCallback(async (projectId) => {
    try {
      if (!currentUser) {
        toast({ title: "Error", description: "You must be logged in to delete a project.", variant: "destructive" });
        return false;
      }

      // Fetch the project to verify ownership
      const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('user_id, customer_id')
        .eq('id', projectId)
        .single();

      if (fetchError) {
        toast({ title: "Error", description: fetchError.message || "Failed to fetch project.", variant: "destructive" });
        return false;
      }

      // Fix: Check both user_id and customer_id for ownership
      if (project.user_id !== currentUser.id && project.customer_id !== currentUser.id) {
        toast({ title: "Error", description: "You are not authorized to delete this project.", variant: "destructive" });
        return false;
      }
      // New: Delete associated bids
      await supabase.from('bids').delete().eq('project_id', projectId);

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        toast({ title: "Error", description: error.message || "Failed to delete project.", variant: "destructive" });
        return false;
      }


      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
      toast({ title: "Project Deleted", description: "The project has been removed.", variant: "destructive" });
      return true;
    } catch (err) {
      toast({ title: "Error", description: err.message || "Unexpected error deleting project.", variant: "destructive" });
      return false;
    }
  }, [toast, currentUser]);

  const addBid = useCallback(async (projectId, bidData) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) {
        toast({ title: "Error", description: "Project not found.", variant: "destructive" });
        return null;
    }

    const bidFee = parseFloat(siteSettings?.bidFee || '0');
    if (bidFee > 0) {
        const feeDeductionSuccessful = await deductBidFeeFunc(currentUser.id, bidFee, `Bid for project: ${projectId}`);
        if (!feeDeductionSuccessful) {
            throw new Error("Bid fee deduction failed. Bid not placed.");
        }
    }

    // Refresh currentUser data from usersData after deduction
    const updatedUser = usersData.find(u => u.id === currentUser.id) || currentUser;

    const { newBid } = await addBidAction(projectId, bidData, updatedUser, siteSettings, toast);
    if (newBid) {
        // Convert snake_case keys from DB to camelCase for frontend usage
        const formattedBid = {
          id: newBid.id,
          projectId: newBid.project_id,
          supplierId: newBid.bidder_id, // <--- use bidder_id as supplierId
          amount: newBid.amount,
          date: newBid.created_at,
          supplierName: newBid.supplier_name,
          supplierProfilePhoto: newBid.supplier_profile_photo_url,
          message: newBid.message,
          supplierNumericId: newBid.supplier_numeric_id,
        };
        setProjects(prevProjects =>
          prevProjects.map(p =>
            p.id === projectId ? { ...p, bids: [...(p.bids || []), formattedBid] } : p
          )
        );
        
        if (project.customerId && addNotificationFunc) {
        addNotificationFunc({
            userId: project.customerId,
            type: 'new_bid',
            message: (t.common?.notifications?.newBidDesc || "New bid from {supplierName} of ₾{bidAmount} on '{projectTitle}'.")
                .replace('{supplierName}', formattedBid.supplierName || updatedUser.name)
                .replace('{bidAmount}', parseFloat(bidData.amount).toFixed(2))
                .replace('{projectTitle}', project.title),
            relatedEntityId: project.id,
            link: `/projects/${project.id}`
        });
        }
    }
    return newBid;
  }, [currentUser, siteSettings, deductBidFeeFunc, toast, projects, addNotificationFunc, t, language, usersData]);

  const acceptBid = useCallback(async (projectId, bidId) => {
    const projectToUpdate = projects.find(p => p.id === projectId);
    const updatedProject = await acceptBidAction(projectToUpdate, bidId, currentUser, toast);
    updateProject(projectId, updatedProject);

    if (updatedProject && updatedProject.awardedSupplierId && usersData && addNotificationFunc) {
      const supplier = usersData.find(u => u.id === updatedProject.awardedSupplierId);
      const customer = usersData.find(u => u.id === updatedProject.customerId);

      if (supplier && customer) {
        addNotificationFunc({
          userId: supplier.id,
          type: 'bid_accepted',
          message: (t.common?.notifications?.bidAcceptedCustomerDesc || "Bid accepted for '{projectTitle}' by {customerName} ({customerPhone}).")
            .replace('{projectTitle}', updatedProject.title)
            .replace('{customerName}', customer.name)
            .replace('{customerPhone}', customer.phone || 'N/A'),
          relatedEntityId: projectToUpdate.id,
          link: `/projects/${projectToUpdate.id}`
        });
        addNotificationFunc({
          userId: customer.id,
          type: 'bid_accepted',
          message: (t.common?.notifications?.bidAcceptedSupplierDesc || "You awarded '{projectTitle}' to {supplierName} ({supplierPhone}).")
            .replace('{projectTitle}', updatedProject.title)
            .replace('{supplierName}', supplier.name)
            .replace('{supplierPhone}', supplier.phone || 'N/A'),
          relatedEntityId: projectToUpdate.id,
          link: `/projects/${projectToUpdate.id}`
        });
      }
    }
    return updatedProject;
  }, [currentUser, projects, updateProject, toast, usersData, addNotificationFunc, t, language]);

  const addReview = useCallback(async (reviewData) => {
    const project = projects.find(p => p.id === reviewData.projectId);
    if (!project) {
      toast({ title: "Error", description: "Project not found for review.", variant: "destructive" });
      return;
    }
    const newReview = await addReviewAction(reviewData, currentUser, project, toast);
    
    setProjects(prevProjects => prevProjects.map(p => {
        if (p.id === reviewData.projectId) {
            return { ...p, review: newReview, status: 'Completed' };
        }
        return p;
    }));

    if (updateUserFuncForReview && usersData) {
      const supplierToUpdate = usersData.find(u => u.id === newReview.supplierId);
      if (supplierToUpdate) {
        const updatedSupplierReviews = [...(supplierToUpdate.reviews || []), newReview];
        updateUserFuncForReview(newReview.supplierId, { reviews: updatedSupplierReviews }); 
      }
    }
  }, [currentUser, projects, toast, updateUserFuncForReview, usersData]);

  const deleteReviewByProjectId = useCallback((projectId) => {
    setProjects(prevProjects => 
      prevProjects.map(p => {
        if (p.id === projectId) {
          const supplierId = p.awardedSupplierId;
          if (supplierId && updateUserFuncForReview && usersData) {
            const supplierToUpdate = usersData.find(u => u.id === supplierId);
            if (supplierToUpdate && supplierToUpdate.reviews) {
              const updatedReviews = supplierToUpdate.reviews.filter(rev => rev.projectId !== projectId);
              updateUserFuncForReview(supplierId, { reviews: updatedReviews });
            }
          }
          return { ...p, review: null };
        }
        return p;
      })
    );
  }, [usersData, updateUserFuncForReview]);


  const getProjectById = useCallback((projectId) => projects.find(p => p.id === projectId), [projects]);
  const getSupplierProjects = useCallback((supplierId) => projects.filter(p => p.bids?.some(b => b.supplierId === supplierId) || p.awardedSupplierId === supplierId), [projects]);
  const getCustomerProjects = useCallback((userId) => projects.filter(p => p.user_id === userId), [projects]);
  
  const mapProjectsForDeletedUser = useCallback((deletedUserId) => {
    setProjects(prevProjects => prevProjects.map(p => {
        if (p.customerId === deletedUserId) return { ...p, customerId: 'deleted_user', customerNumericId: '0000000', status: 'cancelled' };
        let updatedBids = p.bids ? p.bids.filter(b => b.supplierId !== deletedUserId) : [];
        let awardedSupplierId = p.awardedSupplierId;
        let awardedBidId = p.awardedBidId;
        let awardedAmount = p.awardedAmount;
        if (p.awardedSupplierId === deletedUserId) {
            awardedSupplierId = null;
            awardedBidId = null;
            awardedAmount = null;
        }
        return { ...p, bids: updatedBids, awardedSupplierId, awardedBidId, awardedAmount };
    }));
  }, []);

  return {
    projects,
    setProjects,
    addProject,
    updateProject,
    deleteProjectData,
    addBid,
    acceptBid,
    addReview,
    deleteReviewByProjectId,
    getProjectById,
    getSupplierProjects,
    getCustomerProjects,
    mapProjectsForDeletedUser,
  };
};