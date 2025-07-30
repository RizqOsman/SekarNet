import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { User, Wrench, Shield, ArrowRight, Wifi, Settings, Users } from "lucide-react";

export default function SelectRole() {
  const [, setLocation] = useLocation();

  const roles = [
    {
      id: "customer",
      title: "Pelanggan",
      description: "Kelola langganan internet, tagihan, dan tiket dukungan Anda",
      icon: User,
      color: "blue",
      features: ["Lihat tagihan & pembayaran", "Kelola langganan", "Ajukan tiket dukungan", "Lacak status instalasi"],
      path: "/auth/customer/login"
    },
    {
      id: "technician",
      title: "Teknisi",
      description: "Akses pekerjaan instalasi, tiket dukungan, dan operasi lapangan",
      icon: Wrench,
      color: "orange",
      features: ["Lihat pekerjaan yang ditugaskan", "Perbarui status pekerjaan", "Tangani tiket dukungan", "Akses alat lapangan"],
      path: "/auth/technician/login"
    },
    {
      id: "admin",
      title: "Administrator",
      description: "Kemampuan administrasi dan manajemen sistem penuh",
      icon: Shield,
      color: "purple",
      features: ["Kelola semua pengguna", "Konfigurasi sistem", "Lihat laporan & analitik", "Akses sistem penuh"],
      path: "/auth/admin/login"
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700";
      case "orange":
        return "bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700";
      case "purple":
        return "bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700";
      default:
        return "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700";
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case "blue":
        return "text-blue-600";
      case "orange":
        return "text-orange-600";
      case "purple":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <>
      <Helmet>
        <title>Pilih Peran - SEKAR NET</title>
        <meta name="description" content="Pilih peran Anda untuk mengakses sistem SEKAR NET - Pelanggan, Teknisi, atau Administrator." />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Wifi className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-800">SEKAR NET</h1>
            </div>
            <p className="text-xl text-gray-600">Provider internet terpercaya</p>
            <p className="text-gray-500 mt-2">Pilih peran Anda untuk melanjutkan</p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role) => {
              const IconComponent = role.icon;
              return (
                <Card 
                  key={role.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${getColorClasses(role.color)}`}
                  onClick={() => setLocation(role.path)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${getColorClasses(role.color)}`}>
                      <IconComponent className={`h-8 w-8 ${getIconColor(role.color)}`} />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-800">{role.title}</CardTitle>
                    <p className="text-gray-600 text-sm">{role.description}</p>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3 mb-6">
                      {role.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          {feature}
                        </div>
                      ))}
                    </div>

                    <Button 
                      className={`w-full ${role.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 
                                   role.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700' : 
                                   'bg-purple-600 hover:bg-purple-700'}`}
                      onClick={() => setLocation(role.path)}
                    >
                      Lanjutkan sebagai {role.title}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              Butuh bantuan? Hubungi tim dukungan kami
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 