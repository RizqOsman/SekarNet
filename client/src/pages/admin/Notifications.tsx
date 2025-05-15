import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Notification, User } from "@shared/schema";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminNotifications() {
  const { toast } = useToast();
  const [isCreateNotificationOpen, setIsCreateNotificationOpen] = useState(false);
  const [notificationType, setNotificationType] = useState("all_users");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch notifications
  const { data: notifications, isLoading: isNotificationsLoading } = useQuery<Notification[]>({ 
    queryKey: ['/api/notifications']
  });
  
  // Fetch users
  const { data: users } = useQuery<User[]>({ 
    queryKey: ['/api/users']
  });
  
  // Get user name by ID
  const getUserName = (userId: number | null) => {
    if (!userId) return "N/A";
    const user = users?.find(u => u.id === userId);
    return user ? user.fullName : "Unknown User";
  };
  
  // Format date
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get notification type badge
  const getNotificationTypeBadge = (type: string) => {
    switch (type) {
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
      case "announcement":
        return <Badge className="bg-blue-100 text-blue-800">Announcement</Badge>;
      case "alert":
        return <Badge className="bg-red-100 text-red-800">Alert</Badge>;
      case "payment_reminder":
        return <Badge className="bg-purple-100 text-purple-800">Payment Reminder</Badge>;
      case "payment_confirmed":
        return <Badge className="bg-green-100 text-green-800">Payment Confirmed</Badge>;
      case "support_reply":
        return <Badge className="bg-blue-100 text-blue-800">Support Reply</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>;
    }
  };
  
  // Get target audience
  const getTargetAudience = (notification: Notification) => {
    if (notification.userId) {
      return `${getUserName(notification.userId)} (Single User)`;
    } else if (notification.targetRole) {
      switch (notification.targetRole) {
        case "customer":
          return "All Customers";
        case "technician":
          return "All Technicians";
        case "admin":
          return "All Administrators";
        default:
          return notification.targetRole;
      }
    } else {
      return "All Users";
    }
  };
  
  // Filter notifications
  const filteredNotifications = notifications?.filter(notification => {
    if (!searchTerm) return true;
    
    return notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
           getTargetAudience(notification).toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Sort notifications by date (latest first)
  const sortedNotifications = filteredNotifications?.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
  
  // Handle create notification
  const handleCreateNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and message for the notification",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const notificationData: any = {
        type: "announcement",
        title: notificationTitle.trim(),
        message: notificationMessage.trim()
      };
      
      // Set target based on notification type
      if (notificationType === "all_users") {
        // Leave userId and targetRole empty for all users
      } else if (notificationType === "role_based") {
        if (targetRole !== "all") {
          notificationData.targetRole = targetRole;
        }
      }
      
      // Send the notification
      await apiRequest("POST", "/api/notifications", notificationData);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      
      toast({
        title: "Notification Sent",
        description: "Your notification has been successfully sent"
      });
      
      // Reset form and close dialog
      setNotificationTitle("");
      setNotificationMessage("");
      setNotificationType("all_users");
      setTargetRole("all");
      setIsCreateNotificationOpen(false);
    } catch (error) {
      console.error("Error creating notification:", error);
      toast({
        title: "Notification Failed",
        description: "There was an error sending the notification. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Notifications - SEKAR NET Admin</title>
        <meta name="description" content="Manage and send system notifications to customers, technicians, or all users." />
      </Helmet>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Notifications Management</h2>
          <p className="text-gray-600">Send and manage notifications to users</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button onClick={() => setIsCreateNotificationOpen(true)}>
            <i className="ri-notification-line mr-2"></i>
            Create Notification
          </Button>
        </div>
      </div>
      
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
          </div>
          
          {isNotificationsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading notifications...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Target Audience</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedNotifications && sortedNotifications.length > 0 ? (
                    sortedNotifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>
                          <div className="text-sm font-medium">{notification.title}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm max-w-[200px] truncate">{notification.message}</div>
                        </TableCell>
                        <TableCell>
                          {getNotificationTypeBadge(notification.type)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{getTargetAudience(notification)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(notification.createdAt)}</div>
                        </TableCell>
                        <TableCell>
                          {notification.isRead ? (
                            <Badge className="bg-green-100 text-green-800">Read</Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800">Unread</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <i className="ri-delete-bin-line text-gray-500"></i>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        {searchTerm
                          ? "No notifications match your search criteria" 
                          : "No notifications found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Create Notification Dialog */}
      <Dialog open={isCreateNotificationOpen} onOpenChange={setIsCreateNotificationOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Notification</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Target Audience</label>
              <Select value={notificationType} onValueChange={setNotificationType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_users">All Users</SelectItem>
                  <SelectItem value="role_based">By Role</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {notificationType === "role_based" && (
              <div>
                <label className="block text-sm font-medium mb-1">Select Role</label>
                <Select value={targetRole} onValueChange={setTargetRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="customer">Customers</SelectItem>
                    <SelectItem value="technician">Technicians</SelectItem>
                    <SelectItem value="admin">Administrators</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1">Notification Title</label>
              <Input
                placeholder="Enter notification title"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <Textarea
                placeholder="Enter notification message"
                className="min-h-[120px]"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateNotificationOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNotification}>
              Send Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}