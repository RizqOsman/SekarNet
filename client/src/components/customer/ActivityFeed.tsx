import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserActivity } from "@shared/schema";
import { formatRelativeTime } from "@/lib/utils/formatting";

interface ActivityFeedProps {
  activities: UserActivity[];
  onViewAllActivities?: () => void;
}

export default function ActivityFeed({ activities, onViewAllActivities }: ActivityFeedProps) {
  // Function to get icon based on activity type
  const getActivityIcon = (activity: UserActivity) => {
    const action = activity.action.toLowerCase();
    
    if (action.includes("bill") || action.includes("paid")) {
      return { icon: "ri-file-list-3-line", bgColor: "bg-blue-100", textColor: "text-primary" };
    } else if (action.includes("support") || action.includes("ticket")) {
      return { icon: "ri-customer-service-2-line", bgColor: "bg-green-100", textColor: "text-green-600" };
    } else if (action.includes("package") || action.includes("upgrade")) {
      return { icon: "ri-rocket-line", bgColor: "bg-purple-100", textColor: "text-purple-600" };
    } else if (action.includes("install")) {
      return { icon: "ri-tools-line", bgColor: "bg-yellow-100", textColor: "text-yellow-600" };
    } else {
      return { icon: "ri-information-line", bgColor: "bg-gray-100", textColor: "text-gray-600" };
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        
        {activities.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500">No recent activities to display</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const { icon, bgColor, textColor } = getActivityIcon(activity);
              
              return (
                <div key={activity.id} className="flex items-start">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full ${bgColor} flex items-center justify-center ${textColor}`}>
                    <i className={icon}></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{formatRelativeTime(new Date(activity.createdAt))}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {activities.length > 0 && onViewAllActivities && (
          <Button 
            variant="link" 
            className="mt-4 p-0 h-auto text-sm text-primary font-medium hover:text-blue-700"
            onClick={onViewAllActivities}
          >
            View All Activities
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
