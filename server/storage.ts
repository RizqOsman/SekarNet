import {
  users, User, InsertUser,
  packages, Package, InsertPackage,
  subscriptions, Subscription, InsertSubscription,
  installationRequests, InstallationRequest, InsertInstallationRequest,
  bills, Bill, InsertBill,
  supportTickets, SupportTicket, InsertSupportTicket,
  notifications, Notification, InsertNotification,
  technicianJobs, TechnicianJob, InsertTechnicianJob,
  userActivities, UserActivity, InsertUserActivity,
  connectionStats, ConnectionStat, InsertConnectionStat
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Packages
  getPackage(id: number): Promise<Package | undefined>;
  getAllPackages(): Promise<Package[]>;
  createPackage(pkg: InsertPackage): Promise<Package>;
  updatePackage(id: number, updates: Partial<Package>): Promise<Package | undefined>;
  
  // Subscriptions
  getSubscription(id: number): Promise<Subscription | undefined>;
  getUserSubscriptions(userId: number): Promise<Subscription[]>;
  getAllSubscriptions(): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription | undefined>;
  
  // Installation Requests
  getInstallationRequest(id: number): Promise<InstallationRequest | undefined>;
  getUserInstallationRequests(userId: number): Promise<InstallationRequest[]>;
  getTechnicianInstallationRequests(technicianId: number): Promise<InstallationRequest[]>;
  getAllInstallationRequests(): Promise<InstallationRequest[]>;
  createInstallationRequest(request: InsertInstallationRequest): Promise<InstallationRequest>;
  updateInstallationRequest(id: number, updates: Partial<InstallationRequest>): Promise<InstallationRequest | undefined>;
  
  // Bills
  getBill(id: number): Promise<Bill | undefined>;
  getUserBills(userId: number): Promise<Bill[]>;
  getAllBills(): Promise<Bill[]>;
  createBill(bill: InsertBill): Promise<Bill>;
  updateBill(id: number, updates: Partial<Bill>): Promise<Bill | undefined>;
  updateBillPayment(id: number, paymentProof: string): Promise<Bill | undefined>;
  
  // Support Tickets
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  getUserSupportTickets(userId: number): Promise<SupportTicket[]>;
  getTechnicianSupportTickets(technicianId: number): Promise<SupportTicket[]>;
  getAllSupportTickets(): Promise<SupportTicket[]>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: number, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined>;
  
  // Notifications
  getNotification(id: number): Promise<Notification | undefined>;
  getUserNotifications(userId: number, role: string): Promise<Notification[]>;
  getAllNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  
  // Technician Jobs
  getTechnicianJob(id: number): Promise<TechnicianJob | undefined>;
  getTechnicianJobs(technicianId: number): Promise<TechnicianJob[]>;
  getAllTechnicianJobs(): Promise<TechnicianJob[]>;
  createTechnicianJob(job: InsertTechnicianJob): Promise<TechnicianJob>;
  updateTechnicianJob(id: number, updates: Partial<TechnicianJob>): Promise<TechnicianJob | undefined>;
  
  // User Activities
  getUserActivity(id: number): Promise<UserActivity | undefined>;
  getUserActivities(userId: number): Promise<UserActivity[]>;
  getAllUserActivities(): Promise<UserActivity[]>;
  createUserActivity(activity: InsertUserActivity): Promise<UserActivity>;
  
  // Connection Stats
  getConnectionStat(id: number): Promise<ConnectionStat | undefined>;
  getUserConnectionStats(userId: number): Promise<ConnectionStat[]>;
  createConnectionStat(stat: InsertConnectionStat): Promise<ConnectionStat>;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private packagesMap: Map<number, Package>;
  private subscriptionsMap: Map<number, Subscription>;
  private installationRequestsMap: Map<number, InstallationRequest>;
  private billsMap: Map<number, Bill>;
  private supportTicketsMap: Map<number, SupportTicket>;
  private notificationsMap: Map<number, Notification>;
  private technicianJobsMap: Map<number, TechnicianJob>;
  private userActivitiesMap: Map<number, UserActivity>;
  private connectionStatsMap: Map<number, ConnectionStat>;
  
  private userCurrentId: number;
  private packageCurrentId: number;
  private subscriptionCurrentId: number;
  private installationRequestCurrentId: number;
  private billCurrentId: number;
  private supportTicketCurrentId: number;
  private notificationCurrentId: number;
  private technicianJobCurrentId: number;
  private userActivityCurrentId: number;
  private connectionStatCurrentId: number;

  constructor() {
    this.usersMap = new Map();
    this.packagesMap = new Map();
    this.subscriptionsMap = new Map();
    this.installationRequestsMap = new Map();
    this.billsMap = new Map();
    this.supportTicketsMap = new Map();
    this.notificationsMap = new Map();
    this.technicianJobsMap = new Map();
    this.userActivitiesMap = new Map();
    this.connectionStatsMap = new Map();
    
    this.userCurrentId = 1;
    this.packageCurrentId = 1;
    this.subscriptionCurrentId = 1;
    this.installationRequestCurrentId = 1;
    this.billCurrentId = 1;
    this.supportTicketCurrentId = 1;
    this.notificationCurrentId = 1;
    this.technicianJobCurrentId = 1;
    this.userActivityCurrentId = 1;
    this.connectionStatCurrentId = 1;
    
    // Seed data
    this.seedData();
  }

  private seedData() {
    // Add default admin user
    this.createUser({
      username: "admin",
      password: "$2a$10$wEB3RAcVzlO0WC1O7bnAEORLbgQOGJW3bgQKJBJSBQP5Bf1P5uV7a", // "adminpassword"
      email: "admin@sekar.net",
      fullName: "Admin User",
      role: "admin"
    });
    
    // Add default technician user
    this.createUser({
      username: "tech",
      password: "$2a$10$9G5x1rRTVi7bZnvGBL0KeuXwUr0UgoDTH2X1B6VX2XR9kPQngfKK2", // "techpassword"
      email: "tech@sekar.net",
      fullName: "Mike Technician",
      phone: "+62812345678",
      role: "technician"
    });
    
    // Add default customer user
    this.createUser({
      username: "customer",
      password: "$2a$10$BLgf3EOqmwlwC8Yd0lyOgeMUoLW47LcCLKgKUhAH6sknZ6HW0K1Oa", // "customerpassword"
      email: "customer@example.com",
      fullName: "John Smith",
      phone: "+62898765432",
      address: "123 Main Street, Building A, Apartment 101, Jakarta Selatan, 12345",
      role: "customer"
    });
    
    // Add internet packages
    this.createPackage({
      name: "Fiber Blast 20",
      description: "Perfect for small households",
      speed: 20,
      uploadSpeed: 10,
      price: 19900000, // Rp 199,000
      features: ["20 Mbps Download", "10 Mbps Upload", "Unlimited Data", "24/7 Support"],
      isPopular: true
    });
    
    this.createPackage({
      name: "Fiber Blast 50",
      description: "Ideal for streaming and gaming",
      speed: 50,
      uploadSpeed: 25,
      price: 35000000, // Rp 350,000
      features: ["50 Mbps Download", "25 Mbps Upload", "Unlimited Data", "24/7 Priority Support"],
      isPopular: false
    });
    
    this.createPackage({
      name: "Fiber Blast 100",
      description: "For power users and businesses",
      speed: 100,
      uploadSpeed: 50,
      price: 59900000, // Rp 599,000
      features: ["100 Mbps Download", "50 Mbps Upload", "Unlimited Data", "24/7 VIP Support"],
      isPopular: false
    });
    
    // Create subscription for customer
    this.createSubscription({
      userId: 3, // customer
      packageId: 2, // Fiber Blast 50
      status: "active",
      startDate: new Date(),
      endDate: undefined
    });
    
    // Create bill for customer
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 5);
    
    this.createBill({
      userId: 3, // customer
      subscriptionId: 1,
      amount: 35000000, // Rp 350,000
      dueDate,
      period: "April 2023"
    });
    
    // Create notifications
    this.createNotification({
      title: "Scheduled Maintenance",
      message: "Maintenance on May 10th from 2-4 AM. Brief service interruption expected.",
      type: "maintenance",
      targetRole: null,
      userId: null
    });
    
    this.createNotification({
      title: "Payment Reminder",
      message: "Your bill for April 2023 is due in 5 days. Please make payment to avoid service interruption.",
      type: "billing",
      targetRole: null,
      userId: 3 // customer
    });
    
    this.createNotification({
      title: "Special Offer",
      message: "Upgrade to Fiber Blast 100 and get 50% off for the first 3 months!",
      type: "announcement",
      targetRole: "customer",
      userId: null
    });
    
    // Create user activities
    this.createUserActivity({
      userId: 3, // customer
      action: "Bill paid for March 2023",
      details: { amount: 35000000, date: "2023-03-15" }
    });
    
    this.createUserActivity({
      userId: 3, // customer
      action: "Support ticket #1234 resolved",
      details: { ticketId: 1234, issue: "WiFi Configuration" }
    });
    
    this.createUserActivity({
      userId: 3, // customer
      action: "Package upgraded to Fiber Blast 50",
      details: { previousPackage: "Fiber Blast 20", newPackage: "Fiber Blast 50" }
    });
    
    // Create connection stats
    this.createConnectionStat({
      userId: 3, // customer
      downloadSpeed: 49.2,
      uploadSpeed: 25.8,
      ping: 15.3
    });
    
    // Create installation request
    this.createInstallationRequest({
      userId: 3, // customer
      packageId: 2, // Fiber Blast 50
      address: "123 Main Street, Building A, Apartment 101, Jakarta Selatan, 12345",
      preferredDate: new Date("2023-05-05T09:00:00"),
      notes: "Please call before arrival"
    });
    
    // Create support ticket
    this.createSupportTicket({
      userId: 3, // customer
      subject: "Connection Drops Issue",
      description: "Connection keeps dropping every 30 minutes, especially during evening hours. Router has been restarted multiple times with no improvement.",
      priority: "high",
      attachments: []
    });
    
    // Create technician job
    this.createTechnicianJob({
      technicianId: 2, // technician
      installationId: 1,
      ticketId: null,
      jobType: "installation",
      scheduledDate: new Date("2023-05-05T09:00:00"),
      notes: "New installation for Fiber Blast 50"
    });
    
    // Update installation request with technician
    this.updateInstallationRequest(1, {
      technicianId: 2,
      status: "scheduled"
    });
    
    // Create another technician job for support
    this.createTechnicianJob({
      technicianId: 2, // technician
      installationId: null,
      ticketId: 1,
      jobType: "support",
      scheduledDate: new Date("2023-05-05T11:30:00"),
      notes: "Check connection drops issue"
    });
    
    // Update support ticket with technician
    this.updateSupportTicket(1, {
      technicianId: 2,
      status: "in_progress"
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.email === email,
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersMap.values());
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.usersMap.values()).filter(
      (user) => user.role === role,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.usersMap.set(id, user);
    return user;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.usersMap.get(id);
    if (!user) {
      return undefined;
    }
    
    const updatedUser = { ...user, ...updates };
    this.usersMap.set(id, updatedUser);
    return updatedUser;
  }
  
  // Packages
  async getPackage(id: number): Promise<Package | undefined> {
    return this.packagesMap.get(id);
  }
  
  async getAllPackages(): Promise<Package[]> {
    return Array.from(this.packagesMap.values());
  }
  
  async createPackage(insertPackage: InsertPackage): Promise<Package> {
    const id = this.packageCurrentId++;
    const createdAt = new Date();
    const pkg: Package = { ...insertPackage, id, createdAt };
    this.packagesMap.set(id, pkg);
    return pkg;
  }
  
  async updatePackage(id: number, updates: Partial<Package>): Promise<Package | undefined> {
    const pkg = this.packagesMap.get(id);
    if (!pkg) {
      return undefined;
    }
    
    const updatedPackage = { ...pkg, ...updates };
    this.packagesMap.set(id, updatedPackage);
    return updatedPackage;
  }
  
  // Subscriptions
  async getSubscription(id: number): Promise<Subscription | undefined> {
    return this.subscriptionsMap.get(id);
  }
  
  async getUserSubscriptions(userId: number): Promise<Subscription[]> {
    return Array.from(this.subscriptionsMap.values()).filter(
      (subscription) => subscription.userId === userId,
    );
  }
  
  async getAllSubscriptions(): Promise<Subscription[]> {
    return Array.from(this.subscriptionsMap.values());
  }
  
  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionCurrentId++;
    const createdAt = new Date();
    const subscription: Subscription = { ...insertSubscription, id, createdAt };
    this.subscriptionsMap.set(id, subscription);
    return subscription;
  }
  
  async updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription | undefined> {
    const subscription = this.subscriptionsMap.get(id);
    if (!subscription) {
      return undefined;
    }
    
    const updatedSubscription = { ...subscription, ...updates };
    this.subscriptionsMap.set(id, updatedSubscription);
    return updatedSubscription;
  }
  
  // Installation Requests
  async getInstallationRequest(id: number): Promise<InstallationRequest | undefined> {
    return this.installationRequestsMap.get(id);
  }
  
  async getUserInstallationRequests(userId: number): Promise<InstallationRequest[]> {
    return Array.from(this.installationRequestsMap.values()).filter(
      (request) => request.userId === userId,
    );
  }
  
  async getTechnicianInstallationRequests(technicianId: number): Promise<InstallationRequest[]> {
    return Array.from(this.installationRequestsMap.values()).filter(
      (request) => request.technicianId === technicianId,
    );
  }
  
  async getAllInstallationRequests(): Promise<InstallationRequest[]> {
    return Array.from(this.installationRequestsMap.values());
  }
  
  async createInstallationRequest(insertRequest: InsertInstallationRequest): Promise<InstallationRequest> {
    const id = this.installationRequestCurrentId++;
    const createdAt = new Date();
    const status = "pending";
    const request: InstallationRequest = { ...insertRequest, id, status, technicianId: undefined, createdAt };
    this.installationRequestsMap.set(id, request);
    return request;
  }
  
  async updateInstallationRequest(id: number, updates: Partial<InstallationRequest>): Promise<InstallationRequest | undefined> {
    const request = this.installationRequestsMap.get(id);
    if (!request) {
      return undefined;
    }
    
    const updatedRequest = { ...request, ...updates };
    this.installationRequestsMap.set(id, updatedRequest);
    return updatedRequest;
  }
  
  // Bills
  async getBill(id: number): Promise<Bill | undefined> {
    return this.billsMap.get(id);
  }
  
  async getUserBills(userId: number): Promise<Bill[]> {
    return Array.from(this.billsMap.values()).filter(
      (bill) => bill.userId === userId,
    );
  }
  
  async getAllBills(): Promise<Bill[]> {
    return Array.from(this.billsMap.values());
  }
  
  async createBill(insertBill: InsertBill): Promise<Bill> {
    const id = this.billCurrentId++;
    const createdAt = new Date();
    const status = "unpaid";
    const bill: Bill = { ...insertBill, id, status, paymentDate: undefined, paymentProof: undefined, createdAt };
    this.billsMap.set(id, bill);
    return bill;
  }
  
  async updateBill(id: number, updates: Partial<Bill>): Promise<Bill | undefined> {
    const bill = this.billsMap.get(id);
    if (!bill) {
      return undefined;
    }
    
    const updatedBill = { ...bill, ...updates };
    this.billsMap.set(id, updatedBill);
    return updatedBill;
  }
  
  async updateBillPayment(id: number, paymentProof: string): Promise<Bill | undefined> {
    const bill = this.billsMap.get(id);
    if (!bill) {
      return undefined;
    }
    
    const updatedBill: Bill = {
      ...bill,
      status: "paid",
      paymentDate: new Date(),
      paymentProof
    };
    
    this.billsMap.set(id, updatedBill);
    return updatedBill;
  }
  
  // Support Tickets
  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    return this.supportTicketsMap.get(id);
  }
  
  async getUserSupportTickets(userId: number): Promise<SupportTicket[]> {
    return Array.from(this.supportTicketsMap.values()).filter(
      (ticket) => ticket.userId === userId,
    );
  }
  
  async getTechnicianSupportTickets(technicianId: number): Promise<SupportTicket[]> {
    return Array.from(this.supportTicketsMap.values()).filter(
      (ticket) => ticket.technicianId === technicianId,
    );
  }
  
  async getAllSupportTickets(): Promise<SupportTicket[]> {
    return Array.from(this.supportTicketsMap.values());
  }
  
  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    const id = this.supportTicketCurrentId++;
    const createdAt = new Date();
    const status = "new";
    const ticket: SupportTicket = { ...insertTicket, id, status, technicianId: undefined, createdAt };
    this.supportTicketsMap.set(id, ticket);
    return ticket;
  }
  
  async updateSupportTicket(id: number, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const ticket = this.supportTicketsMap.get(id);
    if (!ticket) {
      return undefined;
    }
    
    const updatedTicket = { ...ticket, ...updates };
    this.supportTicketsMap.set(id, updatedTicket);
    return updatedTicket;
  }
  
  // Notifications
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notificationsMap.get(id);
  }
  
  async getUserNotifications(userId: number, role: string): Promise<Notification[]> {
    // Get all user-specific notifications and broadcast notifications for user's role
    return Array.from(this.notificationsMap.values()).filter(
      (notification) => 
        (notification.userId === userId) || 
        (notification.userId === null && (notification.targetRole === null || notification.targetRole === role))
    );
  }
  
  async getAllNotifications(): Promise<Notification[]> {
    return Array.from(this.notificationsMap.values());
  }
  
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationCurrentId++;
    const createdAt = new Date();
    const isRead = false;
    const notification: Notification = { ...insertNotification, id, isRead, createdAt };
    this.notificationsMap.set(id, notification);
    return notification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notificationsMap.get(id);
    if (!notification) {
      return undefined;
    }
    
    const updatedNotification: Notification = {
      ...notification,
      isRead: true
    };
    
    this.notificationsMap.set(id, updatedNotification);
    return updatedNotification;
  }
  
  // Technician Jobs
  async getTechnicianJob(id: number): Promise<TechnicianJob | undefined> {
    return this.technicianJobsMap.get(id);
  }
  
  async getTechnicianJobs(technicianId: number): Promise<TechnicianJob[]> {
    return Array.from(this.technicianJobsMap.values()).filter(
      (job) => job.technicianId === technicianId,
    );
  }
  
  async getAllTechnicianJobs(): Promise<TechnicianJob[]> {
    return Array.from(this.technicianJobsMap.values());
  }
  
  async createTechnicianJob(insertJob: InsertTechnicianJob): Promise<TechnicianJob> {
    const id = this.technicianJobCurrentId++;
    const createdAt = new Date();
    const status = "scheduled";
    const job: TechnicianJob = { 
      ...insertJob, 
      id, 
      status, 
      completionDate: undefined, 
      completionProof: [], 
      createdAt 
    };
    this.technicianJobsMap.set(id, job);
    return job;
  }
  
  async updateTechnicianJob(id: number, updates: Partial<TechnicianJob>): Promise<TechnicianJob | undefined> {
    const job = this.technicianJobsMap.get(id);
    if (!job) {
      return undefined;
    }
    
    // If status is being updated to completed, set completion date if not provided
    if (updates.status === "completed" && !updates.completionDate) {
      updates.completionDate = new Date();
    }
    
    const updatedJob = { ...job, ...updates };
    this.technicianJobsMap.set(id, updatedJob);
    return updatedJob;
  }
  
  // User Activities
  async getUserActivity(id: number): Promise<UserActivity | undefined> {
    return this.userActivitiesMap.get(id);
  }
  
  async getUserActivities(userId: number): Promise<UserActivity[]> {
    return Array.from(this.userActivitiesMap.values()).filter(
      (activity) => activity.userId === userId,
    );
  }
  
  async getAllUserActivities(): Promise<UserActivity[]> {
    return Array.from(this.userActivitiesMap.values());
  }
  
  async createUserActivity(insertActivity: InsertUserActivity): Promise<UserActivity> {
    const id = this.userActivityCurrentId++;
    const createdAt = new Date();
    const activity: UserActivity = { ...insertActivity, id, createdAt };
    this.userActivitiesMap.set(id, activity);
    return activity;
  }
  
  // Connection Stats
  async getConnectionStat(id: number): Promise<ConnectionStat | undefined> {
    return this.connectionStatsMap.get(id);
  }
  
  async getUserConnectionStats(userId: number): Promise<ConnectionStat[]> {
    return Array.from(this.connectionStatsMap.values()).filter(
      (stat) => stat.userId === userId,
    );
  }
  
  async createConnectionStat(insertStat: InsertConnectionStat): Promise<ConnectionStat> {
    const id = this.connectionStatCurrentId++;
    const recordedAt = new Date();
    const stat: ConnectionStat = { ...insertStat, id, recordedAt };
    this.connectionStatsMap.set(id, stat);
    return stat;
  }
}

export const storage = new MemStorage();
