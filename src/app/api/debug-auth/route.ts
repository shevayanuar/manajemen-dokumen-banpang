import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true }
    });
    return NextResponse.json({ 
      ok: true, 
      userCount,
      users,
      env: {
        hasAuthSecret: !!process.env.AUTH_SECRET,
        hasDbUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      ok: false, 
      error: String(error),
      env: {
        hasAuthSecret: !!process.env.AUTH_SECRET,
        hasDbUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
      }
    });
  }
}