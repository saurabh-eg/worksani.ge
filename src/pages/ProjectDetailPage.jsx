
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShieldAlert, Loader2 } from 'lucide-react';

import ProjectInfoCard from '@/components/project/ProjectInfoCard';
import ProjectBidsSection from '@/components/project/ProjectBidsSection';
import ProjectActions from '@/components/project/ProjectActions';
import ProjectReviewForm from '@/components/project/ProjectReviewForm';
import ProjectEditForm from '@/components/project/ProjectEditForm';
import { translations } from '@/lib/translations';

const ProjectDetailPage = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user, language } = useAuth();
  const { 
    getProjectById, 
    addBid, 
    updateProject, 
    deleteProject, 
    addReview, 
    acceptBid,
    users,
    getUserById,
    projects,  // added projects here
  } = useData();
  const { toast } = useToast();
  const t = translations[language] || translations.en;

  const [project, setProject] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProjectData, setEditedProjectData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const fetchProject = useCallback(() => {
    setIsLoading(true);
    const foundProject = getProjectById(projectId);
    if (foundProject) {
      setProject(foundProject);
      setEditedProjectData({ ...foundProject });
      
      const customer = getUserById(foundProject.customerId);
      let pageTitle = `${foundProject.title} | ${t.common.projectDetailTitleDefault || "Project Details | WorkSani"}`;
      let pageDescription = `${t.common.projectDetailMetaDescriptionPrefix || "View details for project:"} ${foundProject.title}. ${t.common.categoryLabel}: ${foundProject.category}. ${t.common.postedByLabel}: ${customer?.name || t.common.unknownUser}. ${t.common.projectDetailMetaDescriptionSuffix || "Find more on WorkSani."}`;
      let pageKeywords = `${foundProject.title}, ${foundProject.category}, ${customer?.name || ''}, ${t.common.projectDetailKeywordsDefault || "project details georgia, home service project tbilisi, bid on project, project requirements worksani"}`;
      
      document.title = pageTitle;
      let metaDescTag = document.querySelector('meta[name="description"]');
      if (metaDescTag) metaDescTag.setAttribute('content', pageDescription);
      
      let metaKeywordsTag = document.querySelector('meta[name="keywords"]');
      if (metaKeywordsTag) metaKeywordsTag.setAttribute('content', pageKeywords);


    } else {
      toast({ title: t.common.error, description: t.projectDetailPage.notFound, variant: "destructive" });
      navigate('/projects');
    }
    setIsLoading(false);
  }, [projectId, getProjectById, navigate, toast, language, t, getUserById]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);


  const handleBidSubmit = async (bidData) => {
    try {
      await addBid(project.id, bidData);
      toast({ title: t.projectBidsSection.bidPlacedToast, description: t.projectBidsSection.bidPlacedDesc.replace('{amount}', bidData.amount) });
      fetchProject(); 
    } catch (error) {
      toast({ title: t.projectBidsSection.bidErrorToast, description: error.message, variant: "destructive" });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      updateProject(project.id, editedProjectData); 
      toast({ title: t.projectEditForm.projectUpdatedToast || "Changes Saved", description: t.projectEditForm.projectUpdatedDesc || "Your changes have been saved successfully." });
      setIsEditing(false);
      fetchProject(); 
    } catch (error) {
      toast({ title: t.projectEditForm.updateErrorToast || "Update Failed", description: t.projectEditForm.updateErrorDesc || "Failed to save changes.", variant: "destructive" });
    }
  };

  // Update project state after adding a new project
  useEffect(() => {
    if (projects.length > 0 && project && !project.id) {
      const updatedProject = projects.find(p => p.id === projectId);
      if (updatedProject) {
        setProject(updatedProject);
        setEditedProjectData({ ...updatedProject });
      }
    }
  }, [projects, project, projectId]);

  const handleDelete = async () => {
    try {
      console.log('handleDelete called for project id:', project.id);
      const success = await deleteProject(project.id);
      console.log('deleteProject returned:', success);
      if (success) {
        // Pass state to indicate deletion success
        navigate('/projects', { state: { projectDeleted: true } });
      } else {
        toast({ title: t.projectDetailPage.deleteErrorToast || "Delete Failed", description: t.projectDetailPage.deleteErrorDesc || "Failed to delete the project.", variant: "destructive" });
      }
    } catch (error) {
      console.error('handleDelete error:', error);
      toast({ title: t.projectDetailPage.deleteErrorToast || "Delete Failed", description: t.projectDetailPage.deleteErrorDesc || "Failed to delete the project.", variant: "destructive" });
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      await addReview({ 
        ...reviewData, 
        projectId: project.id, 
        supplierId: project.awardedSupplierId, 
        customerId: user.id, 
        customerName: user.name 
      });
      toast({ title: t.projectReviewForm.reviewSubmittedToast, description: t.projectReviewForm.reviewSubmittedDesc });
      setShowReviewForm(false);
      fetchProject(); 
    } catch (error) {
      toast({ title: t.projectReviewForm.errorSubmittingReviewToast, description: t.projectReviewForm.errorSubmittingReviewDesc, variant: "destructive" });
    }
  };

  const handleAcceptBid = async (bidId) => {
    try {
      await acceptBid(project.id, bidId);
      toast({ title: t.projectBidsSection.bidAcceptedToast, description: t.projectBidsSection.bidAcceptedProjectDesc });
      fetchProject(); 
    } catch (error) {
      toast({ title: t.projectBidsSection.acceptBidErrorToast, description: error.message, variant: "destructive" });
    }
  };
  
  const handleMarkAsComplete = async () => {
    try {
      updateProject(project.id, { ...project, status: 'Completed' });
      toast({ title: t.projectDetailPage.projectCompletedToast, description: t.projectDetailPage.projectCompletedDesc });
      fetchProject();
    } catch (error) {
      toast({ title: t.common.error, description: t.projectDetailPage.markCompleteError, variant: "destructive" });
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen dark:bg-slate-900">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-16 w-16 text-purple-600 dark:text-purple-400 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    // Suppress "Project not found" toast if redirected after deletion
    React.useEffect(() => {
      if (!(window.history.state && window.history.state.usr && window.history.state.usr.projectDeleted)) {
        toast({ title: t.projectDetailPage.notFoundTitle || "Project Deleted or Not Found", description: t.projectDetailPage.notFoundDesc || "The project has been deleted or does not exist.", variant: "destructive" });
      }
    }, []);
    return (
      <div className="flex flex-col min-h-screen dark:bg-slate-900">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <ShieldAlert size={48} className="mx-auto text-red-500 dark:text-red-400 mb-4" />
          <h1 className="text-2xl font-semibold dark:text-white">{t.projectDetailPage.notFoundTitle || "Project Deleted or Not Found"}</h1>
          <p className="text-gray-600 dark:text-gray-300">{t.projectDetailPage.notFoundDesc || "The project has been deleted or does not exist."}</p>
          <Button onClick={() => navigate('/projects')} className="mt-4 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600">{t.common.back || "Back"} to Projects</Button>
        </main>
        <Footer />
      </div>
    );
  }
  
  const projectOwner = user && project.user_id === user.id;
  const awardedSupplierUser = project.awardedSupplierId ? users.find(u => u.id === project.awardedSupplierId) : null;
  const customerUser = users.find(u => u.id === project.user_id);


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-slate-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-gray-900">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Button variant="outline" onClick={() => navigate(-1)} className="mb-6 text-purple-600 border-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:border-purple-600 dark:hover:bg-purple-700/30">
            <ArrowLeft size={18} className="mr-2" /> {t.common.back}
          </Button>

          <ProjectInfoCard project={project} customer={customerUser} />

          <ProjectActions
            project={project}
            user={user}
            onEdit={() => setIsEditing(true)}
            onDelete={handleDelete}
            onMarkComplete={handleMarkAsComplete}
            onLeaveReview={() => setShowReviewForm(true)}
          />

          {isEditing && projectOwner && editedProjectData && (
            <ProjectEditForm
              editedProject={editedProjectData}
              setEditedProject={setEditedProjectData}
              onEditSubmit={handleEditSubmit}
              onCancelEdit={() => setIsEditing(false)}
            />
          )}

          <ProjectBidsSection
            project={project}
            user={user}
            users={users}
            onBidSubmit={handleBidSubmit}
            onAcceptBid={handleAcceptBid}
          />
          
          <AnimatePresence>
            {showReviewForm && project.status === 'Completed' && projectOwner && !project.review && awardedSupplierUser && (
              <ProjectReviewForm 
                supplierName={awardedSupplierUser?.companyName || awardedSupplierUser?.name || t.projectReviewForm.defaultSupplierName}
                onSubmitReview={handleReviewSubmit} 
                onCancelReview={() => setShowReviewForm(false)}
              />
            )}
          </AnimatePresence>

          {project.status === 'Completed' && project.review && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 p-4 bg-green-100 dark:bg-green-700/30 rounded-lg text-green-700 dark:text-green-300">
                {t.projectDetailPage.reviewSubmittedMessage}
            </motion.div>
          )}

        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDetailPage;