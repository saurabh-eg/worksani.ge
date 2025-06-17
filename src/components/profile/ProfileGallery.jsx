import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Camera, BarChart3 } from 'lucide-react';
import { translations } from '@/lib/translations';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const ProfileGallery = ({ gallery, isEditing, onImageAdd, onImageRemove, currentUILanguage }) => {
  const t = translations[currentUILanguage].profilePage;

  return (
    <motion.div variants={itemVariants}>
        <Label className="font-semibold text-gray-700 flex items-center mb-2"><BarChart3 size={16} className="mr-2 text-purple-500"/> {t.galleryLabel}</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {gallery.map(img => (
                <div key={img.id || img.url} className="relative group">
                    <img-replace src={img.url} alt={img.caption || t.projectImageAlt} className="w-full h-32 object-cover rounded-lg shadow-md"/>
                    {isEditing && (
                        <Button 
                            type="button" 
                            size="sm" 
                            variant="destructive" 
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                            onClick={() => onImageRemove(img.id || img.url)}
                        >
                            X
                        </Button>
                    )}
                </div>
            ))}
            {isEditing && gallery.length < 6 && (
                <label htmlFor="galleryImageUpload" className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors">
                    <Camera size={24} className="text-gray-400"/>
                    <span className="text-xs text-gray-500 mt-1">{t.addImageButton}</span>
                    <input id="galleryImageUpload" type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={onImageAdd} multiple/>
                </label>
            )}
        </div>
        {gallery.length === 0 && !isEditing && <p className="text-sm text-gray-500">{t.noGalleryImages}</p>}
    </motion.div>
  );
};

export default ProfileGallery;