import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isNomorUrutTaken, isNikTaken } from "@/lib/validateCross";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where = search ? {
    OR: [
      { namaPbpAwal: { contains: search, mode: "insensitive" as const } },
      { namaPbpPengganti: { contains: search, mode: "insensitive" as const } },
      { nikPbpAwal: { contains: search } },
      { nikPbpPengganti: { contains: search } },
      ...(isNaN(Number(search)) ? [] : [{ nomorUrut: Number(search) }]),
    ],
  } : {};

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.pengganti.findMany({
      where, orderBy: { nomorUrut: "asc" }, skip, take: limit,
      select: { id: true, nomorUrut: true, namaPbpAwal: true, nikPbpAwal: true, alamatPbpAwal: true, namaPbpPengganti: true, nikPbpPengganti: true, alamatPbpPengganti: true, sebabPenggantian: true, ttdPengganti: true, createdAt: true },
    }),
    prisma.pengganti.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { nomorUrut, namaPbpAwal, nikPbpAwal, alamatPbpAwal, namaPbpPengganti, nikPbpPengganti, alamatPbpPengganti, sebabPenggantian, ttdPengganti } = body;

  if (!nomorUrut || !namaPbpAwal || !nikPbpAwal || !alamatPbpAwal || !namaPbpPengganti || !nikPbpPengganti || !alamatPbpPengganti || !sebabPenggantian || !ttdPengganti)
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });

  const nomor = parseInt(nomorUrut);
  if (isNaN(nomor) || nomor < 1 || nomor > 10000)
    return NextResponse.json({ error: "Nomor urut harus antara 1–10000" }, { status: 400 });
  if (nikPbpAwal.length !== 16)
    return NextResponse.json({ error: "NIK PBP Awal harus tepat 16 digit" }, { status: 400 });
  if (nikPbpPengganti.length !== 16)
    return NextResponse.json({ error: "NIK PBP Pengganti harus tepat 16 digit" }, { status: 400 });
  if (nikPbpAwal === nikPbpPengganti)
    return NextResponse.json({ error: "NIK PBP Awal dan NIK PBP Pengganti tidak boleh sama" }, { status: 400 });

  // Cek nomor urut cross-tabel
  if (await isNomorUrutTaken(nomor))
    return NextResponse.json({ error: "Nomor urut barcode tersebut sudah terdata" }, { status: 400 });

  // Cek NIK cross-tabel
  if (await isNikTaken(nikPbpAwal))
    return NextResponse.json({ error: "NIK PBP Awal sudah terdaftar di sistem" }, { status: 400 });
  if (await isNikTaken(nikPbpPengganti))
    return NextResponse.json({ error: "NIK PBP Pengganti sudah terdaftar di sistem" }, { status: 400 });

  const data = await prisma.pengganti.create({
    data: { nomorUrut: nomor, namaPbpAwal, nikPbpAwal, alamatPbpAwal, namaPbpPengganti, nikPbpPengganti, alamatPbpPengganti, sebabPenggantian, ttdPengganti, createdBy: session.user.id },
  });
  return NextResponse.json(data, { status: 201 });
}