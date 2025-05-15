import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/layouts/AdminLayout";
import { SupportTicket, User } from "@shared/schema";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminSupportTickets() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isViewTicketOpen, setIsViewTicketOpen] = useState(false);
  const [isAssignTicketOpen, setIsAssignTicketOpen] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<number | string>("");
  const [replyText, setReplyText] = useState("");
  
  // Fetch support tickets
  const { data: tickets, isLoading: isTicketsLoading } = useQuery<SupportTicket[]>({ 
    queryKey: ['/api/support-tickets']
  });
  
  // Fetch users for customer and technician data
  const { data: users } = useQuery<User[]>({ 
    queryKey: ['/api/users']
  });
  
  // Get technicians
  const technicians = users?.filter(user => user.role === "technician") || [];
  
  // Get customer name
  const getCustomerName = (userId: number) => {
    const customer = users?.find(u => u.id === userId);
    return customer ? customer.fullName : "Unknown Customer";
  };
  
  // Get technician name
  const getTechnicianName = (technicianId?: number) => {
    if (!technicianId) return "Not Assigned";
    const technician = users?.find(u => u.id === technicianId);
    return technician ? technician.fullName : "Unknown Technician";
  };
  
  // Format date
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get priority badge
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
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-100 text-blue-800">New</Badge>;
      case "in_progress":
        return <Badge className="bg-purple-100 text-purple-800">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };
  
  // Filter tickets
  const filteredTickets = tickets?.filter(ticket => {
    // Apply search filter
    const customerName = getCustomerName(ticket.userId).toLowerCase();
    const subject = ticket.subject.toLowerCase();
    const technicianName = ticket.technicianId ? getTechnicianName(ticket.technicianId).toLowerCase() : "";
    
    const matchesSearch = searchTerm.length === 0 || 
      customerName.includes(searchTerm.toLowerCase()) ||
      subject.includes(searchTerm.toLowerCase()) ||
      technicianName.includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    
    // Apply priority filter
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });
  
  // Open ticket details
  const viewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsViewTicketOpen(true);
  };
  
  // Open assign dialog
  const openAssignDialog = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setSelectedTechnicianId(ticket.technicianId?.toString() || "");
    setIsAssignTicketOpen(true);
  };
  
  // Handle technician assignment
  const handleAssignTechnician = async () => {
    if (!selectedTicket || !selectedTechnicianId || selectedTechnicianId === "") {
      toast({
        title: "Error",
        description: "Please select a technician to assign",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Update support ticket with assigned technician
      await apiRequest("PATCH", `/api/support-tickets/${selectedTicket.id}`, {
        technicianId: Number(selectedTechnicianId),
        status: "in_progress"
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      
      toast({
        title: "Technician Assigned",
        description: `Successfully assigned ${getTechnicianName(Number(selectedTechnicianId))} to this ticket`
      });
      
      setIsAssignTicketOpen(false);
    } catch (error) {
      console.error("Error assigning technician:", error);
      toast({
        title: "Assignment Failed",
        description: "There was an error assigning the technician. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle ticket reply
  const handleTicketReply = async () => {
    if (!selectedTicket || !replyText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply message",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Update support ticket with reply
      await apiRequest("PATCH", `/api/support-tickets/${selectedTicket.id}`, {
        status: "in_progress",
        response: replyText.trim()
      });
      
      // Create notification for customer
      await apiRequest("POST", "/api/notifications", {
        userId: selectedTicket.userId,
        type: "support_reply",
        title: "Support Ticket Update",
        message: `Your support ticket "${selectedTicket.subject}" has received a response.`
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      
      toast({
        title: "Reply Sent",
        description: "Your reply has been sent to the customer"
      });
      
      setReplyText("");
      setIsViewTicketOpen(false);
    } catch (error) {
      console.error("Error sending reply:", error);
      toast({
        title: "Reply Failed",
        description: "There was an error sending your reply. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle ticket status change
  const handleStatusChange = async (ticketId: number, newStatus: string) => {
    try {
      // Update support ticket status
      await apiRequest("PATCH", `/api/support-tickets/${ticketId}`, {
        status: newStatus
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      
      toast({
        title: "Status Updated",
        description: `Ticket status has been updated to ${newStatus}`
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating the ticket status. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Support Tickets - SEKAR NET Admin</title>
        <meta name="description" content="Manage customer support tickets, assign technicians, and track issue resolution." />
      </Helmet>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Support Tickets</h2>
          <p className="text-gray-600">Manage customer support tickets and issue resolution</p>
        </div>
      </div>
      
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by customer, subject, or technician..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="flex gap-2">
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={priorityFilter} 
                onValueChange={setPriorityFilter}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isTicketsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading support tickets...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets && filteredTickets.length > 0 ? (
                    filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <div className="text-sm font-medium">#{ticket.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium max-w-[200px] truncate">{ticket.subject}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{getCustomerName(ticket.userId)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{getTechnicianName(ticket.technicianId)}</div>
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(ticket.priority)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(ticket.status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {formatDate(ticket.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => viewTicket(ticket)}
                            >
                              View
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <i className="ri-more-2-fill text-gray-500"></i>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {(!ticket.technicianId && ticket.status !== "closed") && (
                                  <DropdownMenuItem onClick={() => openAssignDialog(ticket)}>
                                    <i className="ri-user-follow-line mr-2"></i> Assign Technician
                                  </DropdownMenuItem>
                                )}
                                
                                {ticket.status === "new" && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, "in_progress")}>
                                    <i className="ri-time-line mr-2"></i> Mark In Progress
                                  </DropdownMenuItem>
                                )}
                                
                                {ticket.status === "in_progress" && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, "resolved")}>
                                    <i className="ri-check-line mr-2"></i> Mark Resolved
                                  </DropdownMenuItem>
                                )}
                                
                                {(ticket.status === "resolved" || ticket.status === "in_progress") && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, "closed")}>
                                    <i className="ri-close-circle-line mr-2"></i> Close Ticket
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                          ? "No support tickets match your search criteria" 
                          : "No support tickets found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* View Ticket Dialog */}
      {selectedTicket && (
        <Dialog open={isViewTicketOpen} onOpenChange={setIsViewTicketOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                <span>Support Ticket #{selectedTicket.id}</span>
                <div className="flex space-x-2">
                  {getPriorityBadge(selectedTicket.priority)}
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-medium">{selectedTicket.subject}</h3>
                    <p className="text-sm text-gray-500">
                      Reported by {getCustomerName(selectedTicket.userId)} on {formatDate(selectedTicket.createdAt)}
                    </p>
                  </div>
                  <div>
                    {selectedTicket.technicianId && (
                      <div className="text-sm text-gray-500 text-right">
                        Assigned to:<br/>
                        <span className="font-medium">{getTechnicianName(selectedTicket.technicianId)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border-t pt-3 mt-3">
                  <p className="whitespace-pre-line">{selectedTicket.description}</p>
                </div>
              </div>
              
              {selectedTicket.response && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
                  <div className="flex justify-between mb-2">
                    <div>
                      <h3 className="text-md font-medium">Response from Support</h3>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <p className="whitespace-pre-line">{selectedTicket.response}</p>
                  </div>
                </div>
              )}
              
              {selectedTicket.status !== "closed" && (
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2">Reply to Customer</label>
                  <Textarea
                    placeholder="Type your response here..."
                    className="min-h-[120px]"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <DialogFooter>
              <div className="flex justify-between w-full">
                <div>
                  {!selectedTicket.technicianId && (
                    <Button variant="outline" onClick={() => {
                      setIsViewTicketOpen(false);
                      openAssignDialog(selectedTicket);
                    }}>
                      Assign Technician
                    </Button>
                  )}
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => setIsViewTicketOpen(false)}>
                    Close
                  </Button>
                  {selectedTicket.status !== "closed" && (
                    <Button onClick={handleTicketReply} disabled={!replyText.trim()}>
                      Send Reply
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Assign Technician Dialog */}
      {selectedTicket && (
        <Dialog open={isAssignTicketOpen} onOpenChange={setIsAssignTicketOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Technician</DialogTitle>
              <DialogDescription>
                Assign a technician to handle this support ticket.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="mb-4">
                <p className="font-medium">{selectedTicket.subject}</p>
                <p className="text-sm text-gray-500">
                  Reported by {getCustomerName(selectedTicket.userId)} on {formatDate(selectedTicket.createdAt)}
                </p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="technician" className="block text-sm font-medium mb-1">Select Technician</label>
                <Select value={selectedTechnicianId.toString()} onValueChange={setSelectedTechnicianId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map((technician) => (
                      <SelectItem 
                        key={technician.id} 
                        value={technician.id.toString()}
                      >
                        {technician.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignTicketOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignTechnician}>
                Assign Technician
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}