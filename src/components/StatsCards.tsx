import React from 'react';
import { 
  Files, 
  FileText, 
  Image as ImageIcon, 
  MapPin, 
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { ArchiveStats, Dusun, ArchiveType } from '../types/archive';

interface StatsCardsProps {
  stats: ArchiveStats;
  selectedDusun: string;
  onSelectDusun: (dusun: string) => void;
  selectedType: string;
  onSelectType: (type: string) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  stats,
  selectedDusun,
  onSelectDusun,
  selectedType,
  onSelectType
}) => {
  const dusunList: { name: Dusun; count: number; desc: string }[] = [
    { name: 'Pringsewu', count: stats.perDusun.Pringsewu || 0, desc: 'Dusun Sentra Pertanian & UMKM' },
    { name: 'Gintung', count: stats.perDusun.Gintung || 0, desc: 'Dusun Layanan & Budaya' },
    { name: 'Jlegong', count: stats.perDusun.Jlegong || 0, desc: 'Dusun Agrowisata & Sayuran' },
    { name: 'Gedegan', count: stats.perDusun.Gedegan || 0, desc: 'Dusun Lereng & Konservasi' }
  ];

  return (
    <div className="space-y-4">
      {/* 3 Kartu Metrik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Arsip */}
        <div 
          onClick={() => {
            onSelectDusun('Semua Dusun');
            onSelectType('Semua');
          }}
          className={`p-5 rounded-xl border bg-white cursor-pointer transition-all hover:border-emerald-500 hover:shadow-xs ${
            selectedDusun === 'Semua Dusun' && selectedType === 'Semua'
              ? 'border-emerald-600 ring-2 ring-emerald-600/10'
              : 'border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-medium">Total Seluruh Arsip</span>
            <Files className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-stone-900 tracking-tight">
              {stats.total}
            </span>
            <span className="text-xs text-stone-500">berkas tercatat</span>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Desa Giripurno · Ngadirejo</span>
            <span className="text-emerald-700 font-medium flex items-center gap-0.5">
              Lihat semua <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Total Dokumen Resmi */}
        <div 
          onClick={() => onSelectType('Dokumen')}
          className={`p-5 rounded-xl border bg-white cursor-pointer transition-all hover:border-emerald-500 hover:shadow-xs ${
            selectedType === 'Dokumen'
              ? 'border-emerald-600 ring-2 ring-emerald-600/10'
              : 'border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-medium">Dokumen Resmi</span>
            <FileText className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-emerald-800 tracking-tight">
              {stats.dokumen}
            </span>
            <span className="text-xs text-stone-500">
              ({stats.total > 0 ? Math.round((stats.dokumen / stats.total) * 100) : 0}%)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>PDF, DOCX, XLSX, SK &amp; Perdes</span>
            <span className="text-emerald-700 font-medium flex items-center gap-0.5">
              Filter dokumen <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Total Foto Kegiatan */}
        <div 
          onClick={() => onSelectType('Foto Kegiatan')}
          className={`p-5 rounded-xl border bg-white cursor-pointer transition-all hover:border-emerald-500 hover:shadow-xs ${
            selectedType === 'Foto Kegiatan'
              ? 'border-emerald-600 ring-2 ring-emerald-600/10'
              : 'border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-medium">Foto Kegiatan Desa</span>
            <ImageIcon className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-emerald-800 tracking-tight">
              {stats.foto}
            </span>
            <span className="text-xs text-stone-500">
              ({stats.total > 0 ? Math.round((stats.foto / stats.total) * 100) : 0}%)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Dokumentasi 4 Dusun</span>
            <span className="text-emerald-700 font-medium flex items-center gap-0.5">
              Filter foto <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Rincian 4 Dusun di Giripurno */}
      <div className="p-4 rounded-xl border border-stone-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              Distribusi Arsip 4 Wilayah Dusun
            </h3>
          </div>
          <span className="text-xs text-stone-500">
            Klik dusun untuk memfilter data
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {dusunList.map(item => {
            const isSelected = selectedDusun === item.name;
            return (
              <button
                key={item.name}
                onClick={() => onSelectDusun(isSelected ? 'Semua Dusun' : item.name)}
                className={`p-3 rounded-lg text-left transition-all border ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-600 ring-1 ring-emerald-600'
                    : 'bg-stone-50/60 border-stone-200/80 hover:bg-stone-100 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-900 truncate">
                    Dusun {item.name}
                  </span>
                  <span className={`text-sm font-bold font-mono tabular-nums ${isSelected ? 'text-emerald-800' : 'text-stone-700'}`}>
                    {item.count}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-stone-500 truncate">
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
