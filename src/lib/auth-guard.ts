import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return { session: null, error: NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || "http://localhost:3000")) };
  }
  return { session, error: null };
}

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { session: null, error: NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || "http://localhost:3000")) };
  }
  return { session, error: null };
}
