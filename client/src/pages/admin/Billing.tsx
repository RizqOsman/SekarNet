import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Bill, User, Subscription, Package } from "@shared/schema";
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

export default function AdminBilling() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isViewBillOpen, setIsViewBillOpen] = useState(false);
  const [isConfirmPaymentOpen, setIsConfirmPaymentOpen] = useState(false);
  
  // Fetch bills
  const { data: bills, isLoading: isBillsLoading } = useQuery<Bill[]>({ 
    queryKey: ['/api/bills']
  });
  
  // Fetch users
  const { data: users } = useQuery<User[]>({ 
    queryKey: ['/api/users']
  });
  
  // Fetch subscriptions
  const { data: subscriptions } = useQuery<Subscription[]>({ 
    queryKey: ['/api/subscriptions']
  });
  
  // Fetch packages
  const { data: packages } = useQuery<Package[]>({ 
    queryKey: ['/api/packages']
  });
  
  // Get customer name
  const getCustomerName = (userId: number) => {
    const customer = users?.find(u => u.id === userId);
    return customer ? customer.fullName : "Unknown Customer";
  };
  
  // Get customer email
  const getCustomerEmail = (userId: number) => {
    const customer = users?.find(u => u.id === userId);
    return customer ? customer.email : "unknown@email.com";
  };
  
  // Get package name from subscription
  const getPackageName = (billId: number) => {
    if (!bills || !subscriptions || !packages) return "Unknown Package";
    
    const bill = bills.find(b => b.id === billId);
    if (!bill) return "Unknown Package";
    
    const subscription = subscriptions.find(s => s.id === bill.subscriptionId);
    if (!subscription) return "Unknown Package";
    
    const pkg = packages.find(p => p.id === subscription.packageId);
    return pkg ? pkg.name : "Unknown Package";
  };
  
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
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unpaid":
        return <Badge className="bg-red-100 text-red-800">Unpaid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "overdue":
        return <Badge className="bg-orange-100 text-orange-800">Overdue</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };
  
  // View bill details
  const viewBill = (bill: Bill) => {
    setSelectedBill(bill);
    setIsViewBillOpen(true);
  };
  
  // Open confirm payment dialog
  const openConfirmPayment = (bill: Bill) => {
    setSelectedBill(bill);
    setIsConfirmPaymentOpen(true);
  };
  
  // Handle confirm payment
  const handleConfirmPayment = async () => {
    if (!selectedBill) return;
    
    try {
      // Update bill status to paid
      await apiRequest("PATCH", `/api/bills/${selectedBill.id}`, {
        status: "paid",
        paymentDate: new Date().toISOString()
      });
      
      // Create notification for customer
      await apiRequest("POST", "/api/notifications", {
        userId: selectedBill.userId,
        type: "payment_confirmed",
        title: "Payment Confirmed",
        message: `Your payment of ${formatCurrency(selectedBill.amount)} for bill #${selectedBill.id} has been confirmed.`
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/bills'] });
      
      toast({
        title: "Payment Confirmed",
        description: `Payment for bill #${selectedBill.id} has been confirmed`
      });
      
      setIsConfirmPaymentOpen(false);
    } catch (error) {
      console.error("Error confirming payment:", error);
      toast({
        title: "Confirmation Failed",
        description: "There was an error confirming the payment. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Filter bills
  const filteredBills = bills?.filter(bill => {
    // Apply search filter
    const customerName = getCustomerName(bill.userId).toLowerCase();
    const billId = bill.id.toString();
    
    const matchesSearch = searchTerm.length === 0 || 
      customerName.includes(searchTerm.toLowerCase()) ||
      billId.includes(searchTerm);
    
    // Apply status filter
    const matchesStatus = statusFilter === "all" || bill.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort bills by due date (most recent first)
  const sortedBills = filteredBills?.sort((a, b) => {
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    return dateB - dateA;
  });

  return (
    <AdminLayout>
      <Helmet>
        <title>Billing Management - SEKAR NET Admin</title>
        <meta name="description" content="Manage customer bills, payment verification, and billing reports." />
      </Helmet>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Billing Management</h2>
          <p className="text-gray-600">Manage customer payments and billing information</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button variant="outline">
            <i className="ri-download-line mr-2"></i>
            Export Report
          </Button>
          <Button>
            <i className="ri-add-line mr-2"></i>
            Create Bill
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-primary mr-4">
                <i className="ri-money-dollar-circle-line text-2xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">Rp 25,500,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
                <i className="ri-check-line text-2xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Paid Invoices</p>
                <p className="text-2xl font-bold text-gray-900">45</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mr-4">
                <i className="ri-time-line text-2xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-4">
                <i className="ri-error-warning-line text-2xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Overdue Invoices</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by customer name or bill ID..."
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
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isBillsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading bills...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedBills && sortedBills.length > 0 ? (
                    sortedBills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell>
                          <div className="text-sm font-medium">#{bill.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{getCustomerName(bill.userId)}</div>
                          <div className="text-xs text-gray-500">{getCustomerEmail(bill.userId)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{getPackageName(bill.id)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{formatCurrency(bill.amount)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(bill.issueDate)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(bill.dueDate)}</div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(bill.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => viewBill(bill)}
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
                                {(bill.status === "pending" && bill.paymentProof) && (
                                  <DropdownMenuItem onClick={() => openConfirmPayment(bill)}>
                                    <i className="ri-check-double-line mr-2"></i> Confirm Payment
                                  </DropdownMenuItem>
                                )}
                                
                                {bill.status === "unpaid" && (
                                  <DropdownMenuItem>
                                    <i className="ri-mail-send-line mr-2"></i> Send Reminder
                                  </DropdownMenuItem>
                                )}
                                
                                {(bill.status === "unpaid" || bill.status === "overdue") && (
                                  <DropdownMenuItem>
                                    <i className="ri-edit-line mr-2"></i> Edit Bill
                                  </DropdownMenuItem>
                                )}
                                
                                {bill.status !== "paid" && bill.status !== "cancelled" && (
                                  <DropdownMenuItem>
                                    <i className="ri-close-circle-line mr-2"></i> Cancel Bill
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuItem>
                                  <i className="ri-printer-line mr-2"></i> Print Invoice
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        {searchTerm || statusFilter !== "all" 
                          ? "No bills match your search criteria" 
                          : "No bills found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* View Bill Dialog */}
      {selectedBill && (
        <Dialog open={isViewBillOpen} onOpenChange={setIsViewBillOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                <span>Bill #{selectedBill.id}</span>
                {getStatusBadge(selectedBill.status)}
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{getCustomerName(selectedBill.userId)}</p>
                    <p className="text-sm text-gray-600">{getCustomerEmail(selectedBill.userId)}</p>
                    <p className="text-sm text-gray-600">ID: {selectedBill.userId}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Issue Date:</span>
                      <span className="text-sm">{formatDate(selectedBill.issueDate)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Due Date:</span>
                      <span className="text-sm">{formatDate(selectedBill.dueDate)}</span>
                    </div>
                    {selectedBill.paymentDate && (
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Payment Date:</span>
                        <span className="text-sm">{formatDate(selectedBill.paymentDate)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium mt-2 pt-2 border-t">
                      <span>Total Amount:</span>
                      <span>{formatCurrency(selectedBill.amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Bill Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <div className="font-medium">{getPackageName(selectedBill.id)}</div>
                          <div className="text-sm text-gray-500">Monthly subscription</div>
                        </TableCell>
                        <TableCell>
                          {formatDate(selectedBill.periodStart)} - {formatDate(selectedBill.periodEnd)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(selectedBill.amount)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {selectedBill.paymentProof && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Proof</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="max-w-md mx-auto">
                      <img 
                        src={selectedBill.paymentProof} 
                        alt="Payment Proof" 
                        className="rounded-lg border border-gray-200"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <div className="flex justify-between w-full">
                <div>
                  <Button variant="outline">
                    <i className="ri-printer-line mr-2"></i>
                    Print Invoice
                  </Button>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => setIsViewBillOpen(false)}>
                    Close
                  </Button>
                  {selectedBill.status === "pending" && selectedBill.paymentProof && (
                    <Button onClick={() => {
                      setIsViewBillOpen(false);
                      openConfirmPayment(selectedBill);
                    }}>
                      Confirm Payment
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Confirm Payment Dialog */}
      {selectedBill && (
        <Dialog open={isConfirmPaymentOpen} onOpenChange={setIsConfirmPaymentOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Payment</DialogTitle>
              <DialogDescription>
                Are you sure you want to confirm payment for bill #{selectedBill.id}?
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Customer:</span>
                  <span className="text-sm font-medium">{getCustomerName(selectedBill.userId)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="text-sm font-medium">{formatCurrency(selectedBill.amount)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Package:</span>
                  <span className="text-sm font-medium">{getPackageName(selectedBill.id)}</span>
                </div>
              </div>
              
              {selectedBill.paymentProof && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Payment Proof:</label>
                  <div className="max-w-md mx-auto">
                    <img 
                      src={selectedBill.paymentProof} 
                      alt="Payment Proof" 
                      className="rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfirmPaymentOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmPayment}>
                Confirm Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}