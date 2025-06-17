import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminSettingsAppearanceTab from './AdminSettingsAppearanceTab';
import AdminSettingsContentTab from './AdminSettingsContentTab';
import AdminSettingsFinancialTab from './AdminSettingsFinancialTab';
import { Palette, FileText, DollarSign } from 'lucide-react';

const AdminSettingsTab = () => {
  return (
    <Tabs defaultValue="appearance" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6 bg-purple-100/70 p-1 rounded-lg">
        <TabsTrigger value="appearance" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white py-2"><Palette size={16} className="mr-1.5 inline-block"/> Appearance</TabsTrigger>
        <TabsTrigger value="content" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white py-2"><FileText size={16} className="mr-1.5 inline-block"/> Content</TabsTrigger>
        <TabsTrigger value="financial" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white py-2"><DollarSign size={16} className="mr-1.5 inline-block"/> Financial</TabsTrigger>
      </TabsList>

      <TabsContent value="appearance">
        <AdminSettingsAppearanceTab />
      </TabsContent>
      <TabsContent value="content">
        <AdminSettingsContentTab />
      </TabsContent>
      <TabsContent value="financial">
        <AdminSettingsFinancialTab />
      </TabsContent>
    </Tabs>
  );
};

export default AdminSettingsTab;