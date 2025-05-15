import { pgTable, text, serial, integer, boolean, timestamp, json, doublePrecision, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  address: text("address"),
  role: text("role").notNull().default("customer"), // customer, technician, admin
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Internet Packages table
export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  speed: integer("speed").notNull(), // in Mbps
  uploadSpeed: integer("upload_speed").notNull(), // in Mbps
  price: integer("price").notNull(), // in cents
  features: text("features").array(),
  isPopular: boolean("is_popular").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPackageSchema = createInsertSchema(packages).omit({
  id: true,
  createdAt: true,
});

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  packageId: integer("package_id").notNull(),
  status: text("status").notNull().default("active"), // active, suspended, cancelled
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

// Installation Requests table
export const installationRequests = pgTable("installation_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  packageId: integer("package_id").notNull(),
  address: text("address").notNull(),
  preferredDate: timestamp("preferred_date"),
  status: text("status").notNull().default("pending"), // pending, scheduled, in_progress, completed, cancelled
  technicianId: integer("technician_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInstallationRequestSchema = createInsertSchema(installationRequests).omit({
  id: true,
  status: true,
  technicianId: true,
  createdAt: true,
});

// Bills table
export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subscriptionId: integer("subscription_id").notNull(),
  amount: integer("amount").notNull(), // in cents
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull().default("unpaid"), // unpaid, paid, overdue
  paymentDate: timestamp("payment_date"),
  paymentProof: text("payment_proof"),
  period: text("period").notNull(), // e.g., "May 2023"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  status: true,
  paymentDate: true,
  paymentProof: true,
  createdAt: true,
});

// Support Tickets table
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("new"), // new, in_progress, resolved, closed
  priority: text("priority").notNull().default("medium"), // low, medium, high
  attachments: text("attachments").array(),
  technicianId: integer("technician_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  status: true,
  technicianId: true,
  createdAt: true,
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // announcement, maintenance, outage, billing, support
  targetRole: text("target_role"), // null = all, or specify role
  isRead: boolean("is_read").default(false),
  userId: integer("user_id"), // null = broadcast to all users
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

// Technician Jobs table
export const technicianJobs = pgTable("technician_jobs", {
  id: serial("id").primaryKey(),
  technicianId: integer("technician_id").notNull(),
  installationId: integer("installation_id"),
  ticketId: integer("ticket_id"),
  jobType: text("job_type").notNull(), // installation, support, maintenance
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  scheduledDate: timestamp("scheduled_date").notNull(),
  completionDate: timestamp("completion_date"),
  completionProof: text("completion_proof").array(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTechnicianJobSchema = createInsertSchema(technicianJobs).omit({
  id: true,
  status: true,
  completionDate: true,
  completionProof: true,
  createdAt: true,
});

// User Activities table
export const userActivities = pgTable("user_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  details: json("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserActivitySchema = createInsertSchema(userActivities).omit({
  id: true,
  createdAt: true,
});

// Connection Stats table
export const connectionStats = pgTable("connection_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  downloadSpeed: doublePrecision("download_speed").notNull(),
  uploadSpeed: doublePrecision("upload_speed").notNull(),
  ping: doublePrecision("ping"),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

export const insertConnectionStatSchema = createInsertSchema(connectionStats).omit({
  id: true,
  recordedAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Package = typeof packages.$inferSelect;
export type InsertPackage = z.infer<typeof insertPackageSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type InstallationRequest = typeof installationRequests.$inferSelect;
export type InsertInstallationRequest = z.infer<typeof insertInstallationRequestSchema>;

export type Bill = typeof bills.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type TechnicianJob = typeof technicianJobs.$inferSelect;
export type InsertTechnicianJob = z.infer<typeof insertTechnicianJobSchema>;

export type UserActivity = typeof userActivities.$inferSelect;
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;

export type ConnectionStat = typeof connectionStats.$inferSelect;
export type InsertConnectionStat = z.infer<typeof insertConnectionStatSchema>;
