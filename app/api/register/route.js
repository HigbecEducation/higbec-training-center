import { NextResponse } from "next/server";
import {
  ProjectRegistrationModel,
  initializeDatabase,
} from "../../../lib/postgresql";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

    // Check content type to determine how to parse the request
    const contentType = request.headers.get("content-type") || "";
    let data;
    let paymentScreenshot = null;
    let screenshotPath = null;

    if (contentType.includes("multipart/form-data")) {
      // Parse FormData for file upload
      const formData = await request.formData();

      // Extract form fields
      data = {
        fullName: formData.get("fullName"),
        phoneNumber: formData.get("phoneNumber"),
        email: formData.get("email"),
        collegeName: formData.get("collegeName"),
        branch: formData.get("branch"),
        semester: formData.get("semester"),
        batchType: formData.get("batchType"),
        registrationType: formData.get("registrationType"),
        projectTitle: formData.get("projectTitle"),
        groupMembers: formData.get("groupMembers")
          ? JSON.parse(formData.get("groupMembers"))
          : [],
      };

      // Get payment screenshot file
      paymentScreenshot = formData.get("paymentScreenshot");
    } else {
      // Parse JSON for backwards compatibility
      data = await request.json();
    }

    // Validate required fields
    const requiredFields = [
      "fullName",
      "phoneNumber",
      "email",
      "collegeName",
      "branch",
      "semester",
      "batchType",
      "registrationType",
      "projectTitle",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate payment screenshot if provided
    if (paymentScreenshot && paymentScreenshot.size > 0) {
      // Validate file type
      if (!paymentScreenshot.type.startsWith("image/")) {
        return NextResponse.json(
          { message: "Payment screenshot must be an image file" },
          { status: 400 }
        );
      }

      // Validate file size (5MB limit)
      if (paymentScreenshot.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { message: "Payment screenshot must be less than 5MB" },
          { status: 400 }
        );
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "payment-screenshots"
      );
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        console.error("Error creating uploads directory:", error);
      }

      // Generate unique filename
      const timestamp = Date.now();
      const extension = paymentScreenshot.name.split(".").pop();
      const filename = `payment_${timestamp}_${Math.random()
        .toString(36)
        .substring(7)}.${extension}`;
      const filepath = path.join(uploadsDir, filename);

      // Save file
      try {
        const bytes = await paymentScreenshot.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);
        // Store just the filename, not the full path
        screenshotPath = filename;
      } catch (error) {
        console.error("Error saving file:", error);
        return NextResponse.json(
          { message: "Error uploading payment screenshot" },
          { status: 500 }
        );
      }
    }

    // Validate batch type
    const validBatchTypes = [
      "M.Tech",
      "B.Tech",
      "M.Sc.",
      "B.Sc.",
      "Polytechnic",
      "MCA",
      "Diploma",
    ];
    if (!validBatchTypes.includes(data.batchType)) {
      return NextResponse.json(
        { message: "Invalid batch type" },
        { status: 400 }
      );
    }

    // Validate registration type
    const validRegistrationTypes = ["Individual Project", "Group Project"];
    if (!validRegistrationTypes.includes(data.registrationType)) {
      return NextResponse.json(
        { message: "Invalid registration type" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(data.phoneNumber.replace(/[^0-9]/g, ""))) {
      return NextResponse.json(
        { message: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Validate group members if it's a group project
    if (data.registrationType === "Group Project") {
      if (
        !data.groupMembers ||
        !Array.isArray(data.groupMembers) ||
        data.groupMembers.length === 0
      ) {
        return NextResponse.json(
          { message: "Group members are required for group projects" },
          { status: 400 }
        );
      }

      // Validate each group member
      for (const member of data.groupMembers) {
        if (!member.name || !member.phoneNumber) {
          return NextResponse.json(
            { message: "Each group member must have a name and phone number" },
            { status: 400 }
          );
        }

        if (!phoneRegex.test(member.phoneNumber.replace(/[^0-9]/g, ""))) {
          return NextResponse.json(
            {
              message: `Invalid phone number format for group member: ${member.name}`,
            },
            { status: 400 }
          );
        }
      }

      // Limit number of group members
      if (data.groupMembers.length > 5) {
        return NextResponse.json(
          { message: "Maximum 5 group members allowed" },
          { status: 400 }
        );
      }
    }

    // Check if email already exists
    const existingRegistration = await ProjectRegistrationModel.findByEmail(
      data.email
    );
    if (existingRegistration) {
      return NextResponse.json(
        { message: "Email already registered. Please use a different email." },
        { status: 409 }
      );
    }

    // Sanitize and prepare data
    const registrationData = {
      fullName: data.fullName.trim(),
      phoneNumber: data.phoneNumber.trim(),
      email: data.email.toLowerCase().trim(),
      collegeName: data.collegeName.trim(),
      branch: data.branch.trim(),
      semester: data.semester.trim(),
      batchType: data.batchType,
      registrationType: data.registrationType,
      projectTitle: data.projectTitle.trim(),
      groupMembers:
        data.registrationType === "Group Project"
          ? data.groupMembers.map((member) => ({
              name: member.name.trim(),
              phoneNumber: member.phoneNumber.trim(),
            }))
          : [],
      paymentScreenshotPath: screenshotPath, // Store filename only
    };

    // Create new registration
    const savedRegistration = await ProjectRegistrationModel.create(
      registrationData
    );

    // Return success response
    return NextResponse.json(
      {
        message: "Registration successful",
        id: savedRegistration.id,
        projectId: savedRegistration.project_id,
        registrationNumber: `HIGBEC-${savedRegistration.id
          .toString()
          .padStart(6, "0")}`,
        registrationDate: new Date(savedRegistration.created_at).toLocaleString(
          "en-IN",
          {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }
        ),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Handle PostgreSQL constraint violations
    if (error.code === "23505") {
      // Unique constraint violation
      if (error.constraint === "project_registrations_email_key") {
        return NextResponse.json(
          {
            message: "Email already registered. Please use a different email.",
          },
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
      { message: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await ensureDbInitialized();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const batchType = searchParams.get("batchType") || "";
    const registrationType = searchParams.get("registrationType") || "";
    const status = searchParams.get("status") || "";

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { message: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    // Build filter object
    const filters = {
      search,
      batchType,
      registrationType,
      status,
      limit,
      offset: (page - 1) * limit,
    };

    // Remove empty filters
    Object.keys(filters).forEach((key) => {
      if (
        filters[key] === "" ||
        filters[key] === null ||
        filters[key] === undefined
      ) {
        delete filters[key];
      }
    });

    // Fetch registrations with pagination
    const registrations = await ProjectRegistrationModel.findWithFilters(
      filters
    );

    // Get total count for pagination
    const totalCount = await ProjectRegistrationModel.countWithFilters(filters);
    const totalPages = Math.ceil(totalCount / limit);

    // Transform registrations to match frontend expectations
    const transformedRegistrations = registrations.map((reg) => {
      console.log("Raw database row:", reg); // Debug log

      return {
        _id: reg.id, // For compatibility with existing frontend code
        id: reg.id,
        projectId: reg.project_id,
        fullName: reg.full_name,
        phoneNumber: reg.phone_number,
        email: reg.email,
        collegeName: reg.college_name,
        branch: reg.branch,
        semester: reg.semester,
        batchType: reg.batch_type,
        registrationType: reg.registration_type,
        projectTitle: reg.project_title,
        groupMembers: reg.group_members || [],
        // Handle different possible field names for payment screenshot
        paymentScreenshot:
          reg.payment_screenshot_path || reg.payment_screenshot || null,
        paymentScreenshotPath:
          reg.payment_screenshot_path || reg.payment_screenshot || null,
        status: reg.status,
        createdAt: reg.created_at,
        updatedAt: reg.updated_at,
      };
    });

    console.log("Transformed registrations:", transformedRegistrations); // Debug log

    return NextResponse.json({
      registrations: transformedRegistrations,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
