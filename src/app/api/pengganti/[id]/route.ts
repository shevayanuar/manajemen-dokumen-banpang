import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isNomorUrutTaken, isNikTaken } from "@/lib/validateCross";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.pengganti.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { nomorUrut, namaPbpAwal, nikPbpAwal, alamatPbpAwal, namaPbpPengganti, nikPbpPengganti, alamatPbpPengganti, sebabPenggantian, ttdPengganti } = body;

  const current = await prisma.pengganti.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });

  if (nomorUrut !== undefined) {
    const nomor = parseInt(nomorUrut);
    if (isNaN(nomor) || nomor < 1 || nomor > 10000)
      return NextResponse.json({ error: "Nomor urut harus antara 1–10000" }, { status: 400 });
    if (await isNomorUrutTaken(nomor, id, "pengganti"))
      return NextResponse.json({ error: "Nomor urut barcode tersebut sudah terdata" }, { status: 400 });
  }

  if (nikPbpAwal && nikPbpAwal !== current.nikPbpAwal) {
    if (nikPbpAwal.length !== 16)
      return NextResponse.json({ error: "NIK PBP Awal harus tepat 16 digit" }, { status: 400 });
    if (await isNikTaken(nikPbpAwal, id, "nikPbpAwal"))
      return NextResponse.json({ error: "NIK PBP Awal sudah terdaftar di sistem" }, { status: 400 });
  }

  if (nikPbpPengganti && nikPbpPengganti !== current.nikPbpPengganti) {
    if (nikPbpPengganti.length !== 16)
      return NextResponse.json({ error: "NIK PBP Pengganti harus tepat 16 digit" }, { status: 400 });
    if (await isNikTaken(nikPbpPengganti, id, "nikPbpPengganti"))
      return NextResponse.json({ error: "NIK PBP Pengganti sudah terdaftar di sistem" }, { status: 400 });
  }

  const finalNikAwal = nikPbpAwal || current.nikPbpAwal;
  const finalNikPengganti = nikPbpPengganti || current.nikPbpPengganti;
  if (finalNikAwal === finalNikPengganti)
    return NextResponse.json({ error: "NIK PBP Awal dan NIK PBP Pengganti tidak boleh sama" }, { status: 400 });

  const updateData: Record<string, string | number> = {};
  if (nomorUrut !== undefined) updateData.nomorUrut = parseInt(nomorUrut);
  if (namaPbpAwal) updateData.namaPbpAwal = namaPbpAwal;
  if (nikPbpAwal) updateData.nikPbpAwal = nikPbpAwal;
  if (alamatPbpAwal) updateData.alamatPbpAwal = alamatPbpAwal;
  if (namaPbpPengganti) updateData.namaPbpPengganti = namaPbpPengganti;
  if (nikPbpPengganti) updateData.nikPbpPengganti = nikPbpPengganti;
  if (alamatPbpPengganti) updateData.alamatPbpPengganti = alamatPbpPengganti;
  if (sebabPenggantian) updateData.sebabPenggantian = sebabPenggantian;
  if (ttdPengganti) updateData.ttdPengganti = ttdPengganti;

  const updated = await prisma.pengganti.update({ where: { id }, data: updateData });
  return NextResponse.json(updated);
}