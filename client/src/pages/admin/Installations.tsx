import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/layouts/AdminLayout";
import { InstallationRequest, User, Package, TechnicianJob } from "@shared/schema";
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

export default function AdminInstallations() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInstallation, setSelectedInstallation] = useState<InstallationRequest | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<number | string>("");
  
  // Fetch installation requests
  const { data: installations, isLoading: isInstallationsLoading } = useQuery<InstallationRequest[]>({ 
    queryKey: ['/api/installation-requests']
  });
  
  // Fetch users
  const { data: users } = useQuery<User[]>({ 
    queryKey: ['/api/users']
  });
  
  // Fetch packages
  const { data: packages } = useQuery<Package[]>({ 
    queryKey: ['/api/packages']
  });
  
  // Fetch technician jobs
  const { data: technicianJobs } = useQuery<TechnicianJob[]>({ 
    queryKey: ['/api/technician-jobs']
  });
  
  // Get technicians
  const technicians = users?.filter(user => user.role === "technician") || [];
  
  // Get customer name
  const getCustomerName = (userId: number) => {
    const customer = users?.find(u => u.id === userId);
    return customer ? customer.fullName : "Unknown Customer";
  };
  
  // Get package name
  const getPackageName = (packageId: number) => {
    const pkg = packages?.find(p => p.id === packageId);
    return pkg ? pkg.name : "Unknown Package";
  };
  
  // Get technician name
  const getTechnicianName = (technicianId?: number) => {
    if (!technicianId) return "Not Assigned";
    const technician = users?.find(u => u.id === technicianId);
    return technician ? technician.fullName : "Unknown Technician";
  };
  
  // Check if technician has active jobs
  const technicianHasActiveJobs = (technicianId: number) => {
    if (!technicianJobs) return false;
    return technicianJobs.some(job => 
      job.technicianId === technicianId && 
      (job.status === "scheduled" || job.status === "in_progress")
    );
  };
  
  // Filter installations
  const filteredInstallations = installations?.filter(installation => {
    // Apply search filter
    const customerName = getCustomerName(installation.userId).toLowerCase();
    const packageName = getPackageName(installation.packageId).toLowerCase();
    const address = installation.address.toLowerCase();
    
    const matchesSearch = searchTerm.length === 0 || 
      customerName.includes(searchTerm.toLowerCase()) ||
      packageName.includes(searchTerm.toLowerCase()) ||
      address.includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === "all" || installation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Format date
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "N/A";
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Open assign dialog
  const openAssignDialog = (installation: InstallationRequest) => {
    setSelectedInstallation(installation);
    setSelectedTechnicianId("");
    setShowAssignDialog(true);
  };
  
  // Handle technician assignment
  const handleAssignTechnician = async () => {
    if (!selectedInstallation || !selectedTechnicianId || selectedTechnicianId === "") {
      toast({
        title: "Error",
        description: "Please select a technician to assign",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Update installation request with assigned technician
      await apiRequest("PATCH", `/api/installation-requests/${selectedInstallation.id}`, {
        technicianId: Number(selectedTechnicianId),
        status: "scheduled"
      });
      
      // Create technician job
      await apiRequest("POST", "/api/technician-jobs", {
        technicianId: Number(selectedTechnicianId),
        installationId: selectedInstallation.id,
        status: "scheduled",
        scheduledDate: new Date().toISOString(), // This would normally be a selected date
        description: `Installation for ${getCustomerName(selectedInstallation.userId)} at ${selectedInstallation.address}`
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/installation-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/technician-jobs'] });
      
      toast({
        title: "Technician Assigned",
        description: `Successfully assigned ${getTechnicianName(Number(selectedTechnicianId))} to this installation`
      });
      
      setShowAssignDialog(false);
    } catch (error) {
      console.error("Error assigning technician:", error);
      toast({
        title: "Assignment Failed",
        description: "There was an error assigning the technician. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Get status badge
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

  return (
    <AdminLayout>
      <Helmet>
        <title>Installation Requests - SEKAR NET Admin</title>
        <meta name="description" content="Manage customer installation requests, assign technicians, and track installation progress." />
      </Helmet>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Installation Requests</h2>
          <p className="text-gray-600">Manage customer installation requests and technician assignments</p>
        </div>
      </div>
      
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by customer, package, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div>
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isInstallationsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading installation requests...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstallations && filteredInstallations.length > 0 ? (
                    filteredInstallations.map((installation) => (
                      <TableRow key={installation.id}>
                        <TableCell>
                          <div className="text-sm font-medium">{getCustomerName(installation.userId)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{getPackageName(installation.packageId)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm max-w-[200px] truncate">{installation.address}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{getTechnicianName(installation.technicianId)}</div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(installation.status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {installation.preferredDate 
                              ? formatDate(installation.preferredDate)
                              : formatDate(installation.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {installation.status === "pending" && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openAssignDialog(installation)}
                              >
                                Assign
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <i className="ri-more-2-fill text-gray-500"></i>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        {searchTerm || statusFilter !== "all" 
                          ? "No installation requests match your search criteria" 
                          : "No installation requests found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Assign Technician Dialog */}
      {selectedInstallation && (
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Technician</DialogTitle>
              <DialogDescription>
                Assign a technician to handle the installation for {getCustomerName(selectedInstallation.userId)} at {selectedInstallation.address}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
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
                        disabled={technicianHasActiveJobs(technician.id)}
                      >
                        {technician.fullName} 
                        {technicianHasActiveJobs(technician.id) && " (Busy)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="scheduled-date" className="block text-sm font-medium mb-1">Scheduled Date</label>
                <Input
                  id="scheduled-date"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
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