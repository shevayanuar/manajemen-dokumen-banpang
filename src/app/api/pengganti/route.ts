import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPenggantiData, TAGS } from "@/lib/cache";
import { isNomorUrutTaken, isNikTaken } from "@/lib/validateCross";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const data = await getPenggantiData(search, page, limit);
  return NextResponse.json(data);
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

  if (await isNomorUrutTaken(nomor))
    return NextResponse.json({ error: "Nomor urut barcode tersebut sudah terdata" }, { status: 400 });
  if (await isNikTaken(nikPbpAwal))
    return NextResponse.json({ error: "NIK PBP Awal sudah terdaftar di sistem" }, { status: 400 });
  if (await isNikTaken(nikPbpPengganti))
    return NextResponse.json({ error: "NIK PBP Pengganti sudah terdaftar di sistem" }, { status: 400 });

  const data = await prisma.pengganti.create({
    data: { nomorUrut: nomor, namaPbpAwal, nikPbpAwal, alamatPbpAwal, namaPbpPengganti, nikPbpPengganti, alamatPbpPengganti, sebabPenggantian, ttdPengganti, createdBy: session.user.id },
  });

  revalidateTag(TAGS.penggantiStats);
  revalidateTag(TAGS.penggantiData);
  revalidateTag(TAGS.dashboardStats);

  return NextResponse.json(data, { status: 201 });
}