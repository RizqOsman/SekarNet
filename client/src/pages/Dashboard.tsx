import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  Wifi, 
  Zap, 
  Shield, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight, 
  Star, 
  CheckCircle,
  Clock,
  Globe,
  Award,
  TrendingUp
} from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const packages = [
    {
      name: "Paket Basic",
      speed: "20 Mbps",
      price: "Rp 199.000",
      features: ["Unlimited Internet", "24/7 Support", "Free Installation", "No FUP"],
      popular: false
    },
    {
      name: "Paket Standard",
      speed: "50 Mbps",
      price: "Rp 299.000",
      features: ["Unlimited Internet", "24/7 Support", "Free Installation", "No FUP", "Free WiFi Router"],
      popular: true
    },
    {
      name: "Paket Premium",
      speed: "100 Mbps",
      price: "Rp 499.000",
      features: ["Unlimited Internet", "24/7 Support", "Free Installation", "No FUP", "Free WiFi Router", "Priority Support"],
      popular: false
    }
  ];

  const features = [
    {
      icon: Zap,
      title: "Kecepatan Tinggi",
      description: "Nikmati internet super cepat hingga 100 Mbps untuk streaming dan gaming tanpa lag"
    },
    {
      icon: Shield,
      title: "Keamanan Terjamin",
      description: "Koneksi internet yang aman dan stabil dengan teknologi terbaru"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Tim support kami siap membantu Anda kapan saja, 24 jam sehari"
    },
    {
      icon: Globe,
      title: "Jangkauan Luas",
      description: "Cakupan area yang luas di seluruh kota dengan kualitas terbaik"
    }
  ];

  const testimonials = [
    {
      name: "Budi Santoso",
      role: "Pengusaha",
      content: "SEKAR NET sangat membantu bisnis saya. Koneksi stabil dan support yang responsif!",
      rating: 5
    },
    {
      name: "Sari Indah",
      role: "Mahasiswa",
      content: "Perfect untuk streaming dan online learning. Tidak pernah lag!",
      rating: 5
    },
    {
      name: "Ahmad Rizki",
      role: "Gamer",
      content: "Latency rendah, perfect untuk gaming. Recommended banget!",
      rating: 5
    }
  ];

  const stats = [
    { label: "Pelanggan Aktif", value: "10,000+", icon: Users },
    { label: "Area Terjangkau", value: "50+", icon: MapPin },
    { label: "Kecepatan Maksimal", value: "100 Mbps", icon: Zap },
    { label: "Rating Pelanggan", value: "4.9/5", icon: Star }
  ];

  return (
    <>
      <Helmet>
        <title>SEKAR NET - Provider Internet Terpercaya</title>
        <meta name="description" content="SEKAR NET menyediakan layanan internet cepat dan stabil dengan harga terjangkau. Nikmati streaming, gaming, dan browsing tanpa batas." />
      </Helmet>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Wifi className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-800">SEKAR NET</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setLocation("/auth/select-role")}
              >
                Masuk
              </Button>
              <Button
                onClick={() => setLocation("/auth/customer/register")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Daftar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                Internet Cepat & Stabil
                <span className="text-blue-600"> Tanpa Batas</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
                Nikmati pengalaman internet terbaik dengan kecepatan hingga 100 Mbps. 
                Perfect untuk streaming, gaming, dan kebutuhan digital Anda.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
                <Button
                  size="lg"
                  onClick={() => setLocation("/auth/customer/register")}
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3 transform hover:scale-105 transition-transform duration-200"
                >
                  Daftar Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setLocation("/auth/select-role")}
                  className="text-lg px-8 py-3 transform hover:scale-105 transition-transform duration-200"
                >
                  Cek Ketersediaan
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Mengapa Memilih SEKAR NET?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kami berkomitmen memberikan layanan internet terbaik dengan teknologi terkini 
              dan support yang responsif untuk memenuhi kebutuhan digital Anda.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Pilih Paket Internet Anda
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Berbagai pilihan paket internet dengan harga terjangkau dan fitur lengkap 
              untuk memenuhi kebutuhan digital Anda.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <Card key={index} className={`relative ${pkg.popular ? 'ring-2 ring-blue-500' : ''}`}>
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    Paling Populer
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <div className="text-3xl font-bold text-blue-600">{pkg.price}</div>
                  <div className="text-gray-600">per bulan</div>
                  <div className="text-lg font-semibold text-gray-800">{pkg.speed}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${pkg.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                    onClick={() => setLocation("/auth/customer/register")}
                  >
                    Pilih Paket
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Apa Kata Pelanggan Kami?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ribuan pelanggan telah mempercayai SEKAR NET untuk kebutuhan internet mereka.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-800">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Siap Bergabung dengan SEKAR NET?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Daftar sekarang dan nikmati internet cepat dengan harga terjangkau. 
            Tim kami siap membantu Anda mendapatkan koneksi terbaik.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setLocation("/auth/customer/register")}
              className="text-lg px-8 py-3"
            >
              Daftar Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3"
              onClick={() => setLocation("/auth/select-role")}
            >
              Hubungi Kami
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Wifi className="h-6 w-6 text-blue-400 mr-2" />
                <span className="text-xl font-bold">SEKAR NET</span>
              </div>
              <p className="text-gray-300 text-sm">
                Provider internet terpercaya dengan layanan berkualitas tinggi 
                untuk memenuhi kebutuhan digital Anda.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Layanan</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Internet Rumah</li>
                <li>Internet Bisnis</li>
                <li>WiFi Hotspot</li>
                <li>VPN Service</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Perusahaan</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Tentang Kami</li>
                <li>Karir</li>
                <li>Berita</li>
                <li>Kontak</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Kontak</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>+62 21 1234 5678</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>info@sekar.net</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Jakarta, Indonesia</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
            <p>&copy; 2024 SEKAR NET. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </>
  );
} 