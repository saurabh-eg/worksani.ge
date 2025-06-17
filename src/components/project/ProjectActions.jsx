import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Edit3, Trash2, CheckCircle, MessageSquare, Star as StarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { translations } from '@/lib/translations';

const ProjectActions = ({ project, user, onEdit, onDelete, onMarkComplete, onLeaveReview }) => {
  const navigate = useNavigate();
  const { language } = useAuth();
  const t = translations[language];

  if (!user || !project) return null;

  const projectOwner = project.customerId === user.id;
  const awardedSupplier = project.awardedSupplierId === user.id;

  return (
    <div className="my-6 flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-start gap-3">
      {projectOwner && project.status === 'open' && (
        <>
          <Button onClick={onEdit} variant="outline" className="flex-grow sm:flex-none text-purple-600 border-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:border-purple-500 dark:hover:bg-purple-700/30">
            <Edit3 size={16} className="mr-2" /> {t.projectDetailPage.editProjectButton}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" className="flex-grow sm:flex-none">
                <Trash2 size={16} className="mr-2" /> {t.projectDetailPage.deleteProjectButton}
              </Button>
            </DialogTrigger>
            <DialogContent className="space-y-4">
              <DialogHeader>
                <DialogTitle>{t.projectDetailPage.confirmDeleteTitle}</DialogTitle>
                <DialogDescription>{t.projectDetailPage.confirmDeleteDesc}</DialogDescription>
              </DialogHeader>
              <DialogFooter className="space-x-2">
                <DialogClose asChild><Button variant="outline">{t.common.no || 'No'}</Button></DialogClose>
                <Button variant="destructive" onClick={onDelete}>{t.common.yes || 'Yes'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
      {projectOwner && project.status === 'awarded' && (
        <Button onClick={onMarkComplete} className="bg-green-500 hover:bg-green-600 text-white flex-grow sm:flex-none">
          <CheckCircle size={16} className="mr-2" /> {t.projectDetailPage.markCompleteCustomerButton}
        </Button>
      )}
      {awardedSupplier && project.status === 'awarded' && (
         <Button onClick={onMarkComplete} className="bg-green-500 hover:bg-green-600 text-white flex-grow sm:flex-none">
            <CheckCircle size={16} className="mr-2" /> {t.projectDetailPage.markCompleteSupplierButton}
         </Button>
      )}
      {projectOwner && project.status === 'Completed' && !project.review && project.awardedSupplierId && (
        <Button onClick={onLeaveReview} className="bg-yellow-500 hover:bg-yellow-600 text-white flex-grow sm:flex-none">
          <StarIcon size={16} className="mr-2" /> {t.projectDetailPage.leaveReviewButton}
        </Button>
      )}
      {user.role === 'supplier' && project.status === 'open' && !project.bids?.find(b => b.supplierId === user.id) && project.customerId !== user.id && (
        <Button onClick={() => navigate(`/projects/${project.id}#bid-form`)} className="bg-green-500 hover:bg-green-600 text-white flex-grow sm:flex-none">
          {t.projectDetailPage.placeBidButton}
        </Button>
      )}
      {user.role !== 'customer' && project.customerId !== user.id && (project.status === 'open' || project.status === 'awarded') && (
        <Button
          variant="outline"
          className="text-purple-600 border-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:border-purple-500 dark:hover:bg-purple-700/30 flex-grow sm:flex-none"
          onClick={() => navigate('/messages', { state: { prefillChatWith: project.customerId, prefillSubject: `${t.messagesPage.projectSubjectPrefix} ${project.title}` } })}
        >
          <MessageSquare size={16} className="mr-2" /> {t.projectDetailPage.contactCustomerButton}
        </Button>
      )}
    </div>
  );
};

export default ProjectActions;