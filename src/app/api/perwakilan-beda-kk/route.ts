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
      { namaPenerimaBarcode: { contains: search, mode: "insensitive" as const } },
      { namaLengkapWakil: { contains: search, mode: "insensitive" as const } },
      { nikPenerimaBarcode: { contains: search } },
      { nikWakil: { contains: search } },
      ...(isNaN(Number(search)) ? [] : [{ nomorUrut: Number(search) }]),
    ],
  } : {};

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.perwakilanBedaKK.findMany({
      where, orderBy: { nomorUrut: "asc" }, skip, take: limit,
      select: { id: true, nomorUrut: true, namaPenerimaBarcode: true, nikPenerimaBarcode: true, alamatPenerimaBarcode: true, namaLengkapWakil: true, nikWakil: true, alamatWakil: true, ttdWakil: true, createdAt: true },
    }),
    prisma.perwakilanBedaKK.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { nomorUrut, namaPenerimaBarcode, nikPenerimaBarcode, alamatPenerimaBarcode, namaLengkapWakil, nikWakil, alamatWakil, ttdWakil } = body;

  if (!nomorUrut || !namaPenerimaBarcode || !nikPenerimaBarcode || !alamatPenerimaBarcode || !namaLengkapWakil || !nikWakil || !alamatWakil || !ttdWakil)
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });

  const nomor = parseInt(nomorUrut);
  if (isNaN(nomor) || nomor < 1 || nomor > 10000)
    return NextResponse.json({ error: "Nomor urut harus antara 1–10000" }, { status: 400 });
  if (nikPenerimaBarcode.length !== 16)
    return NextResponse.json({ error: "NIK penerima harus tepat 16 digit" }, { status: 400 });
  if (nikWakil.length !== 16)
    return NextResponse.json({ error: "NIK wakil harus tepat 16 digit" }, { status: 400 });
  if (nikPenerimaBarcode === nikWakil)
    return NextResponse.json({ error: "NIK Penerima dan NIK Wakil tidak boleh sama" }, { status: 400 });

  if (await isNomorUrutTaken(nomor))
    return NextResponse.json({ error: "Nomor urut barcode tersebut sudah terdata" }, { status: 400 });

  // Cek NIK cross-tabel
  if (await isNikTaken(nikPenerimaBarcode))
    return NextResponse.json({ error: "NIK penerima sudah terdaftar di sistem" }, { status: 400 });
  if (await isNikTaken(nikWakil))
    return NextResponse.json({ error: "NIK wakil sudah terdaftar di sistem" }, { status: 400 });

  // Cek NIK wakil max 3x (khusus beda KK)
  const nikWakilCount = await prisma.perwakilanBedaKK.count({ where: { nikWakil } });
  if (nikWakilCount >= 3)
    return NextResponse.json({ error: "NIK wakil sudah digunakan 3 kali, tidak dapat ditambahkan lagi" }, { status: 400 });

  const data = await prisma.perwakilanBedaKK.create({
    data: { nomorUrut: nomor, namaPenerimaBarcode, nikPenerimaBarcode, alamatPenerimaBarcode, namaLengkapWakil, nikWakil, alamatWakil, ttdWakil, createdBy: session.user.id },
  });
  return NextResponse.json(data, { status: 201 });
}