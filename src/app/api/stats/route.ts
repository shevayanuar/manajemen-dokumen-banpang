import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDashboardStats } from "@/lib/cache";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await getDashboardStats();
  return NextResponse.json(data);
}