import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const PrivacyPage = () => {
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
              Privacy Policy
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl max-w-2xl mx-auto"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120, delay: 0.4 }}
            >
              Your privacy is important to us at WorkSani.ge.
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
              <div className="flex items-center text-green-600 mb-6">
                <ShieldCheck size={32} className="mr-3" />
                <h2 className="text-3xl font-bold text-green-700 m-0">Our Commitment to Your Privacy</h2>
              </div>

              <p>WorkSani.ge ("us", "we", or "our") operates the worksani.ge website (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
              <p>We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy.</p>

              <h3>1. Information Collection and Use</h3>
              <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>
              <h4>Types of Data Collected:</h4>
              <ul>
                <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to: Email address, First name and last name, Phone number, Address, Cookies and Usage Data.</li>
                <li><strong>Usage Data:</strong> We may also collect information on how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</li>
                <li><strong>Tracking & Cookies Data:</strong> We use cookies and similar tracking technologies to track the activity on our Service and we hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.</li>
              </ul>

              <h3>2. Use of Data</h3>
              <p>WorkSani.ge uses the collected data for various purposes:</p>
              <ul>
                <li>To provide and maintain our Service</li>
                <li>To notify you about changes to our Service</li>
                <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information so that we can improve our Service</li>
                <li>To monitor the usage of our Service</li>
                <li>To detect, prevent and address technical issues</li>
              </ul>

              <h3>3. Data Storage (LocalStorage)</h3>
              <p>WorkSani.ge currently uses browser localStorage for data persistence during the development and prototyping phase. This means that user data, project details, messages, and other application-specific information are stored directly in your web browser on your device.</p>
              <p><strong>Data Stored:</strong> This includes your user profile (name, email, role, etc., excluding passwords which are handled notionally for login simulation), projects you post or bid on, messages exchanged, and site preferences.</p>
              <p><strong>Security:</strong> Data in localStorage is sandboxed to the worksani.ge domain and is not accessible by other websites. However, it is accessible to anyone with physical or remote access to your browser on your device. We recommend using the platform on trusted devices and networks. Passwords are not stored in plaintext; login is simulated against hashed or mock credentials.</p>
              <p><strong>Data Control:</strong> You can clear your browser's localStorage for this site at any time through your browser settings to remove all stored data. Note that this will log you out and remove all your projects and messages from your current browser session.</p>
              <p><strong>Future Data Storage:</strong> We plan to migrate to a secure cloud-based database solution (such as Supabase) for production to ensure better data security, reliability, and scalability. Users will be notified of this change and any implications for their data.</p>

              <h3>4. Disclosure of Data</h3>
              <p>WorkSani.ge may disclose your Personal Data in the good faith belief that such action is necessary to:</p>
              <ul>
                <li>To comply with a legal obligation</li>
                <li>To protect and defend the rights or property of WorkSani.ge</li>
                <li>To prevent or investigate possible wrongdoing in connection with the Service</li>
                <li>To protect the personal safety of users of the Service or the public</li>
                <li>To protect against legal liability</li>
              </ul>

              <h3>5. Security of Data</h3>
              <p>The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data (especially once migrated from localStorage), we cannot guarantee its absolute security during the current localStorage-based phase.</p>

              <h3>6. Your Data Protection Rights</h3>
              <p>WorkSani.ge aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.</p>
              <p>If you wish to be informed about what Personal Data we hold about you and if you want it to be removed from our systems (currently from localStorage via browser controls, later from our database), please contact us. You can manage your profile information directly within your account settings on the platform.</p>

              <h3>7. Changes to This Privacy Policy</h3>
              <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the "effective date" at the top of this Privacy Policy.</p>
              
              <h3>8. Contact Us</h3>
              <p>If you have any questions about this Privacy Policy, please contact us by email: support@worksani.ge</p>
              <p><em>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</em></p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPage;