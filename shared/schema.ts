import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  address: text("address"),
  role: text("role").notNull().default("customer"), // customer, technician, admin
  createdAt: integer("created_at").default(sql`(unixepoch())`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Internet Packages table
export const packages = sqliteTable("packages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  speed: integer("speed").notNull(), // in Mbps
  uploadSpeed: integer("upload_speed").notNull(), // in Mbps
  price: integer("price").notNull(), // in cents
  features: text("features"), // JSON string for SQLite
  isPopular: integer("is_popular", { mode: 'boolean' }).default(false),
  createdAt: integer("created_at").default(sql`(unixepoch())`),
});

export const insertPackageSchema = createInsertSchema(packages).omit({
  id: true,
  createdAt: true,
});

// Subscriptions table
export const subscriptions = sqliteTable("subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  packageId: integer("package_id").notNull(),
  status: text("status").notNull().default("active"), // active, suspended, cancelled
  startDate: integer("start_date", { mode: 'timestamp' }).default(sql`(unixepoch())`),
  endDate: integer("end_date", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

// Installation Requests table
export const installationRequests = sqliteTable("installation_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  packageId: integer("package_id").notNull(),
  address: text("address").notNull(),
  preferredDate: integer("preferred_date", { mode: 'timestamp' }),
  status: text("status").notNull().default("pending"), // pending, scheduled, in_progress, completed, cancelled
  technicianId: integer("technician_id"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const insertInstallationRequestSchema = createInsertSchema(installationRequests).omit({
  id: true,
  status: true,
  technicianId: true,
  createdAt: true,
});

// Bills table
export const bills = sqliteTable("bills", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  subscriptionId: integer("subscription_id").notNull(),
  amount: integer("amount").notNull(), // in cents
  dueDate: integer("due_date", { mode: 'timestamp' }).notNull(),
  status: text("status").notNull().default("unpaid"), // unpaid, paid, overdue
  paymentDate: integer("payment_date", { mode: 'timestamp' }),
  paymentProof: text("payment_proof"),
  period: text("period").notNull(), // e.g., "May 2023"
  issueDate: integer("issue_date", { mode: 'timestamp' }), // Added missing field
  periodStart: integer("period_start", { mode: 'timestamp' }), // Added missing field
  periodEnd: integer("period_end", { mode: 'timestamp' }), // Added missing field
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  status: true,
  paymentDate: true,
  paymentProof: true,
  createdAt: true,
});

// Support Tickets table
export const supportTickets = sqliteTable("support_tickets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  subject: text("subject"), // Added missing field
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  status: text("status").notNull().default("open"), // open, in_progress, resolved, closed
  category: text("category").notNull(), // technical, billing, installation, general
  technicianId: integer("technician_id"),
  resolution: text("resolution"),
  response: text("response"), // Added missing field
  attachments: text("attachments"), // Added missing field - JSON string
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  status: true,
  technicianId: true,
  resolution: true,
  createdAt: true,
  updatedAt: true,
});

// Notifications table
export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // info, warning, error, success
  targetRole: text("target_role"), // Added missing field
  isRead: integer("is_read", { mode: 'boolean' }).default(false),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

// Technician Jobs table
export const technicianJobs = sqliteTable("technician_jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  technicianId: integer("technician_id").notNull(),
  jobType: text("job_type").notNull(), // installation, maintenance, repair
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, cancelled
  address: text("address").notNull(),
  scheduledDate: integer("scheduled_date", { mode: 'timestamp' }),
  completedDate: integer("completed_date", { mode: 'timestamp' }),
  installationId: integer("installation_id"), // Added missing field
  ticketId: integer("ticket_id"), // Added missing field
  completionProof: text("completion_proof"), // Added missing field - JSON string
  notes: text("notes"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const insertTechnicianJobSchema = createInsertSchema(technicianJobs).omit({
  id: true,
  status: true,
  completedDate: true,
  createdAt: true,
});

// User Activities table
export const userActivities = sqliteTable("user_activities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  activity: text("activity").notNull(),
  details: text("details"), // JSON string for SQLite
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const insertUserActivitySchema = createInsertSchema(userActivities).omit({
  id: true,
  createdAt: true,
});

// Connection Stats table
export const connectionStats = sqliteTable("connection_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  downloadSpeed: real("download_speed"), // in Mbps
  uploadSpeed: real("upload_speed"), // in Mbps
  latency: real("latency"), // in ms
  packetLoss: real("packet_loss"), // percentage
  timestamp: integer("timestamp", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const insertConnectionStatSchema = createInsertSchema(connectionStats).omit({
  id: true,
  timestamp: true,
});

// Type exports
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
