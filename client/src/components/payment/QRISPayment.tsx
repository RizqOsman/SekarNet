import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Upload, 
  CreditCard, 
  CheckCircle,
  AlertCircle,
  Info,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRISPaymentProps {
  billId: number;
  amount: number;
  period: string;
  dueDate: Date;
  onPaymentComplete?: () => void;
}

interface QRISData {
  billId: number;
  amount: number;
  merchantName: string;
  billNumber: string;
  qrImageUrl: string;
  instructions: string[];
  paymentDetails: {
    amount: string;
    period: string;
    dueDate: string;
    billNumber: string;
  };
}

export default function QRISPayment({
  billId,
  amount,
  period,
  dueDate,
  onPaymentComplete
}: QRISPaymentProps) {
  const [qrisData, setQrisData] = useState<QRISData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch QRIS data
  const fetchQRISData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/payment/qris/${billId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch QRIS data');
      }

      const data = await response.json();
      setQrisData(data.qrisData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load QRIS payment data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Download QRIS image
  const downloadQRIS = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/payment/qris/${billId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download QRIS image');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qris-sekar-net-bill-${billId}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "QRIS image downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QRIS image",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload JPEG, PNG, or PDF files only",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload files smaller than 2MB",
          variant: "destructive"
        });
        return;
      }

      setPaymentProof(file);
    }
  };

  // Submit payment proof
  const submitPaymentProof = async () => {
    if (!paymentProof) {
      toast({
        title: "No file selected",
        description: "Please select a payment proof file",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('paymentProof', paymentProof);

      const response = await fetch(`/api/payment/qris/${billId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to submit payment proof');
      }

      toast({
        title: "Success",
        description: "Payment proof submitted successfully",
      });

      onPaymentComplete?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit payment proof",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy payment details to clipboard
  const copyPaymentDetails = () => {
    const details = `SEKAR NET Payment Details:
Bill Number: ${qrisData?.billNumber}
Amount: ${qrisData?.paymentDetails.amount}
Period: ${qrisData?.paymentDetails.period}
Due Date: ${qrisData?.paymentDetails.dueDate}`;

    navigator.clipboard.writeText(details);
    toast({
      title: "Copied",
      description: "Payment details copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      {/* Payment Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            QRIS Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg">Payment Details</h3>
              <div className="space-y-2 mt-2">
                <p><strong>Bill Number:</strong> {qrisData?.billNumber || `BILL-${billId.toString().padStart(6, '0')}`}</p>
                <p><strong>Amount:</strong> Rp {(amount / 100).toLocaleString()}</p>
                <p><strong>Period:</strong> {period}</p>
                <p><strong>Due Date:</strong> {dueDate.toLocaleDateString('id-ID')}</p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Badge variant={dueDate < new Date() ? "destructive" : "default"}>
                {dueDate < new Date() ? "Overdue" : "Active"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QRIS Image Section */}
      <Card>
        <CardHeader>
          <CardTitle>Scan QRIS Code</CardTitle>
        </CardHeader>
        <CardContent>
          {!qrisData ? (
            <div className="text-center py-8">
              <Button onClick={fetchQRISData} disabled={isLoading}>
                {isLoading ? "Loading..." : "Load QRIS Payment"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* QRIS Image */}
              <div className="flex justify-center">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <img 
                    src={qrisData.qrImageUrl} 
                    alt="QRIS Code" 
                    className="w-64 h-64 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/qris-placeholder.png';
                    }}
                  />
                </div>
              </div>

              {/* Download Button */}
              <div className="flex justify-center">
                <Button 
                  onClick={downloadQRIS} 
                  disabled={isDownloading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isDownloading ? "Downloading..." : "Download QRIS Image"}
                </Button>
              </div>

              {/* Payment Instructions */}
              <div className="mt-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Payment Instructions
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  {qrisData.instructions.map((instruction, index) => (
                    <li key={index} className="text-gray-700">{instruction}</li>
                  ))}
                </ol>
              </div>

              {/* Copy Payment Details */}
              <div className="flex justify-center">
                <Button 
                  onClick={copyPaymentDetails}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Payment Details
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Proof Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Payment Proof
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                After making the payment, please upload a screenshot or photo of your payment confirmation.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <label htmlFor="payment-proof" className="block text-sm font-medium">
                Payment Proof (JPEG, PNG, PDF - Max 2MB)
              </label>
              <input
                id="payment-proof"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {paymentProof && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">
                  File selected: {paymentProof.name}
                </span>
              </div>
            )}

            <Button 
              onClick={submitPaymentProof}
              disabled={!paymentProof || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Submitting..." : "Submit Payment Proof"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Status */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Payment Method:</span>
              <Badge variant="outline">QRIS</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <Badge variant="secondary">Pending Verification</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Processing Time:</span>
              <span className="text-sm text-gray-600">1-2 business days</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 