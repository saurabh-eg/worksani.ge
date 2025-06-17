import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || (user?.role === 'admin' ? "/admin" : "/dashboard");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Missing Fields", description: "Please enter both email and password.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (error) {
      // Toast is handled in AuthContext for login failure
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-slate-50 to-green-50">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl overflow-hidden glass-effect border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-green-500 p-6 text-center">
              <CardTitle className="text-3xl font-bold text-white">Welcome Back!</CardTitle>
              <CardDescription className="text-purple-100 text-sm">Log in to access your WorkSani.ge account.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email_login" className="text-purple-800 font-medium">Email</Label>
                  <Input
                    id="email_login"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password_login" className="text-purple-800 font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password_login"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="focus:ring-purple-500 focus:border-purple-500"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 text-gray-500 hover:text-purple-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <Link to="/reset-password" className="text-sm text-purple-600 hover:text-purple-700 hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 text-base" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Log In"}
                </Button>
              </form>
              <div className="text-center text-sm">
                <Link to="/admin-login" className="font-medium text-purple-600 hover:text-purple-700 hover:underline">
                  Admin Login
                </Link>
              </div>
            </CardContent>
            <CardFooter className="p-6 bg-slate-50 border-t border-purple-100 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-green-600 hover:text-green-700 hover:underline">
                  Sign up here
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;