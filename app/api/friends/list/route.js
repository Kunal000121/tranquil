import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import User from "../../../../models/User";
import { getAuthUser } from "../../../../lib/auth";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(authUser.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // console.log("Found user friends:", user.friends); // Debug log
    return NextResponse.json({ friends: user.friends || [] });
  } catch (error) {
    console.error("Get friends error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
