import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Edit3, Save, Camera, DollarSign } from 'lucide-react';
import { translations } from '@/lib/translations';
import ProfileInfoForm from '@/components/profile/ProfileInfoForm';
import ProfileGallery from '@/components/profile/ProfileGallery';
import ChangePasswordForm from '@/components/profile/ChangePasswordForm';

const ProfilePage = () => {
  const { user, updateUserContextProfile, language: currentUILanguage } = useAuth();
  const { updateUser, getUserById, changePassword } = useData();
  const { toast } = useToast();
  const t = translations[currentUILanguage].profilePage;

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '', email: '', bio: '', companyName: '', profilePhoto: '', 
    pastProjectsGallery: [], phone: '', languages: [],
  });
  const [currentBalance, setCurrentBalance] = useState(0);
  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);


  useEffect(() => {
    if (user) {
      const freshUserData = getUserById(user.id) || user;
      setProfileData({
        name: freshUserData.name || '',
        email: freshUserData.email || '',
        bio: freshUserData.bio || '',
        companyName: freshUserData.companyName || (freshUserData.role === 'supplier' && freshUserData.name) || '',
        profilePhoto: freshUserData.profilePhoto || '',
        pastProjectsGallery: freshUserData.pastProjectsGallery || [],
        phone: freshUserData.phone || '',
        languages: freshUserData.languages || [],
      });
      setCurrentBalance(parseFloat(freshUserData.balance || 0));
    }
  }, [user, getUserById]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleLanguageChange = (langId) => {
    setProfileData(prev => {
      const newLanguages = prev.languages.includes(langId)
        ? prev.languages.filter(l => l !== langId)
        : [...prev.languages, langId];
      return { ...prev, languages: newLanguages };
    });
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const tempUrl = URL.createObjectURL(file); 
      setProfileData(prev => ({ ...prev, profilePhoto: tempUrl }));
      setNewPhotoFile(file);
    }
  };
  
  const handleGalleryImageAdd = (e) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        const newImageObjects = files.map(file => ({
            file,
            url: URL.createObjectURL(file),
            id: `temp_${Date.now()}_${Math.random()}`,
            caption: 'New Project Image'
        }));

        setProfileData(prev => ({
            ...prev,
            pastProjectsGallery: [...prev.pastProjectsGallery, ...newImageObjects.map(f => ({url: f.url, id: f.id, caption: f.caption}))]
        }));
        setNewGalleryFiles(prev => [...prev, ...newImageObjects]);
    }
  };

  const handleGalleryImageRemove = (imageId) => {
    setProfileData(prev => ({
        ...prev,
        pastProjectsGallery: prev.pastProjectsGallery.filter(img => img.id !== imageId)
    }));
    setNewGalleryFiles(prev => prev.filter(f => f.id !== imageId));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    let finalPhotoUrl = profileData.profilePhoto;
    if (newPhotoFile) {
      finalPhotoUrl = profileData.profilePhoto; 
    }

    const updatedUserDataPartial = {
      name: profileData.name,
      bio: profileData.bio,
      companyName: profileData.companyName,
      profilePhoto: finalPhotoUrl,
      pastProjectsGallery: profileData.pastProjectsGallery,
      phone: profileData.phone,
      languages: profileData.languages,
    };
    
    updateUser(user.id, updatedUserDataPartial);

    toast({ title: t.toastProfileUpdatedTitle, description: t.toastProfileUpdatedDesc, variant: "default" });
    setIsEditing(false);
    setNewPhotoFile(null);
    setNewGalleryFiles([]);
  };

  const handleChangePasswordSubmit = (currentPasswordInput, newPasswordInput, confirmNewPasswordInput) => {
    if (newPasswordInput.length < 6) {
      toast({ title: "Password Too Short", description: "New password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPasswordInput !== confirmNewPasswordInput) {
      toast({ title: "Passwords Don't Match", description: "New password and confirmation do not match.", variant: "destructive" });
      return;
    }
    
    const success = changePassword(user.id, newPasswordInput, currentPasswordInput, false);
    if (success) {
      toast({ title: t.passwordChangedSuccess, variant: "default" });
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">{t.loadingProfile}</main>
        <Footer />
      </div>
    );
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
            className="max-w-3xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
            <motion.div variants={itemVariants}>
                <Card className="bg-white shadow-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-500 p-8 text-white relative">
                    <div className="flex flex-col sm:flex-row items-center sm:space-x-6">
                        <div className="relative">
                            <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                                <AvatarImage src={profileData.profilePhoto || `https://avatar.vercel.sh/${profileData.email}.png?size=128`} alt={profileData.name} />
                                <AvatarFallback className="text-4xl bg-purple-700">{profileData.name?.substring(0,1).toUpperCase() || 'U'}</AvatarFallback>
                            </Avatar>
                            {isEditing && (
                                <label htmlFor="photoUpload" className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition-colors">
                                    <Camera size={20} className="text-purple-600" />
                                    <input id="photoUpload" type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handlePhotoChange} />
                                </label>
                            )}
                        </div>
                        <div className="mt-4 sm:mt-0 text-center sm:text-left">
                            {isEditing ? (
                                <Input 
                                    name="name" 
                                    value={profileData.name} 
                                    onChange={handleInputChange} 
                                    className="text-3xl font-bold bg-transparent border-b-2 border-purple-300 text-white placeholder-purple-200 focus:ring-0 focus:border-white"
                                    placeholder={t.yourNamePlaceholder}
                                />
                            ) : (
                                <CardTitle className="text-4xl font-bold">{profileData.name}</CardTitle>
                            )}
                            <CardDescription className="text-purple-200 text-lg mt-1">
                                {translations[currentUILanguage].roles[user.role]}
                            </CardDescription>
                        </div>
                    </div>
                    {!isEditing && (
                        <Button onClick={() => setIsEditing(true)} variant="outline" className="absolute top-6 right-6 bg-white bg-opacity-20 text-white border-white hover:bg-opacity-30">
                            <Edit3 size={16} className="mr-2"/> {t.editProfileButton}
                        </Button>
                    )}
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                    <CardContent className="p-6 space-y-6">
                        <ProfileInfoForm
                            profileData={profileData}
                            handleInputChange={handleInputChange}
                            handleLanguageChange={handleLanguageChange}
                            isEditing={isEditing}
                            userRole={user.role}
                            currentUILanguage={currentUILanguage}
                        />
                        {user.role === 'supplier' && (
                            <ProfileGallery
                                gallery={profileData.pastProjectsGallery}
                                isEditing={isEditing}
                                onImageAdd={handleGalleryImageAdd}
                                onImageRemove={handleGalleryImageRemove}
                                currentUILanguage={currentUILanguage}
                            />
                        )}
                        {isEditing && (
                            <motion.div variants={itemVariants} className="flex justify-end space-x-3 pt-4 border-t">
                                <Button type="button" variant="outline" onClick={() => { setIsEditing(false); }}>{t.cancelButton}</Button>
                                <Button type="submit" className="bg-purple-600 hover:bg-purple-700"><Save size={16} className="mr-2"/> {t.saveChangesButton}</Button>
                            </motion.div>
                        )}
                    </CardContent>
                    </form>
                    {user.role === 'supplier' && (
                        <CardFooter className="p-6 border-t bg-gray-50">
                             <motion.div variants={itemVariants} className="w-full">
                                <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-2"><DollarSign size={20} className="mr-2 text-green-500"/> {t.accountBalanceLabel}</h4>
                                <p className="text-3xl font-bold text-green-600">₾{currentBalance.toFixed(2)}</p>
                                <p className="text-sm text-gray-500 mt-1">{t.accountBalanceDesc}</p>
                             </motion.div>
                        </CardFooter>
                    )}
                </Card>
            </motion.div>

            <ChangePasswordForm 
                onChangePasswordSubmit={handleChangePasswordSubmit}
                currentUILanguage={currentUILanguage}
            />
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;