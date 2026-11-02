
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { RowDataPacket } from "mysql2";
import pool from "../../../../lib/db";
import { verifySession } from "../../../../lib/auth";

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
] as const;

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  if (!token) return false;

  return Boolean(await verifySession(token));
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Please log in again." },
        { status: 401 }
      );
    }

    const placeholders = allowedKeys.map(() => "?").join(", ");

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT setting_key, setting_value
       FROM site_settings
       WHERE setting_key IN (${placeholders})`,
      [...allowedKeys]
    );

    const profile: Record<string, string> = {};

    for (const key of allowedKeys) profile[key] = "";

    for (const row of rows) {
      if (allowedKeys.includes(row.setting_key)) {
        profile[row.setting_key] = row.setting_value ?? "";
      }
    }

    return NextResponse.json(
      { success: true, profile },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("PROFILE GET ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Could not load profile." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Please log in again." },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid profile data." },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const key of allowedKeys) {
        const value = body[key];

        if (typeof value !== "string") continue;

        await connection.execute(
          `INSERT INTO site_settings (setting_key, setting_value)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [key, value.trim()]
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return NextResponse.json({
      success: true,
      message: "Profile saved successfully!",
    });
  } catch (error) {
    console.error("PROFILE SAVE ERROR:", error);

    const detail =
      error instanceof Error ? error.message : String(error);

    const code =
      typeof error === "object" &&
      error !== null &&
      "code" in error
        ? String(error.code)
        : "UNKNOWN_ERROR";

    return NextResponse.json(
      {
        success: false,
        message: "Profile could not be saved.",
        detail,
        code,
      },
      { status: 500 }
    );
  }
}
