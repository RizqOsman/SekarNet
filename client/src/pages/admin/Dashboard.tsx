import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { 
  User, 
  InstallationRequest, 
  SupportTicket, 
  Bill, 
  Subscription, 
  Package 
} from "@shared/schema";
import StatsCard from "@/components/admin/StatsCard";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils/formatting";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Fetch data for dashboard
  const { data: users, isLoading: isUsersLoading } = useQuery<User[]>({ 
    queryKey: ['/api/users'],
    enabled: !!user
  });
  
  const { data: installations, isLoading: isInstallationsLoading } = useQuery<InstallationRequest[]>({ 
    queryKey: ['/api/installation-requests'],
    enabled: !!user
  });
  
  const { data: tickets, isLoading: isTicketsLoading } = useQuery<SupportTicket[]>({ 
    queryKey: ['/api/support-tickets'],
    enabled: !!user
  });
  
  const { data: bills, isLoading: isBillsLoading } = useQuery<Bill[]>({ 
    queryKey: ['/api/bills'],
    enabled: !!user
  });
  
  const { data: subscriptions, isLoading: isSubscriptionsLoading } = useQuery<Subscription[]>({ 
    queryKey: ['/api/subscriptions'],
    enabled: !!user
  });
  
  const { data: packages, isLoading: isPackagesLoading } = useQuery<Package[]>({ 
    queryKey: ['/api/packages'],
    enabled: !!user
  });
  
  // Calculate customer count
  const customerCount = users?.filter(u => u.role === "customer").length || 0;
  
  // Calculate active installations
  const activeInstallations = installations?.filter(
    i => i.status === "pending" || i.status === "scheduled" || i.status === "in_progress"
  ).length || 0;
  
  // Calculate open tickets
  const openTickets = tickets?.filter(
    t => t.status === "new" || t.status === "in_progress"
  ).length || 0;
  
  // Calculate monthly revenue
  const calculateMonthlyRevenue = () => {
    if (!subscriptions || !packages) return 0;
    
    const activeSubscriptionsWithPackages = subscriptions
      .filter(s => s.status === "active")
      .map(s => {
        const pkg = packages.find(p => p.id === s.packageId);
        return pkg ? pkg.price : 0;
      });
    
    return activeSubscriptionsWithPackages.reduce((sum, price) => sum + price, 0);
  };
  
  const monthlyRevenue = calculateMonthlyRevenue();
  
  // Helper function to get customer name
  const getCustomerName = (userId: number) => {
    const customer = users?.find(u => u.id === userId);
    return customer ? customer.fullName : "Unknown";
  };
  
  // Helper function to get customer email
  const getCustomerEmail = (userId: number) => {
    const customer = users?.find(u => u.id === userId);
    return customer ? customer.email : "unknown@email.com";
  };
  
  // Helper function to get package name
  const getPackageName = (packageId: number) => {
    const pkg = packages?.find(p => p.id === packageId);
    return pkg ? pkg.name : "Unknown Package";
  };
  
  // Helper function to get technician name
  const getTechnicianName = (technicianId: number | undefined) => {
    if (!technicianId) return "Unassigned";
    const technician = users?.find(u => u.id === technicianId);
    return technician ? technician.fullName : "Unknown";
  };
  
  // Function to get status badge for installations
  const getInstallationStatusBadge = (status: string) => {
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
  
  // Function to get status badge for tickets
  const getTicketStatusBadge = (status: string) => {
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
  
  // Loader for all data
  const isLoading = isUsersLoading || isInstallationsLoading || isTicketsLoading || isBillsLoading || isSubscriptionsLoading || isPackagesLoading;
  
  return (
    <AdminLayout>
      <Helmet>
        <title>Admin Dashboard - SEKAR NET</title>
        <meta name="description" content="SEKAR NET administration dashboard - Manage customers, installations, support tickets, and system operations." />
      </Helmet>
      
      {/* Page Header */}
      <div className="mb-6 md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-gray-600">Welcome back, {user?.fullName}! Here's what's happening today.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <div className="relative">
            <Button variant="outline" className="flex items-center">
              <i className="ri-calendar-line text-gray-600 mr-2"></i>
              <span className="text-sm text-gray-700">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </Button>
          </div>
          <Button className="flex items-center">
            <i className="ri-download-line mr-2"></i>
            <span>Export Report</span>
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <Card className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <CardContent className="p-6 flex justify-center items-center h-48">
            <p className="text-gray-500">Loading dashboard data...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <StatsCard
              title="Total Customers"
              value={customerCount.toString()}
              icon="ri-user-line"
              iconBgColor="bg-blue-100"
              iconTextColor="text-primary"
              change={{ value: 12, isIncrease: true }}
            />
            
            <StatsCard
              title="Active Installations"
              value={activeInstallations.toString()}
              icon="ri-install-line"
              iconBgColor="bg-green-100"
              iconTextColor="text-green-600"
              change={{ value: 5, isIncrease: true }}
            />
            
            <StatsCard
              title="Open Tickets"
              value={openTickets.toString()}
              icon="ri-customer-service-2-line"
              iconBgColor="bg-yellow-100"
              iconTextColor="text-yellow-600"
              change={{ value: 8, isIncrease: true }}
            />
            
            <StatsCard
              title="Monthly Revenue"
              value={formatCurrency(monthlyRevenue)}
              icon="ri-money-dollar-circle-line"
              iconBgColor="bg-purple-100"
              iconTextColor="text-purple-600"
              change={{ value: 15, isIncrease: true }}
            />
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Subscriptions by Package</h3>
                  <div className="relative">
                    <Button variant="ghost" size="sm" className="text-sm text-gray-600 flex items-center">
                      Last 6 Months
                      <i className="ri-arrow-down-s-line ml-1"></i>
                    </Button>
                  </div>
                </div>
                <div className="h-72 flex items-center justify-center">
                  <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    Package Distribution Chart
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Revenue Trend</h3>
                  <div className="relative">
                    <Button variant="ghost" size="sm" className="text-sm text-gray-600 flex items-center">
                      Last 6 Months
                      <i className="ri-arrow-down-s-line ml-1"></i>
                    </Button>
                  </div>
                </div>
                <div className="h-72 flex items-center justify-center">
                  <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    Revenue Trend Chart
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Installations */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Recent Installations</h3>
                <Button variant="link" className="text-sm text-primary font-medium hover:text-blue-700">
                  View All
                </Button>
              </div>
              <div className="overflow-x-auto">
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
                    {installations && installations.length > 0 ? (
                      installations.slice(0, 3).map((installation) => (
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
                            <div className="text-sm text-gray-900">{installation.address.split(',')[0]}</div>
                            <div className="text-sm text-gray-500">
                              {installation.address.split(',').slice(1).join(',').trim()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-900">{getTechnicianName(installation.technicianId)}</div>
                          </TableCell>
                          <TableCell>
                            {getInstallationStatusBadge(installation.status)}
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
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                          No installation requests found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Support Tickets */}
          <Card className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Support Tickets</h3>
                <Button variant="link" className="text-sm text-primary font-medium hover:text-blue-700">
                  View All
                </Button>
              </div>
              <div className="overflow-x-auto">
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
                    {tickets && tickets.length > 0 ? (
                      tickets.slice(0, 3).map((ticket) => (
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
                            {getTicketStatusBadge(ticket.status)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-500">
                              {formatDate(new Date(ticket.createdAt))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="link" 
                              className="text-primary hover:text-blue-700"
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                          No support tickets found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </AdminLayout>
  );
}
