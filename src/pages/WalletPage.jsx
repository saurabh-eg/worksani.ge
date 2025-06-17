import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, PlusCircle, Landmark, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { translations } from '@/lib/translations';

const WalletPage = () => {
  const { user, language } = useAuth();
  const { siteSettings } = useData();
  const { toast } = useToast();
  const t = translations[language].walletPage;

  // Use state to track balance changes
  const [currentBalance, setCurrentBalance] = useState(Number(user?.wallet_balance || 0));

  // Update balance when user data changes
  useEffect(() => {
    const newBalance = Number(user?.wallet_balance || 0);
    console.log('User balance updated:', newBalance);
    setCurrentBalance(newBalance);
  }, [user?.wallet_balance]);

  const copyToClipboard = (text, bankName) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: `${bankName} Account Copied!`, description: "Account number copied to clipboard." });
    }, (err) => {
      toast({ title: "Copy Failed", description: "Could not copy text.", variant: "destructive" });
    });
  };

  if (!user || user.role !== 'customer') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p>This page is for customers only.</p>
        </main>
        <Footer />
      </div>
    );
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-100 to-gray-200">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-gray-800 flex items-center">
            <WalletIcon size={36} className="mr-3 text-primary" /> {t.title}
          </h1>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
          variants={{ visible: { transition: { staggerChildren: 0.1 }}}}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="md:col-span-1">
            <Card className="shadow-lg border-l-4 border-primary">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">{t.currentBalance}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-gray-700">
                  ₾{currentBalance.toFixed(2)}
                </p>
              </CardContent>
              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-primary hover:bg-primary-focus text-primary-foreground">
                      <PlusCircle size={20} className="mr-2" /> {t.topUpButton}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px] bg-white">
                    <DialogHeader>
                      <DialogTitle className="text-2xl text-primary">{t.topUpInstructionsTitle}</DialogTitle>
                      <DialogDescription>
                        {t.topUpBankInfo}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {Object.entries(siteSettings.bankAccountInfo || {}).map(([bank, details]) => (
                        <div key={bank} className="p-4 border rounded-lg bg-slate-50">
                          <h4 className="font-semibold text-lg text-gray-700 flex items-center mb-1">
                            <Landmark size={20} className="mr-2 text-primary"/> {bank}
                          </h4>
                          <div className="flex justify-between items-center">
                            <p className="text-gray-600">{details}</p>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(details.match(/GE\d{2}[A-Z]{2}\d{16}/)?.[0] || details, bank)}>
                              <Copy size={16} className="mr-1"/> Copy
                            </Button>
                          </div>
                        </div>
                      ))}
                      {Object.keys(siteSettings.bankAccountInfo || {}).length === 0 && (
                        <p className="text-gray-500">Bank account details are not configured by the admin yet.</p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-2">
            <Card className="shadow-lg h-full">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-700">{t.transactionHistoryTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                {user.transaction_history && user.transaction_history.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.date}</TableHead>
                        <TableHead>{t.type}</TableHead>
                        <TableHead className="text-right">{t.amount}</TableHead>
                        <TableHead>{t.description}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...user.transaction_history]
                        .sort((a,b) => new Date(b.date) - new Date(a.date))
                        .map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>{new Date(tx.date).toLocaleDateString(language, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}</TableCell>
                          <TableCell className="capitalize">
                            {t[tx.type.toLowerCase()] || tx.type.replace(/_/g, ' ')}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${
                            tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {tx.amount > 0 ? `+₾${tx.amount.toFixed(2)}` : `-₾${Math
                              .abs(tx.amount)
                              .toFixed(2)}`}
                          </TableCell>
                          <TableCell>{tx.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-gray-500 py-4">{t.noTransactions}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default WalletPage;