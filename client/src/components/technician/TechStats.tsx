import { Card, CardContent } from "@/components/ui/card";
import { TechnicianJob } from "@shared/schema";

interface TechStatsProps {
  jobs: TechnicianJob[];
}

export default function TechStats({ jobs }: TechStatsProps) {
  // Count jobs by status
  const completedCount = jobs.filter(job => job.status === "completed").length;
  const inProgressCount = jobs.filter(job => job.status === "in_progress").length;
  const scheduledCount = jobs.filter(job => job.status === "scheduled").length;
  
  // Count jobs for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayJobs = jobs.filter(job => {
    const jobDate = new Date(job.scheduledDate);
    return jobDate >= today && jobDate < tomorrow;
  });
  
  const todayCompletedCount = todayJobs.filter(job => job.status === "completed").length;
  const todayInProgressCount = todayJobs.filter(job => job.status === "in_progress").length;
  const todayScheduledCount = todayJobs.filter(job => job.status === "scheduled").length;
  
  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Stats</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600">{todayCompletedCount}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{todayInProgressCount}</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Scheduled</p>
            <p className="text-2xl font-bold text-yellow-600">{todayScheduledCount}</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-semibold text-gray-700 mb-2">Job Summary</h4>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span>Completed:</span>
              </div>
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span>In Progress:</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <span>Scheduled:</span>
              </div>
            </div>
            <div className="text-sm text-right">
              <div className="mb-1">
                <span className="font-medium">{completedCount}</span>
              </div>
              <div className="mb-1">
                <span className="font-medium">{inProgressCount}</span>
              </div>
              <div>
                <span className="font-medium">{scheduledCount}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
