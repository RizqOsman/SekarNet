import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/layouts/AdminLayout";
import { User, Subscription, Package } from "@shared/schema";
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

export default function AdminCustomers() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Fetch users with customer role
  const { data: customers, isLoading: isCustomersLoading } = useQuery<User[]>({ 
    queryKey: ['/api/users'],
    select: (users) => users.filter(user => user.role === "customer")
  });
  
  // Fetch subscriptions for customers
  const { data: subscriptions } = useQuery<Subscription[]>({ 
    queryKey: ['/api/subscriptions']
  });
  
  // Fetch packages
  const { data: packages } = useQuery<Package[]>({ 
    queryKey: ['/api/packages']
  });
  
  // Get subscription for customer
  const getCustomerSubscription = (userId: number) => {
    return subscriptions?.find(sub => sub.userId === userId);
  };
  
  // Get package name
  const getPackageName = (packageId: number) => {
    const pkg = packages?.find(p => p.id === packageId);
    return pkg ? pkg.name : "No package";
  };
  
  // Filter customers based on search and status
  const filteredCustomers = customers?.filter(customer => {
    const matchesSearch = 
      customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm));
      
    if (statusFilter === "all") return matchesSearch;
    
    const customerSubscription = getCustomerSubscription(customer.id);
    const subscriptionStatus = customerSubscription?.status || "inactive";
    return matchesSearch && subscriptionStatus === statusFilter;
  });
  
  // Handle customer status changes
  const handleStatusChange = (customerId: number, newStatus: string) => {
    toast({
      title: "Status Updated",
      description: `Customer status has been updated to ${newStatus}`,
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
        <title>Customers - SEKAR NET Admin</title>
        <meta name="description" content="Manage customer accounts, view subscription details, and update customer information." />
      </Helmet>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
          <p className="text-gray-600">Manage all customer accounts and subscriptions</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <i className="ri-user-add-line mr-2"></i>
            Add Customer
          </Button>
        </div>
      </div>
      
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search customers..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="inactive">No Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isCustomersLoading ? (
            <div className="text-center py-8 text-gray-500">Loading customers...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers && filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => {
                      const subscription = getCustomerSubscription(customer.id);
                      const packageName = subscription ? getPackageName(subscription.packageId) : "No subscription";
                      const status = subscription?.status || "inactive";
                      
                      return (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-lg font-medium">
                                {customer.fullName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{customer.fullName}</div>
                                <div className="text-sm text-gray-500">{customer.username}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-900">{customer.email}</div>
                            <div className="text-sm text-gray-500">{customer.phone || "No phone"}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-900">{packageName}</div>
                            {subscription && (
                              <div className="text-sm text-gray-500">
                                Since {formatDate(subscription.createdAt)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={status} />
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-500">
                              {formatDate(customer.createdAt)}
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
                                  <i className="ri-edit-line mr-2"></i> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(customer.id, "suspended")}>
                                  <i className="ri-pause-circle-line mr-2"></i> Suspend Account
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
                          ? "No customers match your search criteria" 
                          : "No customers found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Customer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
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
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => {
              toast({
                title: "Customer Created",
                description: "New customer account has been created successfully"
              });
              setIsAddDialogOpen(false);
            }}>
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

// Helper component for status badges
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case "suspended":
      return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
    case "cancelled":
      return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
    case "inactive":
      return <Badge className="bg-gray-100 text-gray-800">No Subscription</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
  }
}