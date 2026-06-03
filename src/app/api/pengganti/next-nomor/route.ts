import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const last = await prisma.pengganti.findFirst({ orderBy: { nomorUrut: "desc" }, select: { nomorUrut: true } });
  return NextResponse.json({ next: (last?.nomorUrut ?? 0) + 1 });
}