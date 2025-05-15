import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Package, Subscription } from "@shared/schema";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils/formatting";

export default function AdminPackages() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Fetch packages
  const { data: packages, isLoading: isPackagesLoading } = useQuery<Package[]>({ 
    queryKey: ['/api/packages']
  });
  
  // Fetch subscriptions to count active subscribers per package
  const { data: subscriptions } = useQuery<Subscription[]>({ 
    queryKey: ['/api/subscriptions']
  });
  
  // Count active subscribers for a package
  const countSubscribers = (packageId: number) => {
    if (!subscriptions) return 0;
    return subscriptions.filter(sub => 
      sub.packageId === packageId && 
      sub.status === "active"
    ).length;
  };
  
  // Format speed for display
  const formatSpeed = (speedMbps: number) => {
    return speedMbps >= 1000 
      ? `${speedMbps / 1000} Gbps` 
      : `${speedMbps} Mbps`;
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Internet Packages - SEKAR NET Admin</title>
        <meta name="description" content="Manage internet service packages, pricing, and features for SEKAR NET customers." />
      </Helmet>
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Internet Packages</h2>
          <p className="text-gray-600">Manage available internet service packages</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <i className="ri-add-line mr-2"></i>
            Add Package
          </Button>
        </div>
      </div>
      
      <Card className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <CardContent className="p-6">
          {isPackagesLoading ? (
            <div className="text-center py-8 text-gray-500">Loading packages...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Speed</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Subscribers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages && packages.length > 0 ? (
                    packages.map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="ml-0">
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                {pkg.name}
                                {pkg.isPopular && (
                                  <Badge className="ml-2 bg-yellow-100 text-yellow-800">Popular</Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 max-w-[250px] truncate">{pkg.description}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">
                            Download: {formatSpeed(pkg.speed)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Upload: {formatSpeed(pkg.uploadSpeed)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {pkg.features && pkg.features.length > 0 ? (
                              <ul className="list-disc pl-4">
                                {pkg.features.slice(0, 2).map((feature, index) => (
                                  <li key={index}>{feature}</li>
                                ))}
                                {pkg.features.length > 2 && (
                                  <li>+{pkg.features.length - 2} more</li>
                                )}
                              </ul>
                            ) : (
                              "No features listed"
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(pkg.price)}/month
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">
                            {countSubscribers(pkg.id)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <i className="ri-more-2-fill text-gray-500"></i>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <i className="ri-eye-line mr-2"></i> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <i className="ri-edit-line mr-2"></i> Edit Package
                              </DropdownMenuItem>
                              {pkg.isPopular ? (
                                <DropdownMenuItem>
                                  <i className="ri-star-line mr-2"></i> Remove Popular Tag
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem>
                                  <i className="ri-star-fill mr-2"></i> Mark as Popular
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-red-600">
                                <i className="ri-delete-bin-line mr-2"></i> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No packages found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Package Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Package</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Package Name
              </label>
              <Input
                id="name"
                placeholder="Pro Fiber 100"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="High-speed internet for small offices and homes"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="download" className="text-right text-sm font-medium">
                Download Speed
              </label>
              <div className="col-span-3 flex">
                <Input
                  id="download"
                  type="number"
                  placeholder="100"
                  className="flex-1"
                />
                <div className="bg-gray-100 px-3 flex items-center border border-l-0 border-gray-300 rounded-r-md">
                  Mbps
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="upload" className="text-right text-sm font-medium">
                Upload Speed
              </label>
              <div className="col-span-3 flex">
                <Input
                  id="upload"
                  type="number"
                  placeholder="50"
                  className="flex-1"
                />
                <div className="bg-gray-100 px-3 flex items-center border border-l-0 border-gray-300 rounded-r-md">
                  Mbps
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="price" className="text-right text-sm font-medium">
                Monthly Price
              </label>
              <div className="col-span-3 flex">
                <div className="bg-gray-100 px-3 flex items-center border border-r-0 border-gray-300 rounded-l-md">
                  Rp
                </div>
                <Input
                  id="price"
                  type="number"
                  placeholder="450000"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-right text-sm font-medium mt-2">
                Features
              </label>
              <div className="col-span-3 space-y-2">
                <div className="flex">
                  <Input placeholder="Unlimited data" className="flex-1" />
                  <Button variant="ghost" size="sm" className="ml-2">
                    <i className="ri-add-line"></i>
                  </Button>
                </div>
                <div className="flex">
                  <Input placeholder="24/7 support" className="flex-1" />
                  <Button variant="ghost" size="sm" className="ml-2">
                    <i className="ri-add-line"></i>
                  </Button>
                </div>
                <div className="flex">
                  <Input placeholder="Free installation" className="flex-1" />
                  <Button variant="ghost" size="sm" className="ml-2">
                    <i className="ri-add-line"></i>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <div></div>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox id="popular" />
                <Label htmlFor="popular">Mark as popular package</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => {
              toast({
                title: "Package Created",
                description: "New internet package has been created successfully"
              });
              setIsAddDialogOpen(false);
            }}>
              Add Package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}