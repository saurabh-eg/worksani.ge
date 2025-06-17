import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Phone, Mail, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  const iconVariants = {
    hover: { scale: 1.2, rotate: 5, color: "#7D3C98" },
    tap: { scale: 0.9 }
  };

  return (
    <footer className="bg-gray-800 text-gray-300 pt-12 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          <div>
            <p className="text-xl font-semibold text-white mb-4">WorkSani.ge</p>
            <p className="text-sm">Connecting skilled professionals with customers across Georgia. Find reliable help for your home projects, or offer your expert services.</p>
          </div>

          <div>
            <p className="text-lg font-semibold text-white mb-4">Quick Links</p>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-green-300 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-green-300 transition-colors">Contact Us</Link></li>
              <li><Link to="/projects" className="hover:text-green-300 transition-colors">Browse Projects</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-green-300 transition-colors">How It Works</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-lg font-semibold text-white mb-4">Legal</p>
            <ul className="space-y-2">
              <li><Link to="/terms" className="hover:text-green-300 transition-colors">Terms of Use</Link></li>
              <li><Link to="/privacy" className="hover:text-green-300 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <p className="text-lg font-semibold text-white mb-4">Contact Info</p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={20} className="mr-3 mt-1 text-green-400 flex-shrink-0" />
                <span>123 Rustaveli Ave, Tbilisi, Georgia</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-3 text-green-400 flex-shrink-0" />
                <a href="tel:+995555123456" className="hover:text-green-300 transition-colors">+995 555 123 456</a>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-3 text-green-400 flex-shrink-0" />
                <a href="mailto:info@worksani.ge" className="hover:text-green-300 transition-colors">info@worksani.ge</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-700 pt-8">
          <p className="text-sm text-center md:text-left mb-4 md:mb-0">&copy; {new Date().getFullYear()} WorkSani.ge. All rights reserved.</p>
          <div className="flex space-x-5">
            <motion.a href="#" variants={iconVariants} whileHover="hover" whileTap="tap" className="text-gray-400 hover:text-green-300"><Facebook size={22} /></motion.a>
            <motion.a href="#" variants={iconVariants} whileHover="hover" whileTap="tap" className="text-gray-400 hover:text-green-300"><Twitter size={22} /></motion.a>
            <motion.a href="#" variants={iconVariants} whileHover="hover" whileTap="tap" className="text-gray-400 hover:text-green-300"><Instagram size={22} /></motion.a>
            <motion.a href="#" variants={iconVariants} whileHover="hover" whileTap="tap" className="text-gray-400 hover:text-green-300"><Linkedin size={22} /></motion.a>
            <motion.a href="#" variants={iconVariants} whileHover="hover" whileTap="tap" className="text-gray-400 hover:text-green-300"><Youtube size={22} /></motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;