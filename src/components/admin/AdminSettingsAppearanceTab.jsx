import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Palette, Monitor, Smartphone } from 'lucide-react';
import { translations } from '@/lib/translations';

const AdminSettingsAppearanceTab = () => {
  const { siteSettings, updateSiteSettingsData } = useData();
  const { language } = useAuth();
  const t = translations[language].adminPage.settingsTab;

  const [themeColors, setThemeColors] = useState({
    primaryColor: '#7C3AED',
    secondaryColor: '#10B981',
    textColor: '#1F2937',
  });
  const [previewMode, setPreviewMode] = useState('desktop');


  useEffect(() => {
    if (siteSettings?.theme) {
      setThemeColors(siteSettings.theme);
    }
  }, [siteSettings]);

  const handleColorChange = (e, colorName) => {
    setThemeColors(prev => ({ ...prev, [colorName]: e.target.value }));
  };
  
  const handleSaveAppearance = () => {
    updateSiteSettingsData({ theme: themeColors });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Palette className="mr-2 text-primary"/> {t.appearanceTitle}</CardTitle>
        <CardDescription>Customize the look and feel of your platform.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="primaryColor" className="flex items-center">
              <span className="w-4 h-4 rounded-full mr-2 inline-block" style={{backgroundColor: themeColors.primaryColor}} />
              {t.primaryColor}
            </Label>
            <Input id="primaryColor" type="color" value={themeColors.primaryColor} onChange={(e) => handleColorChange(e, 'primaryColor')} className="h-10"/>
          </div>
          <div>
            <Label htmlFor="secondaryColor" className="flex items-center">
               <span className="w-4 h-4 rounded-full mr-2 inline-block" style={{backgroundColor: themeColors.secondaryColor}} />
              {t.secondaryColor}
            </Label>
            <Input id="secondaryColor" type="color" value={themeColors.secondaryColor} onChange={(e) => handleColorChange(e, 'secondaryColor')} className="h-10"/>
          </div>
          <div>
            <Label htmlFor="textColor" className="flex items-center">
               <span className="w-4 h-4 rounded-full mr-2 inline-block border" style={{backgroundColor: themeColors.textColor}} />
              {t.textColor}
            </Label>
            <Input id="textColor" type="color" value={themeColors.textColor} onChange={(e) => handleColorChange(e, 'textColor')} className="h-10"/>
          </div>
        </div>

        <div className="mt-6">
          <Label>{t.livePreview}</Label>
          <div className="flex space-x-2 mt-1 mb-3">
            <Button variant={previewMode === 'desktop' ? 'default' : 'outline'} onClick={() => setPreviewMode('desktop')} size="sm"><Monitor size={16} className="mr-1"/> {t.desktop}</Button>
            <Button variant={previewMode === 'mobile' ? 'default' : 'outline'} onClick={() => setPreviewMode('mobile')} size="sm"><Smartphone size={16} className="mr-1"/> {t.mobile}</Button>
          </div>
          <div className={`p-4 border rounded-md overflow-hidden ${previewMode === 'mobile' ? 'w-full max-w-xs mx-auto h-[480px]' : 'w-full h-[300px]'}`} 
            style={{
              backgroundColor: '#f9fafb', 
              border: '1px solid #e5e7eb'
            }}>
            <div className="h-12 rounded-t-md flex items-center px-4" style={{backgroundColor: themeColors.primaryColor}}>
              <span className="text-lg font-semibold" style={{color: themeColors.secondaryColor}}>WorkSani.ge</span>
            </div>
            <div className="p-4 space-y-3">
              <h3 className="text-xl font-bold" style={{color: themeColors.textColor}}>Sample Heading</h3>
              <p style={{color: themeColors.textColor}}>This is some sample body text to preview text color.</p>
              <Button style={{backgroundColor: themeColors.secondaryColor, color: themeColors.primaryColor === themeColors.secondaryColor ? '#ffffff' : themeColors.primaryColor /* Basic contrast */ }}>Sample Button</Button>
            </div>
          </div>
        </div>
        <Button onClick={handleSaveAppearance} className="w-full mt-6 bg-primary hover:bg-primary-focus text-white"><Save size={16} className="mr-2"/> Save Appearance</Button>
      </CardContent>
    </Card>
  );
};

export default AdminSettingsAppearanceTab;