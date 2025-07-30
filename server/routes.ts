import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import path from "path";
import fs from "fs";

// JWT Secret - in a real app, this would be in an env variable
const JWT_SECRET = "sekar-net-secret-key";
const JWT_EXPIRES_IN = "7d";

// Token validation middleware
const authenticateToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
    
    req.body.user = user;
    next();
  });
};

// Role validation middleware
const authorizeRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: Function) => {
    const user = req.body.user;
    
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden: You don't have permission to access this resource" });
    }
    
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Generate token
      const token = jwt.sign(
        { id: newUser.id, username: newUser.username, role: newUser.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      // Return user without password
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", details: error.errors });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Validate input
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Generate token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // User Routes
  app.get("/api/users/me", authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUser(req.body.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Package Routes
  app.get("/api/packages", async (req, res) => {
    try {
      const packages = await storage.getAllPackages();
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching packages" });
    }
  });
  
  app.post("/api/packages", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
    try {
      const packageData = req.body;
      const newPackage = await storage.createPackage(packageData);
      res.status(201).json(newPackage);
    } catch (error) {
      res.status(500).json({ message: "Error creating package" });
    }
  });
  
  // Subscription Routes
  app.get("/api/subscriptions", authenticateToken, async (req, res) => {
    try {
      const subscriptions = req.body.user.role === "admin" 
        ? await storage.getAllSubscriptions()
        : await storage.getUserSubscriptions(req.body.user.id);
      
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching subscriptions" });
    }
  });
  
  app.post("/api/subscriptions", authenticateToken, async (req, res) => {
    try {
      const subscriptionData = req.body;
      
      if (req.body.user.role !== "admin" && subscriptionData.userId !== req.body.user.id) {
        return res.status(403).json({ message: "Forbidden: You can only create subscriptions for yourself" });
      }
      
      const newSubscription = await storage.createSubscription(subscriptionData);
      res.status(201).json(newSubscription);
    } catch (error) {
      res.status(500).json({ message: "Error creating subscription" });
    }
  });
  
  // Installation Request Routes
  app.get("/api/installation-requests", authenticateToken, async (req, res) => {
    try {
      const installationRequests = req.body.user.role === "admin" 
        ? await storage.getAllInstallationRequests()
        : req.body.user.role === "technician"
        ? await storage.getTechnicianInstallationRequests(req.body.user.id)
        : await storage.getUserInstallationRequests(req.body.user.id);
      
      res.json(installationRequests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching installation requests" });
    }
  });
  
  app.post("/api/installation-requests", authenticateToken, async (req, res) => {
    try {
      const installationData = req.body;
      
      if (req.body.user.role !== "admin" && installationData.userId !== req.body.user.id) {
        return res.status(403).json({ message: "Forbidden: You can only create installation requests for yourself" });
      }
      
      const newInstallation = await storage.createInstallationRequest(installationData);
      res.status(201).json(newInstallation);
    } catch (error) {
      res.status(500).json({ message: "Error creating installation request" });
    }
  });
  
  app.patch("/api/installation-requests/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Only admins and technicians can update status
      if (req.body.user.role !== "admin" && req.body.user.role !== "technician" && updates.status) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to update status" });
      }
      
      const updatedInstallation = await storage.updateInstallationRequest(parseInt(id), updates);
      if (!updatedInstallation) {
        return res.status(404).json({ message: "Installation request not found" });
      }
      
      res.json(updatedInstallation);
    } catch (error) {
      res.status(500).json({ message: "Error updating installation request" });
    }
  });
  
  // Bills Routes
  app.get("/api/bills", authenticateToken, async (req, res) => {
    try {
      const bills = req.body.user.role === "admin" 
        ? await storage.getAllBills()
        : await storage.getUserBills(req.body.user.id);
      
      res.json(bills);
    } catch (error) {
      res.status(500).json({ message: "Error fetching bills" });
    }
  });
  
  app.post("/api/bills", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
    try {
      const billData = req.body;
      const newBill = await storage.createBill(billData);
      res.status(201).json(newBill);
    } catch (error) {
      res.status(500).json({ message: "Error creating bill" });
    }
  });
  
  app.patch("/api/bills/:id/payment", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentProof } = req.body;
      
      const bill = await storage.getBill(parseInt(id));
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }
      
      // Only admin or bill owner can update payment
      if (req.body.user.role !== "admin" && bill.userId !== req.body.user.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to update this bill" });
      }
      
      const updatedBill = await storage.updateBillPayment(parseInt(id), paymentProof);
      res.json(updatedBill);
    } catch (error) {
      res.status(500).json({ message: "Error updating bill payment" });
    }
  });
  
  // Support Ticket Routes
  app.get("/api/support-tickets", authenticateToken, async (req, res) => {
    try {
      const tickets = req.body.user.role === "admin" 
        ? await storage.getAllSupportTickets()
        : req.body.user.role === "technician"
        ? await storage.getTechnicianSupportTickets(req.body.user.id)
        : await storage.getUserSupportTickets(req.body.user.id);
      
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Error fetching support tickets" });
    }
  });
  
  app.post("/api/support-tickets", authenticateToken, async (req, res) => {
    try {
      const ticketData = req.body;
      
      if (req.body.user.role !== "admin" && ticketData.userId !== req.body.user.id) {
        return res.status(403).json({ message: "Forbidden: You can only create support tickets for yourself" });
      }
      
      const newTicket = await storage.createSupportTicket(ticketData);
      res.status(201).json(newTicket);
    } catch (error) {
      res.status(500).json({ message: "Error creating support ticket" });
    }
  });
  
  app.patch("/api/support-tickets/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Only admins and technicians can update status and priority
      if (req.body.user.role !== "admin" && req.body.user.role !== "technician" && (updates.status || updates.priority)) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to update status or priority" });
      }
      
      const updatedTicket = await storage.updateSupportTicket(parseInt(id), updates);
      if (!updatedTicket) {
        return res.status(404).json({ message: "Support ticket not found" });
      }
      
      res.json(updatedTicket);
    } catch (error) {
      res.status(500).json({ message: "Error updating support ticket" });
    }
  });
  
  // Notifications Routes
  app.get("/api/notifications", authenticateToken, async (req, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.body.user.id, req.body.user.role);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Error fetching notifications" });
    }
  });
  
  app.post("/api/notifications", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
    try {
      const notificationData = req.body;
      const newNotification = await storage.createNotification(notificationData);
      res.status(201).json(newNotification);
    } catch (error) {
      res.status(500).json({ message: "Error creating notification" });
    }
  });
  
  app.patch("/api/notifications/:id/read", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      
      const notification = await storage.getNotification(parseInt(id));
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      // Only notification owner can mark as read
      if (notification.userId && notification.userId !== req.body.user.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to update this notification" });
      }
      
      const updatedNotification = await storage.markNotificationAsRead(parseInt(id));
      res.json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: "Error updating notification" });
    }
  });
  
  // Technician Job Routes
  app.get("/api/technician-jobs", authenticateToken, authorizeRoles(["admin", "technician"]), async (req, res) => {
    try {
      const jobs = req.body.user.role === "admin" 
        ? await storage.getAllTechnicianJobs()
        : await storage.getTechnicianJobs(req.body.user.id);
      
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching technician jobs" });
    }
  });
  
  app.post("/api/technician-jobs", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
    try {
      const jobData = req.body;
      const newJob = await storage.createTechnicianJob(jobData);
      res.status(201).json(newJob);
    } catch (error) {
      res.status(500).json({ message: "Error creating technician job" });
    }
  });
  
  app.patch("/api/technician-jobs/:id", authenticateToken, authorizeRoles(["admin", "technician"]), async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const job = await storage.getTechnicianJob(parseInt(id));
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Only admin or assigned technician can update job
      if (req.body.user.role !== "admin" && job.technicianId !== req.body.user.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to update this job" });
      }
      
      const updatedJob = await storage.updateTechnicianJob(parseInt(id), updates);
      res.json(updatedJob);
    } catch (error) {
      res.status(500).json({ message: "Error updating technician job" });
    }
  });
  
  // User Activities Routes
  app.get("/api/user-activities", authenticateToken, async (req, res) => {
    try {
      const activities = req.body.user.role === "admin" 
        ? await storage.getAllUserActivities()
        : await storage.getUserActivities(req.body.user.id);
      
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user activities" });
    }
  });
  
  // Connection Stats Routes
  app.get("/api/connection-stats", authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getUserConnectionStats(req.body.user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching connection stats" });
    }
  });
  
  app.post("/api/connection-stats", authenticateToken, async (req, res) => {
    try {
      const statData = req.body;
      
      if (req.body.user.role !== "admin" && statData.userId !== req.body.user.id) {
        return res.status(403).json({ message: "Forbidden: You can only create connection stats for yourself" });
      }
      
      const newStat = await storage.createConnectionStat(statData);
      res.status(201).json(newStat);
    } catch (error) {
      res.status(500).json({ message: "Error creating connection stat" });
    }
  });

  // QRIS Payment Routes
  app.get("/api/payment/qris/:billId", authenticateToken, async (req, res) => {
    try {
      const { billId } = req.params;
      
      // Get bill details
      const bill = await storage.getBill(parseInt(billId));
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }
      
      // Only bill owner or admin can access QRIS
      if (req.body.user.role !== "admin" && bill.userId !== req.body.user.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to access this bill" });
      }
      
      // Static QRIS data with your existing QRIS image
      const qrisData = {
        billId: bill.id,
        amount: bill.amount,
        merchantName: "SEKAR NET",
        merchantCity: "Jakarta",
        postalCode: "12345",
        billNumber: `BILL-${bill.id.toString().padStart(6, '0')}`,
        reference1: `REF-${bill.id}`,
        reference2: bill.period,
        // Use your static QRIS image
        qrImageUrl: "/assets/qris-sekar-net.png", // Path to your QRIS image
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };
      
      res.json({
        qrisData,
        downloadUrl: `/api/payment/qris/${billId}/download`,
        instructions: [
          "1. Buka aplikasi e-wallet atau mobile banking Anda",
          "2. Pilih fitur Scan QRIS",
          "3. Scan kode QR di atas",
          "4. Masukkan nominal pembayaran sesuai tagihan",
          "5. Periksa detail pembayaran",
          "6. Konfirmasi pembayaran",
          "7. Simpan bukti pembayaran",
          "8. Upload bukti pembayaran di halaman billing"
        ],
        paymentDetails: {
          amount: `Rp ${(bill.amount / 100).toLocaleString()}`,
          period: bill.period,
          dueDate: new Date(bill.dueDate).toLocaleDateString('id-ID'),
          billNumber: qrisData.billNumber
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Error generating QRIS" });
    }
  });

  app.get("/api/payment/qris/:billId/download", authenticateToken, async (req, res) => {
    try {
      const { billId } = req.params;
      
      // Get bill details
      const bill = await storage.getBill(parseInt(billId));
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }
      
      // Only bill owner or admin can download QRIS
      if (req.body.user.role !== "admin" && bill.userId !== req.body.user.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to access this bill" });
      }
      
      // Path to your static QRIS image
      const qrisImagePath = path.join(process.cwd(), 'public', 'assets', 'qris-sekar-net.png');
      
      // Check if file exists
      if (!fs.existsSync(qrisImagePath)) {
        return res.status(404).json({ message: "QRIS image not found" });
      }
      
      // Set headers for download
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="qris-sekar-net-bill-${billId}.png"`);
      
      // Send the file
      res.sendFile(qrisImagePath);
    } catch (error) {
      res.status(500).json({ message: "Error downloading QRIS" });
    }
  });

  app.post("/api/payment/qris/:billId/verify", authenticateToken, async (req, res) => {
    try {
      const { billId } = req.params;
      const { paymentProof } = req.body;
      
      // Get bill details
      const bill = await storage.getBill(parseInt(billId));
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }
      
      // Only bill owner or admin can verify payment
      if (req.body.user.role !== "admin" && bill.userId !== req.body.user.id) {
        return res.status(403).json({ message: "Forbidden: You don't have permission to verify this payment" });
      }
      
      // Update bill with payment proof
      const updatedBill = await storage.updateBillPayment(parseInt(billId), paymentProof);
      
      res.json({
        message: "Payment proof uploaded successfully",
        bill: updatedBill
      });
    } catch (error) {
      res.status(500).json({ message: "Error verifying payment" });
    }
  });

  // Payment History Routes
  app.get("/api/payment/history", authenticateToken, async (req, res) => {
    try {
      const payments = req.body.user.role === "admin" 
        ? await storage.getAllBills()
        : await storage.getUserBills(req.body.user.id);
      
      // Filter only paid bills
      const paidBills = payments.filter(bill => bill.status === "paid");
      
      res.json(paidBills);
    } catch (error) {
      res.status(500).json({ message: "Error fetching payment history" });
    }
  });

  app.get("/api/payment/statistics", authenticateToken, authorizeRoles(["admin"]), async (req, res) => {
    try {
      const allBills = await storage.getAllBills();
      
      const stats = {
        totalBills: allBills.length,
        paidBills: allBills.filter(bill => bill.status === "paid").length,
        unpaidBills: allBills.filter(bill => bill.status === "unpaid").length,
        overdueBills: allBills.filter(bill => bill.status === "overdue").length,
        totalRevenue: allBills
          .filter(bill => bill.status === "paid")
          .reduce((sum, bill) => sum + bill.amount, 0),
        pendingRevenue: allBills
          .filter(bill => bill.status === "unpaid")
          .reduce((sum, bill) => sum + bill.amount, 0)
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching payment statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
