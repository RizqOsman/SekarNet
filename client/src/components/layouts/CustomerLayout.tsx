import { useState, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";

type NavItem = {
  name: string;
  path: string;
  icon: string;
};

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/customer", icon: "ri-dashboard-line" },
  { name: "Internet Packages", path: "/customer/packages", icon: "ri-rocket-line" },
  { name: "Billing", path: "/customer/billing", icon: "ri-file-list-3-line" },
  { name: "Support", path: "/customer/support", icon: "ri-customer-service-2-line" },
  { name: "Profile", path: "/customer/profile", icon: "ri-user-line" },
];

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMobile();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Get user's initials for avatar
  const getUserInitials = (): string => {
    if (!user || !user.fullName) return "U";
    
    const names = user.fullName.split(" ");
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button
              className="mr-2 text-gray-600"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <i className="ri-menu-line text-xl"></i>
            </button>
            <h1 className="text-xl font-bold text-primary">SEKAR NET</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/customer/profile">
              <a className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white">
                {getUserInitials()}
              </a>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 md:hidden"
          onClick={toggleMobileMenu}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary">SEKAR NET</h2>
              <button
                className="text-gray-600"
                onClick={toggleMobileMenu}
                aria-label="Close mobile menu"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <a
                    className={`flex items-center px-3 py-2 rounded-lg ${
                      location === item.path
                        ? "bg-blue-50 text-primary font-medium"
                        : "text-gray-700 hover:bg-blue-50 hover:text-primary font-medium"
                    }`}
                    onClick={isMobile ? toggleMobileMenu : undefined}
                  >
                    <i className={`${item.icon} mr-3 text-lg`}></i>
                    {item.name}
                  </a>
                </Link>
              ))}
            </nav>

            <div className="absolute bottom-4 left-4 right-4">
              <Button
                variant="ghost"
                className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 w-full justify-start"
                onClick={logout}
              >
                <i className="ri-logout-box-line mr-3 text-lg"></i>
                Log Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white shadow-sm border-r">
        <div className="flex items-center p-4 border-b">
          <h1 className="text-xl font-bold text-primary">SEKAR NET</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={`flex items-center px-3 py-2 rounded-lg ${
                  location === item.path
                    ? "bg-blue-50 text-primary font-medium"
                    : "text-gray-700 hover:bg-blue-50 hover:text-primary font-medium"
                }`}
              >
                <i className={`${item.icon} mr-3 text-lg`}></i>
                {item.name}
              </a>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 w-full justify-start"
            onClick={logout}
          >
            <i className="ri-logout-box-line mr-3 text-lg"></i>
            Log Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="container mx-auto p-4 md:p-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-10">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={`flex flex-col items-center py-2 px-3 ${
                  location === item.path ? "text-primary" : "text-gray-600"
                }`}
              >
                <i className={`${item.icon} text-xl`}></i>
                <span className="text-xs mt-1">{item.name}</span>
              </a>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
