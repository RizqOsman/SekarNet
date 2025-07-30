import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Upload, 
  Wifi, 
  Play, 
  RotateCcw, 
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';

interface SpeedTestResult {
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps
  ping: number; // ms
  jitter: number; // ms
  timestamp: Date;
  serverLocation: string;
  isp: string;
}

interface SpeedTestProps {
  onComplete?: (result: SpeedTestResult) => void;
  onSave?: (result: SpeedTestResult) => void;
  showHistory?: boolean;
  history?: SpeedTestResult[];
}

export default function SpeedTest({
  onComplete,
  onSave,
  showHistory = true,
  history = []
}: SpeedTestProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<'ping' | 'download' | 'upload' | null>(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<SpeedTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testStartTime, setTestStartTime] = useState<Date | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Test servers (in real implementation, these would be actual speed test servers)
  const testServers = [
    { name: 'Jakarta Server', location: 'Jakarta, Indonesia', url: 'https://speedtest.jakarta.com' },
    { name: 'Singapore Server', location: 'Singapore', url: 'https://speedtest.singapore.com' },
    { name: 'Local Server', location: 'Local Network', url: 'https://speedtest.local.com' }
  ];

  const selectedServer = testServers[0]; // Default to Jakarta server

  const startSpeedTest = async () => {
    setIsRunning(true);
    setError(null);
    setResults(null);
    setProgress(0);
    setTestStartTime(new Date());
    
    abortControllerRef.current = new AbortController();

    try {
      // Test 1: Ping Test
      setCurrentTest('ping');
      setProgress(10);
      const pingResult = await measurePing();
      
      // Test 2: Download Test
      setCurrentTest('download');
      setProgress(30);
      const downloadResult = await measureDownloadSpeed();
      
      // Test 3: Upload Test
      setCurrentTest('upload');
      setProgress(70);
      const uploadResult = await measureUploadSpeed();
      
      setProgress(100);
      
      const finalResult: SpeedTestResult = {
        downloadSpeed: downloadResult,
        uploadSpeed: uploadResult,
        ping: pingResult.ping,
        jitter: pingResult.jitter,
        timestamp: new Date(),
        serverLocation: selectedServer.location,
        isp: 'SEKAR NET'
      };
      
      setResults(finalResult);
      onComplete?.(finalResult);
      
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Speed test was cancelled');
      } else {
        setError('Speed test failed. Please try again.');
      }
    } finally {
      setIsRunning(false);
      setCurrentTest(null);
      setProgress(0);
    }
  };

  const stopSpeedTest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsRunning(false);
    setCurrentTest(null);
    setProgress(0);
  };

  const measurePing = async (): Promise<{ ping: number; jitter: number }> => {
    const pings: number[] = [];
    const iterations = 5;
    
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      try {
        await fetch('/api/speedtest/ping', {
          method: 'GET',
          signal: abortControllerRef.current?.signal
        });
        
        const endTime = performance.now();
        const pingTime = endTime - startTime;
        pings.push(pingTime);
        
        // Add small delay between pings
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw err;
        }
        // Continue with next ping if one fails
      }
    }
    
    const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;
    
    // Calculate jitter (standard deviation of ping times)
    const variance = pings.reduce((acc, ping) => acc + Math.pow(ping - avgPing, 2), 0) / pings.length;
    const jitter = Math.sqrt(variance);
    
    return { ping: Math.round(avgPing), jitter: Math.round(jitter) };
  };

  const measureDownloadSpeed = async (): Promise<number> => {
    const testDuration = 10000; // 10 seconds
    const chunkSize = 1024 * 1024; // 1MB chunks
    let totalBytes = 0;
    const startTime = Date.now();
    
    while (Date.now() - startTime < testDuration) {
      try {
        const response = await fetch('/api/speedtest/download', {
          signal: abortControllerRef.current?.signal
        });
        
        if (!response.ok) throw new Error('Download test failed');
        
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          totalBytes += value.length;
          
          // Check if we should abort
          if (abortControllerRef.current?.signal.aborted) {
            throw new Error('Test aborted');
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw err;
        }
        // Continue with next chunk if one fails
      }
    }
    
    const duration = (Date.now() - startTime) / 1000; // seconds
    const speedMbps = (totalBytes * 8) / (1024 * 1024 * duration); // Convert to Mbps
    
    return Math.round(speedMbps * 100) / 100; // Round to 2 decimal places
  };

  const measureUploadSpeed = async (): Promise<number> => {
    const testDuration = 10000; // 10 seconds
    const chunkSize = 1024 * 1024; // 1MB chunks
    let totalBytes = 0;
    const startTime = Date.now();
    
    while (Date.now() - startTime < testDuration) {
      try {
        // Create a dummy payload for upload test
        const payload = new ArrayBuffer(chunkSize);
        
        const response = await fetch('/api/speedtest/upload', {
          method: 'POST',
          body: payload,
          signal: abortControllerRef.current?.signal
        });
        
        if (!response.ok) throw new Error('Upload test failed');
        
        totalBytes += chunkSize;
        
        // Check if we should abort
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Test aborted');
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          throw err;
        }
        // Continue with next chunk if one fails
      }
    }
    
    const duration = (Date.now() - startTime) / 1000; // seconds
    const speedMbps = (totalBytes * 8) / (1024 * 1024 * duration); // Convert to Mbps
    
    return Math.round(speedMbps * 100) / 100; // Round to 2 decimal places
  };

  const saveResult = () => {
    if (results) {
      onSave?.(results);
    }
  };

  const getSpeedRating = (speed: number, type: 'download' | 'upload'): string => {
    if (type === 'download') {
      if (speed >= 100) return 'Excellent';
      if (speed >= 50) return 'Good';
      if (speed >= 25) return 'Fair';
      if (speed >= 10) return 'Poor';
      return 'Very Poor';
    } else {
      if (speed >= 50) return 'Excellent';
      if (speed >= 25) return 'Good';
      if (speed >= 10) return 'Fair';
      if (speed >= 5) return 'Poor';
      return 'Very Poor';
    }
  };

  const getPingRating = (ping: number): string => {
    if (ping < 20) return 'Excellent';
    if (ping < 50) return 'Good';
    if (ping < 100) return 'Fair';
    if (ping < 200) return 'Poor';
    return 'Very Poor';
  };

  return (
    <div className="space-y-6">
      {/* Speed Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Internet Speed Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Server: {selectedServer.name}</p>
              <p className="text-sm text-gray-600">Location: {selectedServer.location}</p>
            </div>
            <div className="flex gap-2">
              {!isRunning ? (
                <Button onClick={startSpeedTest} className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Start Test
                </Button>
              ) : (
                <Button onClick={stopSpeedTest} variant="destructive" className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Stop Test
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {currentTest === 'ping' && 'Testing Ping...'}
                  {currentTest === 'download' && 'Testing Download Speed...'}
                  {currentTest === 'upload' && 'Testing Upload Speed...'}
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Download Speed */}
              <div className="text-center p-4 border rounded-lg">
                <Download className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="text-2xl font-bold text-blue-600">
                  {results.downloadSpeed} Mbps
                </h3>
                <p className="text-sm text-gray-600">Download Speed</p>
                <Badge variant="outline" className="mt-2">
                  {getSpeedRating(results.downloadSpeed, 'download')}
                </Badge>
              </div>

              {/* Upload Speed */}
              <div className="text-center p-4 border rounded-lg">
                <Upload className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="text-2xl font-bold text-green-600">
                  {results.uploadSpeed} Mbps
                </h3>
                <p className="text-sm text-gray-600">Upload Speed</p>
                <Badge variant="outline" className="mt-2">
                  {getSpeedRating(results.uploadSpeed, 'upload')}
                </Badge>
              </div>

              {/* Ping */}
              <div className="text-center p-4 border rounded-lg">
                <Wifi className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="text-2xl font-bold text-purple-600">
                  {results.ping} ms
                </h3>
                <p className="text-sm text-gray-600">Ping</p>
                <Badge variant="outline" className="mt-2">
                  {getPingRating(results.ping)}
                </Badge>
              </div>
            </div>

            {/* Additional Details */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Jitter:</strong> {results.jitter} ms</p>
                <p><strong>ISP:</strong> {results.isp}</p>
                <p><strong>Server:</strong> {results.serverLocation}</p>
              </div>
              <div>
                <p><strong>Test Date:</strong> {results.timestamp.toLocaleDateString()}</p>
                <p><strong>Test Time:</strong> {results.timestamp.toLocaleTimeString()}</p>
                {testStartTime && (
                  <p><strong>Duration:</strong> {Math.round((results.timestamp.getTime() - testStartTime.getTime()) / 1000)}s</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-2">
              <Button onClick={saveResult} className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Save Result
              </Button>
              <Button onClick={startSpeedTest} variant="outline" className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Test Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test History */}
      {showHistory && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Test History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {history.slice(0, 5).map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="font-semibold text-blue-600">{result.downloadSpeed} Mbps</p>
                      <p className="text-xs text-gray-600">Download</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-green-600">{result.uploadSpeed} Mbps</p>
                      <p className="text-xs text-gray-600">Upload</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-purple-600">{result.ping} ms</p>
                      <p className="text-xs text-gray-600">Ping</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{result.timestamp.toLocaleDateString()}</p>
                    <p className="text-xs text-gray-600">{result.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 