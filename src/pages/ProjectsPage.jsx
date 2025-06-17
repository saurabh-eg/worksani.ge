import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Briefcase, Search, PlusCircle, Eye, Filter, ListFilter } from 'lucide-react';
import { translations } from '@/lib/translations';

const projectCategories = [
  "all", "plumbing", "painting", "electrical", "carpentry", "cleaning", "gardening", "moving", "repairs", "hvac", "flooring", "roofing", "other"
];

  const ProjectsPage = () => {
    const { user, language } = useAuth();
    const { projects, getCustomerProjects, getSupplierProjects, getUserById } = useData();
    const navigate = useNavigate();
    const t = translations[language] || translations.en;

    // Show toast if redirected after project deletion
    React.useEffect(() => {
      if (window.history.state && window.history.state.usr && window.history.state.usr.projectDeleted) {
        toast({ title: "Project Deleted", description: "The project has been deleted successfully." });
        // Clear the state so toast doesn't show again on refresh
        window.history.replaceState({}, document.title);
      }
    }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [supplierProjectView, setSupplierProjectView] = useState('available');

  // Debug: Log supplierProjectView changes
  React.useEffect(() => {
    console.log('supplierProjectView changed:', supplierProjectView);
  }, [supplierProjectView]);

  const userProjects = useMemo(() => {
    if (!user) return projects || [];
    if (user.role === 'customer') return getCustomerProjects(user.id) || [];
    
    const allSupplierInvolvedProjects = getSupplierProjects(user.id) || [];

    if (supplierProjectView === 'my_bids_active') {
      return allSupplierInvolvedProjects.filter(p => 
        p.bids?.some(b => b.supplierId === user.id && (p.status === 'open' || p.status === 'awarded' || p.status === 'In Progress')) ||
        (p.awardedSupplierId === user.id && (p.status === 'awarded' || p.status === 'In Progress'))
      );
    } else if (supplierProjectView === 'completed_by_me') {
      return allSupplierInvolvedProjects.filter(p => p.awardedSupplierId === user.id && p.status === 'Completed');
    }
    
    // Fix: For 'available' view, show all open projects regardless of bids or awardedSupplierId
    return (projects || []).filter(p => p.status === 'open');

  }, [user, projects, getCustomerProjects, getSupplierProjects, supplierProjectView]);

  const filteredProjects = useMemo(() => {
    return (userProjects || []).filter(project => {
      const searchTermLower = searchTerm.toLowerCase();
      const titleMatch = project.title?.toLowerCase().includes(searchTermLower);
      const descriptionMatch = project.description?.toLowerCase().includes(searchTermLower);
      const categoryMatch = categoryFilter === 'all' || project.category === categoryFilter;
      return (titleMatch || descriptionMatch) && categoryMatch;
    });
  }, [userProjects, searchTerm, categoryFilter]);

  const getProjectCardColor = (status) => {
    switch (status) {
      case 'open': return 'border-yellow-500 dark:border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'In Progress': return 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'awarded': return 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20';
      case 'Completed': return 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20';
      default: return 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/20';
    }
  };
  
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'open': return 'secondary';
      case 'In Progress': return 'default';
      case 'awarded': return 'default';
      case 'Completed': return 'success';
      default: return 'outline';
    }
  };
  
  const projectsPageTranslations = t.projectsPage || {};
  const commonTranslations = t.common || {};
  const categoriesTranslations = t.categories || {};

  const pageTitle = user?.role === 'supplier' 
    ? (supplierProjectView === 'available' ? projectsPageTranslations.availableProjects : supplierProjectView === 'my_bids_active' ? projectsPageTranslations.myActiveBids : projectsPageTranslations.myCompletedProjects)
    : projectsPageTranslations.myProjectsTitle;
    
  const getLocalizedStatus = (statusKey) => {
    if (!statusKey) return '';
    const key = statusKey.charAt(0).toLowerCase() + statusKey.slice(1).replace(/\s+/g, '');
    return (commonTranslations.status && commonTranslations.status[key]) ? commonTranslations.status[key] : statusKey;
  };


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-100 to-gray-200 dark:from-slate-900 dark:to-slate-800">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-center mb-10"
        >
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4 sm:mb-0">{pageTitle || 'Projects'}</h1>
          {user?.role === 'customer' && (
            <Button onClick={() => navigate('/post-project')} className="bg-primary hover:bg-primary-focus text-white dark:bg-primary dark:hover:bg-primary/90">
              <PlusCircle size={20} className="mr-2" /> {projectsPageTranslations.postNewProjectButton || 'Post New Project'}
            </Button>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-purple-100 dark:border-purple-800"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Search size={16} className="inline mr-1 text-purple-600 dark:text-purple-400" /> {projectsPageTranslations.searchLabel || 'Search'}
              </label>
              <Input
                id="search"
                type="text"
                placeholder={projectsPageTranslations.searchPlaceholder || 'Keywords...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
            <div className="md:col-span-1">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Filter size={16} className="inline mr-1 text-purple-600 dark:text-purple-400" /> {projectsPageTranslations.categoryFilterLabel || 'Category'}
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category" className="w-full focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                  <SelectValue placeholder={projectsPageTranslations.allCategoriesPlaceholder || 'All Categories'} />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-700 dark:text-white">
                  {projectCategories.map(cat => (
                    <SelectItem key={cat} value={cat} className="capitalize dark:focus:bg-slate-600">{cat === 'all' ? (commonTranslations.allCategories || 'All Categories') : (categoriesTranslations[cat] || cat)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {user?.role === 'supplier' && (
              <div className="md:col-span-1">
                <label htmlFor="supplierView" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <ListFilter size={16} className="inline mr-1 text-purple-600 dark:text-purple-400" /> {projectsPageTranslations.viewOptionsLabel || 'View Options'}
                </label>
                <Select value={supplierProjectView} onValueChange={setSupplierProjectView}>
                  <SelectTrigger id="supplierView" className="w-full focus:ring-purple-500 focus:border-purple-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-700 dark:text-white">
                    <SelectItem value="available" className="dark:focus:bg-slate-600">{projectsPageTranslations.availableProjects || 'Available Projects'}</SelectItem>
                    <SelectItem value="my_bids_active" className="dark:focus:bg-slate-600">{projectsPageTranslations.myActiveBids || 'My Active Bids'}</SelectItem>
                    <SelectItem value="completed_by_me" className="dark:focus:bg-slate-600">{projectsPageTranslations.myCompletedProjects || 'My Completed Projects'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </motion.div>

        {filteredProjects.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={{ visible: { transition: { staggerChildren: 0.07 }}}}
            initial="hidden"
            animate="visible"
          >
            {filteredProjects.map(project => {
              const customer = user?.role === 'supplier' ? getUserById(project.customerId) : null;
              return (
                <motion.div key={project.id} variants={{hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 }}}>
                  <Card className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${getProjectCardColor(project.status)} overflow-hidden flex flex-col h-full dark:bg-slate-800`}>
                    <CardHeader className="pb-3 bg-white dark:bg-slate-800 border-b dark:border-slate-700">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100 hover:text-primary dark:hover:text-primary-light transition-colors">
                          <Link to={`/projects/${project.id}`}>{project.title}</Link>
                        </CardTitle>
                        <Badge variant={getStatusBadgeVariant(project.status)} className="capitalize whitespace-nowrap">
                          {getLocalizedStatus(project.status)}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                        {projectsPageTranslations.postedOn || 'Posted on'}: {new Date(project.postedDate).toLocaleDateString()}
                        {customer && ` ${projectsPageTranslations.by || 'by'} ${customer.name} (ID: ${customer.numericId})`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 pb-3 flex-grow">
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-3">{project.description}</p>
                      <>
                        <p><span className="font-medium text-gray-700 dark:text-gray-300">{projectsPageTranslations.categoryLabel || 'Category'}:</span> <Badge variant="outline" className="capitalize text-purple-700 border-purple-300 dark:text-purple-300 dark:border-purple-600">{categoriesTranslations[project.category] || project.category}</Badge></p>
                        <p><span className="font-medium text-gray-700 dark:text-gray-300">{projectsPageTranslations.budgetLabel || 'Budget'}:</span> <span className="font-semibold text-green-600 dark:text-green-400">₾{project.budget}</span></p>
                        <p><span className="font-medium text-gray-700 dark:text-gray-300">{projectsPageTranslations.locationLabel || 'Location'}:</span> {project.location}</p>
                      </>
                    </CardContent>
                    <CardFooter className="bg-white dark:bg-slate-800 pt-3 pb-4 border-t dark:border-slate-700">
                      <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white transition-colors dark:text-primary-light dark:border-primary-light dark:hover:bg-primary-light dark:hover:text-primary">
                        <Link to={`/projects/${project.id}`}>
                          <Eye size={16} className="mr-2" /> {projectsPageTranslations.viewDetailsButton || 'View Details'}
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Briefcase size={64} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-300">{projectsPageTranslations.noProjectsFound || 'No projects found.'}</p>
            <p className="text-gray-500 dark:text-gray-400">{projectsPageTranslations.adjustFilters || 'Try adjusting your search or filters.'}</p>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProjectsPage;