
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

// GET: Fetch all education records
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM education
       ORDER BY sort_order ASC, end_year DESC, created_at DESC`
    );

    return NextResponse.json({
      success: true,
      education: rows,
    });
  } catch (error) {
    console.error("Admin education GET error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch education." },
      { status: 500 }
    );
  }
}

// POST: Add education
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
      degree,
      institution,
      location,
      start_year,
      end_year,
      grade,
      description,
      is_published,
      sort_order,
    } = body;

    if (!degree?.trim() || !institution?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Degree and institution are required.",
        },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO education
       (
         degree,
         institution,
         location,
         start_year,
         end_year,
         grade,
         description,
         is_published,
         sort_order
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        degree.trim(),
        institution.trim(),
        location || null,
        start_year || null,
        end_year || null,
        grade || null,
        description || null,
        is_published !== false,
        Number.isInteger(Number(sort_order)) ? Number(sort_order) : 0,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Education added successfully.",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Admin education POST error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to add education." },
      { status: 500 }
    );
  }
}

// PUT: Update education
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
      degree,
      institution,
      location,
      start_year,
      end_year,
      grade,
      description,
      is_published,
      sort_order,
    } = body;

    if (!id || !degree?.trim() || !institution?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "ID, degree and institution are required.",
        },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE education
       SET
         degree = ?,
         institution = ?,
         location = ?,
         start_year = ?,
         end_year = ?,
         grade = ?,
         description = ?,
         is_published = ?,
         sort_order = ?
       WHERE id = ?`,
      [
        degree.trim(),
        institution.trim(),
        location || null,
        start_year || null,
        end_year || null,
        grade || null,
        description || null,
        Boolean(is_published),
        Number.isInteger(Number(sort_order)) ? Number(sort_order) : 0,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Education record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Education updated successfully.",
    });
  } catch (error) {
    console.error("Admin education PUT error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update education." },
      { status: 500 }
    );
  }
}

// DELETE: Delete education
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
        { success: false, message: "A valid education ID is required." },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM education WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Education record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Education deleted successfully.",
    });
  } catch (error) {
    console.error("Admin education DELETE error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to delete education." },
      { status: 500 }
    );
  }
}
