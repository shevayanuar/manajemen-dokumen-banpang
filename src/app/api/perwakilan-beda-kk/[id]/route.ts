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
  await prisma.perwakilanBedaKK.delete({ where: { id } });

  revalidateTag(TAGS.bedaKKStats);
  revalidateTag(TAGS.bedaKKData);
  revalidateTag(TAGS.dashboardStats);

  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { nomorUrut, namaPenerimaBarcode, nikPenerimaBarcode, alamatPenerimaBarcode, namaLengkapWakil, nikWakil, alamatWakil, ttdWakil } = body;

  const current = await prisma.perwakilanBedaKK.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });

  if (nomorUrut !== undefined) {
    const nomor = parseInt(nomorUrut);
    if (isNaN(nomor) || nomor < 1 || nomor > 10000)
      return NextResponse.json({ error: "Nomor urut harus antara 1–10000" }, { status: 400 });
    if (await isNomorUrutTaken(nomor, id, "bedaKK"))
      return NextResponse.json({ error: "Nomor urut barcode tersebut sudah terdata" }, { status: 400 });
  }

  if (nikPenerimaBarcode && nikPenerimaBarcode !== current.nikPenerimaBarcode) {
    if (nikPenerimaBarcode.length !== 16)
      return NextResponse.json({ error: "NIK penerima harus tepat 16 digit" }, { status: 400 });
    if (await isNikTaken(nikPenerimaBarcode, id, "nikPenerimaBedaKK"))
      return NextResponse.json({ error: "NIK penerima sudah terdaftar di sistem" }, { status: 400 });
  }

  if (nikWakil && nikWakil !== current.nikWakil) {
    if (nikWakil.length !== 16)
      return NextResponse.json({ error: "NIK wakil harus tepat 16 digit" }, { status: 400 });
    if (await isNikTaken(nikWakil))
      return NextResponse.json({ error: "NIK wakil sudah terdaftar di sistem" }, { status: 400 });
    const count = await prisma.perwakilanBedaKK.count({ where: { nikWakil } });
    if (count >= 3)
      return NextResponse.json({ error: "NIK wakil sudah digunakan 3 kali" }, { status: 400 });
  }

  const finalNikPenerima = nikPenerimaBarcode || current.nikPenerimaBarcode;
  const finalNikWakil = nikWakil || current.nikWakil;
  if (finalNikPenerima === finalNikWakil)
    return NextResponse.json({ error: "NIK Penerima dan NIK Wakil tidak boleh sama" }, { status: 400 });

  const updateData: Record<string, string | number> = {};
  if (nomorUrut !== undefined) updateData.nomorUrut = parseInt(nomorUrut);
  if (namaPenerimaBarcode) updateData.namaPenerimaBarcode = namaPenerimaBarcode;
  if (nikPenerimaBarcode) updateData.nikPenerimaBarcode = nikPenerimaBarcode;
  if (alamatPenerimaBarcode) updateData.alamatPenerimaBarcode = alamatPenerimaBarcode;
  if (namaLengkapWakil) updateData.namaLengkapWakil = namaLengkapWakil;
  if (nikWakil) updateData.nikWakil = nikWakil;
  if (alamatWakil) updateData.alamatWakil = alamatWakil;
  if (ttdWakil) updateData.ttdWakil = ttdWakil;

  const updated = await prisma.perwakilanBedaKK.update({ where: { id }, data: updateData });

  revalidateTag(TAGS.bedaKKData);

  return NextResponse.json(updated);
}