import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { initialSiteSettings } from '@/lib/initialData';

export const useSiteSettingsData = (initialData = initialSiteSettings) => {
  const [siteSettings, setSiteSettings] = useState(() => {
    const localData = localStorage.getItem('siteSettings_worksani');
    try {
      return localData ? JSON.parse(localData) : initialData;
    } catch (e) {
      console.error("Error parsing siteSettings from localStorage:", e);
      return initialData;
    }
  });

  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('siteSettings_worksani', JSON.stringify(siteSettings));
    const root = document.documentElement;
    root.style.setProperty('--color-primary', siteSettings.theme?.primaryColor || initialData.theme.primaryColor);
    root.style.setProperty('--color-secondary', siteSettings.theme?.secondaryColor || initialData.theme.secondaryColor);
    root.style.setProperty('--color-text-main', siteSettings.theme?.textColor || initialData.theme.textColor);
  }, [siteSettings, initialData.theme]);

  const updateSiteSettingsData = useCallback((newSettingsPartial) => {
    setSiteSettings(prev => {
      const updated = { ...prev, ...newSettingsPartial };
      if(newSettingsPartial.theme) updated.theme = {...prev.theme, ...newSettingsPartial.theme};
      if(newSettingsPartial.homepageContent) {
        updated.homepageContent = {...prev.homepageContent, ...newSettingsPartial.homepageContent};
        if(newSettingsPartial.homepageContent.specialOffer) {
            updated.homepageContent.specialOffer = {...prev.homepageContent.specialOffer, ...newSettingsPartial.homepageContent.specialOffer};
        }
      }
      if(newSettingsPartial.contactInfo) updated.contactInfo = {...prev.contactInfo, ...newSettingsPartial.contactInfo};
      if(newSettingsPartial.bankAccountInfo) updated.bankAccountInfo = {...prev.bankAccountInfo, ...newSettingsPartial.bankAccountInfo};
      return updated;
    });
    toast({ title: "Settings Updated", description: "Site settings have been saved.", variant: "default"});
  }, [toast]);

  return {
    siteSettings,
    updateSiteSettingsData,
  };
};