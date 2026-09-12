import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import User from "../../../../models/User";
import { getAuthUser } from "../../../../lib/auth";

export async function POST(request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { friendId, message } = await request.json();

    if (!friendId) {
      return NextResponse.json(
        { error: "Friend ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(authUser.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const friend = await User.findById(friendId);

    if (!friend) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 });
    }

    if (!friend.notifications) {
      friend.notifications = [];
    }

    friend.notifications.push({
      from: user._id,
      fromName: user.name,
      message: message || `${user.name} sent you a ping! 👋`,
      timestamp: new Date(),
      read: false,
    });

    await friend.save();

    return NextResponse.json({
      message: "Notification sent successfully",
    });
  } catch (error) {
    console.error("Notify friend error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
