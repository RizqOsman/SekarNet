import { useState } from "react";
import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Headphones, 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Send,
  FileText,
  Wifi,
  Settings,
  Eye
} from "lucide-react";
import { useLocation } from "wouter";

export default function CustomerSupport() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Mock support tickets
  const tickets = [
    {
      id: 1,
      subject: "Koneksi internet lambat",
      category: "Technical",
      status: "open",
      priority: "medium",
      createdAt: "2024-07-28",
      lastUpdate: "2024-07-28"
    },
    {
      id: 2,
      subject: "Ganti alamat instalasi",
      category: "Account",
      status: "resolved",
      priority: "low",
      createdAt: "2024-07-25",
      lastUpdate: "2024-07-26"
    }
  ];

  const getStatusBadge = (status: string) => {
    if (status === 'open') {
      return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Terbuka</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Selesai</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800"
    };
    return <Badge className={colors[priority as keyof typeof colors]}>{priority}</Badge>;
  };

  const supportCategories = [
    { id: "technical", name: "Masalah Teknis", icon: Wifi, description: "Koneksi internet, kecepatan, gangguan" },
    { id: "billing", name: "Tagihan & Pembayaran", icon: Settings, description: "Tagihan, pembayaran, paket" },
    { id: "account", name: "Akun & Profil", icon: FileText, description: "Ganti data, password, alamat" },
    { id: "installation", name: "Instalasi", icon: Settings, description: "Jadwal instalasi, relokasi" }
  ];

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle ticket submission
    console.log("Submitting ticket:", { selectedCategory, subject, message });
    // Reset form
    setSelectedCategory("");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Helmet>
        <title>Dukungan Teknis - SEKAR NET</title>
        <meta name="description" content="Dapatkan bantuan teknis untuk layanan internet Anda" />
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dukungan Teknis</h1>
              <p className="text-gray-600">Kami siap membantu menyelesaikan masalah Anda</p>
            </div>
          </div>
        </div>

        {/* Quick Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Telepon</h3>
              <p className="text-gray-600 mb-3">021-1234-5678</p>
              <p className="text-sm text-gray-500">Senin - Jumat, 08:00 - 17:00</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">WhatsApp</h3>
              <p className="text-gray-600 mb-3">0812-3456-7890</p>
              <p className="text-sm text-gray-500">24/7 Support</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600 mb-3">support@sekar.net</p>
              <p className="text-sm text-gray-500">Respon dalam 24 jam</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create New Ticket */}
          <Card className="bg-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Headphones className="h-5 w-5 text-blue-600" />
                Buat Tiket Baru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <Label htmlFor="category">Kategori Masalah</Label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Pilih kategori</option>
                    {supportCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="subject">Subjek</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Masukkan subjek masalah"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Deskripsi Masalah</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Jelaskan masalah Anda secara detail..."
                    rows={4}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4 mr-2" />
                  Kirim Tiket
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Support Categories */}
          <Card className="bg-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-green-600" />
                Kategori Dukungan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <category.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{category.name}</h4>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tickets */}
        <Card className="bg-white border-0 shadow-xl mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-600" />
              Tiket Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{ticket.subject}</h4>
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </div>
                    <p className="text-gray-600 text-sm mb-1">Kategori: {ticket.category}</p>
                    <p className="text-gray-500 text-sm">Dibuat: {ticket.createdAt}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Lihat Detail
                    </Button>
                    {ticket.status === 'open' && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Balas
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
