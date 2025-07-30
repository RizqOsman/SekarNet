import { db } from "./db";
import { users, packages } from "@shared/schema";

async function checkDatabase() {
  console.log("Checking SEKAR NET database contents...");

  try {
    // Check users
    const allUsers = await db.select().from(users);
    console.log("\n📋 Users in database:");
    allUsers.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
    });

    // Check packages
    const allPackages = await db.select().from(packages);
    console.log("\n📦 Packages in database:");
    allPackages.forEach(pkg => {
      console.log(`- ID: ${pkg.id}, Name: ${pkg.name}, Speed: ${pkg.speed} Mbps, Price: Rp ${pkg.price}`);
    });

    console.log(`\n✅ Database check completed. Found ${allUsers.length} users and ${allPackages.length} packages.`);

  } catch (error) {
    console.error("❌ Error checking database:", error);
    throw error;
  }
}

// Run check if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkDatabase()
    .then(() => {
      console.log("Check completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Check failed:", error);
      process.exit(1);
    });
}

export { checkDatabase }; 