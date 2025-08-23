import { NextResponse } from "next/server";
import {
  ProjectRegistrationModel,
  initializeDatabase,
} from "../../../../lib/postgresql";
import { withAdminAuth } from "../../../../lib/AdminAuth";
export const dynamic = "force-dynamic";
// Initialize database on startup
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
}

async function handleGetStats(request) {
  try {
    await ensureDbInitialized();

    // Get overall stats
    const stats = await ProjectRegistrationModel.getStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handleGetStats);
