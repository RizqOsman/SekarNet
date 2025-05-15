import { users, type User, type InsertUser } from "@shared/schema";
import { packages, type Package, type InsertPackage } from "@shared/schema";
import { subscriptions, type Subscription, type InsertSubscription } from "@shared/schema";
import { installationRequests, type InstallationRequest, type InsertInstallationRequest } from "@shared/schema";
import { bills, type Bill, type InsertBill } from "@shared/schema";
import { supportTickets, type SupportTicket, type InsertSupportTicket } from "@shared/schema";
import { notifications, type Notification, type InsertNotification } from "@shared/schema";
import { technicianJobs, type TechnicianJob, type InsertTechnicianJob } from "@shared/schema";
import { userActivities, type UserActivity, type InsertUserActivity } from "@shared/schema";
import { connectionStats, type ConnectionStat, type InsertConnectionStat } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Packages
  async getPackage(id: number): Promise<Package | undefined> {
    const [pkg] = await db.select().from(packages).where(eq(packages.id, id));
    return pkg;
  }

  async getAllPackages(): Promise<Package[]> {
    return await db.select().from(packages);
  }

  async createPackage(pkg: InsertPackage): Promise<Package> {
    const [createdPackage] = await db.insert(packages).values(pkg).returning();
    return createdPackage;
  }

  async updatePackage(id: number, updates: Partial<Package>): Promise<Package | undefined> {
    const [updatedPackage] = await db
      .update(packages)
      .set(updates)
      .where(eq(packages.id, id))
      .returning();
    return updatedPackage;
  }

  // Subscriptions
  async getSubscription(id: number): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return subscription;
  }

  async getUserSubscriptions(userId: number): Promise<Subscription[]> {
    return await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    return await db.select().from(subscriptions);
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [createdSubscription] = await db.insert(subscriptions).values(subscription).returning();
    return createdSubscription;
  }

  async updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription | undefined> {
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set(updates)
      .where(eq(subscriptions.id, id))
      .returning();
    return updatedSubscription;
  }

  // Installation Requests
  async getInstallationRequest(id: number): Promise<InstallationRequest | undefined> {
    const [request] = await db.select().from(installationRequests).where(eq(installationRequests.id, id));
    return request;
  }

  async getUserInstallationRequests(userId: number): Promise<InstallationRequest[]> {
    return await db
      .select()
      .from(installationRequests)
      .where(eq(installationRequests.userId, userId));
  }

  async getTechnicianInstallationRequests(technicianId: number): Promise<InstallationRequest[]> {
    return await db
      .select()
      .from(installationRequests)
      .where(eq(installationRequests.technicianId, technicianId));
  }

  async getAllInstallationRequests(): Promise<InstallationRequest[]> {
    return await db.select().from(installationRequests);
  }

  async createInstallationRequest(request: InsertInstallationRequest): Promise<InstallationRequest> {
    const [createdRequest] = await db.insert(installationRequests).values(request).returning();
    return createdRequest;
  }

  async updateInstallationRequest(id: number, updates: Partial<InstallationRequest>): Promise<InstallationRequest | undefined> {
    const [updatedRequest] = await db
      .update(installationRequests)
      .set(updates)
      .where(eq(installationRequests.id, id))
      .returning();
    return updatedRequest;
  }

  // Bills
  async getBill(id: number): Promise<Bill | undefined> {
    const [bill] = await db.select().from(bills).where(eq(bills.id, id));
    return bill;
  }

  async getUserBills(userId: number): Promise<Bill[]> {
    return await db.select().from(bills).where(eq(bills.userId, userId));
  }

  async getAllBills(): Promise<Bill[]> {
    return await db.select().from(bills);
  }

  async createBill(bill: InsertBill): Promise<Bill> {
    const [createdBill] = await db.insert(bills).values(bill).returning();
    return createdBill;
  }

  async updateBill(id: number, updates: Partial<Bill>): Promise<Bill | undefined> {
    const [updatedBill] = await db
      .update(bills)
      .set(updates)
      .where(eq(bills.id, id))
      .returning();
    return updatedBill;
  }

  async updateBillPayment(id: number, paymentProof: string): Promise<Bill | undefined> {
    const [updatedBill] = await db
      .update(bills)
      .set({
        paymentProof,
        status: "pending",
      })
      .where(eq(bills.id, id))
      .returning();
    return updatedBill;
  }

  // Support Tickets
  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return ticket;
  }

  async getUserSupportTickets(userId: number): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets).where(eq(supportTickets.userId, userId));
  }

  async getTechnicianSupportTickets(technicianId: number): Promise<SupportTicket[]> {
    return await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.technicianId, technicianId));
  }

  async getAllSupportTickets(): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets);
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const [createdTicket] = await db.insert(supportTickets).values(ticket).returning();
    return createdTicket;
  }

  async updateSupportTicket(id: number, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const [updatedTicket] = await db
      .update(supportTickets)
      .set(updates)
      .where(eq(supportTickets.id, id))
      .returning();
    return updatedTicket;
  }

  // Notifications
  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification;
  }

  async getUserNotifications(userId: number, role: string): Promise<Notification[]> {
    // Get notifications specifically for this user
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId));

    // Get notifications for the user's role
    const roleNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.targetRole, role));

    // Get global notifications (without userId or targetRole)
    const globalNotifications = await db
      .select()
      .from(notifications)
      .where(
        and(
          notifications.userId.isNull(),
          notifications.targetRole.isNull()
        )
      );

    // Combine all notifications
    return [...userNotifications, ...roleNotifications, ...globalNotifications];
  }

  async getAllNotifications(): Promise<Notification[]> {
    return await db.select().from(notifications);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [createdNotification] = await db.insert(notifications).values(notification).returning();
    return createdNotification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return updatedNotification;
  }

  // Technician Jobs
  async getTechnicianJob(id: number): Promise<TechnicianJob | undefined> {
    const [job] = await db.select().from(technicianJobs).where(eq(technicianJobs.id, id));
    return job;
  }

  async getTechnicianJobs(technicianId: number): Promise<TechnicianJob[]> {
    return await db
      .select()
      .from(technicianJobs)
      .where(eq(technicianJobs.technicianId, technicianId));
  }

  async getAllTechnicianJobs(): Promise<TechnicianJob[]> {
    return await db.select().from(technicianJobs);
  }

  async createTechnicianJob(job: InsertTechnicianJob): Promise<TechnicianJob> {
    const [createdJob] = await db.insert(technicianJobs).values(job).returning();
    return createdJob;
  }

  async updateTechnicianJob(id: number, updates: Partial<TechnicianJob>): Promise<TechnicianJob | undefined> {
    const [updatedJob] = await db
      .update(technicianJobs)
      .set(updates)
      .where(eq(technicianJobs.id, id))
      .returning();
    return updatedJob;
  }

  // User Activities
  async getUserActivity(id: number): Promise<UserActivity | undefined> {
    const [activity] = await db.select().from(userActivities).where(eq(userActivities.id, id));
    return activity;
  }

  async getUserActivities(userId: number): Promise<UserActivity[]> {
    return await db
      .select()
      .from(userActivities)
      .where(eq(userActivities.userId, userId))
      .orderBy(desc(userActivities.createdAt));
  }

  async getAllUserActivities(): Promise<UserActivity[]> {
    return await db.select().from(userActivities).orderBy(desc(userActivities.createdAt));
  }

  async createUserActivity(activity: InsertUserActivity): Promise<UserActivity> {
    const [createdActivity] = await db.insert(userActivities).values(activity).returning();
    return createdActivity;
  }

  // Connection Stats
  async getConnectionStat(id: number): Promise<ConnectionStat | undefined> {
    const [stat] = await db.select().from(connectionStats).where(eq(connectionStats.id, id));
    return stat;
  }

  async getUserConnectionStats(userId: number): Promise<ConnectionStat[]> {
    return await db
      .select()
      .from(connectionStats)
      .where(eq(connectionStats.userId, userId))
      .orderBy(desc(connectionStats.recordedAt));
  }

  async createConnectionStat(stat: InsertConnectionStat): Promise<ConnectionStat> {
    const [createdStat] = await db.insert(connectionStats).values(stat).returning();
    return createdStat;
  }
}

export const storage = new DatabaseStorage();