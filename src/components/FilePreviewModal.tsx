import React from 'react';
import { 
  X, 
  ExternalLink, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Calendar, 
  MapPin, 
  User, 
  Tag, 
  HardDrive,
  Copy,
  Check
} from 'lucide-react';
import { ArchiveItem } from '../types/archive';

interface FilePreviewModalProps {
  item: ArchiveItem | null;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ item, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!item) return null;

  const isPhoto = item.archiveType === 'Foto Kegiatan';

  const copyLink = () => {
    const url = item.fileUrl || item.viewUrl || '';
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-start justify-between gap-3 bg-stone-50/70">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg shrink-0 ${
              isPhoto ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {isPhoto ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                {item.archiveType} · Dusun {item.dusun}
              </span>
              <h3 className="text-base font-bold text-stone-900 leading-snug">
                {item.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Visual Preview jika Foto */}
          {isPhoto && (
            <div className="rounded-xl overflow-hidden bg-stone-900/5 border border-stone-200 flex items-center justify-center max-h-72">
              <img
                src={item.thumbnailUrl || item.viewUrl || item.fileUrl}
                alt={item.title}
                className="max-h-72 w-full object-contain"
                onError={(e) => {
                  // Fallback container jika foto demo tidak memiliki link aktif
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Deskripsi & Ringkasan */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              Deskripsi &amp; Catatan Berkas
            </h4>
            <p className="text-sm text-stone-700 leading-relaxed bg-stone-50 p-3.5 rounded-lg border border-stone-200/60">
              {item.description || 'Tidak ada deskripsi rincian untuk berkas ini.'}
            </p>
          </div>

          {/* Grid Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-stone-200 bg-white">
              <span className="text-stone-400 block mb-1">Wilayah Dusun</span>
              <span className="font-semibold text-stone-900 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                Dusun {item.dusun}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-stone-200 bg-white">
              <span className="text-stone-400 block mb-1">Kategori</span>
              <span className="font-semibold text-stone-900 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-emerald-700" />
                {item.category}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-stone-200 bg-white">
              <span className="text-stone-400 block mb-1">Tanggal Kegiatan</span>
              <span className="font-semibold text-stone-900 font-mono tabular-nums flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                {item.date}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-stone-200 bg-white">
              <span className="text-stone-400 block mb-1">Nama Pengunggah</span>
              <span className="font-semibold text-stone-900 truncate flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                {item.uploader}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-stone-200 bg-white">
              <span className="text-stone-400 block mb-1">Ukuran File</span>
              <span className="font-semibold text-stone-900 font-mono tabular-nums flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-emerald-700" />
                {item.fileSizeKB} KB
              </span>
            </div>

            <div className="p-3 rounded-lg border border-stone-200 bg-white">
              <span className="text-stone-400 block mb-1">ID Registrasi Arsip</span>
              <span className="font-mono text-emerald-800 font-semibold truncate block">
                {item.id}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={copyLink}
            className="px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tautan Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>Salin Tautan</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
            >
              Tutup
            </button>

            <a
              href={item.fileUrl || item.viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka di Google Drive</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
