import { NextResponse } from "next/server";

let cachedImage = null;
let lastFetched = 0;

export async function GET() {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  if (cachedImage && now - lastFetched < oneHour) {
    return NextResponse.json({ image: cachedImage });
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=landscape&orientation=landscape&client_id=${process.env.UNSPLASH_ACCESS_KEY}`
    );

    if (!res.ok) {
      throw new Error("Unsplash API request failed");
    }

    const data = await res.json();

    cachedImage = data.urls.full;
    lastFetched = now;

    return NextResponse.json({ image: cachedImage });
  } catch (error) {
    console.error("Background API error:", error);
    return NextResponse.json(
      { image: null, error: "Failed to fetch Unsplash image" },
      { status: 500 }
    );
  }
}