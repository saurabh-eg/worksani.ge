import React, { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { User, Briefcase, Edit, PlusCircle, MessageSquare, DollarSign, BarChart2, Settings, ShieldAlert, Users as UsersIcon, Filter, Search, Eye } from 'lucide-react';
import { translations } from '@/lib/translations';

const DashboardPage = () => {
  const { user, isAdmin, language } = useAuth();
  const { projects, getCustomerProjects, getSupplierProjects, users, getUserById } = useData();
  const navigate = useNavigate();
  const t = translations[language].dashboardPage;

  const userProjects = useMemo(() => {
    if (!user) return [];
    return user.role === 'customer' ? getCustomerProjects(user.id) : getSupplierProjects(user.id);
  }, [user, getCustomerProjects, getSupplierProjects]);

  const openProjectsCount = useMemo(() => userProjects.filter(p => p.status === 'open').length, [userProjects]);
  
  const ongoingProjectsCount = useMemo(() => {
    if (!user) return 0;
    return userProjects.filter(p => p.status === 'In Progress' || p.status === 'awarded' || (user.role === 'supplier' && p.status === 'open' && p.bids?.some(b => b.supplierId === user.id))).length;
  }, [user, userProjects]);

  const completedProjectsCount = useMemo(() => userProjects.filter(p => p.status === 'Completed').length, [userProjects]);

  const currentUserData = useMemo(() => {
    if (!user) return null;
    return getUserById(user.id);
  }, [user, getUserById]);


  if (!user) {
    return (
       <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <ShieldAlert size={48} className="mx-auto text-red-500 mb-4"/>
          <h1 className="text-2xl font-bold text-red-600">{t.notLoggedIn}</h1>
          <p className="text-gray-700 dark:text-gray-300">{t.pleaseLogin}</p>
          <Button onClick={() => navigate('/login')} className="mt-4">{t.loginButton}</Button>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (isAdmin) {
    navigate('/admin', {replace: true}); 
    return null; 
  }
  
  const statCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 }}
  };

  const actionButtonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };
  
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return t.greetingMorning;
    if (hours < 18) return t.greetingAfternoon;
    return t.greetingEvening;
  };

  const customerButtonClass = "bg-primary text-white hover:bg-primary/90";
  const supplierButtonClass = "bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600";
  const commonButtonClass = user.role === 'customer' ? customerButtonClass : supplierButtonClass;


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-100 to-gray-200 dark:from-slate-900 dark:to-slate-800">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">{getGreeting()}, <span className={user.role === 'customer' ? "text-primary" : "text-purple-500 dark:text-purple-400"}>{currentUserData?.name || user.name}!</span></h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">{t.welcomeMessage.replace('{role}', user.role)}. Your User ID: <span className={`font-semibold ${user.role === 'customer' ? 'text-primary' : 'text-purple-500 dark:text-purple-400'}`}>{currentUserData?.numeric_id || user.numeric_id}</span></p>
          {user.role === 'supplier' && currentUserData && currentUserData.balance !== undefined && (
            <p className="text-xl font-semibold text-purple-600 dark:text-purple-400 mt-2">{t.supplierBalance.replace('{balance}', parseFloat(currentUserData.balance || 0).toFixed(2))}</p>
          )}
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
          variants={{ visible: { transition: { staggerChildren: 0.1 }}}}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={statCardVariants}>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-primary dark:bg-slate-800 dark:border-primary">
              <CardHeader className="pb-2">
                <CardDescription className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {user.role === 'customer' ? t.projectsPosted : t.bidsSubmittedWon}
                </CardDescription>
                <CardTitle className="text-4xl font-bold text-primary dark:text-primary-foreground">{userProjects.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.totalProjectsInvolved}</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={statCardVariants}>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-yellow-500 dark:bg-slate-800 dark:border-yellow-400">
              <CardHeader className="pb-2">
                <CardDescription className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {user.role === 'customer' ? t.openProjects : t.ongoingBiddedProjects}
                </CardDescription>
                <CardTitle className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">{user.role === 'customer' ? openProjectsCount : ongoingProjectsCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.activeProjectsAwaitingAction}</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={statCardVariants}>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500 dark:bg-slate-800 dark:border-green-400">
              <CardHeader className="pb-2">
                <CardDescription className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.completedProjects}</CardDescription>
                <CardTitle className="text-4xl font-bold text-green-600 dark:text-green-400">{completedProjectsCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.finishedJobs}</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div 
          className="mb-10"
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">{t.quickActions}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {user.role === 'customer' && (
              <>
                <motion.div variants={actionButtonVariants} whileHover="hover" whileTap="tap">
                  <Button onClick={() => navigate('/post-project')} className={`w-full h-28 text-lg ${customerButtonClass} shadow-md flex flex-col items-center justify-center`}>
                    <PlusCircle size={28} className="mb-2"/> {t.postNewProject}
                  </Button>
                </motion.div>
                <motion.div variants={actionButtonVariants} whileHover="hover" whileTap="tap">
                  <Button onClick={() => navigate('/suppliers')} className={`w-full h-28 text-lg ${customerButtonClass} shadow-md flex flex-col items-center justify-center`}>
                    <Search size={28} className="mb-2"/> {t.findProfessional}
                  </Button>
                </motion.div>
                 <motion.div variants={actionButtonVariants} whileHover="hover" whileTap="tap">
                    <Button onClick={() => navigate('/projects')} className={`w-full h-28 text-lg ${commonButtonClass} shadow-md flex flex-col items-center justify-center`}>
                        <Briefcase size={28} className="mb-2"/> {t.myProjects}
                    </Button>
                </motion.div>
              </>
            )}
            
            {user.role === 'supplier' && (
              <motion.div variants={actionButtonVariants} whileHover="hover" whileTap="tap">
                <Button onClick={() => navigate('/projects')} className={`w-full h-28 text-lg ${commonButtonClass} shadow-md flex flex-col items-center justify-center`}>
                  <Briefcase size={28} className="mb-2"/> {t.browseProjects}
                </Button>
              </motion.div>
            )}
            

            <motion.div variants={actionButtonVariants} whileHover="hover" whileTap="tap">
              <Button onClick={() => navigate('/messages')} className={`w-full h-28 text-lg ${commonButtonClass} shadow-md flex flex-col items-center justify-center`}>
                <MessageSquare size={28} className="mb-2"/> {t.messages}
              </Button>
            </motion.div>
            <motion.div variants={actionButtonVariants} whileHover="hover" whileTap="tap">
              <Button onClick={() => navigate('/profile')} className={`w-full h-28 text-lg ${commonButtonClass} shadow-md flex flex-col items-center justify-center`}>
                <User size={28} className="mb-2"/> {t.editProfile}
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
            initial={{ opacity:0 }}
            animate={{ opacity:1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">{t.recentActivity}</h2>
          <Card className="shadow-lg dark:bg-slate-800">
            <CardContent className="p-6">
              {userProjects.length > 0 ? (
                <ul className="space-y-4">
                  {userProjects.slice(0, 3).map(project => {
                    const customerOfProject = getUserById(project.customerId);
                    return (
                      <li key={project.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                        <div>
                          <Link to={`/projects/${project.id}`} className={`font-medium ${user.role === 'customer' ? 'text-primary' : 'text-purple-500 dark:text-purple-400'} hover:underline`}>{project.title}</Link>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t.statusLabel}: <span className={`font-semibold ${project.status === 'open' ? 'text-yellow-600 dark:text-yellow-400' : project.status === 'Completed' ? 'text-green-600 dark:text-green-400' : (project.status === 'awarded' || project.status === 'In Progress' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300')}`}>{project.status.replace('_', ' ')}</span></p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Project ID: {project.id.substring(0,8)}... Customer ID: {customerOfProject?.numericId || 'N/A'}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${project.id}`)} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-600"><Eye size={14} className="mr-1"/>{t.viewButton}</Button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t.noRecentActivity}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;