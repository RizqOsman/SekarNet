import { lazy } from 'react';
import { Spinner } from '@/components/ui/spinner';

// Auth Pages
export const LoginPage = lazy(() => import('@/pages/auth/Login'));
export const RegisterPage = lazy(() => import('@/pages/auth/Register'));
export const AdminLoginPage = lazy(() => import('@/pages/auth/AdminLogin'));
export const CustomerLoginPage = lazy(() => import('@/pages/auth/CustomerLogin'));
export const TechnicianLoginPage = lazy(() => import('@/pages/auth/TechnicianLogin'));
export const Dashboard = lazy(() => import('@/pages/Dashboard'));
export const SelectRole = lazy(() => import('@/pages/auth/SelectRole'));

// Customer Pages
export const CustomerDashboard = lazy(() => import('@/pages/customer/Dashboard'));
export const CustomerBilling = lazy(() => import('@/pages/customer/Billing'));
export const CustomerPackages = lazy(() => import('@/pages/customer/Packages'));
export const CustomerSupport = lazy(() => import('@/pages/customer/Support'));
export const CustomerProfile = lazy(() => import('@/pages/customer/Profile'));

// Admin Pages
export const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
export const AdminBilling = lazy(() => import('@/pages/admin/Billing'));
export const AdminCustomers = lazy(() => import('@/pages/admin/Customers'));
export const AdminPackages = lazy(() => import('@/pages/admin/Packages'));
export const AdminSupportTickets = lazy(() => import('@/pages/admin/SupportTickets'));
export const AdminTechnicians = lazy(() => import('@/pages/admin/Technicians'));
export const AdminInstallations = lazy(() => import('@/pages/admin/Installations'));
export const AdminNotifications = lazy(() => import('@/pages/admin/Notifications'));
export const TechnicianJobs = lazy(() => import('@/pages/technician/Jobs'));
export const TechnicianMap = lazy(() => import('@/pages/technician/JobMap'));
export const TechnicianProfile = lazy(() => import('@/pages/technician/Profile'));
export const TechnicianJobMap = lazy(() => import('@/pages/technician/JobMap'));
export const TechnicianHistory = lazy(() => import('@/pages/technician/History'));
export const CustomerLogin = lazy(() => import('@/pages/auth/CustomerLogin'));
export const CustomerRegister = lazy(() => import('@/pages/auth/CustomerRegister'));
export const TechnicianLogin = lazy(() => import('@/pages/auth/TechnicianLogin'));
export const AdminLogin = lazy(() => import('@/pages/auth/AdminLogin'));
export const Register = lazy(() => import('@/pages/auth/Register'));
export const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);