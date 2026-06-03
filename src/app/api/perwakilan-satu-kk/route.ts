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
      { namaLengkapWakil: { contains: search, mode: "insensitive" as const } },
      { nikWakil: { contains: search } },
      ...(isNaN(Number(search)) ? [] : [{ nomorUrut: Number(search) }]),
    ],
  } : {};

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.perwakilanSatuKK.findMany({
      where, orderBy: { nomorUrut: "asc" }, skip, take: limit,
      select: { id: true, nomorUrut: true, namaLengkapWakil: true, nikWakil: true, ttdWakil: true, createdAt: true },
    }),
    prisma.perwakilanSatuKK.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { nomorUrut, nikWakil, namaLengkapWakil, ttdWakil } = body;

  if (!nomorUrut || !nikWakil || !namaLengkapWakil || !ttdWakil)
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });

  const nomor = parseInt(nomorUrut);
  if (isNaN(nomor) || nomor < 1 || nomor > 10000)
    return NextResponse.json({ error: "Nomor urut harus antara 1–10000" }, { status: 400 });
  if (nikWakil.length !== 16)
    return NextResponse.json({ error: "NIK harus tepat 16 digit" }, { status: 400 });

  if (await isNomorUrutTaken(nomor))
    return NextResponse.json({ error: "Nomor urut barcode tersebut sudah terdata" }, { status: 400 });
  if (await isNikTaken(nikWakil))
    return NextResponse.json({ error: "NIK sudah terdaftar di sistem" }, { status: 400 });

  const data = await prisma.perwakilanSatuKK.create({
    data: { nomorUrut: nomor, namaLengkapWakil, nikWakil, ttdWakil, createdBy: session.user.id },
  });
  return NextResponse.json(data, { status: 201 });
}