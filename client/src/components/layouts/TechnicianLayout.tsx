import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

type NavItem = {
  name: string;
  path: string;
  icon: string;
};

const navItems: NavItem[] = [
  { name: "Jobs", path: "/technician", icon: "ri-list-check-2" },
  { name: "Map", path: "/technician/map", icon: "ri-map-pin-line" },
  { name: "History", path: "/technician/history", icon: "ri-history-line" },
  { name: "Profile", path: "/technician/profile", icon: "ri-user-line" },
];

export default function TechnicianLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  // Get user's initials for avatar
  const getUserInitials = (): string => {
    if (!user || !user.fullName) return "T";
    
    const names = user.fullName.split(" ");
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white shadow-sm z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">SEKAR NET - Technician</h1>
          <div className="flex items-center space-x-3">
            <Link href="/technician/profile">
              <a className="flex items-center justify-center h-8 w-8 rounded-full bg-white text-primary">
                {getUserInitials()}
              </a>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t">
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
          <a
            className="flex flex-col items-center py-2 px-3 text-gray-600"
            onClick={logout}
          >
            <i className="ri-logout-box-line text-xl"></i>
            <span className="text-xs mt-1">Logout</span>
          </a>
        </div>
      </nav>
    </div>
  );
}
