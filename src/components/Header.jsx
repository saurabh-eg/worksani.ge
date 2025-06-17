import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, Briefcase, Users, LogOut, UserCircle, ShieldCheck, Globe, Wallet, LayoutDashboard, Menu, X, MessageSquare, Info, FileText, LogIn, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { translations } from '@/lib/translations';

const Header = () => {
  const { user, logout, isAdmin, isCustomer, isSupplier, language, changeLanguage } = useAuth();
  const navigate = useNavigate();
  const t = translations[language];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navItemVariants = {
    hover: { scale: 1.05, color: "var(--color-secondary)" },
    tap: { scale: 0.95 }
  };
  
  const navLinkStyle = "text-base lg:text-lg hover:text-secondary transition-colors duration-300 flex items-center py-2";
  const iconStyle = "mr-2 h-5 w-5"; 
  const mobileIconStyle = "mr-3 h-6 w-6";

  const mobileMenuVariants = {
    hidden: { opacity: 0, x: "-100%" },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeInOut" } },
    exit: { opacity: 0, x: "-100%", transition: { duration: 0.3, ease: "easeInOut" } }
  };

  const MobileMenuItem = ({ to, children, onClick, isDestructive = false }) => (
    <Link 
      to={to} 
      className={`mobile-menu-item flex items-center justify-start px-4 py-3 text-lg ${isDestructive ? 'text-red-300 hover:text-red-200 hover:bg-red-500/20' : 'text-primary-foreground hover:bg-white/10'}`} 
      onClick={onClick}
    >
      {children}
    </Link>
  );
  
  const MobileMenuSectionTitle = ({ title }) => (
    <h3 className="px-4 py-2 text-sm font-semibold text-primary-foreground/70 uppercase tracking-wider">{title}</h3>
  );


  return (
    <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50 hero-pattern" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary, white)'}}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center text-2xl font-bold hover:text-gray-200 transition-colors">
            WorkSani.ge
          </Link>
          
          <nav className="hidden md:flex items-center space-x-5 lg:space-x-7">
            <motion.div variants={navItemVariants} whileHover="hover" whileTap="tap">
              <Link to="/" className={navLinkStyle}><Home className={iconStyle}/> {t.header.home}</Link>
            </motion.div>
            <motion.div variants={navItemVariants} whileHover="hover" whileTap="tap">
              <Link to="/projects" className={navLinkStyle}><Briefcase className={iconStyle}/> {t.header.projects}</Link>
            </motion.div>
            {user && isCustomer && (
              <motion.div variants={navItemVariants} whileHover="hover" whileTap="tap">
                <Link to="/suppliers" className={navLinkStyle}><Users className={iconStyle}/> {t.header.suppliers}</Link>
              </motion.div>
            )}
            {!user && (
              <>
                <motion.div variants={navItemVariants} whileHover="hover" whileTap="tap">
                  <Link to="/contact" className={navLinkStyle}>{t.header.contact}</Link>
                </motion.div>
                <motion.div variants={navItemVariants} whileHover="hover" whileTap="tap">
                  <Link to="/about" className={navLinkStyle}>{t.header.about}</Link>
                </motion.div>
              </>
            )}
          </nav>

          <div className="hidden md:flex items-center space-x-2 sm:space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-focus hover:text-primary-foreground-focus">
                  <Globe size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLanguage('en')}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('ka')}>ქართული</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('ru')}>Русский</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <>
                {isAdmin && (
                  <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                    <Button onClick={() => navigate('/admin')} variant="ghost" className="text-primary-foreground hover:bg-primary-focus hover:text-primary-foreground-focus flex items-center">
                      <ShieldCheck className={iconStyle}/> {t.header.admin}
                    </Button>
                  </motion.div>
                )}
                {!isAdmin && (
                  <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                    <Button onClick={() => navigate('/dashboard')} variant="ghost" className="text-primary-foreground hover:bg-primary-focus hover:text-primary-foreground-focus flex items-center">
                      <LayoutDashboard className={iconStyle}/> {t.header.dashboard}
                    </Button>
                  </motion.div>
                )}
                {isCustomer && (
                  <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                    <Button onClick={() => navigate('/wallet')} variant="ghost" className="text-primary-foreground hover:bg-primary-focus hover:text-primary-foreground-focus flex items-center">
                      <Wallet className={iconStyle}/> {t.header.wallet}
                    </Button>
                  </motion.div>
                )}
                {isSupplier && (
                  <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                    <Button onClick={() => navigate('/supplier-wallet')} variant="ghost" className="text-primary-foreground hover:bg-primary-focus hover:text-primary-foreground-focus flex items-center">
                      <Wallet className={iconStyle}/> {t.header.wallet}
                    </Button>
                  </motion.div>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-primary-foreground hover:bg-primary-focus hover:text-primary-foreground-focus flex items-center">
                      <UserCircle className={iconStyle}/> {user.name} 
                      {isSupplier && user.balance !== undefined && ` (Bid: ₾${parseFloat(user.balance || 0).toFixed(2)})`}
                      {isCustomer && user.walletBalance !== undefined && ` (Wallet: ₾${parseFloat(user.walletBalance || 0).toFixed(2)})`}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!isAdmin && <DropdownMenuItem onClick={() => navigate('/dashboard')}>{t.header.dashboard}</DropdownMenuItem>}
                    <DropdownMenuItem onClick={() => navigate('/profile')}>{t.header.profile}</DropdownMenuItem>
                    {!isAdmin && <DropdownMenuItem onClick={() => navigate('/messages')}>{t.header.messages}</DropdownMenuItem>}
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 focus:bg-red-50">
                      <LogOut className={`${iconStyle} text-red-500`}/> {t.header.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                  <Button onClick={() => navigate('/login')} variant="ghost" className="text-primary-foreground hover:bg-primary-focus hover:text-primary-foreground-focus">{t.header.login}</Button>
                </motion.div>
                <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                  <Button onClick={() => navigate('/register')} className="bg-secondary hover:bg-secondary-focus text-primary font-semibold">{t.header.register}</Button>
                </motion.div>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-focus hover:text-primary-foreground-focus mr-2">
                  <Globe size={24} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLanguage('en')}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('ka')}>ქართული</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('ru')}>Русский</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="text-primary-foreground hover:bg-primary-focus hover:text-primary-foreground-focus">
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mobile-menu md:hidden"
          >
            <div className="flex justify-between w-full items-center mb-6 px-4 pt-2">
              <Link to="/" className="text-2xl font-bold text-primary-foreground" onClick={toggleMobileMenu}>
                WorkSani.ge
              </Link>
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="text-primary-foreground">
                <X size={32} />
              </Button>
            </div>

            <div className="w-full overflow-y-auto flex-grow">
              <MobileMenuSectionTitle title={t.header.navigation || "Navigation"} />
              <MobileMenuItem to="/" onClick={toggleMobileMenu}><Home className={mobileIconStyle}/> {t.header.home}</MobileMenuItem>
              <MobileMenuItem to="/projects" onClick={toggleMobileMenu}><Briefcase className={mobileIconStyle}/> {t.header.projects}</MobileMenuItem>
              
              {user ? (
                <>
                  {isCustomer && <MobileMenuItem to="/suppliers" onClick={toggleMobileMenu}><Users className={mobileIconStyle}/> {t.header.suppliers}</MobileMenuItem>}
                  
                  <MobileMenuSectionTitle title={t.header.account || "My Account"} />
                  {isAdmin && <MobileMenuItem to="/admin" onClick={toggleMobileMenu}><ShieldCheck className={mobileIconStyle}/> {t.header.admin}</MobileMenuItem>}
                  {!isAdmin && <MobileMenuItem to="/dashboard" onClick={toggleMobileMenu}><LayoutDashboard className={mobileIconStyle}/> {t.header.dashboard}</MobileMenuItem>}
                  {!isAdmin && <MobileMenuItem to="/profile" onClick={toggleMobileMenu}><UserCircle className={mobileIconStyle}/> {t.header.profile}</MobileMenuItem>}
                  {!isAdmin && <MobileMenuItem to="/messages" onClick={toggleMobileMenu}><MessageSquare className={mobileIconStyle}/> {t.header.messages}</MobileMenuItem>}
                  
                  {(isCustomer || isSupplier) && <MobileMenuSectionTitle title={t.header.wallet || "Wallet"} />}
                  {isCustomer && <MobileMenuItem to="/wallet" onClick={toggleMobileMenu}><Wallet className={mobileIconStyle}/> {t.header.wallet}</MobileMenuItem>}
                  {isSupplier && <MobileMenuItem to="/supplier-wallet" onClick={toggleMobileMenu}><Wallet className={mobileIconStyle}/> {t.header.wallet}</MobileMenuItem>}
                  
                  <div className="mt-6 pt-4 border-t border-primary-foreground/20">
                    <MobileMenuItem to="#" onClick={handleLogout} isDestructive={true}><LogOut className={mobileIconStyle}/> {t.header.logout}</MobileMenuItem>
                  </div>
                </>
              ) : (
                <>
                  <MobileMenuSectionTitle title={t.header.more || "More"} />
                  <MobileMenuItem to="/contact" onClick={toggleMobileMenu}><MessageSquare className={mobileIconStyle}/> {t.header.contact}</MobileMenuItem>
                  <MobileMenuItem to="/about" onClick={toggleMobileMenu}><Info className={mobileIconStyle}/> {t.header.about}</MobileMenuItem>
                  
                  <MobileMenuSectionTitle title={t.header.authentication || "Authentication"} />
                  <MobileMenuItem to="/login" onClick={toggleMobileMenu}><LogIn className={mobileIconStyle}/> {t.header.login}</MobileMenuItem>
                  <MobileMenuItem to="/register" onClick={toggleMobileMenu}><UserPlus className={mobileIconStyle}/> {t.header.register}</MobileMenuItem>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;