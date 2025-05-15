import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import TechnicianLayout from "@/components/layouts/TechnicianLayout";
import { useAuth } from "@/contexts/AuthContext";
import { TechnicianJob, InstallationRequest, SupportTicket, User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/formatting";

type JobLocation = {
  id: number;
  jobType: string;
  address: string;
  customerName: string;
  status: string;
  scheduledDate: string;
};

export default function TechnicianJobMap() {
  const { user } = useAuth();
  const [jobLocations, setJobLocations] = useState<JobLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<JobLocation | null>(null);
  
  // Fetch technician jobs
  const { data: jobs, isLoading: isJobsLoading } = useQuery<TechnicianJob[]>({ 
    queryKey: ['/api/technician-jobs'],
    enabled: !!user
  });
  
  // Fetch installation requests
  const { data: installations, isLoading: isInstallationsLoading } = useQuery<InstallationRequest[]>({ 
    queryKey: ['/api/installation-requests'],
    enabled: !!user
  });
  
  // Fetch support tickets
  const { data: tickets, isLoading: isTicketsLoading } = useQuery<SupportTicket[]>({ 
    queryKey: ['/api/support-tickets'],
    enabled: !!user
  });
  
  // Fetch users (customers)
  const { data: customers, isLoading: isCustomersLoading } = useQuery<User[]>({ 
    queryKey: ['/api/users'],
    enabled: !!user
  });
  
  // Process job locations when data is loaded
  useEffect(() => {
    if (!jobs || !installations || !tickets || !customers) return;
    
    const locations: JobLocation[] = [];
    
    jobs.forEach(job => {
      // For installation jobs
      if (job.installationId) {
        const installation = installations.find(i => i.id === job.installationId);
        if (installation) {
          const customer = customers.find(c => c.id === installation.userId);
          if (customer && customer.address) {
            locations.push({
              id: job.id,
              jobType: "installation",
              address: customer.address,
              customerName: customer.fullName,
              status: job.status,
              scheduledDate: job.scheduledDate
            });
          }
        }
      }
      
      // For support jobs
      if (job.ticketId) {
        const ticket = tickets.find(t => t.id === job.ticketId);
        if (ticket) {
          const customer = customers.find(c => c.id === ticket.userId);
          if (customer && customer.address) {
            locations.push({
              id: job.id,
              jobType: "support",
              address: customer.address,
              customerName: customer.fullName,
              status: job.status,
              scheduledDate: job.scheduledDate
            });
          }
        }
      }
    });
    
    setJobLocations(locations);
  }, [jobs, installations, tickets, customers]);
  
  // Function to get job type badge
  const getJobTypeBadge = (jobType: string) => {
    if (jobType === "installation") {
      return <Badge className="bg-blue-100 text-blue-800">Installation</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Support</Badge>;
    }
  };
  
  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>;
      case "in_progress":
        return <Badge className="bg-green-100 text-green-800">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };
  
  // Open in Google Maps
  const openInMaps = (address: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };
  
  // Loader for all data
  const isLoading = isJobsLoading || isInstallationsLoading || isTicketsLoading || isCustomersLoading;
  
  return (
    <TechnicianLayout>
      <Helmet>
        <title>Job Map - SEKAR NET Technician</title>
        <meta name="description" content="View all your job locations on a map to plan your route efficiently." />
      </Helmet>
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Job Locations</h2>
        <p className="text-gray-600">View all your job locations to plan your route</p>
      </div>
      
      {/* Map View */}
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Job Locations Map</h3>
        </div>
        <div className="aspect-w-16 aspect-h-9">
          <div className="w-full h-64 bg-gray-300 flex items-center justify-center text-gray-600">
            <div className="text-center">
              <p className="mb-2">Google Maps Integration</p>
              <p className="text-sm">In a real application, this would show a Google Maps view with all job locations marked</p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Job Locations List */}
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">All Job Locations</h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading job locations...</p>
            </div>
          ) : jobLocations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No job locations available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobLocations.map((location) => (
                <div 
                  key={location.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:border-primary cursor-pointer transition-all"
                  onClick={() => setSelectedLocation(location)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getJobTypeBadge(location.jobType)}
                        <span className="text-xs text-gray-500">Job #{location.id}</span>
                      </div>
                      <h4 className="font-medium text-gray-900">{location.customerName}</h4>
                      <p className="text-sm text-gray-600 mt-1">{location.address}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      {getStatusBadge(location.status)}
                      <span className="text-xs text-gray-500 mt-1">{formatDate(new Date(location.scheduledDate))}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-end">
                    <Button 
                      size="sm"
                      variant="outline"
                      className="text-primary border-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        openInMaps(location.address);
                      }}
                    >
                      <i className="ri-navigation-line mr-1"></i>
                      Navigate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Selected Location Dialog (simplified version without Dialog component) */}
      {selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedLocation.customerName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getJobTypeBadge(selectedLocation.jobType)}
                    {getStatusBadge(selectedLocation.status)}
                  </div>
                </div>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setSelectedLocation(null)}
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-gray-700">{selectedLocation.address}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500">Scheduled Date</p>
                <p className="text-gray-700">{formatDate(new Date(selectedLocation.scheduledDate))}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  This location would be displayed on a Google Maps view in a real application.
                </p>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setSelectedLocation(null)}
                >
                  Close
                </Button>
                <Button 
                  onClick={() => openInMaps(selectedLocation.address)}
                >
                  <i className="ri-navigation-line mr-1"></i>
                  Navigate
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </TechnicianLayout>
  );
}
