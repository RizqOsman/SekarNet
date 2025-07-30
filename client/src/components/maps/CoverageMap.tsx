import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CoverageArea {
  id: number;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  radius: number; // in meters
  status: 'available' | 'limited' | 'unavailable';
  speed: number; // in Mbps
  price: number; // in cents
}

interface TechnicianJob {
  id: number;
  technicianName: string;
  jobType: 'installation' | 'support' | 'maintenance';
  status: 'scheduled' | 'in_progress' | 'completed';
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  scheduledTime: string;
  customerName: string;
}

interface CoverageMapProps {
  coverageAreas?: CoverageArea[];
  technicianJobs?: TechnicianJob[];
  onAreaClick?: (area: CoverageArea) => void;
  onJobClick?: (job: TechnicianJob) => void;
  showCoverage?: boolean;
  showJobs?: boolean;
  center?: { lat: number; lng: number };
  zoom?: number;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function CoverageMap({
  coverageAreas = [],
  technicianJobs = [],
  onAreaClick,
  onJobClick,
  showCoverage = true,
  showJobs = true,
  center = { lat: -6.2088, lng: 106.8456 }, // Jakarta coordinates
  zoom = 12
}: CoverageMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circlesRef = useRef<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedArea, setSelectedArea] = useState<CoverageArea | null>(null);
  const [selectedJob, setSelectedJob] = useState<TechnicianJob | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsMapLoaded(true);
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: center,
      zoom: zoom,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    mapInstanceRef.current = map;
  }, [isMapLoaded, center, zoom]);

  // Add coverage areas
  useEffect(() => {
    if (!mapInstanceRef.current || !showCoverage) return;

    // Clear existing circles
    circlesRef.current.forEach(circle => circle.setMap(null));
    circlesRef.current = [];

    coverageAreas.forEach(area => {
      const circle = new window.google.maps.Circle({
        strokeColor: getStatusColor(area.status),
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: getStatusColor(area.status),
        fillOpacity: 0.35,
        map: mapInstanceRef.current,
        center: area.coordinates,
        radius: area.radius,
        clickable: true
      });

      // Add click listener
      circle.addListener('click', () => {
        setSelectedArea(area);
        onAreaClick?.(area);
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 200px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${area.name}</h3>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${getStatusColor(area.status)};">${area.status}</span></p>
            <p style="margin: 5px 0;"><strong>Speed:</strong> ${area.speed} Mbps</p>
            <p style="margin: 5px 0;"><strong>Price:</strong> Rp ${(area.price / 100).toLocaleString()}/month</p>
          </div>
        `
      });

      circle.addListener('mouseover', () => {
        infoWindow.open(mapInstanceRef.current, circle);
      });

      circle.addListener('mouseout', () => {
        infoWindow.close();
      });

      circlesRef.current.push(circle);
    });
  }, [coverageAreas, showCoverage, onAreaClick]);

  // Add technician jobs
  useEffect(() => {
    if (!mapInstanceRef.current || !showJobs) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    technicianJobs.forEach(job => {
      const marker = new window.google.maps.Marker({
        position: job.coordinates,
        map: mapInstanceRef.current,
        icon: {
          url: getJobIcon(job.jobType, job.status),
          scaledSize: new window.google.maps.Size(32, 32)
        },
        title: `${job.technicianName} - ${job.jobType}`
      });

      // Add click listener
      marker.addListener('click', () => {
        setSelectedJob(job);
        onJobClick?.(job);
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 250px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${job.technicianName}</h3>
            <p style="margin: 5px 0;"><strong>Job Type:</strong> ${job.jobType}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${getJobStatusColor(job.status)};">${job.status}</span></p>
            <p style="margin: 5px 0;"><strong>Customer:</strong> ${job.customerName}</p>
            <p style="margin: 5px 0;"><strong>Address:</strong> ${job.address}</p>
            <p style="margin: 5px 0;"><strong>Scheduled:</strong> ${new Date(job.scheduledTime).toLocaleString()}</p>
          </div>
        `
      });

      marker.addListener('mouseover', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      marker.addListener('mouseout', () => {
        infoWindow.close();
      });

      markersRef.current.push(marker);
    });
  }, [technicianJobs, showJobs, onJobClick]);

  // Search functionality
  const handleSearch = () => {
    if (!mapInstanceRef.current || !searchQuery) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results: any, status: any) => {
      if (status === 'OK') {
        const location = results[0].geometry.location;
        mapInstanceRef.current.setCenter(location);
        mapInstanceRef.current.setZoom(15);
      }
    });
  };

  // Filter coverage areas
  const filteredAreas = coverageAreas.filter(area => {
    if (filterStatus === 'all') return true;
    return area.status === filterStatus;
  });

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'limited': return '#F59E0B';
      case 'unavailable': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#3B82F6';
      case 'in_progress': return '#F59E0B';
      case 'completed': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getJobIcon = (jobType: string, status: string) => {
    // In a real implementation, you would have actual icon URLs
    const baseUrl = 'https://maps.google.com/mapfiles/ms/icons/';
    switch (jobType) {
      case 'installation': return `${baseUrl}blue-dot.png`;
      case 'support': return `${baseUrl}yellow-dot.png`;
      case 'maintenance': return `${baseUrl}green-dot.png`;
      default: return `${baseUrl}red-dot.png`;
    }
  };

  if (!isMapLoaded) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Coverage Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="search">Search Location</Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  placeholder="Enter address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="status-filter">Filter Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="limited">Limited</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                variant={showCoverage ? "default" : "outline"}
                onClick={() => onAreaClick?.(selectedArea!)}
              >
                {showCoverage ? "Hide" : "Show"} Coverage
              </Button>
              <Button
                variant={showJobs ? "default" : "outline"}
                onClick={() => onJobClick?.(selectedJob!)}
              >
                {showJobs ? "Hide" : "Show"} Jobs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card>
        <CardContent className="p-0">
          <div ref={mapRef} className="w-full h-96 rounded-lg" />
        </CardContent>
      </Card>

      {/* Selected Area Details */}
      {selectedArea && (
        <Card>
          <CardHeader>
            <CardTitle>Coverage Area Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedArea.name}</h3>
                <p className="text-gray-600">Status: <Badge variant={selectedArea.status === 'available' ? 'default' : 'secondary'}>{selectedArea.status}</Badge></p>
                <p className="text-gray-600">Speed: {selectedArea.speed} Mbps</p>
                <p className="text-gray-600">Price: Rp {(selectedArea.price / 100).toLocaleString()}/month</p>
              </div>
              <div>
                <p className="text-gray-600">Coordinates: {selectedArea.coordinates.lat.toFixed(6)}, {selectedArea.coordinates.lng.toFixed(6)}</p>
                <p className="text-gray-600">Coverage Radius: {selectedArea.radius}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Job Details */}
      {selectedJob && (
        <Card>
          <CardHeader>
            <CardTitle>Technician Job Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedJob.technicianName}</h3>
                <p className="text-gray-600">Job Type: <Badge>{selectedJob.jobType}</Badge></p>
                <p className="text-gray-600">Status: <Badge variant={selectedJob.status === 'completed' ? 'default' : 'secondary'}>{selectedJob.status}</Badge></p>
                <p className="text-gray-600">Customer: {selectedJob.customerName}</p>
              </div>
              <div>
                <p className="text-gray-600">Address: {selectedJob.address}</p>
                <p className="text-gray-600">Scheduled: {new Date(selectedJob.scheduledTime).toLocaleString()}</p>
                <p className="text-gray-600">Coordinates: {selectedJob.coordinates.lat.toFixed(6)}, {selectedJob.coordinates.lng.toFixed(6)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coverage Areas List */}
      {showCoverage && (
        <Card>
          <CardHeader>
            <CardTitle>Coverage Areas ({filteredAreas.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAreas.map(area => (
                <div
                  key={area.id}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setSelectedArea(area);
                    mapInstanceRef.current?.setCenter(area.coordinates);
                    mapInstanceRef.current?.setZoom(14);
                  }}
                >
                  <h4 className="font-semibold">{area.name}</h4>
                  <p className="text-sm text-gray-600">Status: <Badge variant={area.status === 'available' ? 'default' : 'secondary'}>{area.status}</Badge></p>
                  <p className="text-sm text-gray-600">{area.speed} Mbps • Rp {(area.price / 100).toLocaleString()}/month</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 