import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wifi, 
  CreditCard, 
  Headphones, 
  User, 
  Activity, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Upload,
  Zap
} from "lucide-react";

export default function CustomerDashboard() {
  const { user } = useAuth();
  
  // Mock data for demonstration
  const connectionStatus = "active";
  const currentSpeed = "50 Mbps";
  const dataUsage = "75%";
  const nextBilling = "15 Juli 2024";
  const outstandingBill = "Rp 299.000";
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Helmet>
        <title>Dashboard - SEKAR NET</title>
        <meta name="description" content="SEKAR NET customer dashboard - Manage your internet subscription, billing, and support." />
      </Helmet>
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Selamat datang, {user?.fullName}!
              </h1>
              <p className="text-gray-600">
                Kelola langganan internet Anda dengan mudah
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant={connectionStatus === "active" ? "default" : "destructive"} className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                {connectionStatus === "active" ? "Terhubung" : "Terputus"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Speed */}
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Kecepatan Saat Ini</p>
                  <p className="text-2xl font-bold text-gray-900">{currentSpeed}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Penggunaan Data</p>
                  <p className="text-2xl font-bold text-gray-900">{dataUsage}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Billing */}
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tagihan Berikutnya</p>
                  <p className="text-2xl font-bold text-gray-900">{nextBilling}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Outstanding Bill */}
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tagihan Tertunda</p>
                  <p className="text-2xl font-bold text-gray-900">{outstandingBill}</p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Package & Billing */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Package */}
            <Card className="bg-white border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <Wifi className="h-5 w-5 text-blue-600" />
                  Paket Internet Aktif
                </CardTitle>
              </CardHeader>
              <CardContent>
                                 <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
                   <div className="flex items-center justify-between mb-4">
                     <div>
                       <h3 className="text-2xl font-bold text-white drop-shadow-sm">SEKAR NET Pro</h3>
                       <p className="text-white font-semibold drop-shadow-sm">50 Mbps Unlimited</p>
                     </div>
                     <Badge variant="secondary" className="bg-white/30 text-white border-white/50 font-medium">
                       Aktif
                     </Badge>
                   </div>
                   <div className="grid grid-cols-2 gap-4 text-sm">
                     <div>
                       <p className="text-white font-semibold drop-shadow-sm">Download</p>
                       <p className="font-bold text-white text-lg drop-shadow-sm">50 Mbps</p>
                     </div>
                     <div>
                       <p className="text-white font-semibold drop-shadow-sm">Upload</p>
                       <p className="font-bold text-white text-lg drop-shadow-sm">20 Mbps</p>
                     </div>
                   </div>
                 </div>
                                 <div className="mt-4 flex gap-3">
                   <Button className="flex-1" variant="outline">
                     Upgrade Paket
                   </Button>
                   <Button className="flex-1" variant="outline">
                     Riwayat Penggunaan
                   </Button>
                 </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-green-600" />
                  Aktivitas Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: "2 menit yang lalu", activity: "Pembayaran tagihan berhasil", status: "success" },
                    { time: "1 jam yang lalu", activity: "Kecepatan internet diperbarui", status: "info" },
                    { time: "3 jam yang lalu", activity: "Tiket dukungan ditutup", status: "success" },
                    { time: "1 hari yang lalu", activity: "Tagihan baru tersedia", status: "warning" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div className={`h-2 w-2 rounded-full ${
                        item.status === "success" ? "bg-green-500" :
                        item.status === "warning" ? "bg-yellow-500" : "bg-blue-500"
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.activity}</p>
                        <p className="text-sm text-gray-500">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions & Profile */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Akses Cepat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline" 
                    size="lg"
                    onClick={() => window.location.href = '/customer/billing'}
                  >
                    <CreditCard className="h-4 w-4 mr-3" />
                    Bayar Tagihan
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline" 
                    size="lg"
                    onClick={() => window.location.href = '/customer/support'}
                  >
                    <Headphones className="h-4 w-4 mr-3" />
                    Dukungan Teknis
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline" 
                    size="lg"
                    onClick={() => window.location.href = '/customer/billing'}
                  >
                    <TrendingUp className="h-4 w-4 mr-3" />
                    Riwayat Tagihan
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline" 
                    size="lg"
                    onClick={() => window.location.href = '/customer/profile'}
                  >
                    <User className="h-4 w-4 mr-3" />
                    Edit Profil
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Profile Summary */}
            <Card className="bg-white border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <User className="h-5 w-5 text-purple-600" />
                  Informasi Akun
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user?.fullName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user?.fullName}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nomor Telepon:</span>
                      <span className="font-medium">{user?.phone || "Belum diatur"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Alamat:</span>
                      <span className="font-medium">{user?.address || "Belum diatur"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Aktif
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Connection Status */}
            <Card className="bg-white border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <Wifi className="h-5 w-5 text-green-600" />
                  Status Koneksi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Terhubung
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">IP Address:</span>
                    <span className="font-mono text-sm">192.168.1.100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Uptime:</span>
                    <span className="font-medium">99.9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 