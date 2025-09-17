import { Suspense } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";

// Lazy loaded pages
import {
  LoginPage,
  RegisterPage,
  AdminLoginPage,
  CustomerLoginPage,
  TechnicianLoginPage,
  CustomerDashboard,
  CustomerBilling,
  CustomerPackages,
  CustomerSupport,
  CustomerProfile,
  AdminDashboard,
  AdminBilling,
  AdminCustomers,
  AdminPackages,
  AdminSupportTickets,
  AdminTechnicians,
  TechnicianJobs,
  TechnicianMap,
  TechnicianProfile,
  PageLoading,
  Dashboard,
  SelectRole,
  CustomerLogin,
  TechnicianLogin,
  AdminLogin,
  CustomerRegister,
  Register,
  TechnicianJobMap,
  TechnicianHistory,
  AdminInstallations,
  AdminNotifications
} from '@/lib/lazy-pages';

import NotFound from "@/pages/not-found";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Suspense fallback={<PageLoading />}>
            <Switch>
              {/* Public Routes */}
              <Route path="/" component={Dashboard} />
              
              {/* Auth Routes */}
              <Route path="/auth/select-role" component={SelectRole} />
              <Route path="/auth/customer/login" component={CustomerLogin} />
              <Route path="/auth/technician/login" component={TechnicianLogin} />
              <Route path="/auth/admin/login" component={AdminLogin} />
              <Route path="/auth/customer/register" component={CustomerRegister} />
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
              
              {/* Auth routes */}
              <Route path="/login" component={LoginPage} />
              <Route path="/register" component={RegisterPage} />
              <Route path="/auth/admin/login" component={AdminLoginPage} />
              <Route path="/auth/customer/login" component={CustomerLoginPage} />
              <Route path="/auth/technician/login" component={TechnicianLoginPage} />

              {/* Fallback to 404 */}
              <Route component={NotFound} />
            </Switch>
          </Suspense>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;