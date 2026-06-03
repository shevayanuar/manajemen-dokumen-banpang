import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

  const [satuKKTotal, bedaKKTotal, penggantiTotal, totalUsers, satuKKToday, bedaKKToday, penggantiToday] = await Promise.all([
    prisma.perwakilanSatuKK.count(),
    prisma.perwakilanBedaKK.count(),
    prisma.pengganti.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.perwakilanSatuKK.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.perwakilanBedaKK.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.pengganti.count({ where: { createdAt: { gte: todayStart } } }),
  ]);

  return NextResponse.json({
    totalPerwakilan: satuKKTotal + bedaKKTotal + penggantiTotal,
    totalSatuKK: satuKKTotal,
    totalBedaKK: bedaKKTotal,
    totalPengganti: penggantiTotal,
    totalUsers,
    todayCount: satuKKToday + bedaKKToday + penggantiToday,
  });
}