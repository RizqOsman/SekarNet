import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  InstallationRequest,
  User,
  Package,
  TechnicianJob
} from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/formatting";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface InstallationsTableProps {
  installations: InstallationRequest[];
  customers: User[];
  technicians: User[];
  packages: Package[];
  technicianJobs: TechnicianJob[];
}

export default function InstallationsTable({
  installations,
  customers,
  technicians,
  packages,
  technicianJobs
}: InstallationsTableProps) {
  const { toast } = useToast();
  const [selectedInstallation, setSelectedInstallation] = useState<InstallationRequest | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Helper function to get customer name
  const getCustomerName = (userId: number) => {
    const customer = customers.find(c => c.id === userId);
    return customer ? customer.fullName : "Unknown";
  };
  
  // Helper function to get customer email
  const getCustomerEmail = (userId: number) => {
    const customer = customers.find(c => c.id === userId);
    return customer ? customer.email : "unknown@email.com";
  };
  
  // Helper function to get package name
  const getPackageName = (packageId: number) => {
    const pkg = packages.find(p => p.id === packageId);
    return pkg ? pkg.name : "Unknown Package";
  };
  
  // Helper function to get technician name
  const getTechnicianName = (technicianId: number | undefined) => {
    if (!technicianId) return "Unassigned";
    const technician = technicians.find(t => t.id === technicianId);
    return technician ? technician.fullName : "Unknown";
  };
  
  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };
  
  // Open assign dialog
  const openAssignDialog = (installation: InstallationRequest) => {
    setSelectedInstallation(installation);
    setSelectedTechnicianId(installation.technicianId?.toString() || "");
    setAssignDialogOpen(true);
  };
  
  // Assign technician to installation
  const assignTechnician = async () => {
    if (!selectedInstallation) return;
    
    setIsUpdating(true);
    
    try {
      const techId = selectedTechnicianId ? parseInt(selectedTechnicianId) : undefined;
      
      // Update installation with technician
      await apiRequest("PATCH", `/api/installation-requests/${selectedInstallation.id}`, {
        technicianId: techId,
        status: techId ? "scheduled" : "pending"
      });
      
      // If technician assigned, create a job
      if (techId) {
        // Check if a job already exists
        const existingJob = technicianJobs.find(
          job => job.installationId === selectedInstallation.id && job.technicianId === techId
        );
        
        if (!existingJob) {
          // Create new job
          await apiRequest("POST", "/api/technician-jobs", {
            technicianId: techId,
            installationId: selectedInstallation.id,
            ticketId: null,
            jobType: "installation",
            scheduledDate: selectedInstallation.preferredDate || new Date().toISOString(),
            notes: `New installation for ${getPackageName(selectedInstallation.packageId)} at ${selectedInstallation.address}`
          });
        }
      }
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/installation-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/technician-jobs'] });
      
      toast({
        title: "Technician Assigned",
        description: techId 
          ? `Installation assigned to ${getTechnicianName(techId)}`
          : "Installation unassigned",
      });
      
      setAssignDialogOpen(false);
    } catch (error) {
      console.error("Error assigning technician:", error);
      toast({
        title: "Assignment Failed",
        description: "There was an error assigning the technician. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {installations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                  No installations found
                </TableCell>
              </TableRow>
            ) : (
              installations.map((installation) => (
                <TableRow key={installation.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                        {getCustomerName(installation.userId).split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{getCustomerName(installation.userId)}</div>
                        <div className="text-sm text-gray-500">{getCustomerEmail(installation.userId)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">{getPackageName(installation.packageId)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">{installation.address}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">{getTechnicianName(installation.technicianId)}</div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(installation.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {installation.preferredDate 
                        ? formatDate(new Date(installation.preferredDate))
                        : formatDate(new Date(installation.createdAt))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="link" 
                      className="text-primary hover:text-blue-700"
                      onClick={() => openAssignDialog(installation)}
                    >
                      {installation.technicianId ? "Reassign" : "Assign"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Assign Technician Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-700 mb-4">
              Select a technician to handle this installation:
            </p>
            
            <Select value={selectedTechnicianId} onValueChange={setSelectedTechnicianId}>
              <SelectTrigger>
                <SelectValue placeholder="Select technician" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {technicians.map((technician) => (
                  <SelectItem key={technician.id} value={technician.id.toString()}>
                    {technician.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedInstallation && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700">Installation Details:</h4>
                <div className="mt-2 text-sm text-gray-600">
                  <p><span className="font-medium">Customer:</span> {getCustomerName(selectedInstallation.userId)}</p>
                  <p><span className="font-medium">Package:</span> {getPackageName(selectedInstallation.packageId)}</p>
                  <p><span className="font-medium">Address:</span> {selectedInstallation.address}</p>
                  {selectedInstallation.preferredDate && (
                    <p>
                      <span className="font-medium">Preferred Date:</span> {formatDate(new Date(selectedInstallation.preferredDate))}
                    </p>
                  )}
                  {selectedInstallation.notes && (
                    <p><span className="font-medium">Notes:</span> {selectedInstallation.notes}</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={assignTechnician}
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : "Assign Technician"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
