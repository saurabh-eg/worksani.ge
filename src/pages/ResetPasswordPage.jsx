import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { KeyRound, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState('email'); // 'email' or 'confirmation'
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Error", description: "Please enter your email address.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      toast({ 
        title: "Reset Instructions Sent", 
        description: "If an account exists with this email, you will receive password reset instructions.", 
      });
      setStep('confirmation');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-slate-50 to-green-50">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/login" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft size={16} className="mr-2" /> Back to Login
          </Link>

          <Card className="shadow-2xl overflow-hidden border-purple-200">
            {step === 'email' ? (
              <>
                <CardHeader className="bg-gradient-to-r from-purple-600 to-green-500 p-6 text-center">
                  <KeyRound className="w-12 h-12 mx-auto mb-4 text-white" />
                  <CardTitle className="text-2xl font-bold text-white">Reset Your Password</CardTitle>
                  <CardDescription className="text-purple-100">
                    Enter your email address and we'll send you instructions to reset your password.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending Instructions...
                        </>
                      ) : (
                        'Send Reset Instructions'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-center">
                  <Mail className="w-12 h-12 mx-auto mb-4 text-white" />
                  <CardTitle className="text-2xl font-bold text-white">Check Your Email</CardTitle>
                  <CardDescription className="text-green-100">
                    We've sent password reset instructions to your email.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600 mb-4">
                    Please check your email inbox and follow the instructions to reset your password.
                    The link will expire in 24 hours.
                  </p>
                  <p className="text-sm text-gray-500">
                    Didn't receive the email? Check your spam folder or{' '}
                    <button
                      onClick={() => setStep('email')}
                      className="text-purple-600 hover:text-purple-700 underline"
                    >
                      try again
                    </button>
                  </p>
                </CardContent>
              </>
            )}
            <CardFooter className="bg-gray-50 p-4 text-center text-sm text-gray-600">
              Remember your password?{' '}
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                Log in here
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPasswordPage;