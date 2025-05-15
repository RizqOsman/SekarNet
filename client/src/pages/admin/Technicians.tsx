import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/layouts/AdminLayout";
import { User, TechnicianJob } from "@shared/schema";
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
  DialogTrigger
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

export default function AdminTechnicians() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Fetch users with technician role
  const { data: technicians, isLoading: isTechniciansLoading } = useQuery<User[]>({ 
    queryKey: ['/api/users'],
    select: (users) => users.filter(user => user.role === "technician")
  });
  
  // Fetch technician jobs
  const { data: technicianJobs } = useQuery<TechnicianJob[]>({ 
    queryKey: ['/api/technician-jobs']
  });
  
  // Get technician jobs count by status
  const getTechnicianJobStats = (technicianId: number) => {
    if (!technicianJobs) return { total: 0, completed: 0, inProgress: 0, scheduled: 0 };
    
    const techJobs = technicianJobs.filter(job => job.technicianId === technicianId);
    const total = techJobs.length;
    const completed = techJobs.filter(job => job.status === "completed").length;
    const inProgress = techJobs.filter(job => job.status === "in_progress").length;
    const scheduled = techJobs.filter(job => job.status === "scheduled").length;
    
    return { total, completed, inProgress, scheduled };
  };
  
  // Calculate completion rate
  const getCompletionRate = (technicianId: number) => {
    const stats = getTechnicianJobStats(technicianId);
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };
  
  // Handle technician status changes
  const handleStatusChange = (technicianId: number, newStatus: string) => {
    toast({
      title: "Status Updated",
      description: `Technician status has been updated to ${newStatus}`,
    });
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  return (
    <AdminLayout>
      <Helmet>
        <title>Technicians - SEKAR NET Admin</title>
        <meta name="description" content="Manage field technicians, assign service areas, and monitor job performance." />
      </Helmet>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Field Technicians</h2>
          <p className="text-gray-600">Manage technician accounts and job assignments</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <i className="ri-user-add-line mr-2"></i>
            Add Technician
          </Button>
        </div>
      </div>
      
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search technicians..."
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
                  <SelectItem value="all">All Technicians</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_job">On Job</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isTechniciansLoading ? (
            <div className="text-center py-8 text-gray-500">Loading technicians...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Technician</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Service Area</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {technicians && technicians.length > 0 ? (
                    technicians
                      .filter(tech => {
                        // Apply search filter
                        if (searchTerm && !tech.fullName.toLowerCase().includes(searchTerm.toLowerCase()) && 
                            !tech.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
                            !(tech.phone && tech.phone.includes(searchTerm))) {
                          return false;
                        }
                        
                        // Apply status filter (simplified for demo)
                        if (statusFilter !== "all") {
                          // This is a placeholder. In a real app, we'd check the actual technician status
                          const hasActiveJobs = getTechnicianJobStats(tech.id).inProgress > 0;
                          if (statusFilter === "on_job" && !hasActiveJobs) return false;
                          if (statusFilter === "active" && hasActiveJobs) return false;
                          // For inactive, we'd check if they're marked inactive in the database
                        }
                        
                        return true;
                      })
                      .map((technician) => {
                        const jobStats = getTechnicianJobStats(technician.id);
                        const completionRate = getCompletionRate(technician.id);
                        const isOnJob = jobStats.inProgress > 0;
                        
                        // For demo purposes we'll assign service areas
                        const serviceAreas = ["Jakarta Selatan", "Jakarta Pusat"];
                        
                        return (
                          <TableRow key={technician.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-lg font-medium">
                                  {technician.fullName.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{technician.fullName}</div>
                                  <div className="text-sm text-gray-500">{technician.username}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-900">{technician.email}</div>
                              <div className="text-sm text-gray-500">{technician.phone || "No phone"}</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-900">Completion: {completionRate}%</div>
                              <div className="text-sm text-gray-500">
                                {jobStats.completed} / {jobStats.total} jobs
                              </div>
                            </TableCell>
                            <TableCell>
                              {isOnJob ? (
                                <Badge className="bg-blue-100 text-blue-800">On Job</Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800">Available</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {serviceAreas.join(", ")}
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <i className="ri-more-2-fill text-gray-500"></i>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <i className="ri-eye-line mr-2"></i> View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <i className="ri-map-pin-line mr-2"></i> Assign Areas
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <i className="ri-edit-line mr-2"></i> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusChange(technician.id, "inactive")}>
                                    <i className="ri-user-unfollow-line mr-2"></i> Set Inactive
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <i className="ri-delete-bin-line mr-2"></i> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {searchTerm || statusFilter !== "all" 
                          ? "No technicians match your search criteria" 
                          : "No technicians found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Technician Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Technician</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Full Name
              </label>
              <Input
                id="name"
                placeholder="John Doe"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                placeholder="john@example.com"
                type="email"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="phone" className="text-right text-sm font-medium">
                Phone
              </label>
              <Input
                id="phone"
                placeholder="+1234567890"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="address" className="text-right text-sm font-medium">
                Address
              </label>
              <Input
                id="address"
                placeholder="123 Main St, City"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="username" className="text-right text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                placeholder="johndoe"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="password" className="text-right text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="areas" className="text-right text-sm font-medium">
                Service Areas
              </label>
              <Input
                id="areas"
                placeholder="Jakarta Selatan, Jakarta Pusat"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => {
              toast({
                title: "Technician Created",
                description: "New technician account has been created successfully"
              });
              setIsAddDialogOpen(false);
            }}>
              Add Technician
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}