import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface SupportOptionsProps {
  onNavigateToSupport?: () => void;
}

const supportTicketSchema = z.object({
  subject: z.string().min(3, { message: "Subject must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  priority: z.string().min(1, { message: "Please select a priority" }),
});

type SupportTicketFormValues = z.infer<typeof supportTicketSchema>;

export default function SupportOptions({ onNavigateToSupport }: SupportOptionsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SupportTicketFormValues>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      subject: "",
      description: "",
      priority: "medium",
    },
  });

  const onSubmit = async (data: SupportTicketFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/support-tickets", {
        userId: user.id,
        subject: data.subject,
        description: data.description,
        priority: data.priority,
        attachments: []
      });
      
      // Reset form
      form.reset();
      
      // Close dialog
      setTicketDialogOpen(false);
      
      // Show success message
      toast({
        title: "Support Ticket Created",
        description: "Your support ticket has been submitted successfully. Our team will respond as soon as possible.",
      });
      
      // Refresh data if needed
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
    } catch (error) {
      console.error("Error creating support ticket:", error);
      toast({
        title: "Error",
        description: "There was an error submitting your support ticket. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Need Support?</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-md transition-all text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-customer-service-2-line text-2xl text-primary"></i>
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Submit a Ticket</h4>
              <p className="text-sm text-gray-600 mb-4">Report an issue or request assistance from our team</p>
              <Button 
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-600"
                onClick={() => setTicketDialogOpen(true)}
              >
                Create Ticket
              </Button>
            </div>
            
            <div className="border border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-md transition-all text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-question-answer-line text-2xl text-primary"></i>
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Live Chat</h4>
              <p className="text-sm text-gray-600 mb-4">Chat with our support team for immediate assistance</p>
              <Button 
                variant="outline" 
                className="px-4 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-blue-50"
              >
                Start Chat
              </Button>
            </div>
            
            <div className="border border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-md transition-all text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-phone-line text-2xl text-primary"></i>
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">Call Support</h4>
              <p className="text-sm text-gray-600 mb-4">Call our support hotline at 0800-123-4567</p>
              <Button 
                variant="outline" 
                className="px-4 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-blue-50"
              >
                View Hours
              </Button>
            </div>
          </div>
          
          {onNavigateToSupport && (
            <div className="mt-6 text-center">
              <Button 
                variant="link" 
                className="text-primary"
                onClick={onNavigateToSupport}
              >
                View All Support Tickets
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Support Ticket Dialog */}
      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of the issue" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please provide details about your issue..." 
                        rows={5}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setTicketDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
