import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token");

    if (!token) return null;

    const decoded = verifyToken(token.value);
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function setAuthCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function deleteAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
}
