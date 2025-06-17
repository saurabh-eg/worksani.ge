import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from 'framer-motion';
import { User, Mail, Briefcase, Phone as PhoneIcon, Info, Languages } from 'lucide-react';
import { translations } from '@/lib/translations';

const allLanguagesList = [
  { id: 'en', label: 'English' },
  { id: 'ka', label: 'ქართული (Georgian)' },
  { id: 'ru', label: 'Русский (Russian)' },
  { id: 'de', label: 'Deutsch (German)' },
  { id: 'fr', label: 'Français (French)' },
];

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const ProfileInfoForm = ({ profileData, handleInputChange, handleLanguageChange, isEditing, userRole, currentUILanguage }) => {
  const t = translations[currentUILanguage].profilePage;

  return (
    <>
      <motion.div variants={itemVariants}>
        <Label htmlFor="email" className="font-semibold text-gray-700 flex items-center"><Mail size={16} className="mr-2 text-purple-500"/> {t.emailLabel}</Label>
        <Input id="email" type="email" value={profileData.email} disabled className="mt-1 bg-gray-100 cursor-not-allowed"/>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="phone" className="font-semibold text-gray-700 flex items-center"><PhoneIcon size={16} className="mr-2 text-purple-500"/> {t.phoneLabel}</Label>
        {isEditing ? (
            <Input id="phone" name="phone" value={profileData.phone} onChange={handleInputChange} className="mt-1" placeholder={t.phonePlaceholder}/>
        ) : (
            <p className="mt-1 text-gray-800 p-2 bg-gray-50 rounded-md min-h-[40px]">{profileData.phone || t.notSet}</p>
        )}
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Label className="font-semibold text-gray-700 flex items-center"><Languages size={16} className="mr-2 text-purple-500"/> {t.languagesLabel}</Label>
        {isEditing ? (
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 border rounded-md">
                {allLanguagesList.map(lang => (
                    <div key={lang.id} className="flex items-center space-x-2">
                        <Checkbox
                            id={`lang-${lang.id}`}
                            checked={profileData.languages.includes(lang.id)}
                            onCheckedChange={() => handleLanguageChange(lang.id)}
                        />
                        <Label htmlFor={`lang-${lang.id}`} className="text-sm font-normal">{lang.label}</Label>
                    </div>
                ))}
            </div>
        ) : (
            <p className="mt-1 text-gray-800 p-2 bg-gray-50 rounded-md min-h-[40px]">
                {profileData.languages.length > 0 ? profileData.languages.map(langId => allLanguagesList.find(l => l.id === langId)?.label).join(', ') : t.notSet}
            </p>
        )}
      </motion.div>

      {userRole === 'customer' && (
           <motion.div variants={itemVariants}>
              <Label htmlFor="bio" className="font-semibold text-gray-700 flex items-center"><Info size={16} className="mr-2 text-purple-500"/> {t.bioLabelCustomer}</Label>
              {isEditing ? (
              <Textarea id="bio" name="bio" value={profileData.bio} onChange={handleInputChange} rows={3} className="mt-1" placeholder={t.bioPlaceholderCustomer}/>
              ) : (
              <p className="mt-1 text-gray-800 p-2 bg-gray-50 rounded-md whitespace-pre-wrap min-h-[60px]">{profileData.bio || t.noBioProvided}</p>
              )}
          </motion.div>
      )}

      {userRole === 'supplier' && (
      <>
          <motion.div variants={itemVariants}>
              <Label htmlFor="companyName" className="font-semibold text-gray-700 flex items-center"><Briefcase size={16} className="mr-2 text-purple-500"/> {t.companyNameLabel}</Label>
              {isEditing ? (
                  <Input id="companyName" name="companyName" value={profileData.companyName} onChange={handleInputChange} className="mt-1"/>
              ) : (
                  <p className="mt-1 text-gray-800 p-2 bg-gray-50 rounded-md min-h-[40px]">{profileData.companyName || t.notSet}</p>
              )}
          </motion.div>
          <motion.div variants={itemVariants}>
              <Label htmlFor="bio" className="font-semibold text-gray-700 flex items-center"><User size={16} className="mr-2 text-purple-500"/> {t.bioLabelSupplier}</Label>
              {isEditing ? (
              <Textarea id="bio" name="bio" value={profileData.bio} onChange={handleInputChange} rows={4} className="mt-1" placeholder={t.bioPlaceholderSupplier}/>
              ) : (
              <p className="mt-1 text-gray-800 p-2 bg-gray-50 rounded-md whitespace-pre-wrap min-h-[60px]">{profileData.bio || t.noBioProvided}</p>
              )}
          </motion.div>
      </>
      )}
    </>
  );
};

export default ProfileInfoForm;