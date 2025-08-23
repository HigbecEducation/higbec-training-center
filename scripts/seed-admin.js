const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

// Admin Schema
const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      default: "admin",
      enum: ["admin", "superadmin"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@higbec.com" });

    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log("Email: admin@higbec.com");
      console.log("Password: admin123456");
      process.exit(0);
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcryptjs.hash("admin123456", saltRounds);

    // Create admin user
    const admin = new Admin({
      username: "admin",
      email: "admin@higbec.com",
      password: hashedPassword,
      role: "superadmin",
      isActive: true,
    });

    await admin.save();

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email: admin@higbec.com");
    console.log("🔐 Password: admin123456");
    console.log("⚠️  Please change the password after first login!");
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
    process.exit(0);
  }
}

// Run the seeder
seedAdmin();
