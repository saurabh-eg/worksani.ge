import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

const TermsPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-slate-50 to-green-50">
      <Header />
      <main className="flex-grow">
        <motion.section
          className="py-20 md:py-28 bg-gradient-to-r from-purple-600 to-green-500 text-white hero-pattern"
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
              Terms of Use
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl max-w-2xl mx-auto"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120, delay: 0.4 }}
            >
              Please read these terms carefully before using WorkSani.ge.
            </motion.p>
          </div>
        </motion.section>

        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="max-w-3xl mx-auto prose lg:prose-xl text-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center text-purple-600 mb-6">
                <FileText size={32} className="mr-3" />
                <h2 className="text-3xl font-bold text-purple-700 m-0">Our Terms and Conditions</h2>
              </div>

              <p>Welcome to WorkSani.ge! These terms and conditions outline the rules and regulations for the use of WorkSani.ge's Website, located at worksani.ge.</p>
              <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use WorkSani.ge if you do not agree to take all of the terms and conditions stated on this page.</p>

              <h3>1. Definitions</h3>
              <p>The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and all Agreements: "Client", "You" and "Your" refers to you, the person log on this website and compliant to the Company’s terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us", refers to our Company. "Party", "Parties", or "Us", refers to both the Client and ourselves. All terms refer to the offer, acceptance and consideration of payment necessary to undertake the process of our assistance to the Client in the most appropriate manner for the express purpose of meeting the Client’s needs in respect of provision of the Company’s stated services, in accordance with and subject to, prevailing law of Georgia.</p>
              
              <h3>2. Use of the Website</h3>
              <p>You are granted a non-exclusive, non-transferable, revocable license to access and use WorkSani.ge strictly in accordance with these terms of use. As a condition of your use of the Site, you warrant to WorkSani.ge that you will not use the Site for any purpose that is unlawful or prohibited by these Terms.</p>

              <h3>3. User Accounts</h3>
              <p>If you create an account on the Website, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account and any other actions taken in connection with it. You must immediately notify WorkSani.ge of any unauthorized uses of your account or any other breaches of security.</p>

              <h3>4. Service Provision</h3>
              <p>WorkSani.ge provides a platform for connecting users seeking home services (Customers) with users providing home services (Suppliers). WorkSani.ge is not a party to any agreement or transaction between Customers and Suppliers. We do not guarantee the quality, safety, or legality of the services provided or the truth or accuracy of listings.</p>

              <h3>5. Bidding and Payments</h3>
              <p>Suppliers may bid on projects posted by Customers. Customers are responsible for selecting a Supplier and agreeing on terms. Any payment transactions are handled directly between Customers and Suppliers, unless WorkSani.ge explicitly offers an integrated payment solution. WorkSani.ge may charge fees for certain services, such as bid placement or premium features, which will be clearly communicated.</p>

              <h3>6. Content</h3>
              <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.</p>

              <h3>7. Intellectual Property</h3>
              <p>The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of WorkSani.ge and its licensors. The Service is protected by copyright, trademark, and other laws of both Georgia and foreign countries.</p>

              <h3>8. Limitation of Liability</h3>
              <p>In no event shall WorkSani.ge, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.</p>
              
              <h3>9. Changes to Terms</h3>
              <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>

              <h3>10. Governing Law</h3>
              <p>These Terms shall be governed and construed in accordance with the laws of Georgia, without regard to its conflict of law provisions.</p>

              <p>If you have any questions about these Terms, please contact us.</p>
              <p><em>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</em></p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;