import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import TechnicianLayout from "@/components/layouts/TechnicianLayout";
import { useAuth } from "@/contexts/AuthContext";
import { TechnicianJob, InstallationRequest, SupportTicket, User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils/formatting";

export default function TechnicianHistory() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<TechnicianJob | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
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
  
  // Filter completed jobs only
  const completedJobs = jobs?.filter(job => job.status === "completed") || [];
  
  // Search and filter jobs
  const filteredJobs = completedJobs.filter(job => {
    // If there's a search query, check if it matches job ID
    if (searchQuery) {
      return job.id.toString().includes(searchQuery);
    }
    return true;
  });
  
  // Sort jobs by completion date (most recent first)
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const dateA = a.completionDate ? new Date(a.completionDate).getTime() : 0;
    const dateB = b.completionDate ? new Date(b.completionDate).getTime() : 0;
    return dateB - dateA;
  });
  
  // Helper function to get job type
  const getJobType = (job: TechnicianJob) => {
    return job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1);
  };
  
  // Helper function to get customer name for a job
  const getCustomerName = (job: TechnicianJob) => {
    if (job.installationId) {
      const installation = installations?.find(i => i.id === job.installationId);
      if (installation) {
        const customer = customers?.find(c => c.id === installation.userId);
        return customer?.fullName || "Unknown Customer";
      }
    } else if (job.ticketId) {
      const ticket = tickets?.find(t => t.id === job.ticketId);
      if (ticket) {
        const customer = customers?.find(c => c.id === ticket.userId);
        return customer?.fullName || "Unknown Customer";
      }
    }
    return "Unknown Customer";
  };
  
  // Helper function to get job details
  const getJobDetails = (job: TechnicianJob) => {
    if (job.installationId) {
      const installation = installations?.find(i => i.id === job.installationId);
      if (installation) {
        return `Installation for Package ID: ${installation.packageId}`;
      }
    } else if (job.ticketId) {
      const ticket = tickets?.find(t => t.id === job.ticketId);
      if (ticket) {
        return ticket.subject;
      }
    }
    return "No details available";
  };
  
  // Open job details dialog
  const openJobDetails = (job: TechnicianJob) => {
    setSelectedJob(job);
    setViewDialogOpen(true);
  };
  
  // Function to get job type badge
  const getJobTypeBadge = (jobType: string) => {
    if (jobType === "installation") {
      return <Badge className="bg-blue-100 text-blue-800">Installation</Badge>;
    } else if (jobType === "support") {
      return <Badge className="bg-red-100 text-red-800">Support</Badge>;
    } else {
      return <Badge className="bg-purple-100 text-purple-800">Maintenance</Badge>;
    }
  };
  
  // Loader for all data
  const isLoading = isJobsLoading || isInstallationsLoading || isTicketsLoading || isCustomersLoading;
  
  return (
    <TechnicianLayout>
      <Helmet>
        <title>Job History - SEKAR NET Technician</title>
        <meta name="description" content="View your completed jobs history and performance as a SEKAR NET technician." />
      </Helmet>
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Job History</h2>
        <p className="text-gray-600">View your completed jobs and installation history</p>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="mb-6">
        <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by job ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Job History List */}
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Completed Jobs</h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading job history...</p>
            </div>
          ) : sortedJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No completed jobs found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedJobs.map((job) => (
                <div 
                  key={job.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-sm cursor-pointer transition-all"
                  onClick={() => openJobDetails(job)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getJobTypeBadge(job.jobType)}
                        <span className="text-xs text-gray-500">Job #{job.id}</span>
                      </div>
                      <h4 className="font-medium text-gray-900">{getCustomerName(job)}</h4>
                      <p className="text-sm text-gray-600 mt-1">{getJobDetails(job)}</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs text-gray-500">Completed on</span>
                      <span className="block text-sm font-medium">
                        {job.completionDate ? formatDate(new Date(job.completionDate)) : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Job Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
          </DialogHeader>
          
          {selectedJob && (
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Job #{selectedJob.id}</h3>
                {getJobTypeBadge(selectedJob.jobType)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{getCustomerName(selectedJob)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Job Type</p>
                  <p className="font-medium">{getJobType(selectedJob)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Scheduled Date</p>
                  <p className="font-medium">{formatDate(new Date(selectedJob.scheduledDate))}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completion Date</p>
                  <p className="font-medium">
                    {selectedJob.completionDate ? formatDate(new Date(selectedJob.completionDate)) : "N/A"}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500">Job Details</p>
                <p className="font-medium">{getJobDetails(selectedJob)}</p>
              </div>
              
              {selectedJob.notes && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium mb-2">Completion Notes</h4>
                  <p className="text-gray-700">{selectedJob.notes}</p>
                </div>
              )}
              
              {selectedJob.completionProof && selectedJob.completionProof.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Completion Evidence</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.completionProof.map((proof, idx) => (
                      <div key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                        Evidence #{idx + 1}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TechnicianLayout>
  );
}
