import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { translations } from '@/lib/translations';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const ChangePasswordForm = ({ onChangePasswordSubmit, currentUILanguage }) => {
  const t = translations[currentUILanguage].profilePage;
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass both newPassword and confirmNewPassword in correct order
    onChangePasswordSubmit('', newPassword, confirmNewPassword);
    setNewPassword('');
    setConfirmNewPassword('');
  };

  return (
    <motion.div variants={itemVariants} className="mt-8">
      <Card className="bg-white shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center"><KeyRound size={20} className="mr-2 text-purple-500"/> {t.changePasswordButton}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="newPassword">{t.newPasswordLabel}</Label>
              <div className="relative">
                <Input id="newPassword" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7" onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirmNewPassword">{t.confirmNewPasswordLabel}</Label>
              <div className="relative">
                <Input id="confirmNewPassword" type={showConfirmNewPassword ? "text" : "password"} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}>
                  {showConfirmNewPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">{t.changePasswordButton}</Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default ChangePasswordForm;