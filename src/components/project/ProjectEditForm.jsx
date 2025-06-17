import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const ProjectEditForm = ({ editedProject, setEditedProject, onEditSubmit, onCancelEdit }) => {
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProject(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // In a real app, you'd upload the file and get a URL.
        // For now, storing the base64 data URL or a temporary blob URL.
        setEditedProject(prev => ({ ...prev, photos: [{ name: file.name, url: reader.result }] }));
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
      <Card className="shadow-lg border-green-200">
        <CardHeader>
          <CardTitle className="text-2xl text-green-700">Edit Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-title" className="text-gray-700">Title</Label>
              <Input id="edit-title" name="title" value={editedProject.title} onChange={handleInputChange} className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="edit-description" className="text-gray-700">Description</Label>
              <Textarea id="edit-description" name="description" value={editedProject.description} onChange={handleInputChange} className="mt-1" rows={4} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category" className="text-gray-700">Category</Label>
                <Input id="edit-category" name="category" value={editedProject.category} onChange={handleInputChange} className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="edit-location" className="text-gray-700">Location</Label>
                <Input id="edit-location" name="location" value={editedProject.location} onChange={handleInputChange} className="mt-1" required />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-budget" className="text-gray-700">Budget (₾)</Label>
              <Input id="edit-budget" name="budget" type="number" value={editedProject.budget} onChange={(e) => setEditedProject({...editedProject, budget: parseFloat(e.target.value)})} className="mt-1" required />
            </div>
            <div>
                <Label htmlFor="edit-photos" className="text-gray-700">Project Photos</Label>
                <Input id="edit-photos" name="photos" type="file" accept="image/*" onChange={handleFileChange} className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200" multiple/>
                {editedProject.photos && editedProject.photos.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                        {editedProject.photos.map((photo, index) => (
                           <img-replace key={index} src={photo.url} alt={photo.name || `Project photo ${index + 1}`} className="h-24 w-full object-cover rounded"/>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={onCancelEdit}>Cancel</Button>
              <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProjectEditForm;