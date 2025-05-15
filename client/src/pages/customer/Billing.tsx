import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import CustomerLayout from "@/components/layouts/CustomerLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Bill, Subscription, Package } from "@shared/schema";
import BillingCard from "@/components/customer/BillingCard";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";

export default function CustomerBilling() {
  const { user } = useAuth();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  // Fetch bills
  const { data: bills, isLoading: isBillsLoading } = useQuery<Bill[]>({ 
    queryKey: ['/api/bills'],
    enabled: !!user
  });
  
  // Fetch user's subscription
  const { data: subscriptions } = useQuery<Subscription[]>({ 
    queryKey: ['/api/subscriptions'],
    enabled: !!user
  });
  
  // Fetch internet packages
  const { data: packages } = useQuery<Package[]>({ 
    queryKey: ['/api/packages'],
    enabled: !!user
  });
  
  // Get user's active subscription (if any)
  const activeSubscription = subscriptions?.find(sub => sub.status === "active");
  
  // Get package details for active subscription
  const activePackage = activeSubscription 
    ? packages?.find(pkg => pkg.id === activeSubscription.packageId) 
    : undefined;
  
  // Filter bills by status
  const unpaidBills = bills?.filter(bill => bill.status === "unpaid") || [];
  const paidBills = bills?.filter(bill => bill.status === "paid") || [];
  const overdueBills = bills?.filter(bill => bill.status === "overdue") || [];
  
  const openDetailsDialog = (bill: Bill) => {
    setSelectedBill(bill);
    setDetailsDialogOpen(true);
  };
  
  // Function to render bill details in the dialog
  const renderBillDetails = () => {
    if (!selectedBill) return null;
    
    const subscription = subscriptions?.find(sub => sub.id === selectedBill.subscriptionId);
    const pkg = subscription ? packages?.find(p => p.id === subscription.packageId) : undefined;
    
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Invoice Number</p>
              <p className="font-medium">#{selectedBill.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <div>
                {selectedBill.status === "paid" ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                    Paid
                  </span>
                ) : selectedBill.status === "overdue" ? (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                    Overdue
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                    Unpaid
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Billing Period</p>
              <p className="font-medium">{selectedBill.period}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Due Date</p>
              <p className="font-medium">{formatDate(new Date(selectedBill.dueDate))}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Subscription Details</h4>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{pkg?.name || "Unknown Package"}</p>
                <p className="text-sm text-gray-600">{pkg?.speed} Mbps Unlimited</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(selectedBill.amount)}</p>
                <p className="text-sm text-gray-500">Monthly fee</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <p className="font-medium">Total Amount</p>
            <p className="text-xl font-bold">{formatCurrency(selectedBill.amount)}</p>
          </div>
        </div>
        
        {selectedBill.status === "paid" && selectedBill.paymentDate && (
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <p className="text-sm font-medium text-green-800">Payment Information</p>
            <p className="text-sm text-green-700">Paid on {formatDate(new Date(selectedBill.paymentDate))}</p>
            
            {selectedBill.paymentProof && (
              <div className="mt-2">
                <p className="text-sm text-green-700 mb-1">Payment Proof:</p>
                <p className="text-xs text-green-700">(Payment proof available)</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <CustomerLayout>
      <Helmet>
        <title>Billing & Payments - SEKAR NET</title>
        <meta name="description" content="Manage your SEKAR NET billing, view invoices, and make payments for your internet subscription." />
      </Helmet>
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Billing & Payments</h2>
        <p className="text-gray-600">Manage your bills and payment history</p>
      </div>
      
      {/* Subscription Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Subscription</h3>
        
        {activePackage ? (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h4 className="text-xl font-bold text-primary">{activePackage.name}</h4>
              <p className="text-gray-600">{activePackage.speed} Mbps Unlimited</p>
              <p className="text-sm text-gray-500 mt-1">
                Subscribed since {activeSubscription && formatDate(new Date(activeSubscription.startDate))}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(activePackage.price)}</p>
              <p className="text-sm text-gray-600">Monthly fee</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">You don't have an active subscription</p>
            <Button 
              className="mt-2" 
              onClick={() => window.location.href = "/customer/packages"}
            >
              Browse Packages
            </Button>
          </div>
        )}
      </div>
      
      {/* Bills */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Bills</h3>
        
        <Tabs defaultValue="unpaid" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3">
            <TabsTrigger value="unpaid">
              Unpaid 
              {unpaidBills.length > 0 && <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">{unpaidBills.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="all">All Bills</TabsTrigger>
          </TabsList>
          
          <TabsContent value="unpaid">
            {isBillsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading bills...</p>
              </div>
            ) : unpaidBills.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">You have no unpaid bills. Yay!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {unpaidBills.map(bill => (
                  <BillingCard 
                    key={bill.id} 
                    bill={bill} 
                    onViewDetails={() => openDetailsDialog(bill)} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="paid">
            {isBillsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading bills...</p>
              </div>
            ) : paidBills.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">You have no paid bills yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paidBills.map(bill => (
                  <BillingCard 
                    key={bill.id} 
                    bill={bill} 
                    onViewDetails={() => openDetailsDialog(bill)} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="all">
            {isBillsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading bills...</p>
              </div>
            ) : bills?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">You have no bills yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bills?.map(bill => (
                  <BillingCard 
                    key={bill.id} 
                    bill={bill} 
                    onViewDetails={() => openDetailsDialog(bill)} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Payment Methods */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Methods</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-xl p-4 hover:border-primary hover:shadow-sm transition-all">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-primary mr-3">
                <i className="ri-bank-line text-xl"></i>
              </div>
              <div>
                <h4 className="font-medium">Bank Transfer</h4>
                <p className="text-sm text-gray-600">Manually verify payment</p>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <p className="font-medium">Bank Account Details:</p>
              <p>SEKAR NET</p>
              <p>Bank Central Asia (BCA)</p>
              <p>Account: 1234567890</p>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-xl p-4 hover:border-primary hover:shadow-sm transition-all">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-primary mr-3">
                <i className="ri-qr-code-line text-xl"></i>
              </div>
              <div>
                <h4 className="font-medium">QRIS</h4>
                <p className="text-sm text-gray-600">Scan to pay instantly</p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded-lg">
                <span className="text-gray-500 text-xs text-center">QRIS Code<br/>Coming Soon</span>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-xl p-4 hover:border-primary hover:shadow-sm transition-all">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-primary mr-3">
                <i className="ri-question-line text-xl"></i>
              </div>
              <div>
                <h4 className="font-medium">Need Help?</h4>
                <p className="text-sm text-gray-600">Contact our billing support</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              If you have any questions about your bill or payment methods, our support team is here to help.
            </p>
            <Button variant="outline" className="w-full">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
      
      {/* Bill Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bill Details</DialogTitle>
          </DialogHeader>
          
          {renderBillDetails()}
          
          <DialogFooter>
            {selectedBill && selectedBill.status === "paid" ? (
              <Button onClick={() => setDetailsDialogOpen(false)}>
                Close
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}
