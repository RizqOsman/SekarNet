import { useState, useEffect } from "react";
import { TechnicianJob, InstallationRequest, SupportTicket, User } from "@shared/schema";
import JobCard from "@/components/technician/JobCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils/formatting";

interface JobsListProps {
  jobs: TechnicianJob[];
  installations: InstallationRequest[];
  tickets: SupportTicket[];
  customers: User[];
}

export default function JobsList({ jobs, installations, tickets, customers }: JobsListProps) {
  const [activeTab, setActiveTab] = useState("today");
  const [filteredJobs, setFilteredJobs] = useState<TechnicianJob[]>([]);
  
  // Group jobs by date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const upcoming = new Date(tomorrow);
  upcoming.setDate(upcoming.getDate() + 1);
  
  // Filter jobs based on active tab
  useEffect(() => {
    let filtered: TechnicianJob[] = [];
    
    if (activeTab === "today") {
      filtered = jobs.filter(job => {
        const jobDate = new Date(job.scheduledDate);
        jobDate.setHours(0, 0, 0, 0);
        return jobDate.getTime() === today.getTime();
      });
    } else if (activeTab === "tomorrow") {
      filtered = jobs.filter(job => {
        const jobDate = new Date(job.scheduledDate);
        jobDate.setHours(0, 0, 0, 0);
        return jobDate.getTime() === tomorrow.getTime();
      });
    } else if (activeTab === "upcoming") {
      filtered = jobs.filter(job => {
        const jobDate = new Date(job.scheduledDate);
        jobDate.setHours(0, 0, 0, 0);
        return jobDate.getTime() >= upcoming.getTime();
      });
    } else if (activeTab === "completed") {
      filtered = jobs.filter(job => job.status === "completed");
    }
    
    // Sort by scheduled date
    filtered.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
    
    setFilteredJobs(filtered);
  }, [activeTab, jobs, today, tomorrow, upcoming]);
  
  // Helper function to get customer data
  const getCustomerData = (userId: number) => {
    const customer = customers.find(c => c.id === userId);
    return {
      name: customer?.fullName || "Unknown Customer",
      phone: customer?.phone || "N/A",
      address: customer?.address || "No address provided"
    };
  };
  
  // Helper function to get installation data
  const getInstallationData = (installationId: number | undefined) => {
    if (!installationId) return undefined;
    return installations.find(i => i.id === installationId);
  };
  
  // Helper function to get ticket data
  const getTicketData = (ticketId: number | undefined) => {
    if (!ticketId) return undefined;
    return tickets.find(t => t.id === ticketId);
  };
  
  // Group jobs by date for display
  const groupedJobs = filteredJobs.reduce<Record<string, TechnicianJob[]>>((acc, job) => {
    const dateKey = formatDate(new Date(job.scheduledDate));
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(job);
    return acc;
  }, {});
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="today" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        {["today", "tomorrow", "upcoming", "completed"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-100">
                <p className="text-gray-500">No jobs to display</p>
              </div>
            ) : (
              Object.entries(groupedJobs).map(([date, dateJobs]) => (
                <div key={date} className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">{date}</h3>
                  <div className="space-y-4">
                    {dateJobs.map(job => {
                      const installation = getInstallationData(job.installationId);
                      const ticket = getTicketData(job.ticketId);
                      const customerId = installation?.userId || ticket?.userId;
                      const { name, phone, address } = customerId 
                        ? getCustomerData(customerId) 
                        : { name: "Unknown", phone: "N/A", address: "No address provided" };
                      
                      return (
                        <JobCard
                          key={job.id}
                          job={job}
                          installationData={installation}
                          ticketData={ticket}
                          customerName={name}
                          customerPhone={phone}
                          customerAddress={address}
                        />
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
