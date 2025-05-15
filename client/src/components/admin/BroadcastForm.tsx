import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function BroadcastForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetRole: "all",
    notificationType: "announcement",
    priority: "normal",
    schedule: ""
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.message) {
      toast({
        title: "Required Fields Missing",
        description: "Please enter a title and message for the notification.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare notification data
      const notificationData = {
        title: formData.title,
        message: formData.message,
        type: formData.notificationType,
        targetRole: formData.targetRole === "all" ? null : formData.targetRole,
        userId: null // Broadcast to all users
      };
      
      // Send notification
      await apiRequest("POST", "/api/notifications", notificationData);
      
      // Reset form
      setFormData({
        title: "",
        message: "",
        targetRole: "all",
        notificationType: "announcement",
        priority: "normal",
        schedule: ""
      });
      
      // Show success message
      toast({
        title: "Notification Sent",
        description: "Your broadcast notification has been sent successfully.",
      });
      
      // Refresh notifications data
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Sending Failed",
        description: "There was an error sending the notification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Send Broadcast Notification</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="col-span-1 md:col-span-4">
              <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</Label>
              <Input 
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                placeholder="Notification title" 
              />
            </div>
            
            <div className="col-span-1 md:col-span-4">
              <Label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</Label>
              <Textarea 
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
                rows={4} 
                placeholder="Enter notification message" 
              />
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <Label htmlFor="targetRole" className="block text-sm font-medium text-gray-700 mb-1">Target Audience</Label>
              <Select 
                value={formData.targetRole} 
                onValueChange={(value) => handleSelectChange("targetRole", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="customer">Customers Only</SelectItem>
                  <SelectItem value="technician">Technicians Only</SelectItem>
                  <SelectItem value="admin">Admins Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <Label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => handleSelectChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <Label htmlFor="notificationType" className="block text-sm font-medium text-gray-700 mb-1">Notification Type</Label>
              <Select 
                value={formData.notificationType} 
                onValueChange={(value) => handleSelectChange("notificationType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">General Announcement</SelectItem>
                  <SelectItem value="maintenance">Maintenance Notice</SelectItem>
                  <SelectItem value="outage">Outage Alert</SelectItem>
                  <SelectItem value="promo">Promotion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <Label htmlFor="schedule" className="block text-sm font-medium text-gray-700 mb-1">Schedule (Optional)</Label>
              <Input 
                id="schedule"
                name="schedule"
                type="datetime-local"
                value={formData.schedule}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" 
              />
            </div>
            
            <div className="col-span-1 md:col-span-4 flex justify-end">
              <Button 
                type="button" 
                variant="outline"
                className="mr-3"
                onClick={() => {
                  setFormData({
                    title: "",
                    message: "",
                    targetRole: "all",
                    notificationType: "announcement",
                    priority: "normal",
                    schedule: ""
                  });
                }}
                disabled={isSubmitting}
              >
                Clear Form
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Notification"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
