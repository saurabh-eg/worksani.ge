import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Users, Zap, ShieldCheck, Lightbulb, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const teamMemberVariants = {
    hover: { scale: 1.05, boxShadow: "0px 10px 20px rgba(125, 60, 152, 0.2)" }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-700 to-green-500">
      <Header />
      <main className="flex-grow">
        <motion.section 
          className="py-20 md:py-28 bg-gradient-to-r from-purple-700 to-green-500 text-white hero-pattern"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1 
              className="text-4xl md:text-6xl font-extrabold mb-4 text-shadow"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
            >
              About WorkSani.ge
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl max-w-2xl mx-auto text-shadow-sm"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.4 }}
            >
              Connecting Georgia's homes with skilled professionals, one project at a time.
            </motion.p>
          </div>
        </motion.section>

        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <img  
                  alt="Diverse team working on a project" 
                  className="rounded-xl shadow-2xl object-cover w-full h-auto max-h-[500px]"
                 src="https://images.unsplash.com/photo-1580982333389-cca46f167381" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold text-purple-700 mb-6">Our Story</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Welcome to WorkSani.ge – Georgia’s go-to platform for home services. We connect homeowners with trusted local professionals in plumbing, painting, electrical work, renovation, and more. 
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Whether you're looking to fix something small or take on a major project, we make it easy to post your needs, receive competitive bids, and hire the right specialist with confidence. 
                </p>
                <p className="text-gray-700 leading-relaxed">
                  With a growing community of verified suppliers and a simple-to-use interface, WorkSani.ge is designed to save you time, stress, and money.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-purple-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-purple-700 text-center mb-16">Why Choose Us?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Users, title: "Trusted Professionals", description: "Access a curated network of verified and skilled local suppliers for any home service." },
                { icon: Zap, title: "Quick & Easy Bidding", description: "Post your project in minutes and receive competitive bids from interested experts." },
                { icon: ShieldCheck, title: "Secure & Transparent", description: "Communicate safely, manage projects, and ensure fair dealings through our platform." },
                { icon: Lightbulb, title: "Wide Range of Services", description: "From minor repairs to major renovations, find specialists for all your home needs." },
                { icon: Target, title: "Local Focus, Quality Results", description: "We're dedicated to connecting Georgian homeowners with the best local talent." },
                { icon: Target, title: "Support Georgian Economy", description: "By using WorkSani.ge, you are supporting local businesses and professionals in Georgia." }
              ].map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="bg-white p-8 rounded-xl shadow-lg text-center card-hover"
                  variants={featureVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <feature.icon className="w-16 h-16 text-green-500 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-purple-700 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-24 bg-white text-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2 
              className="text-3xl font-bold text-purple-700 mb-6"
              initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once: true}}
            >
              Ready to transform your home or grow your business?
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-600 mb-10 max-w-xl mx-auto"
              initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once: true, delay:0.2}}
            >
              Join the WorkSani.ge community today.
            </motion.p>
            <motion.div 
              className="space-y-4 sm:space-y-0 sm:space-x-6"
              initial={{opacity:0, scale:0.9}} whileInView={{opacity:1, scale:1}} viewport={{once: true, delay:0.4}}
            >
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3">
                <Link to="/register?role=customer">Find a Professional</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 font-semibold px-8 py-3">
                <Link to="/register?role=supplier">Offer Your Services</Link>
              </Button>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;