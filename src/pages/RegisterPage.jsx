import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Loader2, User, Briefcase, UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';
import { translations } from '@/lib/translations';

const RegisterPage = () => {
  const { language, register } = useAuth();
  const t = translations[language].registerPage;
  const commonT = translations[language];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [companyName, setCompanyName] = useState('');
  const [bio, setBio] = useState('');
  const [registrationDocument, setRegistrationDocument] = useState(null);
  const [registrationDocumentPreview, setRegistrationDocumentPreview] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const roleParam = queryParams.get('role');
    if (roleParam === 'supplier') {
      setRole('supplier');
    }
  }, [location.search]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({ title: "File Error", description: t.docSizeError, variant: "destructive" });
        return;
      }
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
        toast({ title: "File Error", description: t.docTypeError, variant: "destructive" });
        return;
      }
      setRegistrationDocument(file);
      setRegistrationDocumentPreview(file.name); // Or URL.createObjectURL(file) for image preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Password Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (role === 'supplier' && !companyName.trim()) {
        toast({ title: "Missing Information", description: "Company name is required for suppliers.", variant: "destructive" });
        return;
    }
    if (role === 'supplier' && !registrationDocument) {
        toast({ title: "Missing Document", description: "Company registration document is required for suppliers.", variant: "destructive" });
        return;
    }
    if (!name.trim() || !email.trim()) {
      toast({ title: "Missing Information", description: "Name and Email are required.", variant: "destructive"});
      return;
    }

    setIsSubmitting(true);
    try {
      const userData = { name, email, password, role };
      if (role === 'supplier') {
        userData.companyName = companyName;
        userData.bio = bio;
        // Simulate file upload by storing filename or a mock URL
        userData.companyRegistrationDocument = {
          name: registrationDocument.name,
          url: `/uploads/docs/${registrationDocument.name}` // Mock URL
        };
      }
      await register(userData);
      // Navigation is handled in AuthContext based on role and verification status
    } catch (error) {
      // Toast is handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-slate-50 to-purple-50">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
          className="w-full max-w-lg"
        >
          <Card className="shadow-2xl overflow-hidden glass-effect border-green-200">
            <CardHeader className="bg-gradient-to-r from-green-500 to-purple-600 p-6 text-center">
              <CardTitle className="text-3xl font-bold text-white">{commonT.header.register}</CardTitle>
              <CardDescription className="text-green-100 text-sm">Join WorkSani.ge and connect!</CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-5">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="role" className="text-purple-800 font-medium">I am a...</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="w-full focus:ring-green-500 focus:border-green-500">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer"><User className="inline-block mr-2 h-4 w-4" />{commonT.roles.customer}</SelectItem>
                      <SelectItem value="supplier"><Briefcase className="inline-block mr-2 h-4 w-4" />{commonT.roles.supplier}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="name_register" className="text-purple-800 font-medium">Full Name</Label>
                  <Input id="name_register" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required className="focus:ring-green-500 focus:border-green-500" />
                </div>

                {role === 'supplier' && (
                  <>
                    <div>
                      <Label htmlFor="companyName" className="text-purple-800 font-medium">Company Name</Label>
                      <Input id="companyName" placeholder="Your Company LLC" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div>
                      <Label htmlFor="bio" className="text-purple-800 font-medium">Short Bio / Skills (Optional)</Label>
                      <Textarea id="bio" placeholder="Briefly describe your services or skills..." value={bio} onChange={(e) => setBio(e.target.value)} className="focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div>
                      <Label htmlFor="registrationDocument" className="text-purple-800 font-medium">{t.uploadDocLabel}</Label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-gray-300 hover:border-green-500">
                        <div className="space-y-1 text-center">
                          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="registrationDocument"
                              className="relative cursor-pointer rounded-md bg-white font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                            >
                              <span>Upload a file</span>
                              <input id="registrationDocument" name="registrationDocument" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" required/>
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
                          {registrationDocumentPreview && <p className="text-sm text-green-700 mt-1">{registrationDocumentPreview}</p>}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="email_register" className="text-purple-800 font-medium">Email</Label>
                  <Input id="email_register" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="focus:ring-green-500 focus:border-green-500" />
                </div>

                <div className="relative">
                  <Label htmlFor="password_register" className="text-purple-800 font-medium">Password</Label>
                  <Input
                    id="password_register"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="•••••••• (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength="6"
                    className="focus:ring-green-500 focus:border-green-500"
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-[calc(1.5rem+0.5rem+2px)] transform -translate-y-1/2 h-7 w-7 text-gray-500 hover:text-green-600" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>

                <div className="relative">
                  <Label htmlFor="confirmPassword_register" className="text-purple-800 font-medium">Confirm Password</Label>
                  <Input
                    id="confirmPassword_register"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength="6"
                    className="focus:ring-green-500 focus:border-green-500"
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-[calc(1.5rem+0.5rem+2px)] transform -translate-y-1/2 h-7 w-7 text-gray-500 hover:text-green-600" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
                
                <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 text-base" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Create Account"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="p-6 bg-slate-50 border-t border-green-100 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-purple-600 hover:text-purple-700 hover:underline">
                  {commonT.header.login} here
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

export default RegisterPage;