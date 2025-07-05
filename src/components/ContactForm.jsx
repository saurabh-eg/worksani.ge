import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const ContactForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('https://rvqfqneuvwggcnsmpcpw.supabase.co/functions/v1/contact-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (response.ok) {
        toast({ title: 'Message Sent!', description: "Thank you for contacting us. We'll get back to you shortly." });
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        toast({ title: 'Error', description: 'Failed to send message. Please try again later.' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to send message. Please try again later.' });
    }
    setIsSubmitting(false);
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-6 bg-white p-8 rounded-xl shadow-2xl border border-purple-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-purple-700 font-medium">Full Name</Label>
          <Input 
            id="name" 
            type="text" 
            placeholder="Your Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            className="focus:border-purple-500 focus:ring-purple-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-purple-700 font-medium">Email Address</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="your.email@example.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className="focus:border-purple-500 focus:ring-purple-500"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject" className="text-purple-700 font-medium">Subject</Label>
        <Input 
          id="subject" 
          type="text" 
          placeholder="Regarding..." 
          value={subject} 
          onChange={(e) => setSubject(e.target.value)} 
          required 
          className="focus:border-purple-500 focus:ring-purple-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message" className="text-purple-700 font-medium">Message</Label>
        <Textarea 
          id="message" 
          placeholder="Your message here..." 
          rows={5} 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          required 
          className="focus:border-purple-500 focus:ring-purple-500"
        />
      </div>
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600 text-white font-semibold py-3 text-lg transition-all duration-300 ease-in-out transform hover:scale-105" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...
          </>
        ) : (
          <>
            <Send size={20} className="mr-2" /> Send Message
          </>
        )}
      </Button>
    </motion.form>
  );
};

export default ContactForm;