import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import CustomerLayout from "@/components/layouts/CustomerLayout";
import { useAuth } from "@/contexts/AuthContext";
import { SupportTicket } from "@shared/schema";
import SupportOptions from "@/components/customer/SupportOptions";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { formatDate, formatRelativeTime } from "@/lib/utils/formatting";

export default function CustomerSupport() {
  const { user } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // Fetch support tickets
  const { data: tickets, isLoading: isTicketsLoading } = useQuery<SupportTicket[]>({ 
    queryKey: ['/api/support-tickets'],
    enabled: !!user
  });
  
  // Function to get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{priority}</Badge>;
    }
  };
  
  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-gray-100 text-gray-800">New</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case "closed":
        return <Badge className="bg-purple-100 text-purple-800">Closed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };
  
  // Open view dialog
  const openViewDialog = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setViewDialogOpen(true);
  };
  
  return (
    <CustomerLayout>
      <Helmet>
        <title>Support - SEKAR NET</title>
        <meta name="description" content="Get help and support for your SEKAR NET internet connection. Submit support tickets and track their resolution." />
      </Helmet>
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Support</h2>
        <p className="text-gray-600">Get help with your internet connection</p>
      </div>
      
      {/* Support Options */}
      <div className="mb-6">
        <SupportOptions />
      </div>
      
      {/* Support Tickets */}
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Support Tickets</h3>
          
          {isTicketsLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading support tickets...</p>
            </div>
          ) : tickets?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">You haven't submitted any support tickets yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets?.map(ticket => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">{ticket.subject}</TableCell>
                      <TableCell>{formatDate(new Date(ticket.createdAt))}</TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="link" 
                          className="text-primary hover:text-blue-700"
                          onClick={() => openViewDialog(ticket)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Common Support Articles */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-primary mb-4">
              <i className="ri-wifi-line text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Troubleshooting WiFi Issues</h3>
            <p className="text-sm text-gray-600 mb-4">Learn how to resolve common WiFi connectivity issues and improve your network performance.</p>
            <Button variant="outline" className="w-full">Read Article</Button>
          </CardContent>
        </Card>
        
        <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-primary mb-4">
              <i className="ri-speed-line text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Optimizing Internet Speed</h3>
            <p className="text-sm text-gray-600 mb-4">Tips and tricks to get the most out of your internet connection and maximize your speed.</p>
            <Button variant="outline" className="w-full">Read Article</Button>
          </CardContent>
        </Card>
        
        <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-primary mb-4">
              <i className="ri-router-line text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Router Configuration Guide</h3>
            <p className="text-sm text-gray-600 mb-4">Step-by-step instructions for setting up and configuring your WiFi router for optimal performance.</p>
            <Button variant="outline" className="w-full">Read Article</Button>
          </CardContent>
        </Card>
      </div>
      
      {/* View Ticket Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ticket #{selectedTicket?.id}</DialogTitle>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{selectedTicket.subject}</h3>
                {getStatusBadge(selectedTicket.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Date Submitted</p>
                  <p className="font-medium">{formatDate(new Date(selectedTicket.createdAt))}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Priority</p>
                  <div>{getPriorityBadge(selectedTicket.priority)}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-700 whitespace-pre-line">{selectedTicket.description}</p>
              </div>
              
              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Attachments</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTicket.attachments.map((attachment, idx) => (
                      <div key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {attachment}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedTicket.status === "in_progress" && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center mb-2">
                    <i className="ri-information-line text-blue-600 mr-2"></i>
                    <p className="font-medium text-blue-800">A technician is working on your issue</p>
                  </div>
                  <p className="text-sm text-blue-700">We'll update you on the progress of your ticket soon.</p>
                </div>
              )}
              
              {selectedTicket.status === "resolved" && (
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center mb-2">
                    <i className="ri-check-line text-green-600 mr-2"></i>
                    <p className="font-medium text-green-800">This issue has been resolved</p>
                  </div>
                  <p className="text-sm text-green-700">If you're still experiencing issues, please create a new support ticket.</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
}
