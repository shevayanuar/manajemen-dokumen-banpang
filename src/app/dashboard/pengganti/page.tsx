"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper, RowSelectionState } from "@tanstack/react-table";
import { TambahPenggantiModal } from "@/components/TambahPenggantiModal";
import { EditPenggantiModal } from "@/components/EditPenggantiModal";
import { TandaTanganModal } from "@/components/TandaTanganModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { Modal } from "@/components/Modal";
import { useDebounce } from "@/hooks/useDebounce";

type Pengganti = {
  id: string; nomorUrut: number; namaPbpAwal: string; nikPbpAwal: string;
  alamatPbpAwal: string; namaPbpPengganti: string; nikPbpPengganti: string;
  alamatPbpPengganti: string; sebabPenggantian: string; ttdPengganti: string; createdAt: string;
};

const columnHelper = createColumnHelper<Pengganti>();

export default function PenggantiPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [ttdItem, setTtdItem] = useState<Pengganti | null>(null);
  const [deleteItem, setDeleteItem] = useState<Pengganti | null>(null);
  const [editItem, setEditItem] = useState<Pengganti | null>(null);
  const [page, setPage] = useState(1);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showAksiDropdown, setShowAksiDropdown] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const LIMIT = 50;

  const debouncedSearch = useDebounce(search, 400);

  const { data: statsData } = useQuery<{ total: number; todayCount: number }>({
    queryKey: ["pengganti-stats"],
    queryFn: () => fetch("/api/stats-pengganti").then(r => r.json()),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["pengganti", debouncedSearch, page],
    queryFn: () => {
      const params = new URLSearchParams({ search: debouncedSearch, page: String(page), limit: String(LIMIT) });
      return fetch(`/api/pengganti?${params}`).then(r => r.json());
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/pengganti/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pengganti"] });
      queryClient.invalidateQueries({ queryKey: ["pengganti-stats"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setDeleteItem(null);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => fetch(`/api/pengganti/${id}`, { method: "DELETE" })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pengganti"] });
      queryClient.invalidateQueries({ queryKey: ["pengganti-stats"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setRowSelection({});
      setShowBulkDelete(false);
    },
  });

  const rows: Pengganti[] = data?.data ?? [];
  const selectedIds = Object.keys(rowSelection).filter(k => rowSelection[k]);
  const selectedRows = rows.filter(r => selectedIds.includes(r.id));
  const hasSelection = selectedIds.length > 0;

  function downloadJson() {
    const exportData = selectedRows.map(r => ({
      nomorUrutBarcode: r.nomorUrut, namaPbpAwal: r.namaPbpAwal, nikPbpAwal: r.nikPbpAwal,
      alamatPbpAwal: r.alamatPbpAwal, namaPbpPengganti: r.namaPbpPengganti,
      nikPbpPengganti: r.nikPbpPengganti, alamatPbpPengganti: r.alamatPbpPengganti,
      sebabPenggantian: r.sebabPenggantian, createdAt: r.createdAt,
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `pengganti-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    setShowAksiDropdown(false); setRowSelection({});
  }

  const columns = [
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <input type="checkbox" checked={table.getIsAllPageRowsSelected()}
          ref={el => { if (el) el.indeterminate = table.getIsSomePageRowsSelected(); }}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="w-4 h-4 rounded cursor-pointer" style={{ accentColor: "var(--accent)" }} />
      ),
      cell: ({ row }) => (
        <input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()}
          className="w-4 h-4 rounded cursor-pointer" style={{ accentColor: "var(--accent)" }} />
      ),
      size: 40,
    }),
    columnHelper.accessor("nomorUrut", {
      header: "No Urut Barcode",
      cell: info => <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>{info.getValue()}</span>,
      size: 120,
    }),
    columnHelper.accessor("namaPbpAwal", {
      header: "Nama PBP Awal",
      cell: info => <span className="font-medium text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("nikPbpAwal", {
      header: "NIK PBP Awal",
      cell: info => <span className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor("alamatPbpAwal", {
      header: "Alamat PBP Awal",
      cell: info => <span className="text-xs">{info.getValue()}</span>,
    }),
    columnHelper.accessor("namaPbpPengganti", {
      header: "Nama PBP Pengganti",
      cell: info => <span className="font-medium text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("nikPbpPengganti", {
      header: "NIK PBP Pengganti",
      cell: info => <span className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor("alamatPbpPengganti", {
      header: "Alamat PBP Pengganti",
      cell: info => <span className="text-xs">{info.getValue()}</span>,
    }),
    columnHelper.accessor("sebabPenggantian", {
      header: "Sebab Penggantian",
      cell: info => (
        <span className="text-xs px-2 py-0.5 rounded"
          style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("ttdPengganti", {
      header: "TTD Pengganti",
      cell: info => (
        <button onClick={() => setTtdItem(info.row.original)}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-all"
          style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          <span className="hidden sm:inline">Lihat</span>
        </button>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Aksi",
      cell: info => (
        <div className="flex gap-1.5">
          <button onClick={() => setEditItem(info.row.original)} className="btn-secondary py-1 px-2 text-xs">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button onClick={() => setDeleteItem(info.row.original)} className="btn-danger py-1 px-2 text-xs">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            <span className="hidden sm:inline">Hapus</span>
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: rows, columns, getCoreRowModel: getCoreRowModel(),
    manualPagination: true, pageCount: Math.ceil((data?.total ?? 0) / LIMIT),
    getRowId: row => row.id, onRowSelectionChange: setRowSelection,
    state: { rowSelection }, enableRowSelection: true,
  });

  const totalPages = Math.ceil((data?.total ?? 0) / LIMIT);

  const ttdItemAdapted = ttdItem ? {
    namaLengkap: ttdItem.namaPbpPengganti, nik: ttdItem.nikPbpPengganti,
    nomorUrut: ttdItem.nomorUrut, tandaTangan: ttdItem.ttdPengganti,
  } : null;

  return (
    <div className="animate-fadeIn">
      <div className="mb-5">
        <h1 className="text-xl lg:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Pengganti</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Data pengganti penerima barcode</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="stat-card">
          <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Total Data</p>
          <p className="text-2xl lg:text-3xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>
            {statsData?.total?.toLocaleString("id-ID") ?? "—"}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>seluruh data terdaftar</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Data Baru Hari Ini</p>
          <p className="text-2xl lg:text-3xl font-bold mt-1" style={{ color: "var(--accent)" }}>
            {statsData?.todayCount ?? "—"}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>entri hari ini</p>
        </div>
      </div>

      {/* Controls */}
      <div className="card p-3 lg:p-4 mb-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-muted)" }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input type="text" className="input-field pl-9" placeholder="Cari nomor urut, nama, atau NIK..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); setRowSelection({}); }} />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <button disabled={!hasSelection} onClick={() => setShowAksiDropdown(!showAksiDropdown)}
                className="btn-secondary"
                style={{ opacity: hasSelection ? 1 : 0.45, pointerEvents: hasSelection ? "auto" : "none" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
                </svg>
                <span className="hidden sm:inline">Pilih Aksi {hasSelection && `(${selectedIds.length})`}</span>
                <span className="sm:hidden">{hasSelection ? selectedIds.length : ""} Aksi</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {showAksiDropdown && hasSelection && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowAksiDropdown(false)} />
                  <div className="absolute right-0 top-full mt-1 w-52 rounded-xl overflow-hidden z-20 animate-scaleIn"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
                    <div className="px-3 py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{selectedIds.length} data dipilih</p>
                    </div>
                    <div className="p-1.5 flex flex-col gap-0.5">
                      <button onClick={downloadJson}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left"
                        style={{ color: "var(--text-primary)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-card-hover)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Unduh sebagai JSON
                      </button>
                      <button onClick={() => { setShowBulkDelete(true); setShowAksiDropdown(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left"
                        style={{ color: "var(--danger)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--danger-subtle)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14H6L5 6"/>
                          <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                        Hapus Data Terpilih
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <button onClick={() => setShowModal(true)} className="btn-primary flex-1 sm:flex-none justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span className="hidden sm:inline">Tambah Data</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </div>
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          {isLoading ? "Memuat..." : `${data?.total ?? 0} data ditemukan`}
          {hasSelection && <span style={{ color: "var(--accent)" }}> · {selectedIds.length} dipilih</span>}
        </p>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(header => (
                    <th key={header.id} style={{ width: header.getSize() }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{columns.map((_, j) => (
                    <td key={j}><div className="h-4 rounded animate-pulse" style={{ background: "var(--bg-card-hover)", width: "80%" }} /></td>
                  ))}</tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-muted)" }}>
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                      </svg>
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        {search ? "Data tidak ditemukan" : "Belum ada data"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} style={row.getIsSelected() ? { background: "var(--accent-subtle)" } : {}}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Halaman {page} dari {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => { setPage(p => Math.max(1, p - 1)); setRowSelection({}); }}
                disabled={page === 1} className="btn-secondary py-1 px-3 text-xs disabled:opacity-40">← Prev</button>
              <button onClick={() => { setPage(p => Math.min(totalPages, p + 1)); setRowSelection({}); }}
                disabled={page === totalPages} className="btn-secondary py-1 px-3 text-xs disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <TambahPenggantiModal onClose={() => setShowModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["pengganti"] });
            queryClient.invalidateQueries({ queryKey: ["pengganti-stats"] });
            queryClient.invalidateQueries({ queryKey: ["stats"] });
            setShowModal(false);
          }} />
      )}
      {ttdItemAdapted && <TandaTanganModal item={ttdItemAdapted} onClose={() => setTtdItem(null)} />}
      {deleteItem && (
        <DeleteConfirmModal name={deleteItem.namaPbpAwal}
          onClose={() => setDeleteItem(null)}
          onConfirm={() => deleteMutation.mutate(deleteItem.id)}
          loading={deleteMutation.isPending} />
      )}
      {editItem && (
        <EditPenggantiModal item={editItem} onClose={() => setEditItem(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["pengganti"] });
            setEditItem(null);
          }} />
      )}
      {showBulkDelete && (
        <Modal onClose={() => setShowBulkDelete(false)}>
          <div className="w-full max-w-sm animate-scaleIn card overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-5 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "var(--danger-subtle)", border: "1px solid rgba(220,38,38,0.3)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--danger)" }}>
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Hapus {selectedIds.length} Data?</h3>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Data yang dipilih akan dihapus permanen.</p>
              </div>
            </div>
            <div className="flex gap-2 px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
              <button onClick={() => setShowBulkDelete(false)} className="btn-secondary flex-1 justify-center">Batal</button>
              <button onClick={() => bulkDeleteMutation.mutate(selectedIds)}
                className="btn-danger flex-1 justify-center" disabled={bulkDeleteMutation.isPending}>
                {bulkDeleteMutation.isPending ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}