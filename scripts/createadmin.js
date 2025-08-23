// scripts/create-amplify-admins.js
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: false,
        }
      : false,
});

// Define 4 new admins
const newAdmins = [
  {
    username: "Vyshnav",
    password: "VK@higbecMain2024!",
    email: "vyshnav.krishnan@gmail.com",
    role: "Super Admin",
  },
  {
    username: "Gokul",
    password: "GMN@higbecMain2024!",
    email: "gokulgmn1996@gmail.com ",
    role: "Admin",
  },
  {
    username: "Abhijith",
    password: "ABHI@higbecMain2024!",
    email: "abhijithss003@gmail.com ",
    role: "Admin",
  },
  {
    username: "Vishnu",
    password: "VISHNU@higbecMain2024!",
    email: "vishnuthampi48@gmail.com ",
    role: "Admin",
  },
];

async function createAmplifyAdmins() {
  const client = await pool.connect();

  try {
    console.log("👥 Creating 4 new admins for AWS Amplify deployment...");

    // Start transaction
    await client.query("BEGIN");

    const createdAdmins = [];

    for (let i = 0; i < newAdmins.length; i++) {
      const admin = newAdmins[i];

      // Hash password
      const hashedPassword = await bcrypt.hash(admin.password, 12);

      // Insert admin
      const result = await client.query(
        `INSERT INTO admins (username, password, email, created_at) 
         VALUES ($1, $2, $3, NOW()) 
         RETURNING id, username, email`,
        [admin.username, hashedPassword, admin.email]
      );

      createdAdmins.push({
        ...result.rows[0],
        role: admin.role,
        originalPassword: admin.password,
      });

      console.log(`✅ Created ${admin.role}: ${admin.username}`);
    }

    // Commit transaction
    await client.query("COMMIT");

    console.log("\n🎉 All 4 admins created successfully!");
    console.log("\n📋 Admin Credentials Summary:");
    console.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );

    createdAdmins.forEach((admin, index) => {
      console.log(`\n${index + 1}. ${admin.role}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: ${admin.originalPassword}`);
      console.log(`   ID: ${admin.id}`);
    });

    console.log(
      "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );
    console.log("⚠️  IMPORTANT SECURITY NOTES:");
    console.log("   1. Change ALL passwords after first login");
    console.log("   2. Save these credentials in a secure location");
    console.log("   3. Delete this script output from terminal history");
    console.log("   4. Consider enabling 2FA for production");
  } catch (error) {
    // Rollback on error
    await client.query("ROLLBACK");
    console.error("❌ Error creating admins:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute admin creation
createAmplifyAdmins().catch(console.error);
