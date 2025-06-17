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
import { Star, Briefcase, UserCircle, MessageSquare, Image as ImageIcon, Languages as LanguagesIcon, ShieldCheck, Clock, XCircle, CheckCircle, Award, Zap, ThumbsUp, CalendarDays } from 'lucide-react';
import { translations } from '@/lib/translations';

const allLanguages = [
  { id: 'en', label: 'English' },
  { id: 'ka', label: 'ქართული (Georgian)' },
  { id: 'ru', label: 'Русский (Russian)' },
  { id: 'de', label: 'Deutsch (German)' },
  { id: 'fr', label: 'Français (French)' },
];

const SupplierProfilePage = () => {
  const { id } = useParams();
  const { getUserById, getSupplierProjects } = useData();
  const { user, language: currentUILanguage } = useAuth();
  const t = translations[currentUILanguage];
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);

  useEffect(() => {
    const supplierData = getUserById(id);
    if (supplierData && supplierData.role === 'supplier') {
      setSupplier(supplierData);

      const pageTitle = `${supplierData.companyName || supplierData.name} | ${t.common.supplierProfileTitleDefault || "Supplier Profile | WorkSani"}`;
      const pageDescription = `${t.common.supplierProfileMetaDescriptionPrefix || "View profile for"} ${supplierData.companyName || supplierData.name}. ${t.common.categoryLabel}: ${supplierData.category}. ${t.common.supplierProfileMetaDescriptionSuffix || "Specializing in various home services. Check reviews and ratings on WorkSani."}`;
      const pageKeywords = `${supplierData.companyName || supplierData.name}, ${supplierData.category}, ${t.common.supplierProfileKeywordsDefault || "supplier profile georgia, contractor details tbilisi, reviews, ratings, professional services worksani"}`;
      
      document.title = pageTitle;
      let metaDescTag = document.querySelector('meta[name="description"]');
      if (metaDescTag) metaDescTag.setAttribute('content', pageDescription);
      
      let metaKeywordsTag = document.querySelector('meta[name="keywords"]');
      if (metaKeywordsTag) metaKeywordsTag.setAttribute('content', pageKeywords);
    }
  }, [id, getUserById, t]);

  const supplierProjects = useMemo(() => {
    if (!supplier) return [];
    return getSupplierProjects(supplier.id);
  }, [supplier, getSupplierProjects]);

  const completedProjectsCount = useMemo(() => {
    return supplierProjects.filter(p => p.status === 'Completed').length;
  }, [supplierProjects]);

  const approvedReviews = useMemo(() => {
    if (!supplier || !supplier.reviews) return [];
    return supplier.reviews.filter(review => review.status === 'approved');
  }, [supplier]);

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
    switch(status) {
      case 'verified': return <Badge variant="default" className="bg-green-400 text-green-900 dark:bg-green-500 dark:text-green-50 flex items-center text-xs shadow-md"><CheckCircle size={12} className="mr-1"/> {tRoles.supplier || 'Supplier'} Verified</Badge>;
      case 'pending': return <Badge variant="secondary" className="bg-yellow-400 text-yellow-900 dark:bg-yellow-500 dark:text-yellow-50 flex items-center text-xs shadow-md"><Clock size={12} className="mr-1"/> {tRoles.supplier || 'Supplier'} Pending</Badge>;
      case 'rejected': return <Badge variant="destructive" className="bg-red-400 text-red-900 dark:bg-red-500 dark:text-red-50 flex items-center text-xs shadow-md"><XCircle size={12} className="mr-1"/> {tRoles.supplier || 'Supplier'} Rejected</Badge>;
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

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-500 dark:from-slate-900 dark:via-slate-800 dark:to-gray-900">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-2xl overflow-hidden border-purple-300 dark:border-purple-700 bg-purple-50/80 dark:bg-slate-800/80 backdrop-blur-lg">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Avatar className="w-32 h-32 border-4 border-purple-300 dark:border-purple-500 shadow-lg">
                  <AvatarImage src={supplier.profilePhoto || `https://avatar.vercel.sh/${supplier.email}.png?size=128`} alt={supplier.name} />
                  <AvatarFallback className="text-4xl bg-purple-700 dark:bg-purple-800">{supplier.name?.charAt(0).toUpperCase() || <UserCircle />}</AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left">
                  <h1 className="text-3xl font-bold text-shadow">{supplier.companyName || supplier.name}</h1>
                  <p className="text-sm text-purple-200 dark:text-purple-300">ID: {supplier.numericId || 'N/A'}</p>
                  <div className="flex items-center justify-center md:justify-start mt-2 space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        className={star <= Math.round(averageRatings.overall) ? "fill-yellow-400 text-yellow-400" : "text-purple-300 dark:text-purple-400"}
                      />
                    ))}
                    <span className="ml-2 text-sm">({averageRatings.count} {t.supplierProfilePage.reviewsText})</span>
                  </div>
                  <div className="mt-2 flex items-center justify-center md:justify-start space-x-2">
                    <Badge className="bg-purple-200 text-purple-800 dark:bg-purple-700 dark:text-purple-100 px-3 py-1 shadow-sm">{supplier.category || t.supplierProfilePage.serviceProviderDefault}</Badge>
                    {getVerificationBadge(supplier.verificationStatus)}
                  </div>
                </div>
                {user && user.role === 'customer' && supplier.verificationStatus === 'verified' && (
                    <Button 
                        onClick={() => navigate('/messages', { state: { prefillChatWith: supplier.id, prefillSubject: `${t.messagesPage.inquirySubjectPrefix} ${supplier.companyName || supplier.name}'s services` }})}
                        className="ml-auto mt-4 md:mt-0 bg-purple-200 text-purple-700 hover:bg-purple-300 dark:bg-purple-700 dark:text-purple-100 dark:hover:bg-purple-600 shadow-md font-semibold"
                    >
                        <MessageSquare size={18} className="mr-2"/> {t.supplierProfilePage.contactSupplierButton}
                    </Button>
                )}
              </div>
            </div>

            <CardContent className="p-6 grid md:grid-cols-3 gap-8 text-gray-800 dark:text-gray-200">
              <section className="md:col-span-2">
                <h2 className="text-2xl font-semibold text-purple-700 dark:text-purple-400 mb-3 border-b-2 border-purple-200 dark:border-purple-700 pb-2">{t.supplierProfilePage.aboutTitle}</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{supplier.bio || t.supplierProfilePage.noDescription}</p>
              
                <h2 className="text-2xl font-semibold text-purple-700 dark:text-purple-400 mt-6 mb-3 border-b-2 border-purple-200 dark:border-purple-700 pb-2 flex items-center">
                  <LanguagesIcon size={24} className="mr-2 text-indigo-500 dark:text-indigo-400"/> {t.supplierProfilePage.languagesTitle}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{spokenLanguages}</p>
              </section>

              <aside className="md:col-span-1 space-y-6">
                <Card className="bg-purple-100/50 dark:bg-slate-700/50 p-4 shadow">
                  <CardTitle className="text-lg font-semibold text-purple-700 dark:text-purple-400 mb-2 flex items-center"><Award size={20} className="mr-2"/>{t.supplierProfilePage.summaryTitle}</CardTitle>
                  <div className="text-sm space-y-1">
                    <p className="flex items-center"><Briefcase size={14} className="mr-2 text-purple-500 dark:text-purple-400"/> {t.supplierProfilePage.memberSince}: {new Date(supplier.memberSince || Date.now()).toLocaleDateString()}</p>
                    <p className="flex items-center"><Zap size={14} className="mr-2 text-purple-500 dark:text-purple-400"/> {t.supplierProfilePage.completedProjects}: {completedProjectsCount}</p>
                  </div>
                </Card>
                
                <Card className="bg-purple-100/50 dark:bg-slate-700/50 p-4 shadow">
                  <CardTitle className="text-lg font-semibold text-purple-700 dark:text-purple-400 mb-2 flex items-center"><Star size={20} className="mr-2"/>{t.supplierProfilePage.ratingsTitle}</CardTitle>
                  {averageRatings.count > 0 ? (
                    <>
                      <RatingDisplay label={t.projectReviewForm.ratingCategories.professionalism} score={averageRatings.professionalism} />
                      <RatingDisplay label={t.projectReviewForm.ratingCategories.quality} score={averageRatings.quality} />
                      <RatingDisplay label={t.projectReviewForm.ratingCategories.cleanliness} score={averageRatings.cleanliness} />
                      <RatingDisplay label={t.projectReviewForm.ratingCategories.timeliness} score={averageRatings.timeliness} />
                      <hr className="my-2 border-purple-200 dark:border-slate-600"/>
                      <RatingDisplay label={t.projectReviewForm.ratingCategories.overall} score={averageRatings.overall} />
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.supplierProfilePage.noRatingsYet}</p>
                  )}
                </Card>
              </aside>

              <section className="md:col-span-3">
                <h2 className="text-2xl font-semibold text-purple-700 dark:text-purple-400 mb-4 border-b-2 border-purple-200 dark:border-purple-700 pb-2">{t.supplierProfilePage.galleryTitle}</h2>
                {supplier.pastProjectsGallery && supplier.pastProjectsGallery.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {supplier.pastProjectsGallery.map((projectImage, index) => (
                        <motion.div 
                            key={projectImage.id || index} 
                            className="relative aspect-video rounded-lg overflow-hidden shadow-lg group border-2 border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 transition-all"
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                        <img-replace
                            src={projectImage.url}
                            alt={projectImage.caption || t.supplierProfilePage.projectImageAlt}
                            className="w-full h-full object-cover"
                        />
                        {projectImage.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {projectImage.caption}
                            </div>
                        )}
                        </motion.div>
                    ))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                        <p>{t.supplierProfilePage.noGalleryImages}</p>
                    </div>
                )}
              </section>

              <section className="md:col-span-3">
                <h2 className="text-2xl font-semibold text-purple-700 dark:text-purple-400 mb-4 border-b-2 border-purple-200 dark:border-purple-700 pb-2">{t.supplierProfilePage.reviewsTitle}</h2>
                {approvedReviews && approvedReviews.length > 0 ? (
                    <div className="space-y-6">
                    {approvedReviews.map((review, index) => (
                        <Card key={review.id || index} className="bg-purple-100/70 dark:bg-slate-700/70 shadow-md border border-purple-200 dark:border-purple-700">
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