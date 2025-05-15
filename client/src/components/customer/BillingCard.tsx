import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bill } from "@shared/schema";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils/formatting";

interface BillingCardProps {
  bill: Bill;
  onViewDetails?: (bill: Bill) => void;
}

export default function BillingCard({ bill, onViewDetails }: BillingCardProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  // Calculate days until due
  const getDaysUntilDue = () => {
    const dueDate = new Date(bill.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();

  const getBadgeData = () => {
    if (bill.status === "paid") {
      return { text: "Paid", className: "bg-green-100 text-green-800" };
    } else if (bill.status === "overdue") {
      return { text: "Overdue", className: "bg-red-100 text-red-800" };
    } else {
      return { 
        text: daysUntilDue > 0 ? `Due in ${daysUntilDue} days` : "Due today", 
        className: daysUntilDue > 3 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800" 
      };
    }
  };

  const badgeData = getBadgeData();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileToUpload(e.target.files[0]);
    }
  };

  const uploadPaymentProof = async () => {
    if (!fileToUpload) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload as payment proof",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // In a real app, we'd upload the file to a server
      // For this prototype, we'll just simulate the file upload
      // by converting to base64 and sending that as the proof
      const reader = new FileReader();
      reader.readAsDataURL(fileToUpload);
      reader.onload = async () => {
        const base64String = reader.result as string;
        
        await apiRequest("PATCH", `/api/bills/${bill.id}/payment`, {
          paymentProof: base64String
        });

        queryClient.invalidateQueries({ queryKey: ['/api/bills'] });
        
        toast({
          title: "Payment proof uploaded",
          description: "Your payment proof has been successfully uploaded and is being reviewed.",
        });
        setFileToUpload(null);
      };
    } catch (error) {
      console.error("Error uploading payment proof:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your payment proof. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Bill #{bill.id}</h3>
          <Badge className={badgeData.className}>{badgeData.text}</Badge>
        </div>
        
        <div className="mb-4">
          <h4 className="text-2xl font-bold text-gray-800">{formatCurrency(bill.amount)}</h4>
          <p className="text-gray-600">For {bill.period}</p>
        </div>
        
        {bill.status !== "paid" ? (
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="file"
                id={`payment-proof-${bill.id}`}
                className="hidden"
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
              <label 
                htmlFor={`payment-proof-${bill.id}`}
                className="flex-1 py-2 px-3 border border-gray-300 rounded-lg text-center cursor-pointer text-gray-700 hover:bg-gray-50"
              >
                {fileToUpload ? fileToUpload.name : "Select Payment Proof"}
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="default"
                className="w-full"
                disabled={!fileToUpload || isUploading}
                onClick={uploadPaymentProof}
              >
                {isUploading ? "Uploading..." : "Upload Proof"}
              </Button>
              
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => onViewDetails && onViewDetails(bill)}
              >
                View Details
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => onViewDetails && onViewDetails(bill)}
          >
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
