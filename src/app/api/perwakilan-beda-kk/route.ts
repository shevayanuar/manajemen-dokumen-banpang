import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBedaKKData, TAGS } from "@/lib/cache";
import { isNomorUrutTaken, isNikTaken } from "@/lib/validateCross";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const data = await getBedaKKData(search, page, limit);
  return NextResponse.json(data);
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
  if (await isNikTaken(nikPenerimaBarcode))
    return NextResponse.json({ error: "NIK penerima sudah terdaftar di sistem" }, { status: 400 });
  if (await isNikTaken(nikWakil))
    return NextResponse.json({ error: "NIK wakil sudah terdaftar di sistem" }, { status: 400 });

  const nikWakilCount = await prisma.perwakilanBedaKK.count({ where: { nikWakil } });
  if (nikWakilCount >= 3)
    return NextResponse.json({ error: "NIK wakil sudah digunakan 3 kali, tidak dapat ditambahkan lagi" }, { status: 400 });

  const data = await prisma.perwakilanBedaKK.create({
    data: { nomorUrut: nomor, namaPenerimaBarcode, nikPenerimaBarcode, alamatPenerimaBarcode, namaLengkapWakil, nikWakil, alamatWakil, ttdWakil, createdBy: session.user.id },
  });

  revalidateTag(TAGS.bedaKKStats);
  revalidateTag(TAGS.bedaKKData);
  revalidateTag(TAGS.dashboardStats);

  return NextResponse.json(data, { status: 201 });
}