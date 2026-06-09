import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSatuKKData } from "@/lib/cache";
import { TAGS } from "@/lib/cache";
import { isNomorUrutTaken, isNikTaken } from "@/lib/validateCross";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const data = await getSatuKKData(search, page, limit);
  return NextResponse.json(data);
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

  // Invalidate: stats + data + dashboard
  revalidateTag(TAGS.satuKKStats);
  revalidateTag(TAGS.satuKKData);
  revalidateTag(TAGS.dashboardStats);

  return NextResponse.json(data, { status: 201 });
}