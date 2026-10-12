import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  Image as ImageIcon, 
  ExternalLink, 
  Eye, 
  Download, 
  Trash2, 
  LayoutList, 
  LayoutGrid, 
  ChevronLeft, 
  ChevronRight,
  FileSpreadsheet,
  Calendar,
  User,
  ArrowUpDown
} from 'lucide-react';
import { ArchiveItem, Dusun, ArchiveType } from '../types/archive';

interface ArchiveTableProps {
  archives: ArchiveItem[];
  selectedDusun: string;
  setSelectedDusun: (dusun: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  onPreview: (item: ArchiveItem) => void;
  onDelete: (item: ArchiveItem) => void;
}

export const ArchiveTable: React.FC<ArchiveTableProps> = ({
  archives,
  selectedDusun,
  setSelectedDusun,
  selectedType,
  setSelectedType,
  onPreview,
  onDelete
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title-asc'>('date-desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter & Search Logic
  const filteredArchives = useMemo(() => {
    return archives.filter(item => {
      // Filter Dusun
      if (selectedDusun !== 'Semua Dusun' && item.dusun !== selectedDusun) {
        return false;
      }

      // Filter Jenis
      if (selectedType !== 'Semua' && item.archiveType !== selectedType) {
        return false;
      }

      // Filter Kategori
      if (selectedCategory !== 'Semua' && item.category !== selectedCategory) {
        return false;
      }

      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchUploader = item.uploader.toLowerCase().includes(query);
        const matchDusun = item.dusun.toLowerCase().includes(query);
        const matchCategory = item.category.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchUploader && !matchDusun && !matchCategory) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });
  }, [archives, selectedDusun, selectedType, selectedCategory, searchQuery, sortBy]);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(filteredArchives.length / pageSize));
  
