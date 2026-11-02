
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "../../../../lib/db";
import { createSession } from "../../../../lib/auth";



export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const username = String(body.username || "").trim();
    const password = String(body.password || "");

    if (!username || !password || username.length > 100 || password.length > 200) {
      return NextResponse.json(
        { success: false, message: "Invalid username or password." },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute(
      "SELECT id, username, password_hash FROM admin WHERE username = ? LIMIT 1",
      [username]
    );

    const admins = rows as {
      id: number;
      username: string;
      password_hash: string;
    }[];

    const admin = admins[0];

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Invalid username or password." },
        { status: 401 }
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { success: false, message: "Invalid username or password." },
        { status: 401 }
      );
    }

    const token = await createSession(admin.id, admin.username);

    const response = NextResponse.json({
      success: true,
      message: "Login successful!",
    });

    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
