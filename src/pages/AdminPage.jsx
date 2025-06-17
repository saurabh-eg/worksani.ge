import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminUsersTab from '@/components/admin/AdminUsersTab';
import AdminProjectsTab from '@/components/admin/AdminProjectsTab';
// AdminMessagesTab might need rework if messages move to Supabase
// import AdminMessagesTab from '@/components/admin/AdminMessagesTab';
import AdminSettingsTab from '@/components/admin/AdminSettingsTab';
// AdminFlaggedMessagesTab might need rework
// import AdminFlaggedMessagesTab from '@/components/admin/AdminFlaggedMessagesTab';
import AdminWalletTab from '@/components/admin/AdminWalletTab';
import AdminSupplierVerificationTab from '@/components/admin/AdminSupplierVerificationTab';
import AdminReviewsTab from '@/components/admin/AdminReviewsTab';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';
import { Users, Briefcase, Settings as SettingsIcon, ShieldAlert, AlertTriangle, Wallet, UserCheck, LayoutDashboard, Star as StarIcon } from 'lucide-react';
import { translations } from '@/lib/translations';

const AdminPage = () => {
  const { isAdmin, language } = useAuth();
  const t = translations[language];
  const { 
    projects, 
    users: allUsersFromData, 
    // messages, // Potentially from Supabase now
    // flaggedMessages: allFlaggedMessages, // Potentially from Supabase now
    deleteProject, 
    updateUser, 
    deleteUser, 
    updateProject, 
    getUserById,
    // markFlaggedMessageReviewed, // Potentially from Supabase now
    changePassword,
    deleteReviewByProjectId,
    loadingData, // from DataContext
  } = useData();
  
  // Local state for managed users/projects might not be needed if useData provides up-to-date Supabase data.
  // const [managedUsers, setManagedUsers] = useState([]);
  // const [managedProjects, setManagedProjects] = useState([]);

  // useEffect(() => {
  //   setManagedUsers(allUsersFromData.filter(u => u.role !== 'admin'));
  // }, [allUsersFromData]);

  // useEffect(() => {
  //   setManagedProjects(projects);
  // }, [projects]);

  const managedUsers = allUsersFromData.filter(u => u.role !== 'admin');
  const managedProjects = projects;
  // const allFlaggedMessages = []; // Placeholder, fetch from Supabase if needed


  if (loadingData && !isAdmin) { // Check loadingData before isAdmin to avoid premature redirect
    return <div>Loading admin data...</div>; // Or a more sophisticated loader
  }


  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <ShieldAlert size={48} className="mx-auto text-red-500 mb-4"/>
          <h1 className="text-2xl font-bold text-red-600">{t.adminPage.accessDeniedTitle}</h1>
          <p className="text-gray-700">{t.adminPage.accessDeniedDesc}</p>
        </main>
        <Footer />
      </div>
    );
  }
  
  const TABS_CONFIG = [
    { value: "dashboard", label: t.adminPage.tabs.dashboard, icon: LayoutDashboard },
    { value: "users", label: t.adminPage.tabs.users, icon: Users },
    { value: "projects", label: t.adminPage.tabs.projects, icon: Briefcase },
    { value: "reviews", label: t.adminPage.tabs.reviews, icon: StarIcon },
    { value: "supplierVerification", label: t.adminPage.tabs.supplierVerification, icon: UserCheck },
    // { value: "flaggedMessages", label: t.adminPage.tabs.flaggedMessages, icon: AlertTriangle, count: allFlaggedMessages.filter(fm => fm.status !== 'reviewed').length },
    { value: "walletControls", label: t.adminPage.tabs.walletControls, icon: Wallet },
    { value: "settings", label: t.adminPage.tabs.settings, icon: SettingsIcon },
  ];


  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{t.adminPage.title}</h1>
          <p className="text-lg text-gray-600 mb-8">{t.adminPage.description}</p>
        </motion.div>

        {loadingData ? (
          <div className="text-center py-10">Loading admin panel data...</div>
        ) : (
          <Tabs defaultValue="dashboard" className="w-full">
            <div className="overflow-x-auto pb-2 mb-6">
              <TabsList className="inline-flex w-max bg-purple-100 p-2 rounded-lg">
                {TABS_CONFIG.map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-3 relative text-xs sm:text-sm whitespace-nowrap">
                    <tab.icon className="mr-1.5 h-4 w-4 sm:h-5 sm:w-5 inline"/> {tab.label}
                    {tab.count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {tab.count}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            <TabsContent value="dashboard">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-white rounded-lg shadow">
                <h2 className="text-2xl font-semibold text-gray-700">Welcome, Admin!</h2>
                <p className="text-gray-600 mt-2">This is your central hub for managing WorkSani.ge. Use the tabs above to navigate through different sections.</p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg shadow">
                    <h3 className="font-semibold text-purple-700">Total Users</h3>
                    <p className="text-3xl font-bold text-purple-600">{managedUsers.length}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg shadow">
                    <h3 className="font-semibold text-green-700">Total Projects</h3>
                    <p className="text-3xl font-bold text-green-600">{managedProjects.length}</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg shadow">
                    <h3 className="font-semibold text-yellow-700">Pending Verifications</h3>
                    <p className="text-3xl font-bold text-yellow-600">{allUsersFromData.filter(u => u.role === 'supplier' && u.verification_status === 'pending').length}</p>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="users">
              <AdminUsersTab 
                users={managedUsers} 
                onUpdateUser={updateUser} 
                onDeleteUser={deleteUser}
                setManagedUsers={() => {}} // No longer needed if usersData is directly from context
                onChangePassword={changePassword}
              />
            </TabsContent>
            <TabsContent value="projects">
              <AdminProjectsTab 
                projects={managedProjects} 
                onUpdateProject={updateProject} 
                onDeleteProject={deleteProject} 
                getUserById={getUserById}
                setManagedProjects={() => {}} // No longer needed
              />
            </TabsContent>
            <TabsContent value="reviews">
              <AdminReviewsTab
                projects={managedProjects} // Assuming reviews are nested or fetched with projects
                users={allUsersFromData}
                onUpdateProject={updateProject} // This might need to be onUpdateReview specifically
                onDeleteReview={deleteReviewByProjectId}
              />
            </TabsContent>
            <TabsContent value="supplierVerification">
              <AdminSupplierVerificationTab />
            </TabsContent>
            {/* <TabsContent value="flaggedMessages">
              <AdminFlaggedMessagesTab 
                flaggedMessages={allFlaggedMessages}
                getUserById={getUserById}
                onMarkReviewed={markFlaggedMessageReviewed}
              />
            </TabsContent> */}
            <TabsContent value="walletControls">
              <AdminWalletTab />
            </TabsContent>
            <TabsContent value="settings">
              <AdminSettingsTab />
            </TabsContent>
          </Tabs>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminPage;