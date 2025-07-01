import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Users, Search, Star, MapPin, Filter, ArrowRight, ShieldQuestion } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { translations } from '@/lib/translations';


const SuppliersDirectoryPage = () => {
  const { users, projects } = useData();
  const { language } = useAuth();
  const t = translations[language];
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');

  const suppliers = useMemo(() => {
    return users.filter(user => user.role === 'supplier');
  }, [users]);

  const availableCategories = useMemo(() => {
    const cats = new Set(suppliers.map(s => s.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [suppliers]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = (supplier.name?.toLowerCase() || '').includes(searchLower);
      const companyNameMatch = (supplier.companyName?.toLowerCase() || '').includes(searchLower);
      const bioMatch = (supplier.bio?.toLowerCase() || '').includes(searchLower);

      const categoryMatch = categoryFilter === 'all' || (supplier.category || '').toLowerCase() === categoryFilter.toLowerCase();

      return (nameMatch || companyNameMatch || bioMatch) && categoryMatch;
    }).sort((a, b) => (a.companyName || a.name).localeCompare(b.companyName || b.name));
  }, [suppliers, searchTerm, categoryFilter, locationFilter]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleRequestDetails = (supplierName) => {
    toast({
      title: t.suppliersPage.toastRequestSentTitle,
      description: `${t.suppliersPage.toastRequestSentDesc} ${supplierName}. ${t.suppliersPage.adminWillContact}`,
      duration: 5000,
    });
    // Here you might want to send an actual request to admin via DataContext if implemented
    // For now, a toast notification will suffice.
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-slate-50 to-green-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-center mb-8"
        >
          <h1 className="text-4xl font-bold text-purple-700 flex items-center mb-4 sm:mb-0">
            <Users size={36} className="mr-3 text-green-500" />
            {t.suppliersPage.title}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-purple-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="search-supplier" className="text-sm font-medium text-purple-700">{t.suppliersPage.searchLabel}</Label>
              <div className="relative">
                <Input
                  id="search-supplier"
                  type="text"
                  placeholder={t.suppliersPage.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1 pl-10 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div>
              <Label htmlFor="category-supplier" className="text-sm font-medium text-purple-700">{t.suppliersPage.categoryLabel}</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category-supplier" className="mt-1 border-purple-300 focus:border-purple-500 focus:ring-purple-500">
                  <SelectValue placeholder={t.suppliersPage.allCategoriesPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map(cat => (
                    <SelectItem key={cat} value={cat} className="capitalize">{cat === 'all' ? t.suppliersPage.allCategoriesPlaceholder : cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location-supplier" className="text-sm font-medium text-purple-700">{t.suppliersPage.locationLabel}</Label>
              <div className="relative">
                <Input
                  id="location-supplier"
                  type="text"
                  placeholder={t.suppliersPage.locationPlaceholder}
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="mt-1 pl-10 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                  disabled
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {filteredSuppliers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSuppliers.map((supplier, index) => {
              const supplierReviews = useMemo(() => {
                return projects
                  .filter(
                    (p) =>
                      p.awardedSupplierId === supplier.id &&
                      p.review &&
                      (p.review.supplierId === supplier.id || p.review.supplier_id === supplier.id) &&
                      (p.review.status === 'approved' || p.review.status === 'Approved')
                  )
                  .map((p) => p.review);
              }, [projects, supplier.id]);

              const averageRating = supplierReviews.length
                ? supplierReviews.reduce((acc, review) => acc + (review.rating_overall ?? review.ratings?.overall ?? 0), 0) / supplierReviews.length
                : 0;
              return (
                <motion.div
                  key={supplier.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Card className="h-full flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-purple-200 hover:border-purple-400">
                    <CardHeader className="items-center text-center p-6 bg-gradient-to-br from-purple-100 to-green-100">
                      <Avatar className="w-24 h-24 mb-3 border-4 border-white shadow-md">
                        <AvatarImage src={supplier.profile_photo_url || `https://avatar.vercel.sh/${supplier.email}.png?size=96`} alt={supplier.companyName || supplier.name} />
                        <AvatarFallback className="text-2xl bg-purple-200 text-purple-700">{supplier.name?.charAt(0) || 'S'}</AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-xl font-semibold text-purple-700 hover:text-purple-900 transition-colors">
                        <Link to={`/suppliers/${supplier.id}`}>{supplier.companyName || supplier.name}</Link>
                      </CardTitle>
                      {supplier.category && <Badge variant="secondary" className="mt-1 bg-green-500 text-white">{supplier.category}</Badge>}
                    </CardHeader>
                    <CardContent className="flex-grow p-4 space-y-2 text-sm">
                      <p className="text-gray-600 line-clamp-3">{supplier.bio || t.suppliersPage.defaultBio}</p>
                      <div className="flex items-center text-yellow-500">
                        {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < Math.round(averageRating) ? "fill-current" : "text-gray-300"} />)}
                        <span className="ml-1.5 text-xs text-gray-500">({supplier.reviews?.length || 0} {t.suppliersPage.reviewsText})</span>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50/50 p-4 border-t border-purple-100 flex flex-col space-y-2">
                      <Link to={`/suppliers/${supplier.id}`} className="w-full">
                        <Button variant="outline" className="w-full text-purple-600 border-purple-500 hover:bg-purple-50 hover:text-purple-700">
                          {t.suppliersPage.viewProfileButton} <ArrowRight size={16} className="ml-2" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full text-blue-600 border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => handleRequestDetails(supplier.companyName || supplier.name)}
                      >
                        <ShieldQuestion size={16} className="mr-2" /> {t.suppliersPage.requestDetailsButton}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <Filter size={64} className="mx-auto text-purple-300 mb-4" />
            <p className="text-xl text-gray-600">{t.suppliersPage.noMatchTitle}</p>
            <p className="text-sm text-gray-400">{t.suppliersPage.noMatchDesc}</p>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SuppliersDirectoryPage;