import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, currentPassword, newPassword } = await req.json();

  if (!name || !email) {
    return NextResponse.json({ error: "Nama dan email wajib diisi" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Password saat ini wajib diisi untuk mengganti password" }, { status: 400 });
    }
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Password saat ini salah" }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password baru minimal 8 karakter" }, { status: 400 });
    }
  }

  if (email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email sudah digunakan" }, { status: 400 });
    }
  }

  const data: { name: string; email: string; password?: string } = { name, email };
  if (newPassword) data.password = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({ where: { id: session.user.id }, data });

  return NextResponse.json({ success: true });
}