
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "../../../lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        id,
        degree,
        institution,
        location,
        start_year,
        end_year,
        grade,
        description,
        sort_order
       FROM education
       WHERE is_published = 1
       ORDER BY sort_order ASC, end_year DESC, created_at DESC`
    );

    return NextResponse.json(
      {
        success: true,
        education: rows,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Public education API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load education.",
      },
      { status: 500 }
    );
  }
}
