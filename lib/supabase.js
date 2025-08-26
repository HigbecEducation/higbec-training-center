// lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!supabaseUrl) {
  throw new Error("Missing Supabase URL in environment variables");
}

// Determine key based on runtime environment
const supabaseKey =
  typeof window === "undefined"
    ? process.env.SUPABASE_SERVICE_ROLE_KEY // For server-side (secure operations)
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // For client-side (browser)

if (!supabaseKey) {
  throw new Error(
    typeof window === "undefined"
      ? "Missing Supabase service role key in environment variables"
      : "Missing Supabase anon/publishable key in environment variables"
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  // Disable session behavior on the server for service role usage
  auth:
    typeof window === "undefined"
      ? {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        }
      : undefined,
});

// Storage connectivity test (executed on module load — server-side)
async function checkSupabaseStorageConnection() {
  const { data, error } = await supabase.storage
    .from("uploads")
    .list("", { limit: 1 });

  if (error) {
    console.error("Storage connection test failed:", error);
    return false;
  }

  console.log("Storage connection test succeeded. Sample entry:", data);
  return true;
}

// Only run this test on the server
if (typeof window === "undefined") {
  checkSupabaseStorageConnection();
}

// File upload helper
export async function uploadFileToSupabase(
  file,
  bucket = "uploads",
  folder = "payment-screenshots"
) {
  try {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split(".").pop();
    const fileName = `${folder}/${timestamp}_${randomString}.${fileExtension}`;

    console.log(`Uploading file to Supabase: ${fileName}`);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName);

    console.log(`File uploaded successfully. Public URL: ${publicUrl}`);

    return { success: true, fileName, publicUrl, data };
  } catch (error) {
    console.error("Error uploading file to Supabase:", error);
    return { success: false, error: error.message };
  }
}

// File delete helper
export async function deleteFileFromSupabase(fileName, bucket = "uploads") {
  try {
    const { error } = await supabase.storage.from(bucket).remove([fileName]);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting file from Supabase:", error);
    return { success: false, error: error.message };
  }
}
