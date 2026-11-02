
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "../../../lib/db";

export async function GET() {
  try {
    const [skills] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, category, proficiency, sort_order
       FROM skills
       WHERE is_published = 1
       ORDER BY sort_order ASC, created_at ASC`
    );

    return NextResponse.json(
      { success: true, skills },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Public skills API error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load skills." },
      { status: 500 }
    );
  }
}
