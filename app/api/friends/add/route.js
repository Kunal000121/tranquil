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

    const { friendId } = await request.json();
    if (!friendId) {
      return NextResponse.json(
        { error: "Friend ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(authUser.userId);
    const friend = await User.findById(friendId);

    if (!friend) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (friend._id.toString() === user._id.toString()) {
      return NextResponse.json(
        { error: "Cannot add yourself as friend" },
        { status: 400 }
      );
    }

    const alreadyFriend = user.friends.some(
      (f) => f.userId.toString() === friend._id.toString()
    );
    if (alreadyFriend) {
      return NextResponse.json({ error: "Already friends" }, { status: 409 });
    }

    // Add friend to both users
    user.friends.push({
      userId: friend._id,
      name: friend.name,
      email: friend.email,
    });

    friend.friends.push({
      userId: user._id,
      name: user.name,
      email: user.email,
    });

    await user.save();
    await friend.save();

    return NextResponse.json({
      message: "Friend added successfully",
      friend: {
        id: friend._id,
        name: friend.name,
        uniqueId: friend.uniqueId,
      },
    });
  } catch (error) {
    console.error("Add friend error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}