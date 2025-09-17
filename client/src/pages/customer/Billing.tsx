import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { useLocation } from "wouter";
import { useRealtimeBills } from "@/hooks/use-realtime-bills";

export default function CustomerBilling() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Use the realtime bills hook
  const { bills, isLoading, error } = useRealtimeBills();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'paid') {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Lunas</Badge>;
    } else {
      return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Belum Lunas</Badge>;
    }
  };

  // Calculate stats only if bills are loaded
  const unpaidBills = isLoading || !bills ? [] : bills.filter(bill => bill.status === 'unpaid');
  const totalUnpaid = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Helmet>
        <title>Billing - SEKAR NET</title>
        <meta name="description" content="Kelola tagihan internet Anda dengan mudah" />
      </Helmet>
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/customer")}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tagihan & Pembayaran</h1>
              <p className="text-gray-600">Kelola tagihan internet Anda dengan mudah</p>
            </div>
            <div>
              <Button 
                variant="outline" 
                onClick={() => {
                  // This will trigger a refetch using React Query
                  window.location.reload();
                }}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tagihan Tertunda</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalUnpaid)}</p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tagihan Belum Lunas</p>
                  <p className="text-2xl font-bold text-gray-900">{unpaidBills.length}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tagihan Lunas</p>
                  <p className="text-2xl font-bold text-gray-900">{bills.filter(b => b.status === 'paid').length}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {unpaidBills.length > 0 && (
          <Card className="bg-white border-0 shadow-xl mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Pembayaran Cepat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">Bayar Sekarang</h3>
                    <p className="text-blue-100">Total: {formatCurrency(totalUnpaid)}</p>
                  </div>
                  <Button className="bg-white text-blue-600 hover:bg-blue-50">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Bayar Tagihan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bills List */}
        <Card className="bg-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-green-600" />
              Riwayat Tagihan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              // Loading state
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                    <div className="flex-1">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-48 mb-1" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-24" />
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              // Error state
              <div className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Gagal memuat data</h3>
                <p className="text-gray-600 mb-4">Terjadi kesalahan saat memuat data tagihan Anda.</p>
                <Button onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Coba Lagi
                </Button>
              </div>
            ) : bills.length === 0 ? (
              // Empty state
              <div className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak Ada Tagihan</h3>
                <p className="text-gray-600">Anda tidak memiliki tagihan saat ini.</p>
              </div>
            ) : (
              // Bills list
              <div className="space-y-4">
                {bills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{bill.period}</h4>
                        {getStatusBadge(bill.status)}
                      </div>
                      <p className="text-gray-600 text-sm mb-1">{bill.description}</p>
                      <p className="text-gray-500 text-sm">Jatuh tempo: {formatDate(bill.dueDate)}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(bill.amount)}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Unduh
                        </Button>
                        {bill.status === 'unpaid' && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <CreditCard className="h-4 w-4 mr-1" />
                            Bayar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
