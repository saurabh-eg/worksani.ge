import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { CheckCircle, Users, Wrench, MessageSquare, Search, Edit, DollarSign, Star, UserCircle, Mail, Phone, Send } from 'lucide-react';

import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();

  const { users, projects } = useData();
  const { toast } = useToast();
  const { user, isSupplier, isCustomer, isAuthenticated } = useAuth();

  const [contactForm, setContactForm] = React.useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmittingContact, setIsSubmittingContact] = React.useState(false);

  const handleContactFormChange = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    try {
      const response = await fetch('https://rvqfqneuvwggcnsmpcpw.supabase.co/functions/v1/contact-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (response.ok) {
        toast({ title: 'Message Sent!', description: "Thank you for contacting us. We'll get back to you shortly." });
        setContactForm({ name: '', email: '', subject: '', message: '' });
      } else {
        toast({ title: 'Error', description: 'Failed to send message. Please try again later.' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to send message. Please try again later.' });
    }
    setIsSubmittingContact(false);
  };


  const featuredSuppliers = users.filter(u => u.role === 'supplier').slice(0, 3);

  // For each featured supplier, calculate reviews and average rating from projects
  const getSupplierReviews = (supplierId) => {
    return projects
      .filter(
        (p) =>
          p.awardedSupplierId === supplierId &&
          p.review &&
          (p.review.supplierId === supplierId || p.review.supplier_id === supplierId) &&
          (p.review.status === 'approved' || p.review.status === 'Approved')
      )
      .map((p) => p.review);
  };

  const getAverageRating = (reviews) => {
    if (!reviews.length) return 0;
    return (
      reviews.reduce((acc, review) => acc + (review.rating_overall ?? review.ratings?.overall ?? 0), 0) / reviews.length
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  const cardHoverEffect = {
    hover: {
      scale: 1.03,
      boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
      transition: { duration: 0.3 }
    }
  };

  // Example: Get top 3 testimonials from projects with reviews
  // const testimonials = projects
  //   .filter(p => p.review && p.review.comment)
  //   .map(p => ({
  //     id: p.id,
  //     reviewerName: p.review.reviewerName || "Anonymous",
  //     rating: p.review.rating_overall || p.review.ratings?.overall || 0,
  //     comment: p.review.comment,
  //     projectTitle: p.title || "General Feedback"
  //   }))
  //   .slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <Header />
      <main className="flex-grow">
        <motion.section
          className="relative py-20 md:py-32 text-white hero-pattern"
          style={{ background: 'linear-gradient(135deg, #7D3C98 0%, #A9DFBF 30%, #7D3C98 70%, #A9DFBF 100%)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-black opacity-30"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.h1
              className="text-4xl md:text-6xl font-extrabold mb-6 text-shadow"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
            >
              Find Reliable Home Services in Georgia
            </motion.h1>
            <motion.p
              className="text-lg md:text-2xl mb-10 max-w-3xl mx-auto text-shadow"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 120, delay: 0.4 }}
            >
              Connect with trusted professionals for plumbing, painting, repairs, and more.
            </motion.p>
            <motion.div
              className="space-y-4 sm:space-y-0 sm:space-x-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 120, delay: 0.6 }}
            >
              <Button
                size="lg"
                className={`bg-white text-purple-700 hover:bg-gray-100 font-bold text-lg px-10 py-6 w-full sm:w-auto transform hover:scale-105 transition-transform duration-300 ${isSupplier ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => {
                  if (isSupplier) {
                    toast({ title: "Sorry😔 You are a Service Provider", description: "Suppliers cannot request services from this Account." });
                  } else if (isCustomer && isAuthenticated) {
                    navigate('/dashboard');
                  } else {
                    navigate('/register?role=customer');
                  }
                }}
                // Don't disable, just show toast if supplier
                // disabled={isSupplier}
              >
                I Need a Service
              </Button>
              <Button
                size="lg"
                variant="outline"
                className={`border-white text-purple-700 hover:bg-white hover:text-purple-700 font-bold text-lg px-10 py-6 w-full sm:w-auto transform hover:scale-105 transition-transform duration-300 ${isCustomer ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => {
                  if (isCustomer) {
                    toast({ title: "Sorry😔 You are a Customer", description: "Customers cannot become service providers from this account." });
                  } else if (isSupplier && isAuthenticated) {
                    navigate('/projects');
                  } else {
                    navigate('/register?role=supplier');
                  }
                }}
                // Don't disable, just show toast if customer
                // disabled={isCustomer}
              >
                I'm a Service Provider
              </Button>
            </motion.div>
          </div>
        </motion.section>

        <section id="how-it-works" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-center mb-4 text-purple-700"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants}
            >
              How WorkSani.ge Works
            </motion.h2>
            <motion.p
              className="text-center text-gray-600 mb-12 md:mb-16 max-w-2xl mx-auto"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants}
            >
              Getting your home projects done or finding work has never been easier.
            </motion.p>
            <motion.div
              className="grid md:grid-cols-2 gap-10"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants}
            >
              <motion.div variants={itemVariants} className="p-6 rounded-xl shadow-lg bg-gradient-to-br from-purple-50 to-green-50 border border-purple-200">
                <h3 className="text-2xl font-semibold mb-4 text-purple-700">For Customers</h3>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex items-start"><Edit size={24} className="text-green-500 mr-3 mt-1 flex-shrink-0" /> <span><span className="font-semibold">Post Your Project:</span> Describe what you need, set your budget, and add photos.</span></li>
                  <li className="flex items-start"><DollarSign size={24} className="text-green-500 mr-3 mt-1 flex-shrink-0" /> <span><span className="font-semibold">Receive Bids:</span> Verified suppliers will send you their best offers.</span></li>
                  <li className="flex items-start"><MessageSquare size={24} className="text-green-500 mr-3 mt-1 flex-shrink-0" /> <span><span className="font-semibold">Chat & Hire:</span> Discuss details with suppliers and choose the best fit.</span></li>
                  <li className="flex items-start"><Star size={24} className="text-green-500 mr-3 mt-1 flex-shrink-0" /> <span><span className="font-semibold">Review & Rate:</span> Share your experience after the job is done.</span></li>
                </ol>
              </motion.div>
              <motion.div variants={itemVariants} className="p-6 rounded-xl shadow-lg bg-gradient-to-br from-green-50 to-purple-50 border border-green-200">
                <h3 className="text-2xl font-semibold mb-4 text-green-700">For Suppliers</h3>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex items-start"><UserCircle size={24} className="text-purple-500 mr-3 mt-1 flex-shrink-0" /> <span><span className="font-semibold">Create Profile:</span> Showcase your skills, experience, and past projects.</span></li>
                  <li className="flex items-start"><Search size={24} className="text-purple-500 mr-3 mt-1 flex-shrink-0" /> <span><span className="font-semibold">Find Projects:</span> Browse relevant job postings in your area.</span></li>
                  <li className="flex items-start"><DollarSign size={24} className="text-purple-500 mr-3 mt-1 flex-shrink-0" /> <span><span className="font-semibold">Place Bids:</span> Offer competitive prices for jobs you can do.</span></li>
                  <li className="flex items-start"><CheckCircle size={24} className="text-purple-500 mr-3 mt-1 flex-shrink-0" /> <span><span className="font-semibold">Get Hired & Paid:</span> Complete jobs and build your reputation.</span></li>
                </ol>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {featuredSuppliers.length > 0 && (
          <section className="py-16 md:py-24 bg-purple-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-center mb-12 text-purple-700"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants}
              >
                Featured Suppliers
              </motion.h2>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants}
              >
                {featuredSuppliers.map((supplier) => {
                  const supplierReviews = getSupplierReviews(supplier.id);
                  const averageRating = getAverageRating(supplierReviews);
                  return (
                    <motion.div key={supplier.id} variants={itemVariants} whileHover="hover" {...cardHoverEffect}>
                      <Card className="overflow-hidden card-hover h-full flex flex-col">
                        <CardHeader className="bg-gradient-to-r from-purple-600 to-green-500 p-0">
                          <div className="h-40 w-full flex items-center justify-center">
                            {supplier.profile_photo_url ? (
                              <img src={supplier.profile_photo_url} alt={supplier.companyName || supplier.name} className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg" />
                            ) : (
                              <UserCircle size={80} className="text-white opacity-80" />
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="p-6 flex-grow flex flex-col">
                          <CardTitle className="text-xl font-semibold text-purple-700 mb-1">{supplier.companyName || supplier.name}</CardTitle>
                          <CardDescription className="text-gray-600 text-sm mb-3 flex-grow">{supplier.bio?.substring(0, 100) || "Experienced professional."}{supplier.bio && supplier.bio.length > 100 ? '...' : ''}</CardDescription>
                          <div className="flex items-center text-yellow-500 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={18} fill="currentColor" className={i < Math.round(averageRating) ? 'text-yellow-500' : 'text-gray-300'} />
                            ))}
                            <span className="ml-2 text-sm text-gray-500">({supplierReviews.length} reviews)</span>
                          </div>
                          <Button onClick={() => navigate(`/suppliers/${supplier.id}`)} className="w-full mt-auto bg-green-500 hover:bg-green-600 text-white">View Profile</Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </section>
        )}

        {/* {testimonials.length > 0 && (
          <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-center mb-12 text-purple-700"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants}
              >
                What Our Users Say
              </motion.h2>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants}
              >
                {testimonials.map((testimonial) => (
                  <motion.div key={testimonial.id} variants={itemVariants} whileHover="hover" {...cardHoverEffect}>
                    <Card className="h-full flex flex-col p-6 bg-gradient-to-br from-purple-50 to-green-50 card-hover">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center text-xl font-bold mr-4">
                          {testimonial.reviewerName ? testimonial.reviewerName.charAt(0) : 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-purple-700">{testimonial.reviewerName || "Anonymous User"}</p>
                          <div className="flex text-yellow-500">
                            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" className={i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'} />)}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 italic flex-grow">"{testimonial.comment}"</p>
                      <p className="text-sm text-gray-500 mt-3">- For project: {testimonial.projectTitle || "General Feedback"}</p>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )} */}

        <section id="about-us" className="py-16 md:py-24 bg-purple-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-center mb-8 text-purple-700"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants}
            >
              About Us
            </motion.h2>
            <motion.p
              className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto text-center"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants}
            >
              Welcome to WorkSani.ge – Georgia’s go-to platform for home services. We connect homeowners with trusted local professionals in plumbing, painting, electrical work, renovation, and more. Whether you're looking to fix something small or take on a major project, we make it easy to post your needs, receive competitive bids, and hire the right specialist with confidence. With a growing community of verified suppliers and a simple-to-use interface, WorkSani.ge is designed to save you time, stress, and money.
            </motion.p>
          </div>
        </section>

        <section id="contact-us" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-center mb-12 text-purple-700"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants}
            >
              Contact Us
            </motion.h2>
            <motion.div
              className="grid md:grid-cols-2 gap-12 items-start"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants}
            >
              <motion.div variants={itemVariants} className="space-y-6">
                <p className="text-lg text-gray-700">Need help or have a question? We're here to support you.</p>
                <div className="space-y-3">
                  <p className="flex items-center text-gray-700"><Mail size={20} className="mr-3 text-purple-500" /> Email: <a href="mailto:support@worksani.ge" className="ml-1 text-purple-600 hover:underline">support@worksani.ge</a></p>
                  <p className="flex items-center text-gray-700"><Phone size={20} className="mr-3 text-purple-500" /> Phone: <a href="tel:+995599123456" className="ml-1 text-purple-600 hover:underline">+995 599 123 456</a></p>
                  <p className="text-gray-600">Business Hours: Monday – Saturday, 10:00 AM – 6:00 PM</p>
                </div>
                <p className="text-gray-600">You can also reach us through the feedback form, and we’ll get back to you within 24 hours.</p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="shadow-lg border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-purple-700">Send us a Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="contact-name" className="text-gray-700">Name</Label>
                        <Input id="contact-name" name="name" value={contactForm.name} onChange={handleContactFormChange} placeholder="Your Name" required className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="contact-email" className="text-gray-700">Email</Label>
                        <Input id="contact-email" name="email" type="email" value={contactForm.email} onChange={handleContactFormChange} placeholder="Your Email" required className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="contact-subject" className="text-gray-700">Subject</Label>
                        <Input id="contact-subject" name="subject" value={contactForm.subject} onChange={handleContactFormChange} placeholder="Subject of your message" required className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="contact-message" className="text-gray-700">Message</Label>
                        <Textarea id="contact-message" name="message" value={contactForm.message} onChange={handleContactFormChange} placeholder="Your message..." required rows={4} className="mt-1" />
                      </div>
                      <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={isSubmittingContact}>
                        {isSubmittingContact ? "Sending..." : <><Send size={16} className="mr-2" /> Send Message</>}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-purple-600 text-white hero-pattern">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-6"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants}
            >
              Ready to Get Started?
            </motion.h2>
            <motion.p
              className="text-lg md:text-xl mb-8 max-w-xl mx-auto"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants}
            >
              Join WorkSani.ge today and experience a new way to manage home services or grow your business.
            </motion.p>
            <motion.div
              className="space-y-4 sm:space-y-0 sm:space-x-6"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants}
            >
              <Button
                size="lg"
                className="bg-green-400 text-purple-700 hover:bg-green-500 font-bold text-lg px-10 py-6 w-full sm:w-auto transform hover:scale-105 transition-transform duration-300"
                onClick={() => {
                  if (isCustomer && isAuthenticated) {
                    navigate('/suppliers'); // redirect to suppliers directory
                  } else if (isSupplier && isAuthenticated) {
                    toast({ title: "You are a Service Provider", description: "You cannot request services from this account." });
                  } else {
                    navigate('/register?role=customer');
                  }
                }}
              >
                Find a Service Provider
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-purple-700 hover:bg-white hover:text-purple-700 font-bold text-lg px-10 py-6 w-full sm:w-auto transform hover:scale-105 transition-transform duration-300"
                onClick={() => {
                  if (isSupplier && isAuthenticated) {
                    navigate('/projects'); // supplier dashboard/projects
                  } else if (isCustomer && isAuthenticated) {
                    toast({ title: "You are a Customer", description: "Customers cannot become suppliers from this account." });
                  } else {
                    navigate('/register?role=supplier');
                  }
                }}
              >
                Become a Supplier
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;