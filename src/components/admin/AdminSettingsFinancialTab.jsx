import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { DollarSign, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { translations } from '@/lib/translations';

const AdminSettingsFinancialTab = () => {
  const { siteSettings, updateSiteSettingsData } = useData();
  const { language } = useAuth();
  const { toast } = useToast();
  const t = translations[language].adminPage.settingsTab.financial || {};

  const [projectPostingFee, setProjectPostingFee] = useState('');
  const [bidFee, setBidFee] = useState('');
  const [bankAccounts, setBankAccounts] = useState({
    TBC: '',
    BOG: '',
  });

  useEffect(() => {
    if (siteSettings) {
      setProjectPostingFee(siteSettings.projectPostingFee?.toString() || '0');
      setBidFee(siteSettings.bidFee?.toString() || '0');
      setBankAccounts(siteSettings.bankAccountInfo || { TBC: '', BOG: '' });
    }
  }, [siteSettings]);

  const handleSave = () => {
    const numericProjectFee = parseFloat(projectPostingFee);
    const numericBidFee = parseFloat(bidFee);

    if (isNaN(numericProjectFee) || isNaN(numericBidFee)) {
      toast({ title: t.invalidFeesTitle, description: t.invalidFeesDesc, variant: "destructive" });
      return;
    }

    const updatedSettings = {
      ...siteSettings,
      projectPostingFee: numericProjectFee,
      bidFee: numericBidFee,
      bankAccountInfo: bankAccounts,
    };

    updateSiteSettingsData(updatedSettings);
    toast({ title: t.settingsSavedTitle, description: t.settingsSavedDesc });
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="projectPostingFee" className="text-base">
                {t.projectFeeLabel}
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                <Input
                  id="projectPostingFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={projectPostingFee}
                  onChange={(e) => setProjectPostingFee(e.target.value)}
                  className="pl-9"
                  placeholder="0.00"
                />
              </div>
              <p className="text-sm text-gray-500">{t.projectFeeDesc}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bidFee" className="text-base">
                {t.bidFeeLabel}
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                <Input
                  id="bidFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={bidFee}
                  onChange={(e) => setBidFee(e.target.value)}
                  className="pl-9"
                  placeholder="0.00"
                />
              </div>
              <p className="text-sm text-gray-500">{t.bidFeeDesc}</p>
            </div>

            <div className="space-y-4">
              <Label className="text-base">{t.bankAccountsLabel}</Label>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tbcAccount">TBC Bank</Label>
                  <Input
                    id="tbcAccount"
                    value={bankAccounts.TBC}
                    onChange={(e) => setBankAccounts(prev => ({ ...prev, TBC: e.target.value }))}
                    placeholder="GE29TB..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bogAccount">Bank of Georgia</Label>
                  <Input
                    id="bogAccount"
                    value={bankAccounts.BOG}
                    onChange={(e) => setBankAccounts(prev => ({ ...prev, BOG: e.target.value }))}
                    placeholder="GE92BG..."
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500">{t.bankAccountsDesc}</p>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="w-4 h-4 mr-2" /> {t.saveButton}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminSettingsFinancialTab;