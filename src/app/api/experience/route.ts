
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "../../../lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        id,
        job_title,
        company,
        location,
        start_date,
        end_date,
        is_current,
        description,
        sort_order
       FROM experience
       WHERE is_published = 1
       ORDER BY sort_order ASC, start_date DESC, created_at DESC`
    );

    return NextResponse.json(
      {
        success: true,
        experience: rows,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Public experience API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load experience.",
      },
      { status: 500 }
    );
  }
}
