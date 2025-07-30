import { db } from "./db";
import { users, packages, subscriptions, bills, supportTickets, notifications } from "@shared/schema";
import bcrypt from "bcryptjs";

async function setupDatabase() {
  console.log("Setting up SEKAR NET database...");

  try {
    // Check if we already have data
    const existingUsers = await db.select().from(users).limit(1);
    
    if (existingUsers.length > 0) {
      console.log("✓ Database already has data, skipping seed");
      return;
    }

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    const [adminUser] = await db.insert(users).values({
      username: "admin",
      password: adminPassword,
      email: "admin@sekar.net",
      fullName: "Administrator",
      phone: "+62 21 1234 5678",
      address: "Jakarta, Indonesia",
      role: "admin"
    }).returning();

    console.log("✓ Created admin user");

    // Create technician user
    const techPassword = await bcrypt.hash("tech123", 10);
    const [techUser] = await db.insert(users).values({
      username: "technician",
      password: techPassword,
      email: "technician@sekar.net",
      fullName: "John Technician",
      phone: "+62 21 1234 5679",
      address: "Jakarta, Indonesia",
      role: "technician"
    }).returning();

    console.log("✓ Created technician user");

    // Create customer user
    const customerPassword = await bcrypt.hash("customer123", 10);
    const [customerUser] = await db.insert(users).values({
      username: "customer",
      password: customerPassword,
      email: "customer@example.com",
      fullName: "Budi Santoso",
      phone: "+62 21 1234 5680",
      address: "Jl. Sudirman No. 123, Jakarta",
      role: "customer"
    }).returning();

    console.log("✓ Created customer user");

    // Create packages
    const [basicPackage] = await db.insert(packages).values({
      name: "Paket Basic",
      description: "Internet cepat untuk kebutuhan sehari-hari",
      speed: 20,
      uploadSpeed: 10,
      price: 199000,
      features: JSON.stringify(["Unlimited Internet", "24/7 Support", "Free Installation", "No FUP"]),
      isPopular: false
    }).returning();

    const [standardPackage] = await db.insert(packages).values({
      name: "Paket Standard",
      description: "Internet stabil untuk streaming dan gaming",
      speed: 50,
      uploadSpeed: 25,
      price: 299000,
      features: JSON.stringify(["Unlimited Internet", "24/7 Support", "Free Installation", "No FUP", "Free WiFi Router"]),
      isPopular: true
    }).returning();

    const [premiumPackage] = await db.insert(packages).values({
      name: "Paket Premium",
      description: "Internet super cepat untuk kebutuhan bisnis",
      speed: 100,
      uploadSpeed: 50,
      price: 499000,
      features: JSON.stringify(["Unlimited Internet", "24/7 Support", "Free Installation", "No FUP", "Free WiFi Router", "Priority Support"]),
      isPopular: false
    }).returning();

    console.log("✓ Created internet packages");

    // Create subscription for customer
    const [subscription] = await db.insert(subscriptions).values({
      userId: customerUser.id,
      packageId: standardPackage.id,
      status: "active"
    }).returning();

    console.log("✓ Created customer subscription");

    // Create sample bills
    const currentDate = new Date();
    const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 15);

    await db.insert(bills).values({
      userId: customerUser.id,
      subscriptionId: subscription.id,
      amount: 299000,
      dueDate: Math.floor(dueDate.getTime() / 1000),
      period: `${currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`
    });

    console.log("✓ Created sample bills");

    // Create sample support ticket
    await db.insert(supportTickets).values({
      userId: customerUser.id,
      title: "Koneksi internet lambat",
      description: "Internet saya terasa lambat sejak kemarin",
      priority: "medium",
      status: "open",
      category: "technical"
    });

    console.log("✓ Created sample support ticket");

    // Create sample notification
    await db.insert(notifications).values({
      userId: customerUser.id,
      title: "Tagihan Baru",
      message: "Tagihan internet Anda untuk bulan ini sudah tersedia",
      type: "info"
    });

    console.log("✓ Created sample notification");

    console.log("\n🎉 Database setup completed successfully!");
    console.log("\nDemo accounts:");
    console.log("Admin: admin / admin123");
    console.log("Technician: technician / tech123");
    console.log("Customer: customer / customer123");

  } catch (error) {
    console.error("❌ Error setting up database:", error);
    throw error;
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase()
    .then(() => {
      console.log("Setup completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Setup failed:", error);
      process.exit(1);
    });
}

export { setupDatabase }; 