  // Current page items
  const paginatedArchives = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredArchives.slice(start, start + pageSize);
  }, [filteredArchives, currentPage, pageSize]);

  // Handle category change or search change (reset page to 1)
  const handleFilterChange = (setter: (val: string) => void, val: string) => {
    setter(val);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
      {/* Control Header: Filters & Search */}
      <div className="p-4 sm:p-5 border-b border-stone-200 space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari judul arsip, dusun, keterangan, atau pengunggah..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 bg-stone-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* View Mode Toggle (Table / Card) */}
          <div className="flex items-center gap-2 self-end lg:self-center">
            <div className="flex items-center p-1 bg-stone-100 rounded-lg border border-stone-200">
              <button
                onClick={() => setViewMode('table')}
                title="Tampilan Tabel"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                title="Tampilan Kartu"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-stone-300 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            >
              <option value="date-desc">Terbaru</option>
              <option value="date-asc">Terlama</option>
              <option value="title-asc">Nama (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-xs">
          {/* Dusun Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            <span className="text-stone-500 font-medium whitespace-nowrap mr-1">Dusun:</span>
            {['Semua Dusun', 'Pringsewu', 'Gintung', 'Jlegong', 'Gedegan'].map(d => (
              <button
                key={d}
                onClick={() => handleFilterChange(setSelectedDusun, d)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                  selectedDusun === d
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="hidden sm:block h-4 w-px bg-stone-200 mx-1"></div>

          {/* Jenis Arsip Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            <span className="text-stone-500 font-medium whitespace-nowrap mr-1">Jenis:</span>
            {['Semua', 'Dokumen', 'Foto Kegiatan'].map(t => (
              <button
                key={t}
                onClick={() => handleFilterChange(setSelectedType, t)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                  selectedType === t
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content: Table or Cards View */}
      {filteredArchives.length === 0 ? (
        <div className="py-16 text-center px-4">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-stone-800">Tidak ada arsip yang cocok</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Tidak ditemukan berkas sesuai filter atau kata kunci pencarian. Coba ubah dusun atau hapus kata pencarian.
          </p>
          <button
            onClick={() => {
              setSelectedDusun('Semua Dusun');
              setSelectedType('Semua');
              setSelectedCategory('Semua');
              setSearchQuery('');
            }}
            className="mt-4 px-3.5 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW (Desktop default, with responsive mobile card fallback) */
        <div className="overflow-x-auto">
          {/* Desktop Table View */}
          <table className="w-full text-left border-collapse hidden md:table">
            <thead>
              <tr className="bg-stone-50 text-[11px] font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Judul Arsip &amp; Keterangan</th>
                <th className="py-3 px-3">Jenis</th>
                <th className="py-3 px-3">Dusun</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3 text-right">Tanggal</th>
                <th className="py-3 px-3 text-right">Ukuran</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/80 text-xs text-stone-700">
              {paginatedArchives.map((item, index) => {
                const itemNumber = (currentPage - 1) * pageSize + index + 1;
                const isPhoto = item.archiveType === 'Foto Kegiatan';

                return (
                  <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-mono tabular-nums text-stone-400">
                      {itemNumber}
                    </td>

                    <td className="py-3 px-4 max-w-xs sm:max-w-md">
                      <div className="flex items-start gap-2.5">
                        <div className={`mt-0.5 p-1.5 rounded-md shrink-0 ${
                          isPhoto ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {isPhoto ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-semibold text-stone-900 line-clamp-1 hover:text-emerald-800 cursor-pointer" onClick={() => onPreview(item)}>
                            {item.title}
                          </p>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-1">
                            <span>Pengunggah: {item.uploader}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono">{item.id}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-stone-800 font-medium">
                        {item.archiveType}
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-medium text-stone-900">
                        Dusun {item.dusun}
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-stone-600">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums whitespace-nowrap text-stone-600">
                      {item.date}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums whitespace-nowrap text-stone-500">
                      {item.fileSizeKB ? `${item.fileSizeKB} KB` : '-'}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onPreview(item)}
                          className="p-1.5 text-stone-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors"
                          title="Pratinjau Arsip"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <a
                          href={item.fileUrl || item.viewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-stone-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors"
                          title="Buka / Unduh di Google Drive"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => onDelete(item)}
                          className="p-1.5 text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                          title="Hapus Arsip"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile Card View (otomatis saat layar kecil) */}
          <div className="md:hidden divide-y divide-stone-200">
            {paginatedArchives.map((item) => (
              <div key={item.id} className="p-4 space-y-2 hover:bg-stone-50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <div className={`mt-0.5 p-1.5 rounded-md shrink-0 ${
                      item.archiveType === 'Foto Kegiatan' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {item.archiveType === 'Foto Kegiatan' ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 
                        onClick={() => onPreview(item)}
                        className="text-xs font-bold text-stone-900 leading-snug cursor-pointer"
                      >
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-1">
                        <span>Dusun {item.dusun}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.archiveType}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{item.date}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-stone-600 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px]">
                  <span className="text-stone-400 truncate max-w-[150px]">
                    Oleh: {item.uploader}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPreview(item)}
                      className="px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 rounded-md"
                    >
                      Lihat
                    </button>
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-xs font-medium text-stone-700 bg-stone-100 rounded-md"
                    >
                      Buka Drive
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* GRID / CARDS VIEW */
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedArchives.map((item) => {
            const isPhoto = item.archiveType === 'Foto Kegiatan';
            return (
              <div
                key={item.id}
                className="rounded-xl border border-stone-200 bg-stone-50/40 hover:bg-white hover:border-emerald-300 transition-all p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                    <span className="font-medium text-stone-800">Dusun {item.dusun}</span>
                    <span className="font-mono tabular-nums">{item.date}</span>
                  </div>

                  <div className="flex items-start gap-2.5 mb-2">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      isPhoto ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isPhoto ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 
                        onClick={() => onPreview(item)}
                        className="text-sm font-bold text-stone-900 leading-snug line-clamp-2 cursor-pointer hover:text-emerald-800"
                      >
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {item.category} · {item.archiveType}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-3 mb-3">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-500 font-mono tabular-nums">
                    {item.fileSizeKB} KB
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onPreview(item)}
                      className="px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                    >
                      Detail
                    </button>
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-stone-600 hover:text-stone-900 rounded-md transition-colors"
                      title="Buka Berkas"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="p-4 border-t border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <span>Menampilkan</span>
          <span className="font-mono tabular-nums font-semibold text-stone-900">
            {filteredArchives.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
          </span>
          <span>-</span>
          <span className="font-mono tabular-nums font-semibold text-stone-900">
            {Math.min(currentPage * pageSize, filteredArchives.length)}
          </span>
          <span>dari</span>
          <span className="font-mono tabular-nums font-semibold text-stone-900">
            {filteredArchives.length}
          </span>
          <span>arsip</span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 rounded-md border border-stone-300 bg-white text-xs text-stone-700"
          >
            <option value="5">5 per halaman</option>
            <option value="10">10 per halaman</option>
            <option value="20">20 per halaman</option>
            <option value="50">50 per halaman</option>
          </select>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded-md border border-stone-300 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono tabular-nums font-medium text-stone-800">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded-md border border-stone-300 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Halaman Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
