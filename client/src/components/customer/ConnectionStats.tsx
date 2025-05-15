import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ConnectionStat } from "@shared/schema";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ConnectionStatsProps {
  connectionStats?: ConnectionStat;
  subscribedSpeed?: number;
}

export default function ConnectionStats({ connectionStats, subscribedSpeed = 50 }: ConnectionStatsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isTestingSpeed, setIsTestingSpeed] = useState(false);

  const downloadSpeed = connectionStats?.downloadSpeed || 0;
  const uploadSpeed = connectionStats?.uploadSpeed || 0;
  const ping = connectionStats?.ping || 0;

  // Calculate percentage of subscribed speed
  const downloadPercentage = Math.min(Math.round((downloadSpeed / subscribedSpeed) * 100), 100);
  const uploadPercentage = Math.min(Math.round((uploadSpeed / (subscribedSpeed / 2)) * 100), 100); // Upload is usually half of download

  const runSpeedTest = async () => {
    if (!user) return;

    setIsTestingSpeed(true);
    
    try {
      // Simulate a speed test by generating random values
      // In a real app, this would call a speed test API
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate random speed results close to the subscribed speed
      const randomDownload = subscribedSpeed * (0.85 + Math.random() * 0.15);
      const randomUpload = (subscribedSpeed / 2) * (0.85 + Math.random() * 0.15);
      const randomPing = 10 + Math.random() * 20;
      
      // Save the results to the server
      await apiRequest("POST", "/api/connection-stats", {
        userId: user.id,
        downloadSpeed: randomDownload,
        uploadSpeed: randomUpload,
        ping: randomPing
      });
      
      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/connection-stats'] });
      
      toast({
        title: "Speed Test Completed",
        description: `Download: ${randomDownload.toFixed(1)} Mbps, Upload: ${randomUpload.toFixed(1)} Mbps, Ping: ${randomPing.toFixed(1)} ms`
      });
    } catch (error) {
      console.error("Error running speed test:", error);
      toast({
        title: "Speed Test Failed",
        description: "There was an error running the speed test. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTestingSpeed(false);
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Connection Status</h3>
          <span className="flex items-center text-green-600 text-sm">
            <i className="ri-checkbox-circle-fill mr-1"></i>
            Online
          </span>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Download</span>
              <span className="font-medium">{downloadSpeed.toFixed(1)} Mbps</span>
            </div>
            <Progress value={downloadPercentage} className="h-2 bg-gray-200" />
          </div>
          
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Upload</span>
              <span className="font-medium">{uploadSpeed.toFixed(1)} Mbps</span>
            </div>
            <Progress value={uploadPercentage} className="h-2 bg-gray-200" />
          </div>
          
          {ping > 0 && (
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Ping</span>
                <span className="font-medium">{ping.toFixed(1)} ms</span>
              </div>
            </div>
          )}
          
          <Button 
            variant="secondary"
            className="w-full"
            onClick={runSpeedTest}
            disabled={isTestingSpeed}
          >
            {isTestingSpeed ? "Testing Speed..." : "Run Speed Test"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
