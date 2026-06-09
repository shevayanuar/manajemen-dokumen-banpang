import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TAGS } from "@/lib/cache";
import { isNomorUrutTaken, isNikTaken } from "@/lib/validateCross";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.perwakilanSatuKK.delete({ where: { id } });

  revalidateTag(TAGS.satuKKStats);
  revalidateTag(TAGS.satuKKData);
  revalidateTag(TAGS.dashboardStats);

  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { nomorUrut, nikWakil, namaLengkapWakil, ttdWakil } = body;

  const current = await prisma.perwakilanSatuKK.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });

  if (nomorUrut !== undefined) {
    const nomor = parseInt(nomorUrut);
    if (isNaN(nomor) || nomor < 1 || nomor > 10000)
      return NextResponse.json({ error: "Nomor urut harus antara 1–10000" }, { status: 400 });
    if (await isNomorUrutTaken(nomor, id, "satuKK"))
      return NextResponse.json({ error: "Nomor urut barcode tersebut sudah terdata" }, { status: 400 });
  }

  if (nikWakil && nikWakil !== current.nikWakil) {
    if (nikWakil.length !== 16)
      return NextResponse.json({ error: "NIK harus tepat 16 digit" }, { status: 400 });
    if (await isNikTaken(nikWakil, id, "nikWakilSatuKK"))
      return NextResponse.json({ error: "NIK sudah terdaftar di sistem" }, { status: 400 });
  }

  const updateData: Record<string, string | number> = {};
  if (nomorUrut !== undefined) updateData.nomorUrut = parseInt(nomorUrut);
  if (nikWakil) updateData.nikWakil = nikWakil;
  if (namaLengkapWakil) updateData.namaLengkapWakil = namaLengkapWakil;
  if (ttdWakil) updateData.ttdWakil = ttdWakil;

  const updated = await prisma.perwakilanSatuKK.update({ where: { id }, data: updateData });

  // Update only invalidates data, not stats (count unchanged)
  revalidateTag(TAGS.satuKKData);

  return NextResponse.json(updated);
}