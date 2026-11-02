
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "../../../lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        id,
        title,
        description,
        tech_stack,
        image_url,
        github_url,
        project_url,
        category,
        is_published,
        sort_order
       FROM projects
       WHERE is_published = 1
       ORDER BY sort_order ASC, created_at DESC`
    );

    return NextResponse.json(
      { success: true, projects: rows },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Public projects API error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load projects." },
      { status: 500 }
    );
  }
}
