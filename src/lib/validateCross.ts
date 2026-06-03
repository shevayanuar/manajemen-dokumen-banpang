import { prisma } from "@/lib/prisma";

export async function isNomorUrutTaken(nomor: number, excludeId?: string, excludeTable?: "satuKK" | "bedaKK" | "pengganti") {
  const [s, b, p] = await Promise.all([
    excludeTable === "satuKK"
      ? prisma.perwakilanSatuKK.findFirst({ where: { nomorUrut: nomor, NOT: excludeId ? { id: excludeId } : undefined } })
      : prisma.perwakilanSatuKK.findUnique({ where: { nomorUrut: nomor } }),
    excludeTable === "bedaKK"
      ? prisma.perwakilanBedaKK.findFirst({ where: { nomorUrut: nomor, NOT: excludeId ? { id: excludeId } : undefined } })
      : prisma.perwakilanBedaKK.findUnique({ where: { nomorUrut: nomor } }),
    excludeTable === "pengganti"
      ? prisma.pengganti.findFirst({ where: { nomorUrut: nomor, NOT: excludeId ? { id: excludeId } : undefined } })
      : prisma.pengganti.findUnique({ where: { nomorUrut: nomor } }),
  ]);
  return !!(s || b || p);
}

export async function isNikTaken(nik: string, excludeId?: string, excludeField?: string) {
  const checks = await Promise.all([
    prisma.perwakilanSatuKK.findFirst({ where: { nikWakil: nik, ...(excludeField === "nikWakilSatuKK" && excludeId ? { NOT: { id: excludeId } } : {}) } }),
    prisma.perwakilanBedaKK.findFirst({ where: { nikPenerimaBarcode: nik, ...(excludeField === "nikPenerimaBedaKK" && excludeId ? { NOT: { id: excludeId } } : {}) } }),
    prisma.pengganti.findFirst({ where: { nikPbpAwal: nik, ...(excludeField === "nikPbpAwal" && excludeId ? { NOT: { id: excludeId } } : {}) } }),
    prisma.pengganti.findFirst({ where: { nikPbpPengganti: nik, ...(excludeField === "nikPbpPengganti" && excludeId ? { NOT: { id: excludeId } } : {}) } }),
  ]);
  return checks.some(Boolean);
}