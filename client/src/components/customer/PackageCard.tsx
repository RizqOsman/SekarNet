import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon } from "lucide-react";
import { Package } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";

interface PackageCardProps {
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  packageData: Package;
  onPlanSelected?: () => void;
}

export default function PackageCard({ 
  isCurrentPlan = false, 
  isPopular = false, 
  packageData,
  onPlanSelected 
}: PackageCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Format price from cents to currency format
  const formatPrice = (price: number) => {
    const priceInK = price / 100000; // Convert to K (100,000)
    return `Rp ${priceInK}K`;
  };
  
  const handleChoosePlan = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to select a package",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isCurrentPlan) {
        toast({
          title: "Current Plan",
          description: "This is already your current plan",
        });
      } else {
        // Request new installation
        await apiRequest("POST", "/api/installation-requests", {
          userId: user.id,
          packageId: packageData.id,
          address: user.address || "",
          preferredDate: new Date().toISOString(),
          notes: `New installation request for ${packageData.name}`
        });
        
        toast({
          title: "Installation Request Submitted",
          description: `Your request for ${packageData.name} has been submitted successfully.`,
        });
        
        if (onPlanSelected) {
          onPlanSelected();
        }
      }
    } catch (error) {
      console.error("Error selecting package:", error);
      toast({
        title: "Error",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="relative border border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-md transition-all">
      {isPopular && (
        <Badge className="absolute top-4 right-4 bg-blue-100 text-blue-600 hover:bg-blue-100">
          Popular
        </Badge>
      )}
      {isCurrentPlan && (
        <Badge className="absolute top-4 right-4 bg-green-100 text-green-600 hover:bg-green-100">
          Current
        </Badge>
      )}
      
      <h4 className="text-xl font-bold text-gray-800 mb-2">{packageData.name}</h4>
      <p className="text-sm text-gray-600 mb-4">{packageData.description}</p>
      
      <div className="mb-4">
        <p className="text-3xl font-bold text-primary">{formatPrice(packageData.price)}</p>
        <p className="text-sm text-gray-600">per month</p>
      </div>
      
      <ul className="space-y-2 mb-6">
        {packageData.features?.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-gray-700">
            <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button
        variant={isCurrentPlan ? "secondary" : "outline"}
        className={`w-full ${isCurrentPlan ? "bg-green-500 text-white hover:bg-green-600" : "border-primary text-primary hover:bg-blue-50"}`}
        onClick={handleChoosePlan}
        disabled={isLoading}
      >
        {isLoading 
          ? "Processing..." 
          : isCurrentPlan 
            ? "Current Plan" 
            : "Choose Plan"
        }
      </Button>
    </div>
  );
}
