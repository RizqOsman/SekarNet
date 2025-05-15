import { useState, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";

type NavSection = {
  title: string;
  items: NavItem[];
};

type NavItem = {
  name: string;
  path: string;
  icon: string;
};

const navSections: NavSection[] = [
  {
    title: "Dashboard",
    items: [
      { name: "Overview", path: "/admin", icon: "ri-dashboard-line" },
    ],
  },
  {
    title: "Management",
    items: [
      { name: "Customers", path: "/admin/customers", icon: "ri-user-line" },
      { name: "Technicians", path: "/admin/technicians", icon: "ri-tools-line" },
      { name: "Packages", path: "/admin/packages", icon: "ri-rocket-line" },
    ],
  },
  {
    title: "Operations",
    items: [
      { name: "Installations", path: "/admin/installations", icon: "ri-install-line" },
      { name: "Support Tickets", path: "/admin/support-tickets", icon: "ri-customer-service-2-line" },
      { name: "Billing", path: "/admin/billing", icon: "ri-file-list-3-line" },
    ],
  },
  {
    title: "System",
    items: [
      { name: "Notifications", path: "/admin/notifications", icon: "ri-notification-3-line" },
    ],
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMobile();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Get user's initials for avatar
  const getUserInitials = (): string => {
    if (!user || !user.fullName) return "A";
    
    const names = user.fullName.split(" ");
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-[hsl(var(--sidebar-background))] text-white">
        <div className="flex items-center p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">SEKAR NET</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navSections.map((section) => (
            <div key={section.title} className="mb-6">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </p>
              <div className={section.title === "Dashboard" ? "mt-2" : "mt-2 space-y-1"}>
                {section.items.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <a 
                      className={`flex items-center px-3 py-2 rounded-lg ${
                        location === item.path 
                          ? "bg-blue-900 bg-opacity-40 text-blue-200 font-medium" 
                          : "text-gray-300 hover:bg-blue-900 hover:bg-opacity-40 hover:text-blue-200 font-medium"
                      }`}
                    >
                      <i className={`${item.icon} mr-3 text-lg`}></i>
                      {item.name}
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          
          <div className="mb-6">
            <Link href="#" onClick={logout}>
              <a className="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-blue-900 hover:bg-opacity-40 hover:text-blue-200 font-medium">
                <i className="ri-logout-box-line mr-3 text-lg"></i>
                Logout
              </a>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 bg-[hsl(var(--sidebar-background))] text-white shadow-sm z-10 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button
              className="mr-2 text-gray-300"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <i className="ri-menu-line text-xl"></i>
            </button>
            <h1 className="text-xl font-bold">SEKAR NET</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/admin/notifications">
              <a className="text-gray-300">
                <i className="ri-notification-3-line text-xl"></i>
              </a>
            </Link>
            <Link href="/admin/profile">
              <a className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 text-white">
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
            className="absolute left-0 top-0 bottom-0 w-64 bg-[hsl(var(--sidebar-background))] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">SEKAR NET</h2>
              <button
                className="text-gray-300"
                onClick={toggleMobileMenu}
                aria-label="Close mobile menu"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            <nav className="p-4 space-y-2">
              {navSections.map((section) => (
                <div key={section.title} className="mb-6">
                  <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {section.title}
                  </p>
                  <div className={section.title === "Dashboard" ? "mt-2" : "mt-2 space-y-1"}>
                    {section.items.map((item) => (
                      <Link key={item.path} href={item.path}>
                        <a 
                          className={`flex items-center px-3 py-2 rounded-lg ${
                            location === item.path 
                              ? "bg-blue-900 bg-opacity-40 text-blue-200 font-medium" 
                              : "text-gray-300 hover:bg-blue-900 hover:bg-opacity-40 hover:text-blue-200 font-medium"
                          }`}
                          onClick={isMobile ? toggleMobileMenu : undefined}
                        >
                          <i className={`${item.icon} mr-3 text-lg`}></i>
                          {item.name}
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="mb-6">
                <Link href="#" onClick={logout}>
                  <a className="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-blue-900 hover:bg-opacity-40 hover:text-blue-200 font-medium">
                    <i className="ri-logout-box-line mr-3 text-lg"></i>
                    Logout
                  </a>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="container mx-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
