import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import TechnicianLayout from "@/components/layouts/TechnicianLayout";
import { useAuth } from "@/contexts/AuthContext";
import { TechnicianJob } from "@shared/schema";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

// Profile form schema
const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address").optional(),
  phone: z.string().optional(),
  address: z.string().optional()
});

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters")
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function TechnicianProfile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch technician jobs
  const { data: jobs } = useQuery<TechnicianJob[]>({ 
    queryKey: ['/api/technician-jobs'],
    enabled: !!user
  });
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || ""
    }
  });
  
  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });
  
  // Calculate job statistics
  const getJobStats = () => {
    if (!jobs) return { total: 0, completed: 0, inProgress: 0, scheduled: 0 };
    
    const total = jobs.length;
    const completed = jobs.filter(job => job.status === "completed").length;
    const inProgress = jobs.filter(job => job.status === "in_progress").length;
    const scheduled = jobs.filter(job => job.status === "scheduled").length;
    
    return { total, completed, inProgress, scheduled };
  };
  
  const jobStats = getJobStats();
  
  // Get completion rate
  const getCompletionRate = () => {
    if (jobStats.total === 0) return 0;
    return Math.round((jobStats.completed / jobStats.total) * 100);
  };
  
  // Handle profile update
  const handleProfileUpdate = async (data: ProfileFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real app, we'd update the user profile
      // For this prototype, we'll just show a success message
      
      await apiRequest("PATCH", `/api/users/${user.id}`, data);
      
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle password change
  const handlePasswordChange = async (data: PasswordFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real app, we'd change the password
      // For this prototype, we'll just show a success message
      
      await apiRequest("POST", "/api/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
      
      passwordForm.reset();
      setPasswordDialogOpen(false);
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Password Change Failed",
        description: "There was an error changing your password. Please check your current password and try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <TechnicianLayout>
      <Helmet>
        <title>Profile - SEKAR NET Technician</title>
        <meta name="description" content="Manage your technician profile and view your job performance statistics." />
      </Helmet>
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
        <p className="text-gray-600">Manage your account settings and view performance</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-24 w-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold mb-4">
                {user?.fullName?.split(' ').map(n => n[0]).join('') || 'T'}
              </div>
              <h3 className="text-xl font-bold">{user?.fullName}</h3>
              <p className="text-gray-600">{user?.email}</p>
              <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Technician
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium">{user?.phone || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{user?.address || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-medium">{user?.username}</p>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setEditDialogOpen(true)}
              >
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setPasswordDialogOpen(true)}
              >
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Performance Card */}
        <Card className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{jobStats.total}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-green-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-600">{jobStats.completed}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-600 mb-1">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{jobStats.inProgress}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <p className="text-sm text-yellow-600 mb-1">Scheduled</p>
                <p className="text-2xl font-bold text-yellow-600">{jobStats.scheduled}</p>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <p className="font-medium">Completion Rate</p>
                <p className="font-medium">{getCompletionRate()}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${getCompletionRate()}%` }}></div>
              </div>
            </div>
            
            <h3 className="font-medium text-gray-800 mb-4">Service Areas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <p className="font-medium">Jakarta Selatan</p>
                <p className="text-sm text-gray-600">Primary Area</p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="font-medium">Jakarta Pusat</p>
                <p className="text-sm text-gray-600">Secondary Area</p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="font-medium">Jakarta Barat</p>
                <p className="text-sm text-gray-600">Secondary Area</p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="font-medium">Jakarta Timur</p>
                <p className="text-sm text-gray-600">Occasional</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Certifications and Skills */}
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
        <CardHeader>
          <CardTitle>Certifications & Skills</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-4">Technical Certifications</h3>
              <div className="space-y-3">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-primary mr-3">
                      <i className="ri-award-line text-xl"></i>
                    </div>
                    <div>
                      <p className="font-medium">Fiber Optic Installation</p>
                      <p className="text-sm text-gray-600">Certified Technician</p>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-primary mr-3">
                      <i className="ri-award-line text-xl"></i>
                    </div>
                    <div>
                      <p className="font-medium">Network Troubleshooting</p>
                      <p className="text-sm text-gray-600">Advanced Level</p>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-primary mr-3">
                      <i className="ri-award-line text-xl"></i>
                    </div>
                    <div>
                      <p className="font-medium">Customer Service</p>
                      <p className="text-sm text-gray-600">SEKAR NET Certified</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-4">Skills & Specializations</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Fiber Optic Installation</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Router Configuration</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Network Diagnostics</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">WiFi Optimization</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Cable Management</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Signal Testing</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Customer Support</span>
              </div>
              
              <h3 className="font-medium text-gray-800 mb-4">Equipment Proficiency</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm">Fiber Splicing Equipment</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i key={star} className={`ri-star-fill ${star <= 5 ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm">Network Analyzers</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i key={star} className={`ri-star-fill ${star <= 4 ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm">Router Configuration</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i key={star} className={`ri-star-fill ${star <= 5 ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={true} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={profileForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={profileForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPasswordDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Changing..." : "Change Password"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </TechnicianLayout>
  );
}
