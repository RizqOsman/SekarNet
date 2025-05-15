import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TechnicianJob, InstallationRequest, SupportTicket } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils/formatting";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface JobCardProps {
  job: TechnicianJob;
  installationData?: InstallationRequest;
  ticketData?: SupportTicket;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
}

export default function JobCard({
  job,
  installationData,
  ticketData,
  customerName = "Customer",
  customerPhone = "Not available",
  customerAddress = "No address provided"
}: JobCardProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");
  
  // Define job type badge styles
  const getJobTypeBadge = () => {
    if (job.jobType === "installation") {
      return { text: "Installation", className: "bg-blue-100 text-blue-800" };
    } else if (job.jobType === "support") {
      return { text: "Troubleshooting", className: "bg-red-100 text-red-800" };
    } else {
      return { text: "Maintenance", className: "bg-purple-100 text-purple-800" };
    }
  };
  
  // Define job status badge styles
  const getStatusBadge = () => {
    if (job.status === "scheduled") {
      return { text: "Scheduled", className: "bg-yellow-100 text-yellow-800" };
    } else if (job.status === "in_progress") {
      return { text: "In Progress", className: "bg-green-100 text-green-800" };
    } else if (job.status === "completed") {
      return { text: "Completed", className: "bg-blue-100 text-blue-800" };
    } else {
      return { text: "Cancelled", className: "bg-gray-100 text-gray-800" };
    }
  };
  
  const jobTypeBadge = getJobTypeBadge();
  const statusBadge = getStatusBadge();
  
  // Format the scheduled time
  const scheduledTime = new Date(job.scheduledDate).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  // Function to update job status
  const updateJobStatus = async (status: string) => {
    setIsUpdating(true);
    
    try {
      const updates: any = { status };
      
      // If completing the job, include completion date and notes
      if (status === "completed") {
        updates.completionDate = new Date().toISOString();
        updates.notes = completionNotes || "Job completed successfully.";
      }
      
      await apiRequest("PATCH", `/api/technician-jobs/${job.id}`, updates);
      
      // Also update installation or ticket status if applicable
      if (job.installationId && status === "completed") {
        await apiRequest("PATCH", `/api/installation-requests/${job.installationId}`, {
          status: "completed"
        });
      }
      
      if (job.ticketId && status === "completed") {
        await apiRequest("PATCH", `/api/support-tickets/${job.ticketId}`, {
          status: "resolved"
        });
      }
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/technician-jobs'] });
      
      toast({
        title: "Job Updated",
        description: `Job status updated to ${status}.`,
      });
      
      // Close dialog if open
      setCompleteDialogOpen(false);
    } catch (error) {
      console.error("Error updating job status:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating the job status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Function to start job (set to in_progress)
  const startJob = () => {
    updateJobStatus("in_progress");
  };
  
  // Function to open the complete job dialog
  const openCompleteDialog = () => {
    setCompleteDialogOpen(true);
  };
  
  return (
    <>
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center mb-1">
                <Badge className={jobTypeBadge.className}>{jobTypeBadge.text}</Badge>
                <span className="ml-2 text-xs text-gray-500">ID: #{job.id}</span>
              </div>
              <h3 className="font-bold text-gray-800">{customerName}</h3>
              <p className="text-sm text-gray-600">
                {job.jobType === "installation" 
                  ? `${installationData?.packageId ? `Package ID: ${installationData.packageId}` : 'New Installation'}`
                  : ticketData?.subject || 'Service Visit'}
              </p>
            </div>
            
            <div className="flex flex-col items-end">
              <Badge className={statusBadge.className}>{statusBadge.text}</Badge>
              <span className="text-sm font-medium mt-1">{scheduledTime}</span>
              <span className="text-xs text-gray-500">{formatDate(new Date(job.scheduledDate))}</span>
            </div>
          </div>
          
          <div className="mt-4 border-t pt-4">
            <div className="flex items-start">
              <i className="ri-map-pin-line text-gray-400 mt-0.5 mr-2"></i>
              <div>
                <p className="text-sm text-gray-700">{customerAddress}</p>
              </div>
            </div>
            
            <div className="flex items-center mt-2">
              <i className="ri-phone-line text-gray-400 mr-2"></i>
              <p className="text-sm text-gray-700">{customerPhone}</p>
            </div>
            
            {ticketData?.description && (
              <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700 font-medium">Customer Notes:</p>
                <p className="text-sm text-gray-600">{ticketData.description}</p>
              </div>
            )}
            
            {job.notes && (
              <div className="mt-2 p-3 rounded-lg bg-blue-50">
                <p className="text-sm text-gray-700 font-medium">Job Notes:</p>
                <p className="text-sm text-gray-600">{job.notes}</p>
              </div>
            )}
          </div>
          
          <div className="mt-4 grid grid-cols-3 gap-2">
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customerAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center py-2 bg-primary text-white rounded-lg"
            >
              <i className="ri-navigation-line mr-1"></i>
              Navigate
            </a>
            
            {job.status === "scheduled" ? (
              <Button 
                className="flex items-center justify-center py-2 bg-blue-500 text-white rounded-lg"
                onClick={startJob}
                disabled={isUpdating}
              >
                <i className="ri-play-line mr-1"></i>
                Start
              </Button>
            ) : job.status === "in_progress" ? (
              <Button 
                className="flex items-center justify-center py-2 bg-green-500 text-white rounded-lg"
                onClick={openCompleteDialog}
                disabled={isUpdating}
              >
                <i className="ri-check-line mr-1"></i>
                Complete
              </Button>
            ) : (
              <Button 
                className="flex items-center justify-center py-2 bg-gray-200 text-gray-600 rounded-lg"
                disabled
              >
                <i className="ri-check-double-line mr-1"></i>
                Completed
              </Button>
            )}
            
            <a 
              href={`tel:${customerPhone.replace(/\D/g, '')}`}
              className="flex items-center justify-center py-2 border border-gray-300 text-gray-700 rounded-lg"
            >
              <i className="ri-phone-line mr-1"></i>
              Call
            </a>
          </div>
        </CardContent>
      </Card>
      
      {/* Complete Job Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Job</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-700 mb-4">Please enter any notes about the job completion:</p>
            <Textarea
              placeholder="Job completion notes..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCompleteDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={() => updateJobStatus("completed")}
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Complete Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
