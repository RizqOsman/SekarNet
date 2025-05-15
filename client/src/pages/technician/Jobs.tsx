import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import TechnicianLayout from "@/components/layouts/TechnicianLayout";
import { useAuth } from "@/contexts/AuthContext";
import { TechnicianJob, InstallationRequest, SupportTicket, User } from "@shared/schema";
import JobsList from "@/components/technician/JobsList";
import TechStats from "@/components/technician/TechStats";
import { formatDate } from "@/lib/utils/formatting";
import { Card, CardContent } from "@/components/ui/card";

export default function TechnicianJobs() {
  const { user } = useAuth();
  const [todayDate, setTodayDate] = useState<string>("");
  const [jobCount, setJobCount] = useState<number>(0);
  
  // Fetch technician jobs
  const { data: jobs, isLoading: isJobsLoading } = useQuery<TechnicianJob[]>({ 
    queryKey: ['/api/technician-jobs'],
    enabled: !!user
  });
  
  // Fetch installation requests
  const { data: installations, isLoading: isInstallationsLoading } = useQuery<InstallationRequest[]>({ 
    queryKey: ['/api/installation-requests'],
    enabled: !!user
  });
  
  // Fetch support tickets
  const { data: tickets, isLoading: isTicketsLoading } = useQuery<SupportTicket[]>({ 
    queryKey: ['/api/support-tickets'],
    enabled: !!user
  });
  
  // Fetch users (customers)
  const { data: customers, isLoading: isCustomersLoading } = useQuery<User[]>({ 
    queryKey: ['/api/users'],
    enabled: !!user
  });
  
  // Set today's date and job count
  useEffect(() => {
    const today = new Date();
    setTodayDate(formatDate(today));
    
    // Count jobs for today
    if (jobs) {
      const todayJobs = jobs.filter(job => {
        const jobDate = new Date(job.scheduledDate);
        const currentDate = new Date();
        return jobDate.toDateString() === currentDate.toDateString();
      });
      
      setJobCount(todayJobs.length);
    }
  }, [jobs]);
  
  // Loader for all data
  const isLoading = isJobsLoading || isInstallationsLoading || isTicketsLoading || isCustomersLoading;
  
  return (
    <TechnicianLayout>
      <Helmet>
        <title>Jobs - SEKAR NET Technician</title>
        <meta name="description" content="View and manage your assigned installation and support jobs for SEKAR NET." />
      </Helmet>
      
      {/* Day Overview */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Today's Jobs</h2>
          <div className="bg-white shadow-sm rounded-lg px-3 py-1 text-sm font-medium text-gray-700">
            {todayDate}
          </div>
        </div>
        <div className="flex items-center mt-2">
          <span className="text-gray-600">You have</span>
          <span className="mx-1 px-2 py-0.5 bg-primary text-white rounded-full text-sm font-medium">{jobCount}</span>
          <span className="text-gray-600">jobs assigned for today</span>
        </div>
      </div>
      
      {isLoading ? (
        <Card className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <CardContent className="p-6 flex justify-center items-center h-48">
            <p className="text-gray-500">Loading job data...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Jobs List */}
          <div className="space-y-4 mb-8">
            <JobsList 
              jobs={jobs || []} 
              installations={installations || []} 
              tickets={tickets || []} 
              customers={customers || []} 
            />
          </div>
          
          {/* Daily Stats */}
          <TechStats jobs={jobs || []} />
        </>
      )}
    </TechnicianLayout>
  );
}
