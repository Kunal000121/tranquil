import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getAuthUser } from "@/lib/auth";

export async function GET(req) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ users: [] });
    }

    const users = await User.find({
      uniqueId: { $regex: query, $options: "i" },
    })
      .select("uniqueId name")
      .limit(10);

    return NextResponse.json({ users });
  } catch (error) {
    console.error("User search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}