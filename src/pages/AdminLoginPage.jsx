import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { translations } from '@/lib/translations';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, language } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const t = translations[language].auth;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password, true);
      toast({ title: t.adminLoginSuccessTitle, description: t.adminLoginSuccessDesc, variant: "default" });
      navigate('/admin');
    } catch (error) {
      toast({ title: t.loginFailed, description: error.message || t.invalidCredentials, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-slate-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-gray-900">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl overflow-hidden border-purple-200 dark:border-purple-700 bg-white dark:bg-slate-800">
            <CardHeader className="bg-gradient-to-r from-purple-700 to-purple-900 p-6 text-center dark:from-purple-800 dark:to-purple-900">
              <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-white" />
              <CardTitle className="text-3xl font-bold text-white">{t.adminLoginTitle}</CardTitle>
              <CardDescription className="text-purple-200 dark:text-purple-300">{t.adminLoginDescription}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-purple-800 dark:text-purple-300 font-medium">{t.emailLabel}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    required
                    className="focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:focus:ring-purple-400 dark:focus:border-purple-400"
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-purple-800 dark:text-purple-300 font-medium">{t.passwordLabel}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:focus:ring-purple-400 dark:focus:border-purple-400"
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : t.loginButton}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminLoginPage;