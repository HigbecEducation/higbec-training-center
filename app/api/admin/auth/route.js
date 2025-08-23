import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { AdminModel, initializeDatabase } from "@/lib/postgresql";

// Initialize database on startup
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
}

export async function POST(request) {
  try {
    await ensureDbInitialized();

    const { action, ...data } = await request.json();

    if (action === "login") {
      return handleLogin(data);
    } else if (action === "register") {
      return handleRegister(data);
    } else {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleLogin({ email, password }) {
  try {
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Find admin by email
    const admin = await AdminModel.findByEmail(email.toLowerCase().trim());

    if (!admin) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Create response with token in cookie
    const response = NextResponse.json({
      message: "Login successful",
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });

    // Set HTTP-only cookie
    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}

async function handleRegister({ username, email, password }) {
  try {
    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Validate username
    if (username.length < 3) {
      return NextResponse.json(
        { message: "Username must be at least 3 characters long" },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await AdminModel.findByUsernameOrEmail(
      username.trim(),
      email.toLowerCase().trim()
    );

    if (existingAdmin) {
      if (existingAdmin.email === email.toLowerCase().trim()) {
        return NextResponse.json(
          { message: "Admin with this email already exists" },
          { status: 409 }
        );
      } else {
        return NextResponse.json(
          { message: "Admin with this username already exists" },
          { status: 409 }
        );
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcryptjs.hash(password, saltRounds);

    // Create new admin
    const adminData = {
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin",
      isActive: true,
    };

    const admin = await AdminModel.create(adminData);

    return NextResponse.json(
      {
        message: "Admin registered successfully",
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Handle PostgreSQL constraint violations
    if (error.code === "23505") {
      // Unique constraint violation
      if (error.constraint === "admins_email_key") {
        return NextResponse.json(
          { message: "Admin with this email already exists" },
          { status: 409 }
        );
      } else if (error.constraint === "admins_username_key") {
        return NextResponse.json(
          { message: "Admin with this username already exists" },
          { status: 409 }
        );
      }
    }

    // Handle PostgreSQL check constraint violations
    if (error.code === "23514") {
      // Check constraint violation
      return NextResponse.json(
        { message: "Invalid data provided. Please check your input." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    // Logout - clear the cookie
    const response = NextResponse.json({
      message: "Logout successful",
    });

    response.cookies.set("admin-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ message: "Logout failed" }, { status: 500 });
  }
}
