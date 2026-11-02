
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "../../../lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        id,
        title,
        issuer,
        description,
        category,
        image_url,
        certificate_url,
        issue_date,
        sort_order
       FROM certificates
       WHERE is_published = 1
       ORDER BY sort_order ASC, issue_date DESC, created_at DESC`
    );

    return NextResponse.json(
      { success: true, certificates: rows },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Public certificates API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load certificates.",
      },
      { status: 500 }
    );
  }
}
