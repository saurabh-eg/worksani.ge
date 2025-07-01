import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { Star, Briefcase, UserCircle, MessageSquare, Image as ImageIcon, Languages as LanguagesIcon, ShieldCheck, Clock, XCircle, CheckCircle, Award, Zap, ThumbsUp, CalendarDays, MessageSquareIcon } from 'lucide-react';
import { translations } from '@/lib/translations';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const allLanguages = [
  { id: 'en', label: 'English' },
  { id: 'ka', label: 'ქართული (Georgian)' },
  { id: 'ru', label: 'Русский (Russian)' },
  { id: 'de', label: 'Deutsch (German)' },
  { id: 'fr', label: 'Français (French)' },
];

const SupplierProfilePage = () => {
  const { id } = useParams();
  const { getUserById, getSupplierProjects, projects } = useData();
  const { user, language: currentUILanguage } = useAuth();
  const t = translations[currentUILanguage];
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);

  // Modal state for gallery
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  useEffect(() => {
    if (id && getUserById) {
      const foundSupplier = getUserById(id);
      setSupplier(foundSupplier);
    }
  }, [id, getUserById]);

  // Get all projects where this supplier was awarded
  const supplierProjects = useMemo(() => {
    if (!supplier || !getSupplierProjects) return [];
    // Only include projects where awardedSupplierId matches supplier.id and status is 'Completed'
    return getSupplierProjects(supplier.id)
      .filter((p) => p.awardedSupplierId === supplier.id && p.status === 'Completed')
      .sort((a, b) => new Date(b.created_at || b.postedDate) - new Date(a.created_at || a.postedDate))
      .slice(0, 6); // Only 6 most recent
  }, [supplier, getSupplierProjects]);

  // Count of completed projects
  const completedProjectsCount = supplierProjects.length;

  // Get all reviews for this supplier from completed projects, status approved
  const approvedReviews = useMemo(() => {
    if (!supplier || !projects) return [];
    // Find all reviews from projects where supplier is awarded and review is approved
    return projects
      .filter(
        (p) =>
          p.awardedSupplierId === supplier.id &&
          p.review &&
          (p.review.supplierId === supplier.id || p.review.supplier_id === supplier.id) &&
          (p.review.status === 'approved' || p.review.status === 'Approved')
      )
      .map((p) => {
        const r = p.review;
        return {
          id: r.id,
          reviewerName: r.reviewerName || r.reviewer_name || t.supplierProfilePage.anonymousReviewer,
          date: r.created_at || r.date || p.completedAt || p.completed_at,
          comment: r.comment,
          ratings: {
            professionalism: r.rating_professionalism ?? r.ratings?.professionalism ?? 0,
            quality: r.rating_quality ?? r.ratings?.quality ?? 0,
            cleanliness: r.rating_cleanliness ?? r.ratings?.cleanliness ?? 0,
            timeliness: r.rating_timeliness ?? r.ratings?.timeliness ?? 0,
            overall: r.rating_overall ?? r.ratings?.overall ?? 0,
          },
        };
      });
  }, [supplier, projects, t]);

  if (!supplier) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 dark:from-slate-900 dark:via-slate-800 dark:to-gray-900">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-lg shadow-xl">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">{t.supplierProfilePage.notFoundTitle}</h1>
            <p className="text-gray-700 dark:text-gray-300">{t.supplierProfilePage.notFoundDesc}</p>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const calculateAverageRatings = (reviews = []) => {
    if (!reviews || reviews.length === 0) {
      return { overall: 0, professionalism: 0, quality: 0, cleanliness: 0, timeliness: 0, count: 0 };
    }
    const totalRatings = reviews.reduce((acc, review) => {
      acc.professionalism += review.ratings?.professionalism || 0;
      acc.quality += review.ratings?.quality || 0;
      acc.cleanliness += review.ratings?.cleanliness || 0;
      acc.timeliness += review.ratings?.timeliness || 0;
      acc.overall += review.ratings?.overall || 0;
      return acc;
    }, { professionalism: 0, quality: 0, cleanliness: 0, timeliness: 0, overall: 0 });

    const count = reviews.length;
    return {
      professionalism: count > 0 ? totalRatings.professionalism / count : 0,
      quality: count > 0 ? totalRatings.quality / count : 0,
      cleanliness: count > 0 ? totalRatings.cleanliness / count : 0,
      timeliness: count > 0 ? totalRatings.timeliness / count : 0,
      overall: count > 0 ? totalRatings.overall / count : 0,
      count: count,
    };
  };

  const averageRatings = calculateAverageRatings(approvedReviews);

  const spokenLanguages = supplier.languages && supplier.languages.length > 0
    ? supplier.languages.map(langId => allLanguages.find(l => l.id === langId)?.label || langId).join(', ')
    : t.supplierProfilePage.notSpecified;

  const getVerificationBadge = (status) => {
    const tRoles = t.roles || {};
    switch (status) {
      case 'verified': return <Badge variant="default" className="bg-green-400 text-green-900 dark:bg-green-500 dark:text-green-50 flex items-center text-xs shadow-md"><CheckCircle size={12} className="mr-1" /> {tRoles.supplier || 'Supplier'} Verified</Badge>;
      case 'pending': return <Badge variant="secondary" className="bg-yellow-400 text-yellow-900 dark:bg-yellow-500 dark:text-yellow-50 flex items-center text-xs shadow-md"><Clock size={12} className="mr-1" /> {tRoles.supplier || 'Supplier'} Pending</Badge>;
      case 'rejected': return <Badge variant="destructive" className="bg-red-400 text-red-900 dark:bg-red-500 dark:text-red-50 flex items-center text-xs shadow-md"><XCircle size={12} className="mr-1" /> {tRoles.supplier || 'Supplier'} Rejected</Badge>;
      default: return <Badge variant="outline" className="text-xs border-purple-400 text-purple-700 dark:border-purple-600 dark:text-purple-300 shadow-sm">{status}</Badge>;
    }
  };

  const RatingDisplay = ({ label, score }) => (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}:</span>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(s => (
          <Star key={s} size={14} className={s <= Math.round(score) ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"} />
        ))}
        <span className="ml-2 text-sm font-medium text-purple-600 dark:text-purple-400">{score.toFixed(1)}</span>
      </div>
    </div>
  );

  // Handler to open modal
  const handleOpenGallery = (project) => {
    setSelectedProject(project);
    setSelectedImageIdx(0);
    setGalleryModalOpen(true);
  };

  // Handler to close modal
  const handleCloseGallery = () => {
    setGalleryModalOpen(false);
    setSelectedProject(null);
    setSelectedImageIdx(0);
  };

  // Handler for next/prev
  const handlePrevImage = () => {
    if (!selectedProject?.photos) return;
    setSelectedImageIdx((idx) => (idx === 0 ? selectedProject.photos.length - 1 : idx - 1));
  };
  const handleNextImage = () => {
    if (!selectedProject?.photos) return;
    setSelectedImageIdx((idx) => (idx === selectedProject.photos.length - 1 ? 0 : idx + 1));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-500 dark:from-slate-900 dark:via-slate-800 dark:to-gray-900">
      <Header />
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-2xl overflow-hidden border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-2xl">
            <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 p-8 text-white rounded-t-2xl shadow-lg">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <Avatar className="w-32 h-32 border-4 border-purple-300 dark:border-purple-500 shadow-xl ring-4 ring-white/30 dark:ring-slate-900/40">
                  <AvatarImage src={supplier.profile_photo_url || `https://avatar.vercel.sh/${supplier.email}.png?size=128`} alt={supplier.name} />
                  <AvatarFallback className="text-4xl bg-purple-700 dark:bg-purple-800">{supplier.name?.charAt(0).toUpperCase() || <UserCircle />}</AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-4xl font-extrabold text-shadow drop-shadow-lg">{supplier.companyName || supplier.name}</h1>
                  <p className="text-xs mt-1 text-purple-200 dark:text-purple-300">
                    ID: {
                      supplier.numeric_id
                    }
                  </p>
                  <div className="flex items-center justify-center md:justify-start mt-3 space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={22}
                        className={star <= Math.round(averageRatings.overall) ? "fill-yellow-400 text-yellow-400 drop-shadow" : "text-purple-300 dark:text-purple-400"}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium">{averageRatings.count} {t.supplierProfilePage.reviewsText}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <Badge className="bg-purple-200 text-purple-800 dark:bg-purple-700 dark:text-purple-100 px-3 py-1 shadow">{supplier.category || t.supplierProfilePage.serviceProviderDefault}</Badge>
                    {getVerificationBadge(supplier.verificationStatus)}
                  </div>
                </div>
                {/* --- Add this block for right-side info --- */}
                <div className="flex flex-col items-start justify-center min-w-[160px] mt-6 md:mt-0">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays size={18} className="text-purple-200" />
                    <span className="text-xs text-purple-100">{t.supplierProfilePage.memberSince || "Member Since"}:</span>
                    <span className="text-sm font-semibold text-white">
                      {/* Use memberSince, fallback to member_since */}
                      {supplier.memberSince
                        ? new Date(supplier.memberSince).toLocaleDateString()
                        : supplier.member_since
                          ? new Date(supplier.member_since).toLocaleDateString()
                          : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase size={18} className="text-purple-200" />
                    <span className="text-xs text-purple-100">{t.supplierProfilePage.completedProjects || "Completed Projects"}:</span>
                    <span className="text-sm font-semibold text-white">{completedProjectsCount}</span>
                  </div>
                </div>
                {/* --- end right-side info --- */}
                {user && user.role === 'customer' && supplier.verificationStatus === 'verified' && (
                  <Button
                    onClick={() => navigate('/messages', { state: { prefillChatWith: supplier.id, prefillSubject: `${t.messagesPage.inquirySubjectPrefix} ${supplier.companyName || supplier.name}'s services` } })}
                    className="ml-auto mt-4 md:mt-0 bg-white/90 text-purple-700 hover:bg-purple-200 dark:bg-purple-700 dark:text-purple-100 dark:hover:bg-purple-600 shadow-lg font-semibold rounded-full px-6 py-3"
                  >
                    <MessageSquareIcon size={18} className="mr-2" /> {t.supplierProfilePage.contactSupplierButton}
                  </Button>
                )}
              </div>
            </div>

            <CardContent className="p-6 grid md:grid-cols-3 gap-8 text-gray-800 dark:text-gray-200 bg-gradient-to-br from-white/80 to-purple-50 dark:from-slate-800/80 dark:to-slate-900/80 rounded-b-2xl">
              <section className="md:col-span-2">
                <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-3 border-b-2 border-purple-200 dark:border-purple-700 pb-2 flex items-center gap-2">
                  <Briefcase size={22} className="text-purple-400" /> {t.supplierProfilePage.aboutTitle}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{supplier.bio || t.supplierProfilePage.noDescription}</p>

                <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mt-8 mb-3 border-b-2 border-purple-200 dark:border-purple-700 pb-2 flex items-center gap-2">
                  <LanguagesIcon size={22} className="text-indigo-500 dark:text-indigo-400" /> {t.supplierProfilePage.languagesTitle}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{spokenLanguages}</p>
              </section>

              <aside className="md:col-span-1 space-y-6">

                <Card className="bg-purple-100/60 dark:bg-slate-700/60 p-4 shadow rounded-xl">
                  <CardTitle className="text-lg font-semibold text-purple-700 dark:text-purple-400 mb-2 flex items-center"><Star size={20} className="mr-2" />{t.supplierProfilePage.ratingsTitle}</CardTitle>
                  {averageRatings.count > 0 ? (
                    <>
                      <RatingDisplay label={t.projectReviewForm.ratingCategories.professionalism} score={averageRatings.professionalism} />
                      <RatingDisplay label={t.projectReviewForm.ratingCategories.quality} score={averageRatings.quality} />
                      <RatingDisplay label={t.projectReviewForm.ratingCategories.cleanliness} score={averageRatings.cleanliness} />
                      <RatingDisplay label={t.projectReviewForm.ratingCategories.timeliness} score={averageRatings.timeliness} />
                      <hr className="my-2 border-purple-200 dark:border-slate-600" />
                      <RatingDisplay label={t.projectReviewForm.ratingCategories.overall} score={averageRatings.overall} />
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.supplierProfilePage.noRatingsYet}</p>
                  )}
                </Card>
              </aside>

              <section className="md:col-span-3">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400 border-b-2 border-purple-200 dark:border-purple-700 pb-2 flex items-center gap-2">{t.supplierProfilePage.galleryTitle}</h2>
                  <span className="text-xs text-gray-400">{t.supplierProfilePage.galleryHint || "Click an image to view more"}</span>
                </div>
                {supplierProjects && supplierProjects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {supplierProjects.map((project, index) => {
                      // Ensure photos is always an array of objects with url and caption
                      let photosArr = [];
                      if (Array.isArray(project.photos)) {
                        photosArr = project.photos;
                      } else if (typeof project.photos === 'string') {
                        try {
                          const parsed = JSON.parse(project.photos);
                          photosArr = Array.isArray(parsed) ? parsed : [];
                        } catch {
                          photosArr = [];
                        }
                      }
                      // fallback: empty array
                      // Extract url from photo object or use string directly
                      const galleryImageUrl = photosArr.length > 0 ? (typeof photosArr[0] === 'string' ? photosArr[0] : photosArr[0].url) : null;
                      return (
                        <motion.div
                          key={project.id || index}
                          className="relative aspect-video rounded-xl overflow-hidden shadow-lg group border-2 border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 transition-all cursor-pointer bg-white dark:bg-slate-800"
                          whileHover={{ scale: 1.04 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          onClick={() => handleOpenGallery({ ...project, photos: photosArr })}
                        >
                          {galleryImageUrl ? (
                            <img
                              src={galleryImageUrl}
                              alt={project.title || t.supplierProfilePage.projectImageAlt}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-purple-100 dark:bg-slate-700 text-purple-400 dark:text-purple-200">
                              <ImageIcon size={48} />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="font-semibold">{project.title}</div>
                            {project.description && <div>{project.description.slice(0, 80)}{project.description.length > 80 ? '...' : ''}</div>}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                    <p>{t.supplierProfilePage.noGalleryImages}</p>
                  </div>
                )}

                {/* Gallery Modal */}
                <Dialog open={galleryModalOpen} onOpenChange={setGalleryModalOpen}>
                  <DialogContent
                    className="max-w-3xl p-0 bg-black/60 dark:bg-black/80 shadow-none rounded-2xl"
                    aria-describedby={undefined}
                    role="dialog"
                  >
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                      <DialogHeader>
                        <DialogTitle className="p-4 text-lg">{selectedProject?.title}</DialogTitle>
                        <DialogClose asChild>
                          <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 z-10"
                            onClick={handleCloseGallery}
                            aria-label="Close gallery"
                          >
                            
                          </button>
                        </DialogClose>
                      </DialogHeader>
                      {/* Add visually hidden description for accessibility */}
                      <div id="gallery-description" className="sr-only">
                        {selectedProject?.description || t.supplierProfilePage.projectImageAlt || "Project gallery images"}
                      </div>
                      {selectedProject?.photos && selectedProject.photos.length > 0 ? (
                        <div className="relative flex flex-col items-center">
                          <img
                            src={typeof selectedProject.photos[selectedImageIdx] === 'string' ? selectedProject.photos[selectedImageIdx] : selectedProject.photos[selectedImageIdx]?.url}
                            alt={`Project Image ${selectedImageIdx + 1}`}
                            className="max-h-[60vh] w-auto mx-auto rounded shadow-lg"
                            style={{ maxWidth: '100%' }}
                          />
                          {selectedProject.photos.length > 1 && (
                            <>
                              <div className="absolute inset-y-0 left-0 flex items-center">
                                <button
                                  className="bg-white/80 dark:bg-slate-800/80 rounded-full p-2 m-2 shadow hover:bg-purple-100 dark:hover:bg-purple-700"
                                  onClick={handlePrevImage}
                                  aria-label="Previous Image"
                                >
                                  <ChevronLeft size={28} />
                                </button>
                              </div>
                              <div className="absolute inset-y-0 right-0 flex items-center">
                                <button
                                  className="bg-white/80 dark:bg-slate-800/80 rounded-full p-2 m-2 shadow hover:bg-purple-100 dark:hover:bg-purple-700"
                                  onClick={handleNextImage}
                                  aria-label="Next Image"
                                >
                                  <ChevronRight size={28} />
                                </button>
                              </div>
                              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                                {selectedProject.photos.map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={typeof img === 'string' ? img : img?.url}
                                    alt={`Thumb ${idx + 1}`}
                                    className={`w-8 h-8 object-cover rounded border-2 cursor-pointer ${idx === selectedImageIdx ? 'border-purple-600' : 'border-gray-200 opacity-70'}`}
                                    onClick={() => setSelectedImageIdx(idx)}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-64 text-purple-400 dark:text-purple-200">
                          <ImageIcon size={64} />
                        </div>
                      )}
                      <div className="p-4 text-gray-700 dark:text-gray-300">
                        <span className="block font-semibold text-purple-700 dark:text-purple-300 mb-1">Description:</span>
                        <div className="bg-purple-50 dark:bg-slate-800 rounded-lg p-3 shadow-inner min-h-[40px]">
                          {selectedProject?.description
                            ? <span>{selectedProject.description}</span>
                            : <span className="italic text-gray-400">No description provided.</span>
                          }
                        </div>
                      </div>
                    </div>
                  </DialogContent >
                </Dialog>
              </section>

              <div className="md:col-span-3 my-8 border-t border-purple-200 dark:border-purple-700" />

              <section className="md:col-span-3">
                <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-4 border-b-2 border-purple-200 dark:border-purple-700 pb-2 flex items-center gap-2">
                  <MessageSquare size={22} className="text-purple-400" /> {t.supplierProfilePage.reviewsTitle}
                </h2>
                {approvedReviews && approvedReviews.length > 0 ? (
                  <div className="space-y-6">
                    {approvedReviews.map((review, index) => (
                      <Card key={review.id || index} className="bg-purple-100/80 dark:bg-slate-700/80 shadow-md border border-purple-200 dark:border-purple-700 rounded-xl">
                        <CardHeader className="pb-2 pt-3 px-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-purple-700 dark:text-purple-300">{review.reviewerName || t.supplierProfilePage.anonymousReviewer}</p>
                              <p className="text-xs text-purple-500 dark:text-purple-400">{t.supplierProfilePage.reviewedOn} {new Date(review.date).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={16}
                                  className={star <= (review.ratings?.overall || 0) ? "fill-yellow-400 text-yellow-400" : "text-purple-300 dark:text-purple-500"}
                                />
                              ))}
                              <span className="ml-2 text-sm font-medium text-purple-700 dark:text-purple-300">{(review.ratings?.overall || 0).toFixed(1)}</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                          <p className="text-gray-700 dark:text-gray-300 italic">"{review.comment}"</p>
                          {review.ratings && (
                            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                              <RatingDisplay label={t.projectReviewForm.ratingCategories.professionalism} score={review.ratings.professionalism || 0} />
                              <RatingDisplay label={t.projectReviewForm.ratingCategories.quality} score={review.ratings.quality || 0} />
                              <RatingDisplay label={t.projectReviewForm.ratingCategories.cleanliness} score={review.ratings.cleanliness || 0} />
                              <RatingDisplay label={t.projectReviewForm.ratingCategories.timeliness} score={review.ratings.timeliness || 0} />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
                    <p>{t.supplierProfilePage.noReviews}</p>
                  </div>
                )}
              </section>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default SupplierProfilePage;