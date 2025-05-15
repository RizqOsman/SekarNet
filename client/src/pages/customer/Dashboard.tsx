import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import CustomerLayout from "@/components/layouts/CustomerLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Subscription, Package, Bill, UserActivity, Notification, ConnectionStat } from "@shared/schema";
import ConnectionStats from "@/components/customer/ConnectionStats";
import ActivityFeed from "@/components/customer/ActivityFeed";
import NotificationsList from "@/components/customer/NotificationsList";
import SupportOptions from "@/components/customer/SupportOptions";
import { formatCurrency, formatDate } from "@/lib/utils/formatting";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Fetch user's subscription
  const { data: subscriptions } = useQuery<Subscription[]>({ 
    queryKey: ['/api/subscriptions'],
    enabled: !!user
  });
  
  // Fetch internet packages
  const { data: packages } = useQuery<Package[]>({ 
    queryKey: ['/api/packages'],
    enabled: !!user
  });
  
  // Fetch bills
  const { data: bills } = useQuery<Bill[]>({ 
    queryKey: ['/api/bills'],
    enabled: !!user
  });
  
  // Fetch user activities
  const { data: activities } = useQuery<UserActivity[]>({ 
    queryKey: ['/api/user-activities'],
    enabled: !!user
  });
  
  // Fetch notifications
  const { data: notifications } = useQuery<Notification[]>({ 
    queryKey: ['/api/notifications'],
    enabled: !!user
  });
  
  // Fetch connection stats
  const { data: connectionStats } = useQuery<ConnectionStat[]>({ 
    queryKey: ['/api/connection-stats'],
    enabled: !!user
  });
  
  // Get user's active subscription (if any)
  const activeSubscription = subscriptions?.find(sub => sub.status === "active");
  
  // Get package details for active subscription
  const activePackage = activeSubscription 
    ? packages?.find(pkg => pkg.id === activeSubscription.packageId) 
    : undefined;
  
  // Get latest unpaid bill
  const latestBill = bills?.filter(bill => bill.status === "unpaid")
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())[0];
  
  // Get latest connection stat
  const latestConnectionStat = connectionStats?.sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  )[0];
  
  // Limit activities and notifications for dashboard
  const recentActivities = activities?.slice(0, 3) || [];
  const recentNotifications = notifications?.slice(0, 3) || [];
  
  // Calculate days until due for the latest bill
  const getDaysUntilDue = () => {
    if (!latestBill) return 0;
    
    const dueDate = new Date(latestBill.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const daysUntilDue = getDaysUntilDue();
  
  return (
    <CustomerLayout>
      <Helmet>
        <title>Dashboard - SEKAR NET</title>
        <meta name="description" content="SEKAR NET customer dashboard - Manage your internet subscription, billing, and support." />
      </Helmet>
      
      {/* Greeting and User Info */}
      <div className="mb-6 md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome, {user?.fullName}</h2>
          <p className="text-gray-600">Here's what's happening with your connection</p>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Current Package */}
        <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Current Package</h3>
              {activeSubscription ? (
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800">No Active Package</Badge>
              )}
            </div>
            
            {activePackage ? (
              <>
                <div className="mb-4">
                  <h4 className="text-2xl font-bold text-primary">{activePackage.name}</h4>
                  <p className="text-gray-600">{activePackage.speed} Mbps Unlimited</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Next billing date</p>
                    <p className="font-medium">
                      {activeSubscription && activeSubscription.endDate 
                        ? formatDate(new Date(activeSubscription.endDate))
                        : "Not available"}
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    className="px-3 py-1 rounded-lg bg-blue-50 text-primary text-sm font-medium hover:bg-blue-100"
                    onClick={() => navigate("/customer/packages")}
                  >
                    Upgrade
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">You don't have an active package</p>
                <Button 
                  variant="default"
                  onClick={() => navigate("/customer/packages")}
                >
                  Browse Packages
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Payment Status</h3>
              
              {latestBill ? (
                latestBill.status === "paid" ? (
                  <Badge className="bg-green-100 text-green-800">Paid</Badge>
                ) : (
                  <Badge className={daysUntilDue > 3 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                    {daysUntilDue > 0 ? `Due in ${daysUntilDue} days` : "Due today"}
                  </Badge>
                )
              ) : (
                <Badge className="bg-gray-100 text-gray-800">No Bills</Badge>
              )}
            </div>
            
            {latestBill ? (
              <>
                <div className="mb-4">
                  <h4 className="text-2xl font-bold text-gray-800">{formatCurrency(latestBill.amount)}</h4>
                  <p className="text-gray-600">For {latestBill.period}</p>
                </div>
                
                <Button 
                  className="w-full"
                  variant={latestBill.status === "paid" ? "outline" : "default"}
                  onClick={() => navigate("/customer/billing")}
                >
                  {latestBill.status === "paid" ? "View Invoices" : "Pay Now"}
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">No bills available</p>
                <Button 
                  variant="outline"
                  onClick={() => navigate("/customer/billing")}
                >
                  View Billing History
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connection Status */}
        <ConnectionStats 
          connectionStats={latestConnectionStat} 
          subscribedSpeed={activePackage?.speed} 
        />
      </div>

      {/* Recent Activity and Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Recent Activity */}
        <ActivityFeed 
          activities={recentActivities} 
          onViewAllActivities={() => navigate("/customer/profile")} 
        />

        {/* Notifications */}
        <NotificationsList notifications={recentNotifications} />
      </div>

      {/* Support Section */}
      <SupportOptions onNavigateToSupport={() => navigate("/customer/support")} />
    </CustomerLayout>
  );
}
