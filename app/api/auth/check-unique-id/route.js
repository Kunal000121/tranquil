import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import User from "../../../../models/User";

export async function POST(request) {
  try {
    await dbConnect();

    const { uniqueId } = await request.json();

    if (!uniqueId) {
      return NextResponse.json(
        { error: "Unique ID is required" },
        { status: 400 }
      );
    }

    if (uniqueId.length < 5) {
      return NextResponse.json(
        { available: false, error: "Unique ID must be at least 5 characters" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(uniqueId)) {
      return NextResponse.json(
        { available: false, error: "Invalid characters in unique ID" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ uniqueId });

    return NextResponse.json({
      available: !existingUser,
      uniqueId,
    });
  } catch (error) {
    console.error("Check unique ID error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
