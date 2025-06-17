import React, { useState, useEffect, useRef } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/components/ui/use-toast';
import { Save, Plus, Trash2, Eye } from 'lucide-react';
import { translations } from '@/lib/translations';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";

const AdminSettingsContentTab = () => {
  const { siteSettings, updateSiteSettingsData } = useData();
  const { language } = useAuth();
  const t = translations[language].adminPage.settingsTab;
  const { toast } = useToast();
  const aboutUsImageInputRef = useRef(null);

  const [formData, setFormData] = useState({
    homepageContent: {
      specialOffer: { title: '', description: '', image: '' },
      howItWorksCustomer: [],
      howItWorksSupplier: [],
    },
    aboutUsContent: '',
    aboutUsImage: '',
    contactInfo: { email: '', phone: '', address: '', businessHours: '' },
    contactFormEnabled: true,
  });
  const [previewAboutUsContent, setPreviewAboutUsContent] = useState('');
  const [previewAboutUsImage, setPreviewAboutUsImage] = useState('');


  useEffect(() => {
    if (siteSettings) {
      setFormData({
        homepageContent: siteSettings.homepageContent || { specialOffer: { title: '', description: '', image: '' }, howItWorksCustomer: [], howItWorksSupplier: [] },
        aboutUsContent: siteSettings.aboutUsContent || '',
        aboutUsImage: siteSettings.aboutUsImage || '',
        contactInfo: siteSettings.contactInfo || { email: '', phone: '', address: '', businessHours: '' },
        contactFormEnabled: siteSettings.contactFormEnabled === undefined ? true : siteSettings.contactFormEnabled,
      });
      setPreviewAboutUsContent(siteSettings.aboutUsContent || '');
      setPreviewAboutUsImage(siteSettings.aboutUsImage || '');
    }
  }, [siteSettings]);

  const handleInputChange = (e, section, field, index, subField) => {
    const { value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setFormData(prev => {
      const newData = { ...prev };
      if (index !== undefined && subField !== undefined && newData[section] && newData[section][field] && Array.isArray(newData[section][field])) { 
        newData[section][field][index][subField] = val;
      } else if (field !== undefined && newData[section]) { 
        newData[section][field] = val;
      } else { 
        newData[section] = val;
      }
      return newData;
    });
  };
  
  const handleNestedInputChange = (e, section, subSection, field) => {
     const { value } = e.target;
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subSection]: {
            ...prev[section][subSection],
            [field]: value
          }
        }
      }));
  };

  const handleAboutUsImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, aboutUsImage: reader.result }));
        setPreviewAboutUsImage(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const addHowItWorksStep = (type) => {
    setFormData(prev => ({
      ...prev,
      homepageContent: {
        ...prev.homepageContent,
        [type]: [...(prev.homepageContent?.[type] || []), { id: `new_${Date.now()}`, title: '', icon: '', description: '' }]
      }
    }));
  };

  const removeHowItWorksStep = (type, index) => {
    setFormData(prev => ({
      ...prev,
      homepageContent: {
        ...prev.homepageContent,
        [type]: prev.homepageContent[type].filter((_, i) => i !== index)
      }
    }));
  };


  const handleSave = () => {
    updateSiteSettingsData(formData);
  };
  
  const handlePreviewAboutUs = () => {
    setPreviewAboutUsContent(formData.aboutUsContent);
    setPreviewAboutUsImage(formData.aboutUsImage);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.homepageEditorTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <fieldset className="border p-4 rounded-md">
            <legend className="px-2 font-medium">{t.specialOfferSection}</legend>
            <div className="space-y-2">
              <Label htmlFor="offerTitle">{t.offerTitle}</Label>
              <Input id="offerTitle" value={formData.homepageContent?.specialOffer?.title || ''} onChange={(e) => handleNestedInputChange(e, 'homepageContent', 'specialOffer', 'title')} />
              <Label htmlFor="offerDescription">{t.offerDescription}</Label>
              <Textarea id="offerDescription" value={formData.homepageContent?.specialOffer?.description || ''} onChange={(e) => handleNestedInputChange(e, 'homepageContent', 'specialOffer', 'description')} />
              <Label htmlFor="offerImageURL">{t.offerImageURL}</Label>
              <Input id="offerImageURL" value={formData.homepageContent?.specialOffer?.image || ''} onChange={(e) => handleNestedInputChange(e, 'homepageContent', 'specialOffer', 'image')} />
            </div>
          </fieldset>
          
          {['howItWorksCustomer', 'howItWorksSupplier'].map(type => (
            <fieldset key={type} className="border p-4 rounded-md">
              <legend className="px-2 font-medium">{type === 'howItWorksCustomer' ? t.customerSteps : t.supplierSteps}</legend>
              {formData.homepageContent?.[type]?.map((step, index) => (
                <div key={step.id || index} className="border-b py-2 mb-2 space-y-1">
                  <Label>Step {index + 1}</Label>
                  <Input placeholder={t.stepTitle} value={step.title} onChange={(e) => handleInputChange(e, 'homepageContent', type, index, 'title')} />
                  <Input placeholder={t.stepIcon} value={step.icon} onChange={(e) => handleInputChange(e, 'homepageContent', type, index, 'icon')} />
                  <Textarea placeholder={t.stepDescription} value={step.description} onChange={(e) => handleInputChange(e, 'homepageContent', type, index, 'description')} /><button type="button" onClick={() => removeHowItWorksStep(type, index)} className="text-red-500 hover:text-red-700 text-xs flex items-center"><Trash2 size={14} className="mr-1"/> {t.removeStep}</button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => addHowItWorksStep(type)}><Plus size={14} className="mr-1"/> {t.addStep}</Button>
            </fieldset>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
            <div>
                <CardTitle>{t.aboutUsEditorTitle}</CardTitle>
                <CardDescription>Edit the content and background image for the About Us page.</CardDescription>
            </div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" onClick={handlePreviewAboutUs}><Eye size={16} className="mr-2"/> Preview</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>About Us Preview</DialogTitle>
                    </DialogHeader>
                    <div className="my-4 prose max-w-none">
                        {previewAboutUsImage && <img-replace src={previewAboutUsImage} alt="About Us Background Preview" className="w-full h-48 object-cover rounded-md mb-4"/>}
                        <div dangerouslySetInnerHTML={{ __html: previewAboutUsContent.replace(/\n/g, '<br />') }} />
                    </div>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="aboutUsContent">{t.aboutUsContent}</Label>
            <Textarea id="aboutUsContent" value={formData.aboutUsContent} onChange={(e) => handleInputChange(e, 'aboutUsContent')} rows={8} className="mt-1"/>
          </div>
          <div>
            <Label htmlFor="aboutUsImageUpload">{t.aboutUsImageURL}</Label>
            <Input 
              id="aboutUsImageUpload" 
              type="file" 
              ref={aboutUsImageInputRef}
              onChange={handleAboutUsImageUpload} 
              accept="image/*" 
              className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
            />
            {formData.aboutUsImage && (
              <div className="mt-2">
                <img-replace src={formData.aboutUsImage} alt="About Us Image Preview" className="h-32 w-auto object-contain rounded-md border p-1"/>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t.contactInfoEditorTitle}</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="supportEmail">{t.supportEmail}</Label>
          <Input id="supportEmail" type="email" value={formData.contactInfo?.email || ''} onChange={(e) => handleNestedInputChange(e, 'contactInfo', 'email')} />
          <Label htmlFor="phoneNumber">{t.phoneNumber}</Label>
          <Input id="phoneNumber" value={formData.contactInfo?.phone || ''} onChange={(e) => handleNestedInputChange(e, 'contactInfo', 'phone')} />
          <Label htmlFor="businessAddress">{t.businessAddress}</Label>
          <Input id="businessAddress" value={formData.contactInfo?.address || ''} onChange={(e) => handleNestedInputChange(e, 'contactInfo', 'address')} />
           <Label htmlFor="businessHours">{t.contactInfo?.businessHours || 'Business Hours'}</Label>
          <Input id="businessHours" value={formData.contactInfo?.businessHours || ''} onChange={(e) => handleNestedInputChange(e, 'contactInfo', 'businessHours')} />
          <div className="flex items-center space-x-2 pt-2">
            <Switch id="contactFormEnabled" checked={formData.contactFormEnabled} onCheckedChange={(checked) => handleInputChange({ target: { type: 'checkbox', checked }}, 'contactFormEnabled')} />
            <Label htmlFor="contactFormEnabled">{t.enableContactForm}</Label>
          </div>
        </CardContent>
      </Card>
      
      <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary-focus text-white"><Save size={16} className="mr-2"/> {t.saveSettingsButton}</Button>
    </div>
  );
};

export default AdminSettingsContentTab;