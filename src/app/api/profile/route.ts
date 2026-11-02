
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "../../../lib/db";

const allowedKeys = [
  "profile_name",
  "profile_role",
  "profile_location",
  "profile_email",
  "profile_intro",
  "profile_about",
  "profile_github",
  "profile_linkedin",
  "profile_leetcode",
  "profile_image_url",
  "profile_resume_url",
];

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT setting_key, setting_value
       FROM site_settings
       WHERE setting_key IN (${allowedKeys.map(() => "?").join(",")})`,
      allowedKeys
    );

    const profile: Record<string, string> = {};

    for (const key of allowedKeys) {
      profile[key] = "";
    }

    for (const row of rows) {
      profile[row.setting_key] = row.setting_value ?? "";
    }

    return NextResponse.json(
      { success: true, profile },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Public profile GET error:", error);

    return NextResponse.json(
      { success: false, message: "Could not load profile." },
      { status: 500 }
    );
  }
}
