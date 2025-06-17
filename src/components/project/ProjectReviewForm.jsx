import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Star, Send, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { translations } from '@/lib/translations';

const StarRatingInput = ({ rating, setRating, label }) => {
  return (
    <div className="mb-4">
      <Label className="text-gray-700 dark:text-gray-300 font-medium block mb-1.5">{label}</Label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map(starValue => (
          <motion.div
            key={starValue}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Star
              size={28}
              className={`cursor-pointer transition-all duration-150 ease-in-out ${rating >= starValue ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-500 hover:text-yellow-300 dark:hover:text-yellow-300'}`}
              onClick={() => setRating(starValue)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ProjectReviewForm = ({ supplierName, onSubmitReview, onCancelReview }) => {
  const [ratings, setRatings] = useState({
    professionalism: 0,
    quality: 0,
    cleanliness: 0,
    timeliness: 0,
    overall: 0,
  });
  const [comment, setComment] = useState('');
  const { toast } = useToast();
  const { language } = useAuth();
  const t = translations[language].projectReviewForm;

  const handleRatingChange = (category, value) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allRated = Object.values(ratings).every(r => r > 0);
    if (!allRated || !comment.trim()) {
      toast({ title: t.invalidReviewToast, description: t.invalidReviewDescFull, variant: "destructive" });
      return;
    }
    onSubmitReview({ ratings, comment });
    setRatings({ professionalism: 0, quality: 0, cleanliness: 0, timeliness: 0, overall: 0 });
    setComment('');
  };

  const reviewCategories = [
    { key: 'professionalism', label: t.ratingCategories.professionalism },
    { key: 'quality', label: t.ratingCategories.quality },
    { key: 'cleanliness', label: t.ratingCategories.cleanliness },
    { key: 'timeliness', label: t.ratingCategories.timeliness },
    { key: 'overall', label: t.ratingCategories.overall },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[100]"
    >
      <Card className="shadow-2xl border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-800 w-full max-w-lg max-h-[95vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10 border-b dark:border-slate-700 py-4 px-6">
          <div>
            <CardTitle className="text-2xl text-purple-700 dark:text-purple-400">{t.leaveReviewTitle.replace('{supplierName}', supplierName || t.defaultSupplierName)}</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">{t.shareYourExperience}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancelReview} className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
            <X size={24} />
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {reviewCategories.map(cat => (
              <StarRatingInput
                key={cat.key}
                label={cat.label}
                rating={ratings[cat.key]}
                setRating={(value) => handleRatingChange(cat.key, value)}
              />
            ))}
            
            <div>
              <Label htmlFor="review-comment" className="text-gray-700 dark:text-gray-300 font-medium">{t.yourReviewLabel}</Label>
              <Textarea 
                id="review-comment" 
                value={comment} 
                onChange={(e) => setComment(e.target.value)} 
                placeholder={t.reviewPlaceholder} 
                className="mt-1.5 min-h-[120px] focus:ring-purple-500 dark:focus:ring-purple-400 dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600" 
                rows={5} 
                required 
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <Button type="button" variant="outline" onClick={onCancelReview} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
                {t.cancelButton}
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600">
                <Send size={16} className="mr-2" /> {t.submitButton}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProjectReviewForm;