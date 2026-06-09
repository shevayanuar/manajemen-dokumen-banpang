import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSatuKKStats } from "@/lib/cache";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await getSatuKKStats();
  return NextResponse.json(data);
}