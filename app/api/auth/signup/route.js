import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { generateToken } from "../../../../lib/auth";
import { cookies } from "next/headers";
import dbConnect from "../../../../lib/mongodb";
import User from "../../../../models/User";

export async function POST(request) {
  try {
    await dbConnect();

    const { name, email, password, uniqueId } = await request.json();

    // Validation
    if (!name || !email || !password || !uniqueId) {
      return NextResponse.json(
        { error: "Name, email, password, and unique ID are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Validate uniqueId format
    if (uniqueId.length < 5) {
      return NextResponse.json(
        { error: "Unique ID must be at least 5 characters" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(uniqueId)) {
      return NextResponse.json(
        {
          error:
            "Unique ID can only contain letters, numbers, dots, hyphens, and underscores",
        },
        { status: 400 }
      );
    }

    // Check if user already exists (email)
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Check if unique ID already exists
    const existingUserByUniqueId = await User.findOne({ uniqueId });
    if (existingUserByUniqueId) {
      return NextResponse.json(
        { error: "This unique ID is already taken" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      uniqueId,
    });

    await user.save();

    const token = generateToken(user._id);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        uniqueId: user.uniqueId,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    // Handle mongoose validation errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return NextResponse.json(
        { error: `This ${field} is already taken` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
