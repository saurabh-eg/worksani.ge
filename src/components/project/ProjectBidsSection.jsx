import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Send, Star, MessageSquare, CheckCircle, ShieldAlert, Loader2, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { translations } from '@/lib/translations';

const ProjectBidsSection = ({ project, user, users, onBidSubmit, onAcceptBid }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const navigate = useNavigate();
  const { language } = useAuth();
  const { siteSettings } = useData();
  const t = translations[language] || translations.en;
  const bidsT = t.projectBidsSection || {};
  const messagesPageT = t.messagesPage || {};

  const projectOwner = user && project.customerId === user.id;
  const canBid = user && user.role === 'supplier' && project.status === 'open' && !project.bids?.find(b => b.supplierId === user.id);
  const alreadyBid = user && user.role === 'supplier' && project.bids?.find(b => b.supplierId === user.id);

  const bidFee = parseFloat(siteSettings?.bidFee || 0);
  const userBidBalance = parseFloat(user?.bid_balance || 0);
  const canAffordBid = userBidBalance >= bidFee;

  const handleInternalBidSubmit = async (e) => {
    e.preventDefault();
    if (parseFloat(bidAmount) <= 0 || !bidMessage.trim()) {
      return;
    }
     if (!canAffordBid && bidFee > 0) {
      // This case should ideally be prevented by disabling the button, but as a safeguard:
      // Toast is handled by the button text or a separate toast in onBidSubmit
      return;
    }
    setIsSubmittingBid(true);
    try {
      await onBidSubmit({
        amount: parseFloat(bidAmount),
        message: bidMessage,
      });
      setBidAmount('');
      setBidMessage('');
    } catch (error) {
      // Error is handled by onBidSubmit's toast
    } finally {
      setIsSubmittingBid(false);
    }
  };
  
  let bidSubmitButtonText = bidsT.submitButton || 'Submit Bid';
  if (bidFee > 0) {
    if (canAffordBid) {
      bidSubmitButtonText = (bidsT.submitButtonWithFee || 'Submit Bid (Fee: ₾{fee})').replace('{fee}', bidFee.toFixed(2));
    } else {
      bidSubmitButtonText = (bidsT.insufficientBalanceButtonWithFee || 'Insufficient Balance (Fee: ₾{fee})').replace('{fee}', bidFee.toFixed(2));
    }
  }


  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
      {canBid && (
        <Card className="shadow-lg border-green-200 dark:border-green-700 mb-8 bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-2xl text-green-700 dark:text-green-400">{bidsT.placeYourBid || 'Place Your Bid'}</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
              {(bidsT.currentBalance || 'Your current bid balance: ₾{balance}.').replace('{balance}', userBidBalance.toFixed(2))}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInternalBidSubmit} className="space-y-4">
              <div>
                <Label htmlFor="bid-amount" className="text-gray-700 dark:text-gray-300">{bidsT.bidAmountLabel || 'Bid Amount (₾)'}</Label>
                <Input id="bid-amount" type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} placeholder={bidsT.bidAmountPlaceholder || "Enter your bid amount"} className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white" required />
              </div>
              <div>
                <Label htmlFor="bid-message" className="text-gray-700 dark:text-gray-300">{bidsT.messageToCustomerLabel || 'Message to Customer'}</Label>
                <Textarea id="bid-message" value={bidMessage} onChange={(e) => setBidMessage(e.target.value)} placeholder={bidsT.messageToCustomerPlaceholder || "Explain why you're a good fit"} className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white" rows={3} required />
              </div>
              <Button type="submit" disabled={isSubmittingBid || (!canAffordBid && bidFee > 0)} className="w-full bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700" aria-label={canAffordBid ? 'Submit Bid' : 'Insufficient Bid Balance'}>
                {isSubmittingBid ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send size={16} className="mr-2" />}
                {isSubmittingBid ? (bidsT.submittingButton || 'Submitting...') : bidSubmitButtonText}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {alreadyBid && project.status === 'open' && (
        <div className="mt-8 p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-center text-purple-700 dark:text-purple-300">
          <CheckCircle size={24} className="inline-block mr-2" /> {bidsT.alreadyBidMessage || 'You have already placed a bid on this project.'}
        </div>
      )}

      {project.bids && project.bids.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-purple-700 dark:text-purple-400">{(bidsT.bidsReceivedTitle || 'Bids Received ({count})').replace('{count}', project.bids.length)}</h2>
          <div className="space-y-4">
            {project.bids.sort((a, b) => new Date(b.date) - new Date(a.date)).map(bid => {
              const supplier = users?.find(u => u.id === bid.supplierId);
              return (
                <Card key={bid.id} className={`shadow-md border-l-4 ${project.awardedBidId === bid.id ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-purple-300 dark:border-purple-600 bg-white dark:bg-slate-800'}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3 border-2 border-purple-300 dark:border-purple-500">
                          <AvatarImage src={bid.supplierProfilePhoto || supplier?.profilePhoto || `https://avatar.vercel.sh/${supplier?.email}.png?size=40`} alt={bid.supplierName} />
                          <AvatarFallback className="bg-purple-200 text-purple-700 dark:bg-purple-700 dark:text-purple-200">
                            {bid.supplierName ? bid.supplierName.substring(0, 2).toUpperCase() : <UserCircle />}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link to={`/suppliers/${bid.supplierId}`} className="text-lg font-semibold text-purple-600 hover:underline dark:text-purple-400 dark:hover:text-purple-300">{bid.supplierName}</Link>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(bid.date).toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">₾{bid.amount.toFixed(2)}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300">{bid.message}</p>
                  </CardContent>
                  {projectOwner && project.status === 'open' && (
                    <CardFooter className="bg-gray-50 dark:bg-slate-700/50 p-3">
                      <div className="flex justify-end space-x-3 w-full">
                        <Button variant="outline" size="sm" onClick={() => navigate('/messages', { state: { prefillChatWith: bid.supplierId, prefillSubject: `${messagesPageT.projectSubjectPrefix || 'Regarding Project:'} ${project.title}` } })} className="dark:text-purple-300 dark:border-purple-500 dark:hover:bg-purple-700/30">
                          <MessageSquare size={16} className="mr-2" /> {bidsT.chatButton || 'Chat'}
                        </Button>
                        <Button onClick={() => onAcceptBid(bid.id)} size="sm" className="bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700">
                          <Star size={16} className="mr-2" /> {bidsT.acceptBidButton || 'Accept Bid'}
                        </Button>
                      </div>
                    </CardFooter>
                  )}
                  {project.awardedBidId === bid.id && (
                    <div className="p-3 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 font-semibold text-sm flex items-center">
                      <CheckCircle size={16} className="mr-2" /> {bidsT.bidAcceptedMessage || 'This bid was accepted.'}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {(!project.bids || project.bids.length === 0) && project.status === 'open' && (
        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg text-center text-yellow-700 dark:text-yellow-300">
          <ShieldAlert size={24} className="inline-block mr-2" /> 
          {projectOwner ? (bidsT.noBidsCustomerMessage || 'Your project is live! Waiting for suppliers to place bids.') : (bidsT.noBidsSupplierMessage || 'No bids have been placed on this project yet.')}
        </div>
      )}
    </motion.div>
  );
};

export default ProjectBidsSection;