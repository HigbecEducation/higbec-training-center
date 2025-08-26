import { NextResponse } from "next/server";
import {
  ProjectRegistrationModel,
  initializeDatabase,
} from "../../../../lib/postgresql";
import { deleteFileFromSupabase } from "../../../../lib/supabase";

// Initialize database on startup
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
}

// GET registration by ID
export async function GET(request, { params }) {
  try {
    await ensureDbInitialized();

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "Registration ID is required" },
        { status: 400 }
      );
    }

    const registration = await ProjectRegistrationModel.findById(parseInt(id));

    if (!registration) {
      return NextResponse.json(
        { message: "Registration not found" },
        { status: 404 }
      );
    }

    // Transform the response to match frontend expectations
    const transformedRegistration = {
      id: registration.id,
      projectId: registration.project_id,
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
      paymentScreenshot: registration.payment_screenshot_path,
      paymentScreenshotPath: registration.payment_screenshot_path,
      paymentScreenshotFileName: registration.payment_screenshot_file_name,
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

// UPDATE registration status
export async function PUT(request, { params }) {
  try {
    await ensureDbInitialized();

    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "Registration ID is required" },
        { status: 400 }
      );
    }

    if (!body.status) {
      return NextResponse.json(
        { message: "Status is required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { message: "Invalid status. Must be pending, approved, or rejected" },
        { status: 400 }
      );
    }

    // Update the registration
    const updatedRegistration = await ProjectRegistrationModel.updateStatus(
      parseInt(id),
      body.status
    );

    if (!updatedRegistration) {
      return NextResponse.json(
        { message: "Registration not found" },
        { status: 404 }
      );
    }

    // Transform the response
    const transformedRegistration = {
      id: updatedRegistration.id,
      projectId: updatedRegistration.project_id,
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
      paymentScreenshot: updatedRegistration.payment_screenshot_path,
      paymentScreenshotPath: updatedRegistration.payment_screenshot_path,
      paymentScreenshotFileName:
        updatedRegistration.payment_screenshot_file_name,
      status: updatedRegistration.status,
      createdAt: updatedRegistration.created_at,
      updatedAt: updatedRegistration.updated_at,
    };

    return NextResponse.json({
      message: "Registration status updated successfully",
      registration: transformedRegistration,
    });
  } catch (error) {
    console.error("Error updating registration:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE registration
export async function DELETE(request, { params }) {
  try {
    await ensureDbInitialized();

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "Registration ID is required" },
        { status: 400 }
      );
    }

    // Get the registration first to access file info
    const registration = await ProjectRegistrationModel.findById(parseInt(id));

    if (!registration) {
      return NextResponse.json(
        { message: "Registration not found" },
        { status: 404 }
      );
    }

    // Delete the file from Supabase Storage if it exists
    if (registration.payment_screenshot_file_name) {
      console.log(
        "Deleting file from Supabase:",
        registration.payment_screenshot_file_name
      );

      const deleteResult = await deleteFileFromSupabase(
        registration.payment_screenshot_file_name,
        "uploads"
      );

      if (!deleteResult.success) {
        console.warn(
          "Failed to delete file from Supabase:",
          deleteResult.error
        );
        // Continue with registration deletion even if file deletion fails
      } else {
        console.log("File deleted successfully from Supabase");
      }
    }

    // Delete the registration from database
    const deletedRegistration = await ProjectRegistrationModel.delete(
      parseInt(id)
    );

    if (!deletedRegistration) {
      return NextResponse.json(
        { message: "Failed to delete registration" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Registration deleted successfully",
      deletedId: parseInt(id),
    });
  } catch (error) {
    console.error("Error deleting registration:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
