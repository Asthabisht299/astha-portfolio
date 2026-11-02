
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

// GET — Fetch all skills for Admin Studio
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const [skills] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM skills
       ORDER BY sort_order ASC, created_at DESC`
    );

    return NextResponse.json({ success: true, skills });
  } catch (error) {
    console.error("Skills GET error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load skills." },
      { status: 500 }
    );
  }
}

// POST — Add a new skill
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name = String(body.name || "").trim();
    const category = String(body.category || "").trim();
    const proficiency = body.proficiency
      ? String(body.proficiency).trim()
      : null;
    const isPublished = body.is_published ?? true;
    const sortOrder = Number(body.sort_order ?? 0);

    if (!name || !category) {
      return NextResponse.json(
        { success: false, message: "Skill name and category are required." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(sortOrder)) {
      return NextResponse.json(
        { success: false, message: "Invalid sort order." },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO skills
       (name, category, proficiency, is_published, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
      [name, category, proficiency, isPublished ? 1 : 0, sortOrder]
    );

    return NextResponse.json({
      success: true,
      message: "Skill added successfully.",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Skills POST error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to add skill." },
      { status: 500 }
    );
  }
}

// PUT — Update an existing skill
export async function PUT(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const id = Number(body.id);
    const name = String(body.name || "").trim();
    const category = String(body.category || "").trim();
    const proficiency = body.proficiency
      ? String(body.proficiency).trim()
      : null;
    const isPublished = body.is_published ?? true;
    const sortOrder = Number(body.sort_order ?? 0);

    if (!Number.isInteger(id) || id <= 0 || !name || !category) {
      return NextResponse.json(
        { success: false, message: "Valid ID, name and category are required." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(sortOrder)) {
      return NextResponse.json(
        { success: false, message: "Invalid sort order." },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE skills
       SET name = ?, category = ?, proficiency = ?,
           is_published = ?, sort_order = ?
       WHERE id = ?`,
      [name, category, proficiency, isPublished ? 1 : 0, sortOrder, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Skill not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Skill updated successfully.",
    });
  } catch (error) {
    console.error("Skills PUT error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update skill." },
      { status: 500 }
    );
  }
}

// DELETE — Delete a skill
export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = Number(request.nextUrl.searchParams.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid skill ID is required." },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM skills WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Skill not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Skill deleted successfully.",
    });
  } catch (error) {
    console.error("Skills DELETE error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to delete skill." },
      { status: 500 }
    );
  }
}
