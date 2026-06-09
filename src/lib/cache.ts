import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

// ─── CACHE TAGS ───────────────────────────────────────────
export const TAGS = {
  satuKKStats:    "satu-kk-stats",
  satuKKData:     "satu-kk-data",
  bedaKKStats:    "beda-kk-stats",
  bedaKKData:     "beda-kk-data",
  penggantiStats: "pengganti-stats",
  penggantiData:  "pengganti-data",
  dashboardStats: "dashboard-stats",
} as const;

// ─── DASHBOARD STATS ──────────────────────────────────────
export const getDashboardStats = unstable_cache(
  async () => {
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const [satuKKTotal, bedaKKTotal, penggantiTotal, totalUsers, satuKKToday, bedaKKToday, penggantiToday] = await Promise.all([
      prisma.perwakilanSatuKK.count(),
      prisma.perwakilanBedaKK.count(),
      prisma.pengganti.count(),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.perwakilanSatuKK.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.perwakilanBedaKK.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.pengganti.count({ where: { createdAt: { gte: todayStart } } }),
    ]);
    return {
      totalPerwakilan: satuKKTotal + bedaKKTotal + penggantiTotal,
      totalSatuKK: satuKKTotal,
      totalBedaKK: bedaKKTotal,
      totalPengganti: penggantiTotal,
      totalUsers,
      todayCount: satuKKToday + bedaKKToday + penggantiToday,
    };
  },
  ["dashboard-stats"],
  { revalidate: false, tags: [TAGS.dashboardStats] }
);

// ─── SATU KK STATS ────────────────────────────────────────
export const getSatuKKStats = unstable_cache(
  async () => {
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const [total, todayCount] = await Promise.all([
      prisma.perwakilanSatuKK.count(),
      prisma.perwakilanSatuKK.count({ where: { createdAt: { gte: todayStart } } }),
    ]);
    return { total, todayCount };
  },
  ["satu-kk-stats"],
  { revalidate: false, tags: [TAGS.satuKKStats] }
);

// ─── SATU KK DATA ─────────────────────────────────────────
export const getSatuKKData = unstable_cache(
  async (search: string, page: number, limit: number) => {
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
    return { data, total, page, limit };
  },
  ["satu-kk-data"],
  { revalidate: false, tags: [TAGS.satuKKData] }
);

// ─── BEDA KK STATS ────────────────────────────────────────
export const getBedaKKStats = unstable_cache(
  async () => {
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const [total, todayCount] = await Promise.all([
      prisma.perwakilanBedaKK.count(),
      prisma.perwakilanBedaKK.count({ where: { createdAt: { gte: todayStart } } }),
    ]);
    return { total, todayCount };
  },
  ["beda-kk-stats"],
  { revalidate: false, tags: [TAGS.bedaKKStats] }
);

// ─── BEDA KK DATA ─────────────────────────────────────────
export const getBedaKKData = unstable_cache(
  async (search: string, page: number, limit: number) => {
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
    return { data, total, page, limit };
  },
  ["beda-kk-data"],
  { revalidate: false, tags: [TAGS.bedaKKData] }
);

// ─── PENGGANTI STATS ──────────────────────────────────────
export const getPenggantiStats = unstable_cache(
  async () => {
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const [total, todayCount] = await Promise.all([
      prisma.pengganti.count(),
      prisma.pengganti.count({ where: { createdAt: { gte: todayStart } } }),
    ]);
    return { total, todayCount };
  },
  ["pengganti-stats"],
  { revalidate: false, tags: [TAGS.penggantiStats] }
);

// ─── PENGGANTI DATA ───────────────────────────────────────
export const getPenggantiData = unstable_cache(
  async (search: string, page: number, limit: number) => {
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
    return { data, total, page, limit };
  },
  ["pengganti-data"],
  { revalidate: false, tags: [TAGS.penggantiData] }
);