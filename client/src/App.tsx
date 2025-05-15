import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";

// Auth pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

// Customer pages
import CustomerDashboard from "@/pages/customer/Dashboard";
import CustomerPackages from "@/pages/customer/Packages";
import CustomerBilling from "@/pages/customer/Billing";
import CustomerSupport from "@/pages/customer/Support";
import CustomerProfile from "@/pages/customer/Profile";

// Technician pages
import TechnicianJobs from "@/pages/technician/Jobs";
import TechnicianJobMap from "@/pages/technician/JobMap";
import TechnicianHistory from "@/pages/technician/History";
import TechnicianProfile from "@/pages/technician/Profile";

// Admin pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminCustomers from "@/pages/admin/Customers";
import AdminTechnicians from "@/pages/admin/Technicians";
import AdminPackages from "@/pages/admin/Packages";
import AdminInstallations from "@/pages/admin/Installations";
import AdminSupportTickets from "@/pages/admin/SupportTickets";
import AdminBilling from "@/pages/admin/Billing";
import AdminNotifications from "@/pages/admin/Notifications";

import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Auth Routes */}
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Customer Routes */}
      <Route path="/customer" component={CustomerDashboard} />
      <Route path="/customer/packages" component={CustomerPackages} />
      <Route path="/customer/billing" component={CustomerBilling} />
      <Route path="/customer/support" component={CustomerSupport} />
      <Route path="/customer/profile" component={CustomerProfile} />
      
      {/* Technician Routes */}
      <Route path="/technician" component={TechnicianJobs} />
      <Route path="/technician/map" component={TechnicianJobMap} />
      <Route path="/technician/history" component={TechnicianHistory} />
      <Route path="/technician/profile" component={TechnicianProfile} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/customers" component={AdminCustomers} />
      <Route path="/admin/technicians" component={AdminTechnicians} />
      <Route path="/admin/packages" component={AdminPackages} />
      <Route path="/admin/installations" component={AdminInstallations} />
      <Route path="/admin/support-tickets" component={AdminSupportTickets} />
      <Route path="/admin/billing" component={AdminBilling} />
      <Route path="/admin/notifications" component={AdminNotifications} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
