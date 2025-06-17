import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { PlusCircle, Upload, X, ArrowLeft, DollarSign, MapPin, ListChecks, Loader2, AlertTriangle, Wallet } from 'lucide-react';
import { translations } from '@/lib/translations';

const projectCategories = [
  "plumbing", "painting", "electrical", "carpentry", "cleaning", "gardening", "moving", "repairs", "hvac", "flooring", "roofing", "other"
];

const PostProjectPage = () => {
  const { user, language } = useAuth();
  const { addProject, siteSettings } = useData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const t = translations[language].postProjectPage || {};
  const commonT = translations[language].common || {};
  const categoriesT = translations[language].categories || {};

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projectPostingFee = parseFloat(siteSettings?.projectPostingFee || 0);
  const userBalance = parseFloat(user?.wallet_balance || 0);
  const canAfford = userBalance >= projectPostingFee;

  const handlePhotoChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (photos.length + filesArray.length > 5) {
        toast({ title: t.maxPhotosTitle || "Too many photos", description: t.maxPhotosDesc || "You can upload a maximum of 5 photos.", variant: "destructive"});
        return;
      }
      const newPhotos = filesArray.map(file => ({
        file,
        preview: URL.createObjectURL(file) 
      }));
      setPhotos(prevPhotos => [...prevPhotos, ...newPhotos]);
    }
  };

  const removePhoto = (index) => {
    setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canAfford && projectPostingFee > 0) {
      toast({ title: t.insufficientBalanceTitle || "Insufficient Balance", description: (t.insufficientBalanceAction || "Your balance (₾{balance}) is too low. Project posting fee: ₾{fee}.").replace('{balance}', userBalance.toFixed(2)).replace('{fee}', projectPostingFee.toFixed(2)), variant: "destructive" });
      return;
    }
    if (!title || !description || !category || !location || !budget) {
      toast({ title: t.missingFieldsTitle || "Missing Fields", description: t.missingFieldsDesc || "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    if (parseFloat(budget) <= 0) {
        toast({ title: t.invalidBudgetTitle || "Invalid Budget", description: t.invalidBudgetDesc || "Budget must be a positive amount.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    try {
      const photoDataForStorage = photos.map(p => ({ name: p.file.name, url: p.preview }));
      const projectData = { title, description, category, location, budget: parseFloat(budget), photos: photoDataForStorage };
      const newProject = await addProject(projectData);
      if (newProject) {
        navigate(`/projects/${newProject.id}`);
      } else {
        throw new Error(t.postProjectErrorDesc || "An unexpected error occurred during project creation.");
      }
    } catch (error) {
      console.error("Failed to post project:", error);
      toast({ title: t.postProjectErrorTitle || "Error Posting Project", description: error.message || t.postProjectErrorDesc || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (user && user.role !== 'customer') {
    toast({ title: commonT.accessDeniedTitle || "Access Denied", description: t.customerOnlyDesc || "Only customers can post projects.", variant: "destructive"});
    navigate('/dashboard');
    return null;
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  let submitButtonText = t.submitButton || "Post Project";
  if (projectPostingFee > 0) {
    if (canAfford) {
      submitButtonText = (t.submitButtonWithFee || "Post Project (Fee: ₾{fee})").replace('{fee}', projectPostingFee.toFixed(2));
    } else {
      submitButtonText = (t.submitButtonInsufficientBalance || "Insufficient Balance (Fee: ₾{fee})").replace('{fee}', projectPostingFee.toFixed(2));
    }
  }


  return (
    <motion.div 
      className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-slate-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-gray-900"
      initial="initial"
      animate="animate"
      variants={pageVariants}
    >
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-8 border-primary text-primary hover:bg-primary-light dark:text-purple-400 dark:border-purple-600 dark:hover:bg-purple-700/30">
          <ArrowLeft size={18} className="mr-2" /> {commonT.back || "Back"}
        </Button>
        <Card className="max-w-2xl mx-auto shadow-2xl overflow-hidden border-purple-200 dark:border-purple-700 bg-white dark:bg-slate-800">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-green-500 dark:from-purple-700 dark:to-green-600 p-6">
            <CardTitle className="text-3xl font-bold text-white flex items-center"><ListChecks size={32} className="mr-3"/> {t.pageTitle || "Post a New Project"}</CardTitle>
            <CardDescription className="text-purple-100 dark:text-purple-200">{t.pageDescription || "Describe your project to get bids from skilled professionals."}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="p-6 sm:p-8 space-y-6">
              
              {!canAfford && projectPostingFee > 0 && (
                <motion.div 
                  initial={{opacity:0, y: -10}} animate={{opacity:1, y:0}}
                  className="p-4 mb-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-md"
                >
                  <div className="flex items-center">
                    <AlertTriangle size={20} className="mr-2"/>
                    <p className="font-semibold">{(t.insufficientBalanceAction || "Your balance (₾{balance}) is too low. Project posting fee: ₾{fee}.").replace('{balance}', userBalance.toFixed(2)).replace('{fee}', projectPostingFee.toFixed(2))}</p>
                  </div>
                  <Button onClick={() => navigate('/wallet')} className="mt-3 bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700">
                    <Wallet size={16} className="mr-2"/> {t.topUpWalletButton || "Top Up Wallet"}
                  </Button>
                </motion.div>
              )}

              <div>
                <Label htmlFor="title" className="text-purple-700 dark:text-purple-300 font-medium text-lg">{t.titleLabel || "Project Title"}</Label>
                <Input id="title" placeholder={t.titlePlaceholder || "e.g., Fix Leaky Kitchen Faucet"} value={title} onChange={(e) => setTitle(e.target.value)} required className="text-base py-3 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
              </div>

              <div>
                <Label htmlFor="description" className="text-purple-700 dark:text-purple-300 font-medium text-lg">{t.descriptionLabel || "Detailed Description"}</Label>
                <Textarea id="description" placeholder={t.descriptionPlaceholder || "Provide as much detail as possible..."} value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} className="text-base py-3 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category" className="text-purple-700 dark:text-purple-300 font-medium text-lg">{t.categoryLabel || "Category"}</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger id="category" className="text-base py-3 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                      <SelectValue placeholder={t.categoryPlaceholder || "Select a category"} />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-700 dark:text-white">
                      {projectCategories.map(cat => (
                        <SelectItem key={cat} value={cat} className="capitalize text-base dark:focus:bg-slate-600">{categoriesT[cat] || cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location" className="text-purple-700 dark:text-purple-300 font-medium text-lg flex items-center"><MapPin size={18} className="mr-2 text-green-500 dark:text-green-400"/> {t.locationLabel || "Location"}</Label>
                  <Input id="location" placeholder={t.locationPlaceholder || "e.g., Tbilisi, Saburtalo"} value={location} onChange={(e) => setLocation(e.target.value)} required className="text-base py-3 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
                </div>
              </div>
              
              <div>
                <Label htmlFor="budget" className="text-purple-700 dark:text-purple-300 font-medium text-lg flex items-center"><DollarSign size={18} className="mr-2 text-green-500 dark:text-green-400"/> {t.budgetLabel || "Your Budget (₾)"}</Label>
                <Input id="budget" type="number" placeholder={t.budgetPlaceholder || "e.g., 150"} value={budget} onChange={(e) => setBudget(e.target.value)} required min="1" className="text-base py-3 focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
              </div>

              <div>
                <Label className="text-purple-700 dark:text-purple-300 font-medium text-lg">{t.photosLabel || "Upload Photos (Optional, Max 5)"}</Label>
                <div className="mt-2 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-purple-300 dark:border-purple-600 border-dashed rounded-md hover:border-purple-500 dark:hover:border-purple-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload size={40} className="mx-auto text-gray-400 dark:text-gray-500" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-700 rounded-md font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500 dark:focus-within:ring-offset-slate-800">
                        <span>{t.uploadButton || "Upload files"}</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handlePhotoChange} accept="image/*" />
                      </label>
                      <p className="pl-1">{t.dragDropText || "or drag and drop"}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{t.fileTypesText || "PNG, JPG, GIF up to 10MB"}</p>
                  </div>
                </div>
                {photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img-replace src={photo.preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-md shadow-md" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600"
                          onClick={() => removePhoto(index)}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-purple-100 dark:border-slate-700">
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600 font-semibold py-3 text-lg" disabled={isSubmitting || (!canAfford && projectPostingFee > 0)}>
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <><PlusCircle size={20} className="mr-2"/> {submitButtonText}</>}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
      <Footer />
    </motion.div>
  );
};

export default PostProjectPage;