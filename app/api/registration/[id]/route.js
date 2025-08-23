import { NextResponse } from "next/server";
import { ProjectRegistrationModel, initializeDatabase } from "@/lib/postgresql";

// Initialize database on startup
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
}

export async function GET(request, { params }) {
  try {
    await ensureDbInitialized();

    const { id } = params;

    // Validate ID format (should be a positive integer)
    const registrationId = parseInt(id);
    if (!registrationId || registrationId <= 0) {
      return NextResponse.json(
        { message: "Invalid registration ID format" },
        { status: 400 }
      );
    }

    // Find registration by ID
    const registration = await ProjectRegistrationModel.findById(
      registrationId
    );

    if (!registration) {
      return NextResponse.json(
        { message: "Registration not found" },
        { status: 404 }
      );
    }

    // Transform to match frontend expectations
    const transformedRegistration = {
      _id: registration.id, // For compatibility
      id: registration.id,
      fullName: registration.full_name,
      phoneNumber: registration.phone_number,
      email: registration.email,
      collegeName: registration.college_name,
      branch: registration.branch,
      semester: registration.semester,
      batchType: registration.batch_type,
      registrationType: registration.registration_type,
      projectTitle: registration.project_title,
      groupMembers: registration.group_members || [],
      status: registration.status,
      createdAt: registration.created_at,
      updatedAt: registration.updated_at,
    };

    return NextResponse.json(transformedRegistration);
  } catch (error) {
    console.error("Error fetching registration:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await ensureDbInitialized();

    const { id } = params;
    const updateData = await request.json();

    // Validate ID format
    const registrationId = parseInt(id);
    if (!registrationId || registrationId <= 0) {
      return NextResponse.json(
        { message: "Invalid registration ID format" },
        { status: 400 }
      );
    }

    // Validate update data
    const allowedFields = ["status", "project_title", "group_members"];
    const filteredData = {};

    Object.keys(updateData).forEach((key) => {
      // Convert camelCase to snake_case for database
      const dbKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      if (allowedFields.includes(dbKey)) {
        filteredData[dbKey] = updateData[key];
      }
    });

    // Validate status if provided
    if (
      filteredData.status &&
      !["pending", "approved", "rejected"].includes(filteredData.status)
    ) {
      return NextResponse.json(
        { message: "Invalid status value" },
        { status: 400 }
      );
    }

    // Validate and stringify group_members if provided
    if (filteredData.group_members !== undefined) {
      if (!Array.isArray(filteredData.group_members)) {
        return NextResponse.json(
          { message: "Group members must be an array" },
          { status: 400 }
        );
      }
      filteredData.group_members = JSON.stringify(filteredData.group_members);
    }

    if (Object.keys(filteredData).length === 0) {
      return NextResponse.json(
        { message: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update registration
    const updatedRegistration = await ProjectRegistrationModel.updateById(
      registrationId,
      filteredData
    );

    if (!updatedRegistration) {
      return NextResponse.json(
        { message: "Registration not found" },
        { status: 404 }
      );
    }

    // Transform response
    const transformedRegistration = {
      _id: updatedRegistration.id,
      id: updatedRegistration.id,
      fullName: updatedRegistration.full_name,
      phoneNumber: updatedRegistration.phone_number,
      email: updatedRegistration.email,
      collegeName: updatedRegistration.college_name,
      branch: updatedRegistration.branch,
      semester: updatedRegistration.semester,
      batchType: updatedRegistration.batch_type,
      registrationType: updatedRegistration.registration_type,
      projectTitle: updatedRegistration.project_title,
      groupMembers: updatedRegistration.group_members || [],
      status: updatedRegistration.status,
      createdAt: updatedRegistration.created_at,
      updatedAt: updatedRegistration.updated_at,
    };

    return NextResponse.json({
      message: "Registration updated successfully",
      registration: transformedRegistration,
    });
  } catch (error) {
    console.error("Error updating registration:", error);

    // Handle PostgreSQL constraint violations
    if (error.code === "23514") {
      // Check constraint violation
      return NextResponse.json(
        { message: "Invalid data provided. Please check your input." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await ensureDbInitialized();

    const { id } = params;

    // Validate ID format
    const registrationId = parseInt(id);
    if (!registrationId || registrationId <= 0) {
      return NextResponse.json(
        { message: "Invalid registration ID format" },
        { status: 400 }
      );
    }

    // Delete registration
    const deletedRegistration = await ProjectRegistrationModel.deleteById(
      registrationId
    );

    if (!deletedRegistration) {
      return NextResponse.json(
        { message: "Registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Registration deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting registration:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
