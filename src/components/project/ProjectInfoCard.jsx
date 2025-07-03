import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, DollarSign, CalendarDays, UserCircle, Image as ImageIcon } from 'lucide-react';

const ProjectInfoCard = ({ project, customer }) => {
  if (!project) return null;

  const getStatusBadgeVariant = (status) => {
    if (status === 'open') return 'bg-green-500 text-white';
    if (status === 'In Progress') return 'bg-yellow-500 text-white';
    if (status === 'Completed') return 'bg-purple-500 text-white';
    return 'bg-gray-500 text-white';
  };

  return (
    <Card className="shadow-xl overflow-hidden border-purple-200 mb-8">
      <div className="md:flex">
        <div className="md:w-1/2">
          {project.photos && project.photos.length > 0 && project.photos[0].url ? (
            <img src={project.photos[0].url} alt={project.title} className="object-contain w-full h-64 md:h-full" />
          ) : (
            <div className="w-full h-64 md:h-full bg-gradient-to-br from-purple-200 to-green-200 flex items-center justify-center">
              <ImageIcon size={64} className="text-purple-500 opacity-70" />
            </div>
          )}
        </div>
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
          <CardHeader className="p-0 mb-4">
            <div className="flex justify-between items-start">
              <CardTitle className="text-3xl font-bold text-purple-700">{project.title}</CardTitle>
              <Badge className={`capitalize whitespace-nowrap ${getStatusBadgeVariant(project.status)}`}>
                {project.status}
              </Badge>
            </div>
            <CardDescription className="text-gray-600 mt-1">{project.category}</CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-4 flex-grow">
            <p className="text-gray-700 leading-relaxed">{project.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <MapPin size={16} className="mr-2 text-green-500" /> Location: {project.location}
              </div>
              <div className="flex items-center text-gray-600">
                <DollarSign size={16} className="mr-2 text-green-500" /> Budget: ₾{project.budget}
              </div>
              <div className="flex items-center text-gray-600">
                <CalendarDays size={16} className="mr-2 text-green-500" /> Posted: {new Date(project.postedDate || project.timestamp).toLocaleDateString()}
              </div>
              {customer && (
                <div className="flex items-center text-gray-600 col-span-1 sm:col-span-2">
                  <Avatar className="h-8 w-8 mr-2 border-2 border-purple-300">
                    <AvatarImage src={customer.profile_photo_url || `https://avatar.vercel.sh/${customer.email}.png?size=32`} alt={customer.name} />
                    <AvatarFallback className="bg-purple-200 text-purple-700 text-xs">
                      {customer.name ? customer.name.substring(0, 2).toUpperCase() : <UserCircle size={16} />}
                    </AvatarFallback>
                  </Avatar>
                  Posted by: {customer.name}
                </div>
              )}
            </div>
             {project.status === 'In Progress' && project.awardedSupplierId && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-700 font-semibold">This project is currently in progress.</p>
                    {customer && customer.phone && (
                        <p className="text-xs text-yellow-600">Supplier can contact you at: {customer.phone}</p>
                    )}
                </div>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

export default ProjectInfoCard;