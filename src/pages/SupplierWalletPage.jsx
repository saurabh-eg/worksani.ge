import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, PlusCircle, Landmark, Copy, ShieldAlert } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { translations } from '@/lib/translations';
import { useNavigate } from 'react-router-dom';

const SupplierWalletPage = () => {
  const { user, language } = useAuth();
  const { siteSettings, getUserById } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const t = translations[language].supplierWalletPage || translations[language].walletPage; 
  const commonT = translations[language];

  const currentUserData = getUserById(user?.id);

  const [currentBalance, setCurrentBalance] = useState(Number(currentUserData?.bid_balance || 0));

  useEffect(() => {
    setCurrentBalance(Number(currentUserData?.bid_balance || 0));
  }, [currentUserData?.bid_balance]);

  const copyToClipboard = (textToCopy, bankName) => {
    if (!textToCopy) {
        toast({ title: commonT.supplierWalletPage?.copyErrorTitle || "Nothing to Copy", description: commonT.supplierWalletPage?.copyErrorNoAccount || "Account number is not available.", variant: "destructive" });
        return;
    }
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({ title: `${bankName} ${commonT.supplierWalletPage?.accountCopiedTitle || "Account Copied!"}`, description: commonT.supplierWalletPage?.accountCopiedDesc || "Account number copied to clipboard." });
    }, (err) => {
      toast({ title: commonT.supplierWalletPage?.copyFailedTitle || "Copy Failed", description: commonT.supplierWalletPage?.copyFailedDesc || "Could not copy text.", variant: "destructive" });
    });
  };

  if (!currentUserData || currentUserData.role !== 'supplier') {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <Card className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-xl">
            <ShieldAlert size={48} className="mx-auto text-red-500 mb-4"/>
            <h1 className="text-2xl font-bold text-red-700">{commonT.supplierWalletPage?.accessDeniedTitle || "Access Denied"}</h1>
            <p className="text-gray-700">{commonT.supplierWalletPage?.accessDeniedDesc || "This page is for suppliers only. Please log in as a supplier."}</p>
            <Button onClick={() => navigate('/login')} className="mt-4 bg-purple-600 hover:bg-purple-700 text-white">{commonT.header?.login || "Login"}</Button>
          </Card>
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 text-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold flex items-center text-purple-100">
            <WalletIcon size={36} className="mr-3 text-purple-300" /> {t.title}
          </h1>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
          variants={{ visible: { transition: { staggerChildren: 0.1 }}}}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="md:col-span-1">
            <Card className="shadow-xl border-l-4 border-purple-300 bg-purple-700/50 backdrop-blur-md text-purple-50">
              <CardHeader>
                <CardTitle className="text-2xl text-purple-200">{t.currentBalance}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold">₾{currentBalance.toFixed(2)}</p>
              </CardContent>
              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-purple-300 hover:bg-purple-400 text-purple-900 font-semibold">
                      <PlusCircle size={20} className="mr-2" /> {t.topUpButton}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px] bg-purple-800 text-purple-100 border-purple-700">
                    <DialogHeader>
                      <DialogTitle className="text-2xl text-purple-200">{t.topUpInstructionsTitle}</DialogTitle>
                      <DialogDescription className="text-purple-300">
                        {t.topUpBankInfo || commonT.walletPage.topUpBankInfo}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {siteSettings.bankAccountInfo && Object.entries(siteSettings.bankAccountInfo).map(([bank, accountNumber]) => (
                        <div key={bank} className="p-4 border border-purple-700 rounded-lg bg-purple-900/50">
                          <h4 className="font-semibold text-lg text-purple-200 flex items-center mb-1">
                            <Landmark size={20} className="mr-2 text-purple-300"/> {bank}
                          </h4>
                          <div className="flex justify-between items-center">
                            <p className="text-purple-300">{accountNumber}</p>
                            <Button variant="ghost" size="sm" className="text-purple-300 hover:text-purple-100 hover:bg-purple-700" onClick={() => copyToClipboard(accountNumber.match(/GE\d{2}[A-Z]{2}\d{16}/)?.[0] || accountNumber, bank)}>
                              <Copy size={16} className="mr-1"/> {commonT.supplierWalletPage?.copyButton || "Copy"}
                            </Button>
                          </div>
                        </div>
                      ))}
                       {(!siteSettings.bankAccountInfo || Object.keys(siteSettings.bankAccountInfo).length === 0) && (
                        <p className="text-purple-400">{commonT.supplierWalletPage?.noBankDetails || "Bank account details are not configured by the admin yet."}</p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-2">
            <Card className="shadow-xl h-full bg-purple-700/50 backdrop-blur-md text-purple-50">
              <CardHeader>
                <CardTitle className="text-2xl text-purple-200">{t.transactionHistoryTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                {currentUserData.transaction_history && currentUserData.transaction_history.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-purple-600">
                          <TableHead className="text-purple-300">{t.date}</TableHead>
                          <TableHead className="text-purple-300">{t.type}</TableHead>
                          <TableHead className="text-right text-purple-300">{t.amount}</TableHead>
                          <TableHead className="text-purple-300">{t.description}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentUserData.transaction_history
                          .sort((a,b) => new Date(b.date) - new Date(a.date))
                          .map((tx) => (
                            <TableRow key={tx.id} className="border-b border-purple-700/50 hover:bg-purple-600/30">
                              <TableCell className="text-sm text-purple-200">
                                {new Date(tx.date).toLocaleDateString(language, { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </TableCell>
                              <TableCell className="capitalize text-sm text-purple-100">
                                {commonT.transactionTypes?.[tx.type.toLowerCase()] || tx.type.replace(/_/g, ' ')}
                              </TableCell>
                              <TableCell className={`text-right font-medium text-sm ${
                                tx.amount > 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {tx.amount > 0 ? `+₾${tx.amount.toFixed(2)}` : `-₾${Math.abs(tx.amount).toFixed(2)}`}
                              </TableCell>
                              <TableCell className="text-xs text-purple-300">{tx.description}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-purple-300 text-center py-4">{t.noTransactions}</p>
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

export default SupplierWalletPage;