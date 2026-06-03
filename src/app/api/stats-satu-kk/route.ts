import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

  const [total, todayCount] = await Promise.all([
    prisma.perwakilanSatuKK.count(),
    prisma.perwakilanSatuKK.count({ where: { createdAt: { gte: todayStart } } }),
  ]);

  return NextResponse.json({ total, todayCount });
}