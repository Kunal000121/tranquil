import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "../../../../lib/mongodb";
import User from "../../../../models/User";
import { generateToken } from "../../../../lib/auth";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    await dbConnect();

    const { emailOrUniqueId, password } = await request.json();

    if (!emailOrUniqueId || !password) {
      return NextResponse.json(
        { error: "Email/Unique ID and password are required" },
        { status: 400 }
      );
    }

    // Find user by email or uniqueId
    const user = await User.findOne({
      $or: [
        { email: emailOrUniqueId.toLowerCase() },
        { uniqueId: emailOrUniqueId },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = generateToken(user._id);

    // Set cookie (MUST be awaited in Next.js 15)
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true, // Added this - AuthModal checks for success: true
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        uniqueId: user.uniqueId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
