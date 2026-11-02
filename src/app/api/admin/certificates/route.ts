
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../../../../lib/db";
import { verifySession } from "../../../../lib/auth";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  if (!token) return false;

  try {
    await verifySession(token);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM certificates
       ORDER BY sort_order ASC, issue_date DESC, created_at DESC`
    );

    return NextResponse.json({ success: true, certificates: rows });
  } catch (error) {
    console.error("Admin certificates GET error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to fetch certificates." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const {
      title,
      issuer,
      description,
      category,
      image_url,
      certificate_url,
      issue_date,
      is_published = true,
      sort_order = 0,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, message: "Certificate title is required." },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO certificates
       (title, issuer, description, category, image_url,
        certificate_url, issue_date, is_published, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        issuer || null,
        description || null,
        category || null,
        image_url || null,
        certificate_url || null,
        issue_date || null,
        is_published ? 1 : 0,
        Number(sort_order) || 0,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Certificate added successfully.",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Admin certificates POST error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to add certificate." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const {
      id,
      title,
      issuer,
      description,
      category,
      image_url,
      certificate_url,
      issue_date,
      is_published,
      sort_order,
    } = body;

    if (!id || !title?.trim()) {
      return NextResponse.json(
        { success: false, message: "ID and title are required." },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE certificates SET
       title = ?, issuer = ?, description = ?, category = ?,
       image_url = ?, certificate_url = ?, issue_date = ?,
       is_published = ?, sort_order = ?
       WHERE id = ?`,
      [
        title.trim(),
        issuer || null,
        description || null,
        category || null,
        image_url || null,
        certificate_url || null,
        issue_date || null,
        is_published ? 1 : 0,
        Number(sort_order) || 0,
        Number(id),
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Certificate not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Certificate updated successfully.",
    });
  } catch (error) {
    console.error("Admin certificates PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update certificate." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const id = Number(request.nextUrl.searchParams.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid certificate ID is required." },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM certificates WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Certificate not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Certificate deleted successfully.",
    });
  } catch (error) {
    console.error("Admin certificates DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to delete certificate." },
      { status: 500 }
    );
  }
}
