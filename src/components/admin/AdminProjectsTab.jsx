import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Edit, Trash2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminProjectsTab = ({ projects, onUpdateProject, onDeleteProject, getUserById, setManagedProjects }) => {
  const [searchTermProjects, setSearchTermProjects] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const { toast } = useToast();

  const handleProjectEdit = (project) => {
    setEditingProject({ ...project });
  };

  const handleProjectSave = () => {
    if (!editingProject) return;
    onUpdateProject(editingProject);
    setManagedProjects(prev => prev.map(p => p.id === editingProject.id ? editingProject : p));
    toast({ title: "Project Updated", description: `Project "${editingProject.title}" has been updated.`, variant: "default" });
    setEditingProject(null);
  };

  const handleProjectDelete = (projectId, projectTitle) => {
     if (window.confirm(`Are you sure you want to delete project "${projectTitle}"? This action cannot be undone.`)) {
      onDeleteProject(projectId);
      setManagedProjects(prev => prev.filter(p => p.id !== projectId));
      toast({ title: "Project Deleted", description: `Project "${projectTitle}" has been deleted.`, variant: "destructive" });
    }
  };

  const filteredProjects = projects.filter(project =>
    (project.title?.toLowerCase() || '').includes(searchTermProjects.toLowerCase()) ||
    (project.description?.toLowerCase() || '').includes(searchTermProjects.toLowerCase())
  );

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };
  
  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible">
       <Card>
        <CardHeader>
          <CardTitle>All Projects ({filteredProjects.length})</CardTitle>
          <CardDescription>View, edit, or delete projects.</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search projects by title or description..."
              value={searchTermProjects}
              onChange={(e) => setSearchTermProjects(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Budget (₾)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => {
                const projectPoster = getUserById(project.customerId);
                return (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      <Link to={`/projects/${project.id}`} className="hover:underline text-purple-600">{project.title}</Link>
                    </TableCell>
                    <TableCell className="capitalize">{project.category}</TableCell>
                    <TableCell>{projectPoster?.name || 'N/A'}</TableCell>
                    <TableCell className="capitalize">{project.status?.replace('_', ' ') || 'Unknown'}</TableCell>
                    <TableCell>₾{project.budget}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog open={editingProject?.id === project.id} onOpenChange={(isOpen) => !isOpen && setEditingProject(null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleProjectEdit(project)} className="text-blue-600 border-blue-600 hover:bg-blue-50">
                            <Edit className="h-4 w-4"/>
                          </Button>
                        </DialogTrigger>
                        {editingProject && editingProject.id === project.id && (
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Edit Project: {editingProject.title}</DialogTitle>
                              <DialogDescription>Modify project details below.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="projectTitleAdmin" className="text-right">Title</Label>
                                <Input id="projectTitleAdmin" value={editingProject.title} onChange={(e) => setEditingProject({...editingProject, title: e.target.value})} className="col-span-3" />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="projectDescriptionAdmin" className="text-right">Description</Label>
                                <Textarea id="projectDescriptionAdmin" value={editingProject.description} onChange={(e) => setEditingProject({...editingProject, description: e.target.value})} className="col-span-3" />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="projectStatusAdmin" className="text-right">Status</Label>
                                <select id="projectStatusAdmin" value={editingProject.status} onChange={(e) => setEditingProject({...editingProject, status: e.target.value})} className="col-span-3 border border-gray-300 rounded-md p-2">
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="completed_pending_review">Pending Review</option>
                                </select>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="projectBudgetAdmin" className="text-right">Budget (₾)</Label>
                                <Input id="projectBudgetAdmin" type="number" value={editingProject.budget} onChange={(e) => setEditingProject({...editingProject, budget: e.target.value})} className="col-span-3" />
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild><Button variant="outline" onClick={() => setEditingProject(null)}>Cancel</Button></DialogClose>
                              <Button type="button" onClick={handleProjectSave}>Save Project</Button>
                            </DialogFooter>
                          </DialogContent>
                        )}
                      </Dialog>
                      <Button variant="destructive" size="sm" onClick={() => handleProjectDelete(project.id, project.title)}>
                        <Trash2 className="h-4 w-4"/>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminProjectsTab;