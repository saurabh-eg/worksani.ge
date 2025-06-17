import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, UserPlus, Users, Briefcase, Search, BadgeDollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { translations } from '@/lib/translations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminWalletTab = () => {
  const { users, projects, topUpUserBalance, getUserByEmail } = useData();
  const { language } = useAuth();
  const t = translations[language].adminPage.wallet;
  const { toast } = useToast();

  const [targetCustomerEmail, setTargetCustomerEmail] = useState('');
  const [amountCustomer, setAmountCustomer] = useState('');
  const [targetSupplierEmail, setTargetSupplierEmail] = useState('');
  const [amountSupplier, setAmountSupplier] = useState('');

  const [searchTermCustomers, setSearchTermCustomers] = useState('');
  const [searchTermSuppliers, setSearchTermSuppliers] = useState('');
  const [searchTermProjects, setSearchTermProjects] = useState('');

  const handleAddBalance = (e, userRole) => {
    e.preventDefault();
    const emailToUse = userRole === 'customer' ? targetCustomerEmail : targetSupplierEmail;
    const amountToUse = userRole === 'customer' ? amountCustomer : amountSupplier;

    const targetUser = getUserByEmail(emailToUse);
    if (!targetUser) {
      toast({ title: "Error", description: `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} not found with this email.`, variant: "destructive" });
      return;
    }
    if (targetUser.role !== userRole) {
      toast({ title: "Error", description: `This email does not belong to a ${userRole} account.`, variant: "destructive" });
      return;
    }
    const numAmount = parseFloat(amountToUse);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ title: "Error", description: "Please enter a valid positive amount.", variant: "destructive" });
      return;
    }
    topUpUserBalance(targetUser.id, numAmount, 'deposit', `Admin manual top-up (${userRole})`);
    
    if (userRole === 'customer') {
      setTargetCustomerEmail('');
      setAmountCustomer('');
    } else {
      setTargetSupplierEmail('');
      setAmountSupplier('');
    }
  };

  const customersWithWallets = useMemo(() => {
    return users
      .filter(u => u.role === 'customer' && u.walletBalance !== undefined)
      .filter(u => u.name.toLowerCase().includes(searchTermCustomers.toLowerCase()) || u.email.toLowerCase().includes(searchTermCustomers.toLowerCase()));
  }, [users, searchTermCustomers]);

  const suppliersWithBalances = useMemo(() => {
    return users
      .filter(u => u.role === 'supplier' && u.balance !== undefined)
      .filter(u => u.name.toLowerCase().includes(searchTermSuppliers.toLowerCase()) || u.email.toLowerCase().includes(searchTermSuppliers.toLowerCase()));
  }, [users, searchTermSuppliers]);

  const projectsWithPaymentStatus = useMemo(() => {
    return projects.filter(p => 
        p.title.toLowerCase().includes(searchTermProjects.toLowerCase()) || 
        p.id.toLowerCase().includes(searchTermProjects.toLowerCase())
    );
  }, [projects, searchTermProjects]);


  return (
    <Tabs defaultValue="customer_wallet" className="w-full space-y-8">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="customer_wallet">Customer Wallet Management</TabsTrigger>
        <TabsTrigger value="supplier_wallet">Supplier Wallet Management</TabsTrigger>
      </TabsList>

      <TabsContent value="customer_wallet">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><UserPlus className="mr-2 text-primary" /> {t.addBalanceTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleAddBalance(e, 'customer')} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerEmail">{t.userEmailLabel || "User Email (Customer)"}</Label>
                  <Input id="customerEmail" type="email" value={targetCustomerEmail} onChange={(e) => setTargetCustomerEmail(e.target.value)} placeholder="customer@example.com" required />
                </div>
                <div>
                  <Label htmlFor="amountCustomer">{t.amountLabel}</Label>
                  <Input id="amountCustomer" type="number" value={amountCustomer} onChange={(e) => setAmountCustomer(e.target.value)} placeholder="50.00" required />
                </div>
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary-focus text-primary-foreground">
                <DollarSign className="mr-2 h-4 w-4" /> {t.addButton || "Add Balance"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center"><Users className="mr-2 text-primary" /> {t.customerBalancesTitle}</CardTitle>
            <Input 
              type="text" 
              placeholder="Search customers by name or email..." 
              value={searchTermCustomers}
              onChange={(e) => setSearchTermCustomers(e.target.value)}
              className="mt-2 max-w-sm"
            />
          </CardHeader>
          <CardContent>
            {customersWithWallets.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Balance (₾)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customersWithWallets.map(customer => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell className="text-right font-medium">{(customer.walletBalance || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500">{t.noCustomers}</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="supplier_wallet">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><BadgeDollarSign className="mr-2 text-secondary" /> {t.addBalanceSupplierTitle || "Add Balance to Supplier Wallet"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleAddBalance(e, 'supplier')} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplierEmail">{t.userEmailLabel || "User Email (Supplier)"}</Label>
                  <Input id="supplierEmail" type="email" value={targetSupplierEmail} onChange={(e) => setTargetSupplierEmail(e.target.value)} placeholder="supplier@example.com" required />
                </div>
                <div>
                  <Label htmlFor="amountSupplier">{t.amountLabel}</Label>
                  <Input id="amountSupplier" type="number" value={amountSupplier} onChange={(e) => setAmountSupplier(e.target.value)} placeholder="50.00" required />
                </div>
              </div>
              <Button type="submit" className="bg-secondary hover:bg-secondary-focus text-secondary-foreground">
                <DollarSign className="mr-2 h-4 w-4" /> {t.addButton || "Add Balance"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center"><Users className="mr-2 text-secondary" /> {t.supplierBalancesTitle || "Supplier Balances"}</CardTitle>
            <Input 
              type="text" 
              placeholder="Search suppliers by name or email..." 
              value={searchTermSuppliers}
              onChange={(e) => setSearchTermSuppliers(e.target.value)}
              className="mt-2 max-w-sm"
            />
          </CardHeader>
          <CardContent>
            {suppliersWithBalances.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Balance (₾)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliersWithBalances.map(supplier => (
                    <TableRow key={supplier.id}>
                      <TableCell>{supplier.name}</TableCell>
                      <TableCell>{supplier.email}</TableCell>
                      <TableCell className="text-right font-medium">{(supplier.balance || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500">{t.noSuppliers || "No suppliers found."}</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center"><Briefcase className="mr-2 text-primary" /> {t.projectPaymentsTitle}</CardTitle>
           <Input 
            type="text" 
            placeholder="Search projects by title or ID..." 
            value={searchTermProjects}
            onChange={(e) => setSearchTermProjects(e.target.value)}
            className="mt-2 max-w-sm"
          />
        </CardHeader>
        <CardContent>
          {projectsWithPaymentStatus.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Title</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectsWithPaymentStatus.map(project => {
                  const customer = users.find(u => u.id === project.customerId);
                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.title}</TableCell>
                      <TableCell>{customer ? customer.name : 'N/A'}</TableCell>
                      <TableCell className="capitalize">{project.status}</TableCell>
                      <TableCell className={`capitalize font-semibold ${project.paymentStatus === 'paid' ? 'text-green-600' : project.paymentStatus === 'unpaid' ? 'text-red-600' : 'text-gray-500'}`}>
                        {project.paymentStatus === 'paid' ? t.statusPaid : project.paymentStatus === 'unpaid' ? t.statusUnpaid : t.notApplicable}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-500">{t.noProjects}</p>
          )}
        </CardContent>
      </Card>
    </Tabs>
  );
};

export default AdminWalletTab;