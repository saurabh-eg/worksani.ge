import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataProvider';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import ProjectsPage from '@/pages/ProjectsPage';
import ProjectDetailPage from '@/pages/ProjectDetailPage';
import PostProjectPage from '@/pages/PostProjectPage';
import MessagesPage from '@/pages/MessagesPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminPage from '@/pages/AdminPage';
import SupplierProfilePage from '@/pages/SupplierProfilePage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import SuppliersDirectoryPage from '@/pages/SuppliersDirectoryPage';
import WalletPage from '@/pages/WalletPage';
import SupplierWalletPage from '@/pages/SupplierWalletPage';
import { translations } from '@/lib/translations';
// Supabase client is now managed within AuthContext and DataContext

const DEFAULT_META = {
  title: "WorkSani - Home Services Marketplace",
  description: "Find reliable professionals for your home service needs or offer your expert services. WorkSani connects customers with skilled suppliers for renovations, repairs, cleaning, and more.",
  keywords: "home services, marketplace, professionals, georgia, tbilisi, handyman, plumber, electrician, renovation, repair, cleaning"
};

const PageMetaHandler = () => {
  const location = useLocation();
  const { language, loading: authLoading } = useAuth();
  
  // Ensure translations and t object are initialized even if language is briefly undefined
  const currentLang = language || 'en';
  const currentTranslations = translations[currentLang] || translations.en || {};
  const t = {
    common: {
      ...DEFAULT_META,
      ...(currentTranslations.common || {})
    }
  };

  useEffect(() => {
    if (authLoading) return; // Don't update meta tags until auth (and language) is resolved

    const path = location.pathname;
    let title = t.common.defaultTitle || DEFAULT_META.title;
    let description = t.common.defaultMetaDescription || DEFAULT_META.description;
    let keywords = t.common.defaultKeywords || DEFAULT_META.keywords;

    switch (path) {
      case '/':
        title = t.common.homeTitle || "WorkSani - Your Trusted Home Services Platform";
        description = t.common.homeMetaDescription || DEFAULT_META.description;
        keywords = t.common.homeKeywords || DEFAULT_META.keywords;
        break;
      case '/about':
        title = t.common.aboutTitle || "About WorkSani | Our Mission and Values";
        description = t.common.aboutMetaDescription || "Learn about WorkSani, the platform dedicated to connecting homeowners with skilled service providers.";
        keywords = t.common.aboutKeywords || DEFAULT_META.keywords;
        break;
      case '/contact':
        title = t.common.contactTitle || "Contact WorkSani | Get In Touch With Us";
        description = t.common.contactMetaDescription || "Have questions or need support? Contact the WorkSani team.";
        keywords = t.common.contactKeywords || DEFAULT_META.keywords;
        break;
      case '/projects':
        title = t.common.projectsTitle || "Browse Projects | WorkSani Home Services";
        description = t.common.projectsMetaDescription || "Explore a wide range of home service projects.";
        keywords = t.common.projectsKeywords || DEFAULT_META.keywords;
        break;
      case '/suppliers':
        title = t.common.suppliersTitle || "Find Suppliers | WorkSani Professionals Directory";
        description = t.common.suppliersMetaDescription || "Search our directory of verified and skilled suppliers.";
        keywords = t.common.suppliersKeywords || DEFAULT_META.keywords;
        break;
    }

    if (path.startsWith('/projects/')) {
      title = t.common.projectDetailTitleDefault || "Project Details | WorkSani";
      description = t.common.projectDetailMetaDescriptionDefault || "View the details of this home service project.";
      keywords = t.common.projectDetailKeywordsDefault || DEFAULT_META.keywords;
    } else if (path.startsWith('/suppliers/')) {
      title = t.common.supplierProfileTitleDefault || "Supplier Profile | WorkSani";
      description = t.common.supplierProfileMetaDescriptionDefault || "View the profile of this skilled supplier.";
      keywords = t.common.supplierProfileKeywordsDefault || DEFAULT_META.keywords;
    }

    document.title = title;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);
  }, [location, t, authLoading]); // Added authLoading dependency

  return null;
};

const App = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <DataProvider>
          <PageMetaHandler />
          <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-100 to-gray-200 dark:from-slate-900 dark:to-slate-800 text-foreground">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin-login" element={<AdminLoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/suppliers/:id" element={<SupplierProfilePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/suppliers" element={
                <ProtectedRoute customerOnly>
                  <SuppliersDirectoryPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/wallet" element={
                <ProtectedRoute customerOnly>
                  <WalletPage />
                </ProtectedRoute>
              } />
              <Route path="/supplier-wallet" element={
                <ProtectedRoute supplierOnly>
                  <SupplierWalletPage />
                </ProtectedRoute>
              } />
              <Route path="/projects" element={
                <ProtectedRoute>
                  <ProjectsPage />
                </ProtectedRoute>
              } />
              <Route path="/projects/:id" element={
                <ProtectedRoute>
                  <ProjectDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/post-project" element={
                <ProtectedRoute customerOnly>
                  <PostProjectPage />
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <AdminPage />
                </ProtectedRoute>
              } />
            </Routes>
            <Toaster />
          </div>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;