import { Card, CardContent } from "@/components/ui/card";
import { Notification } from "@shared/schema";
import { formatRelativeTime } from "@/lib/utils/formatting";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface NotificationsListProps {
  notifications: Notification[];
}

export default function NotificationsList({ notifications }: NotificationsListProps) {
  const { user } = useAuth();

  // Function to get notification style based on type
  const getNotificationStyle = (notification: Notification) => {
    const type = notification.type.toLowerCase();
    
    if (type === "maintenance") {
      return { bgColor: "bg-yellow-50", borderColor: "border-yellow-100", iconColor: "text-yellow-500", icon: "ri-information-line" };
    } else if (type === "billing") {
      return { bgColor: "bg-red-50", borderColor: "border-red-100", iconColor: "text-red-500", icon: "ri-error-warning-line" };
    } else if (type === "announcement" || type === "promo") {
      return { bgColor: "bg-green-50", borderColor: "border-green-100", iconColor: "text-green-500", icon: "ri-gift-line" };
    } else if (type === "outage") {
      return { bgColor: "bg-orange-50", borderColor: "border-orange-100", iconColor: "text-orange-500", icon: "ri-alarm-warning-line" };
    } else if (type === "support") {
      return { bgColor: "bg-blue-50", borderColor: "border-blue-100", iconColor: "text-blue-500", icon: "ri-customer-service-2-line" };
    } else {
      return { bgColor: "bg-gray-50", borderColor: "border-gray-100", iconColor: "text-gray-500", icon: "ri-notification-line" };
    }
  };

  const markAsRead = async (notificationId: number) => {
    if (!user) return;
    
    try {
      await apiRequest("PATCH", `/api/notifications/${notificationId}/read`, {});
      // Refresh notifications
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h3>
        
        {notifications.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500">No notifications to display</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const { bgColor, borderColor, iconColor, icon } = getNotificationStyle(notification);
              
              return (
                <div 
                  key={notification.id} 
                  className={`p-3 ${bgColor} rounded-lg border ${borderColor} ${notification.isRead ? 'opacity-70' : ''}`}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <div className="flex items-start">
                    <i className={`${icon} ${iconColor} mr-3 text-lg`}></i>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(new Date(notification.createdAt))}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
