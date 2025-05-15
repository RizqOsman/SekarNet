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
  SupportTicket,
  User,
  TechnicianJob
} from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatRelativeTime } from "@/lib/utils/formatting";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription
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

interface TicketsTableProps {
  tickets: SupportTicket[];
  customers: User[];
  technicians: User[];
  technicianJobs: TechnicianJob[];
}

export default function TicketsTable({
  tickets,
  customers,
  technicians,
  technicianJobs
}: TicketsTableProps) {
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
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
  
  // Helper function to get technician name
  const getTechnicianName = (technicianId: number | undefined) => {
    if (!technicianId) return "Unassigned";
    const technician = technicians.find(t => t.id === technicianId);
    return technician ? technician.fullName : "Unknown";
  };
  
  // Function to get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{priority}</Badge>;
    }
  };
  
  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-gray-100 text-gray-800">New</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case "closed":
        return <Badge className="bg-purple-100 text-purple-800">Closed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };
  
  // Open assign dialog
  const openAssignDialog = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setSelectedTechnicianId(ticket.technicianId?.toString() || "");
    setAssignDialogOpen(true);
  };
  
  // Open view dialog
  const openViewDialog = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setViewDialogOpen(true);
  };
  
  // Assign technician to ticket
  const assignTechnician = async () => {
    if (!selectedTicket) return;
    
    setIsUpdating(true);
    
    try {
      const techId = selectedTechnicianId ? parseInt(selectedTechnicianId) : undefined;
      
      // Update ticket with technician
      await apiRequest("PATCH", `/api/support-tickets/${selectedTicket.id}`, {
        technicianId: techId,
        status: techId ? "in_progress" : "new"
      });
      
      // If technician assigned, create a job
      if (techId) {
        // Check if a job already exists
        const existingJob = technicianJobs.find(
          job => job.ticketId === selectedTicket.id && job.technicianId === techId
        );
        
        if (!existingJob) {
          // Create new job
          await apiRequest("POST", "/api/technician-jobs", {
            technicianId: techId,
            installationId: null,
            ticketId: selectedTicket.id,
            jobType: "support",
            scheduledDate: new Date().toISOString(),
            notes: `Support ticket: ${selectedTicket.subject}`
          });
        }
      }
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/technician-jobs'] });
      
      toast({
        title: "Technician Assigned",
        description: techId 
          ? `Ticket assigned to ${getTechnicianName(techId)}`
          : "Ticket unassigned",
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
              <TableHead>ID</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                  No support tickets found
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">
                    #{ticket.id}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-gray-900">{ticket.subject}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                        {getCustomerName(ticket.userId).split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm text-gray-900">{getCustomerName(ticket.userId)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">{getTechnicianName(ticket.technicianId)}</div>
                  </TableCell>
                  <TableCell>
                    {getPriorityBadge(ticket.priority)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(ticket.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {formatDate(new Date(ticket.createdAt))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="link" 
                      className="text-primary hover:text-blue-700"
                      onClick={() => openViewDialog(ticket)}
                    >
                      View
                    </Button>
                    <Button 
                      variant="link" 
                      className="text-primary hover:text-blue-700"
                      onClick={() => openAssignDialog(ticket)}
                    >
                      {ticket.technicianId ? "Reassign" : "Assign"}
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
              Select a technician to handle this support ticket:
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
      
      {/* View Ticket Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ticket #{selectedTicket?.id}</DialogTitle>
            <DialogDescription>
              {selectedTicket?.subject}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm text-gray-500">Submitted by</span>
                <p className="font-medium">{selectedTicket?.userId ? getCustomerName(selectedTicket.userId) : 'Unknown'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Status</span>
                <p>{selectedTicket && getStatusBadge(selectedTicket.status)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Priority</span>
                <p>{selectedTicket && getPriorityBadge(selectedTicket.priority)}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-gray-700 whitespace-pre-line">{selectedTicket?.description}</p>
            </div>
            
            {selectedTicket?.attachments && selectedTicket.attachments.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Attachments</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTicket.attachments.map((attachment, idx) => (
                    <div key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {attachment}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-sm text-gray-500 mt-6">
              Created {selectedTicket?.createdAt ? formatRelativeTime(new Date(selectedTicket.createdAt)) : ''}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setViewDialogOpen(false);
              openAssignDialog(selectedTicket!);
            }}>
              {selectedTicket?.technicianId ? "Reassign" : "Assign Technician"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
