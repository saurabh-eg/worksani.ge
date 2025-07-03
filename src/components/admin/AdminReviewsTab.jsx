import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Edit, Trash2, Search, Star as StarIcon, UserCircle, Briefcase, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { translations } from '@/lib/translations';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabaseClient';

const AdminReviewsTab = ({ projects, users, onUpdateProject, onDeleteReview }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingReviewData, setEditingReviewData] = useState(null);
  const [localReviews, setLocalReviews] = useState([]);
  const [updateInProgress, setUpdateInProgress] = useState(false); // NEW: flag for optimistic update
  const updateTimeoutRef = useRef(null); // NEW: ref for timeout
  const { toast } = useToast();
  const { language } = useAuth();
  const t = translations[language].adminPage.reviewsTab || {};
  const commonT = translations[language].common || {};

  React.useEffect(() => {
    if (!updateInProgress) { // Only sync if not updating
      const mappedReviews = projects
        .filter(p => p.review)
        .map(p => ({
          ...p.review,
          projectTitle: p.title,
          projectId: p.id,
          supplierName: users.find(u => u.id === p.review.supplierId)?.name || 'Unknown Supplier',
          customerName: users.find(u => u.id === p.review.reviewerId)?.name || 'Unknown Customer',
          status: p.review.status || 'pending'
        }));
      setLocalReviews(mappedReviews);
    }
  }, [projects, users, commonT, updateInProgress]);

  const reviews = localReviews.length > 0 ? localReviews : [];

  const filteredReviews = reviews.filter(review =>
    (review.projectTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (review.supplierName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (review.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (review.comment?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (review.status?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleReviewDelete = async (projectId, reviewId) => {
    const reviewToDelete = reviews.find(r => r.projectId === projectId && r.id === reviewId);
    if (!reviewToDelete) return;
    if (!window.confirm(t.confirmDeleteReview || "Are you sure you want to delete this review?")) return;

    // 1. Delete review from Supabase
    const { error: reviewDeleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewToDelete.id);

    if (reviewDeleteError) {
      toast({ title: "Error", description: reviewDeleteError.message || "Failed to delete review.", variant: "destructive" });
      return;
    }

    // 2. Update project in Supabase to remove review_id
    const { error: projectUpdateError } = await supabase
      .from('projects')
      .update({ review_id: null })
      .eq('id', projectId);

    if (projectUpdateError) {
      toast({ title: "Error", description: projectUpdateError.message || "Failed to update project after review deletion.", variant: "destructive" });
      return;
    }

    // 3. Update local state/UI
    onDeleteReview(projectId, reviewId);
    toast({ title: t.reviewDeletedTitle || "Review Deleted", description: t.reviewDeletedDesc || "The review has been removed." });
  };

  const handleReviewEdit = (review) => {
    setEditingReviewData({
      ...review,
      projectId: review.projectId
    });
  };

  const handleReviewSave = async () => {
    if (!editingReviewData) return;

    const projectToUpdate = projects.find(p => p.id === editingReviewData.projectId);
    if (projectToUpdate) {
      // Update review in the reviews table
      const { error } = await supabase
        .from('reviews')
        .update({
          comment: editingReviewData.comment,
          rating_overall: editingReviewData.ratings.overall,
          rating_professionalism: editingReviewData.ratings.professionalism,
          rating_quality: editingReviewData.ratings.quality,
          rating_cleanliness: editingReviewData.ratings.cleanliness,
          rating_timeliness: editingReviewData.ratings.timeliness,
          status: editingReviewData.status || projectToUpdate.review.status || 'pending',
        })
        .eq('id', editingReviewData.id);

      if (error) {
        toast({ title: "Error", description: error.message || "Failed to update review.", variant: "destructive" });
        return;
      }

      // Update local state/UI
      const updatedReviewData = {
        ...projectToUpdate.review,
        comment: editingReviewData.comment,
        ratings: { ...editingReviewData.ratings },
        date: new Date().toISOString(),
        status: editingReviewData.status || projectToUpdate.review.status || 'pending'
      };

      const updatedProject = {
        ...projectToUpdate,
        review: updatedReviewData,
        userId: projectToUpdate.user_id || projectToUpdate.userId,
        customerId: projectToUpdate.customer_id || projectToUpdate.customerId,
        customerNumericId: projectToUpdate.customer_numeric_id || projectToUpdate.customerNumericId,
        awardedSupplierId: projectToUpdate.awarded_supplier_id || projectToUpdate.awardedSupplierId,
        awardedBidId: projectToUpdate.awarded_bid_id || projectToUpdate.awardedBidId,
        awardedAmount: projectToUpdate.awarded_amount || projectToUpdate.awardedAmount,
        review_id: projectToUpdate.review_id || (projectToUpdate.review && projectToUpdate.review.id),
        title: projectToUpdate.title,
        description: projectToUpdate.description,
        budget: projectToUpdate.budget,
        category: projectToUpdate.category,
        location: projectToUpdate.location,
        photos: projectToUpdate.photos,
        status: projectToUpdate.status,
        paymentStatus: projectToUpdate.payment_status || projectToUpdate.paymentStatus,
      };
      onUpdateProject(projectToUpdate.id, updatedProject);

      const supplierToUpdate = users.find(u => u.id === projectToUpdate.awardedSupplierId);
      if (supplierToUpdate) {
        const updatedSupplierReviews = (supplierToUpdate.reviews || []).map(rev =>
          rev.id === editingReviewData.id ? updatedReviewData : rev
        );
        onUpdateProject(supplierToUpdate.id, { ...supplierToUpdate, reviews: updatedSupplierReviews });
      }

      toast({ title: t.reviewUpdatedTitle || "Review Updated", description: t.reviewUpdatedDesc || "The review has been successfully updated." });
      setEditingReviewData(null);
    }
  };

  const handleReviewStatusChange = async (projectId, reviewId, newStatus) => {
    const projectToUpdate = projects.find(p => p.id === projectId);
    if (projectToUpdate && projectToUpdate.review && projectToUpdate.review.id === reviewId) {
      setUpdateInProgress(true); // Set flag before update
      // Update review status in the reviews table
      const { error } = await supabase
        .from('reviews')
        .update({ status: newStatus })
        .eq('id', reviewId);

      if (error) {
        toast({ title: "Error", description: error.message || "Failed to update review status.", variant: "destructive" });
        setUpdateInProgress(false); // Reset flag on error
        return;
      }

      // Update local state/UI immediately for instant UI update
      setLocalReviews(prevReviews => prevReviews.map(r =>
        r.id === reviewId ? { ...r, status: newStatus } : r
      ));

      // Update parent project state immediately and optimistically
      const updatedReviewData = { ...projectToUpdate.review, status: newStatus };
      const updatedProject = { ...projectToUpdate, review: updatedReviewData };
      onUpdateProject(projectId, updatedProject, true); // pass 'optimisticOnly' flag

      toast({ title: t.reviewStatusUpdatedTitle || "Review Status Updated", description: `${t.reviewStatusUpdatedDesc || "Review status changed to"} ${newStatus}.` });

      // Clear the update flag after a short delay to allow parent data to sync
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = setTimeout(() => setUpdateInProgress(false), 1500);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-500 text-white"><CheckCircle size={12} className="mr-1" /> {t.statusApproved || "Approved"}</Badge>;
      case 'declined': return <Badge className="bg-red-500 text-white"><XCircle size={12} className="mr-1" /> {t.statusDeclined || "Declined"}</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500 text-black"><AlertCircle size={12} className="mr-1" /> {t.statusPending || "Pending"}</Badge>;
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><StarIcon className="mr-2 text-yellow-500" /> {t.title || "Manage Reviews"} ({filteredReviews.length})</CardTitle>
          <CardDescription>{t.description || "View, edit, approve, or decline customer reviews."}</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t.searchPlaceholder || "Search reviews (project, user, comment, status)..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredReviews.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.projectTitle || "Project"}</TableHead>
                  <TableHead>{t.supplier || "Supplier"}</TableHead>
                  <TableHead>{t.customer || "Customer"}</TableHead>
                  <TableHead>{t.rating || "Overall Rating"}</TableHead>
                  <TableHead>{t.status || "Status"}</TableHead>
                  <TableHead>{t.date || "Date"}</TableHead>
                  <TableHead className="text-right">{t.actions || "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Briefcase size={16} className="mr-2 text-purple-500 opacity-70" />
                        {review.projectTitle}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center">
                        <UserCircle size={16} className="mr-2 text-green-500 opacity-70" />
                        {review.supplierName}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center">
                        <UserCircle size={16} className="mr-2 text-blue-500 opacity-70" />
                        {review.customerName}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center">
                        <span className="mr-1.5 text-sm font-semibold text-yellow-600">
                          {review.ratings.overall.toFixed(1)}
                        </span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                              key={star}
                              size={14}
                              className={
                                star <= review.ratings.overall
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{getStatusBadge(review.status)}</TableCell>

                    <TableCell>{new Date(review.date).toLocaleDateString()}</TableCell>

                    <TableCell className="text-right space-x-1">
                      {review.status !== 'approved' && (
                        <Button variant="outline" size="sm" onClick={() => handleReviewStatusChange(review.projectId, review.id, 'approved')} className="text-green-600 border-green-600 hover:bg-green-50">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {review.status !== 'declined' && (
                        <Button variant="outline" size="sm" onClick={() => handleReviewStatusChange(review.projectId, review.id, 'declined')} className="text-red-600 border-red-600 hover:bg-red-50">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Dialog open={editingReviewData?.id === review.id} onOpenChange={(isOpen) => !isOpen && setEditingReviewData(null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReviewEdit(review)}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>

                        {editingReviewData?.id === review.id && (
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>{t.editReviewTitle || "Edit Review"}</DialogTitle>
                              <DialogDescription>{t.editReviewDesc || "Modify the review details below."}</DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                              <div className="space-y-1">
                                <Label htmlFor="reviewCommentAdmin">{t.commentLabel || "Comment"}</Label>
                                <Textarea
                                  id="reviewCommentAdmin"
                                  value={editingReviewData.comment}
                                  onChange={(e) => setEditingReviewData({ ...editingReviewData, comment: e.target.value })}
                                  rows={3}
                                />
                              </div>

                              {Object.entries(editingReviewData.ratings || {}).map(([key, value]) => (
                                <div key={key} className="grid grid-cols-3 items-center gap-2">
                                  <Label htmlFor={`rating-${key}`} className="text-sm capitalize text-right">
                                    {translations[language].projectReviewForm.ratingCategories[key] || key}
                                  </Label>
                                  <Input
                                    id={`rating-${key}`}
                                    type="number"
                                    min="1"
                                    max="5"
                                    step="0.5"
                                    value={value}
                                    onChange={(e) =>
                                      setEditingReviewData({
                                        ...editingReviewData,
                                        ratings: {
                                          ...editingReviewData.ratings,
                                          [key]: Number(e.target.value),
                                        },
                                      })
                                    }
                                    className="col-span-2 h-8"
                                  />
                                </div>
                              ))}
                            </div>

                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline" onClick={() => setEditingReviewData(null)}>
                                  {commonT.cancel || "Cancel"}
                                </Button>
                              </DialogClose>
                              <Button onClick={handleReviewSave}>{commonT.save || "Save"}</Button>
                            </DialogFooter>
                          </DialogContent>
                        )}
                      </Dialog>

                      <Button variant="destructive" size="sm" onClick={() => handleReviewDelete(review.projectId, review.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <StarIcon size={40} className="mx-auto mb-2 opacity-70" />
              <p>{t.noReviewsFound || "No reviews found matching your criteria."}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminReviewsTab;