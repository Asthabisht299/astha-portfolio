
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../../../../lib/db";
import { verifySession } from "../../../../lib/auth";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  if (!token) return false;

  const session = await verifySession(token);
  return !!session;
}

// GET: Fetch all experience records for admin
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM experience
       ORDER BY sort_order ASC, start_date DESC, created_at DESC`
    );

    return NextResponse.json({
      success: true,
      experience: rows,
    });
  } catch (error) {
    console.error("Admin experience GET error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch experience." },
      { status: 500 }
    );
  }
}

// POST: Add new experience
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      job_title,
      company,
      location,
      start_date,
      end_date,
      is_current,
      description,
      is_published,
      sort_order,
    } = body;

    if (!job_title?.trim() || !company?.trim()) {
      return NextResponse.json(
        { success: false, message: "Job title and company are required." },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO experience
       (
         job_title,
         company,
         location,
         start_date,
         end_date,
         is_current,
         description,
         is_published,
         sort_order
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        job_title.trim(),
        company.trim(),
        location || null,
        start_date || null,
        is_current ? null : end_date || null,
        Boolean(is_current),
        description || null,
        is_published !== false,
        Number.isInteger(Number(sort_order)) ? Number(sort_order) : 0,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Experience added successfully.",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Admin experience POST error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to add experience." },
      { status: 500 }
    );
  }
}

// PUT: Update experience
export async function PUT(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      id,
      job_title,
      company,
      location,
      start_date,
      end_date,
      is_current,
      description,
      is_published,
      sort_order,
    } = body;

    if (!id || !job_title?.trim() || !company?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "ID, job title and company are required.",
        },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE experience
       SET
         job_title = ?,
         company = ?,
         location = ?,
         start_date = ?,
         end_date = ?,
         is_current = ?,
         description = ?,
         is_published = ?,
         sort_order = ?
       WHERE id = ?`,
      [
        job_title.trim(),
        company.trim(),
        location || null,
        start_date || null,
        is_current ? null : end_date || null,
        Boolean(is_current),
        description || null,
        Boolean(is_published),
        Number.isInteger(Number(sort_order)) ? Number(sort_order) : 0,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Experience record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Experience updated successfully.",
    });
  } catch (error) {
    console.error("Admin experience PUT error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update experience." },
      { status: 500 }
    );
  }
}

// DELETE: Delete experience
export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const id = request.nextUrl.searchParams.get("id");

    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
      return NextResponse.json(
        { success: false, message: "A valid experience ID is required." },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM experience WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Experience record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Experience deleted successfully.",
    });
  } catch (error) {
    console.error("Admin experience DELETE error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to delete experience." },
      { status: 500 }
    );
  }
}
