
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
  return Boolean(session);
}

function getProjectData(body: Record<string, unknown>) {
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const category = String(body.category || "PERSONAL PROJECT").trim();

  const techStack = Array.isArray(body.tech_stack)
    ? body.tech_stack.map(String)
    : String(body.tech_stack || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  if (!title) throw new Error("Project title is required.");

  return {
    title,
    description,
    category,
    tech_stack: JSON.stringify(techStack),
    image_url: String(body.image_url || "").trim() || null,
    github_url: String(body.github_url || "").trim() || null,
    project_url: String(body.project_url || "").trim() || null,
    is_published: body.is_published ? 1 : 0,
    sort_order: Number(body.sort_order) || 0,
  };
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC"
    );

    return NextResponse.json({ success: true, projects: rows });
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json(
      { success: false, message: "Could not load projects." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const project = getProjectData(body);

    await pool.execute(
      `INSERT INTO projects
       (title, description, tech_stack, image_url, github_url, project_url, category, is_published, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        project.title,
        project.description,
        project.tech_stack,
        project.image_url,
        project.github_url,
        project.project_url,
        project.category,
        project.is_published,
        project.sort_order,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Project created successfully!",
    });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Could not create project.",
      },
      { status: 400 }
    );
  }
}

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

    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json(
        { success: false, message: "Invalid project ID." },
        { status: 400 }
      );
    }

    const project = getProjectData(body);

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE projects SET
        title = ?, description = ?, tech_stack = ?, image_url = ?,
        github_url = ?, project_url = ?, category = ?,
        is_published = ?, sort_order = ?
       WHERE id = ?`,
      [
        project.title,
        project.description,
        project.tech_stack,
        project.image_url,
        project.github_url,
        project.project_url,
        project.category,
        project.is_published,
        project.sort_order,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Project not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project updated successfully!",
    });
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Could not update project.",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = Number(request.nextUrl.searchParams.get("id"));

    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json(
        { success: false, message: "Invalid project ID." },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM projects WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Project not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully!",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { success: false, message: "Could not delete project." },
      { status: 500 }
    );
  }
}
