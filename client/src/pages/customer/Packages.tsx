import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import CustomerLayout from "@/components/layouts/CustomerLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Package, Subscription } from "@shared/schema";
import PackageCard from "@/components/customer/PackageCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function CustomerPackages() {
  const { user } = useAuth();
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  
  // Fetch internet packages
  const { data: packages } = useQuery<Package[]>({ 
    queryKey: ['/api/packages'],
    enabled: !!user
  });
  
  // Fetch user's subscription
  const { data: subscriptions } = useQuery<Subscription[]>({ 
    queryKey: ['/api/subscriptions'],
    enabled: !!user
  });
  
  // Get user's active subscription (if any)
  const activeSubscription = subscriptions?.find(sub => sub.status === "active");
  
  // Get package ID for active subscription
  const activePackageId = activeSubscription?.packageId;
  
  // Group packages by speed
  const basicPackages = packages?.filter(pkg => pkg.speed <= 20) || [];
  const standardPackages = packages?.filter(pkg => pkg.speed > 20 && pkg.speed <= 50) || [];
  const premiumPackages = packages?.filter(pkg => pkg.speed > 50) || [];
  
  const handlePlanSelected = () => {
    setSuccessDialogOpen(true);
  };
  
  return (
    <CustomerLayout>
      <Helmet>
        <title>Internet Packages - SEKAR NET</title>
        <meta name="description" content="Browse and select from SEKAR NET's high-speed internet packages - from basic browsing to premium fiber optic solutions." />
      </Helmet>
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Internet Packages</h2>
        <p className="text-gray-600">Choose the perfect internet package for your needs</p>
      </div>
      
      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Packages</TabsTrigger>
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="standard">Standard</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages?.map(pkg => (
              <PackageCard 
                key={pkg.id}
                packageData={pkg}
                isCurrentPlan={pkg.id === activePackageId}
                isPopular={pkg.isPopular}
                onPlanSelected={handlePlanSelected}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="basic">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {basicPackages.map(pkg => (
              <PackageCard 
                key={pkg.id}
                packageData={pkg}
                isCurrentPlan={pkg.id === activePackageId}
                isPopular={pkg.isPopular}
                onPlanSelected={handlePlanSelected}
              />
            ))}
            
            {basicPackages.length === 0 && (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">No basic packages available at the moment.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="standard">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {standardPackages.map(pkg => (
              <PackageCard 
                key={pkg.id}
                packageData={pkg}
                isCurrentPlan={pkg.id === activePackageId}
                isPopular={pkg.isPopular}
                onPlanSelected={handlePlanSelected}
              />
            ))}
            
            {standardPackages.length === 0 && (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">No standard packages available at the moment.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="premium">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {premiumPackages.map(pkg => (
              <PackageCard 
                key={pkg.id}
                packageData={pkg}
                isCurrentPlan={pkg.id === activePackageId}
                isPopular={pkg.isPopular}
                onPlanSelected={handlePlanSelected}
              />
            ))}
            
            {premiumPackages.length === 0 && (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">No premium packages available at the moment.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Package Features Comparison */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Package Comparison</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Feature</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">Basic</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">Standard</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">Download Speed</td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">Up to 20 Mbps</td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">Up to 50 Mbps</td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">Up to 100 Mbps</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">Upload Speed</td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">Up to 10 Mbps</td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">Up to 25 Mbps</td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">Up to 50 Mbps</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">Data Limit</td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">Unlimited</td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">Unlimited</td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">Unlimited</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">Support</td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">24/7 Basic Support</td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">24/7 Priority Support</td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">24/7 VIP Support</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">WiFi Router</td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">Basic Router</td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">Dual-Band Router</td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">Premium Mesh System</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">Ideal For</td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">Basic browsing, email, social media</td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">Streaming HD content, online gaming</td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">4K streaming, heavy downloads, multiple users</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Installation Request Submitted</DialogTitle>
          </DialogHeader>
          
          <div className="py-6">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <i className="ri-check-line text-green-600 text-4xl"></i>
              </div>
            </div>
            
            <p className="text-center text-gray-700">
              Thank you for your installation request! Our team will review your request and contact you to schedule the installation.
            </p>
            <p className="text-center text-gray-700 mt-2">
              You can track the status of your installation in your dashboard.
            </p>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setSuccessDialogOpen(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}
