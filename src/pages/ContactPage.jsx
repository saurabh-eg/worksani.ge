import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const ContactPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-slate-50 to-green-50">
      <Header />
      <main className="flex-grow">
        <motion.section
          className="py-20 md:py-28 bg-gradient-to-r from-green-500 to-purple-600 text-white hero-pattern"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1
              className="text-4xl md:text-6xl font-extrabold mb-4"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120, delay: 0.2 }}
            >
              Get In Touch
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl max-w-2xl mx-auto"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120, delay: 0.4 }}
            >
              We're here to help! Reach out to us with any questions or feedback.
            </motion.p>
          </div>
        </motion.section>

        <motion.section
          className="py-16 md:py-24 bg-white"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <motion.div variants={itemVariants}>
                <h2 className="text-3xl font-bold text-purple-700 mb-6">Contact Information</h2>
                <p className="text-gray-700 mb-8 leading-relaxed">
                  Need help or have a question? We're here to support you.
                </p>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <Mail size={24} className="text-purple-500 mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-purple-700">Email</h4>
                      <a href="mailto:support@worksani.ge" className="text-gray-600 hover:text-purple-600 transition-colors">support@worksani.ge</a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone size={24} className="text-purple-500 mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-purple-700">Phone</h4>
                      <a href="tel:+995599123456" className="text-gray-600 hover:text-purple-600 transition-colors">+995 599 123 456</a>
                    </div>
                  </div>
                   <div className="flex items-start">
                    <Clock size={24} className="text-purple-500 mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-purple-700">Business Hours</h4>
                      <p className="text-gray-600">Monday – Saturday, 10:00 AM – 6:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin size={24} className="text-purple-500 mr-4 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-purple-700">Our Office</h4>
                      <p className="text-gray-600">123 Rustaveli Ave, Tbilisi, Georgia</p> {/* Placeholder address */}
                    </div>
                  </div>
                </div>
                 <p className="text-gray-700 mt-8 leading-relaxed">
                  You can also reach us through the feedback form, and we’ll get back to you within 24 hours.
                </p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <ContactForm />
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;