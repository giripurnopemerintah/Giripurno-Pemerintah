import React, { useState, useRef, DragEvent } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2,
  Calendar,
  User,
  MapPin,
  Tag,
  Info,
  FileCheck
} from 'lucide-react';
import { Dusun, ArchiveType, ArchiveCategory, UploadFormData, GasSettings } from '../types/archive';

interface UploadFormProps {
  settings: GasSettings;
  onUploadSubmit: (data: UploadFormData) => Promise<{ success: boolean; message: string }>;
  onCancel?: () => void;
}

export const UploadForm: React.FC<UploadFormProps> = ({
  settings,
  onUploadSubmit,
  onCancel
}) => {
  const [title, setTitle] = useState('');
  const [archiveType, setArchiveType] = useState<ArchiveType>('Dokumen');
  const [dusun, setDusun] = useState<Dusun>('Pringsewu');
  const [category, setCategory] = useState<ArchiveCategory>('Pemerintahan');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [uploader, setUploader] = useState('Perangkat Desa Giripurno');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedDocumentExts = ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx'];
  const allowedPhotoExts = ['.jpg', '.jpeg', '.png', '.webp'];

  const validateAndSetFile = (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    // Cek batas ukuran 25MB
    const maxBytes = 25 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMsg('Ukuran file melebihi batas maksimal 25 MB.');
      return;
    }

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const isDoc = allowedDocumentExts.includes(ext);
    const isPhoto = allowedPhotoExts.includes(ext);

    if (!isDoc && !isPhoto) {
      setErrorMsg(`Format berkas tidak didukung. Harap unggah PDF, DOCX, XLSX, JPG, atau PNG.`);
      return;
    }

    // Auto-adjust tipe arsip sesuai file
    if (isPhoto && archiveType !== 'Foto Kegiatan') {
      setArchiveType('Foto Kegiatan');
    } else if (isDoc && archiveType !== 'Dokumen') {
      setArchiveType('Dokumen');
    }

    setSelectedFile(file);

    // Buat nama otomatis jika judul belum diisi
    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName);
    }

    // Generate image preview jika foto
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreview(url);
    } else {
      setFilePreview(null);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Silakan pilih berkas dokumen atau foto terlebih dahulu.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Judul atau nama arsip wajib diisi.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      setUploadStep('Mengonversi berkas dan menyiapkan metadata...');
      await new Promise(r => setTimeout(r, 400));

      if (settings.isLiveMode && settings.webAppUrl) {
        setUploadStep('Mengunggah ke Google Drive Desa Giripurno & mencatat di Google Sheets...');
      } else {
        setUploadStep('Menyimpan arsip ke basis data lokal desa...');
      }

      const result = await onUploadSubmit({
        title: title.trim(),
        archiveType,
        dusun,
        category,
        date,
        description: description.trim(),
        uploader: uploader.trim(),
        file: selectedFile
      });

      if (result.success) {
        setSuccessMsg(result.message);
        // Reset form
        setSelectedFile(null);
        setFilePreview(null);
        setTitle('');
        setDescription('');
      } else {
        setErrorMsg(result.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses arsip.');
    } finally {
      setIsSubmitting(false);
      setUploadStep('');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-200 gap-2">
        <div>
          <h2 className="text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-emerald-700" />
            Unggah Arsip Dokumen &amp; Foto Kegiatan
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Simpan arsip resmi Desa Giripurno secara terstruktur per Dusun dan Jenis Berkas.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {settings.isLiveMode ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Penyimpanan: Google Drive Resmi
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 font-medium border border-stone-200">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Mode Penyimpanan Lokal
            </span>
          )}
        </div>
      </div>

      {/* Notifikasi Sukses / Gagal */}
      {successMsg && (
        <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900">Unggah Berhasil!</p>
              <p className="text-xs text-emerald-700 mt-0.5">{successMsg}</p>
            </div>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-900">Gagal Mengunggah</p>
              <p className="text-xs text-rose-700 mt-0.5">{errorMsg}</p>
            </div>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Area Drag and Drop */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
            Berkas Berkas (Maksimal 25 MB)
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-600 bg-emerald-50/70 scale-[0.99]'
                : selectedFile
                ? 'border-emerald-300 bg-emerald-50/20 hover:border-emerald-500'
                : 'border-stone-300 bg-stone-50/50 hover:bg-stone-50 hover:border-emerald-500'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.jpg,.jpeg,.png,.webp"
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-3">
                {filePreview ? (
                  <div className="relative w-32 h-24 rounded-lg overflow-hidden border border-stone-200 shadow-xs">
                    <img
                      src={filePreview}
                      alt="Pratinjau Foto"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                    <FileCheck className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-stone-900">{selectedFile.name}</p>
                  <p className="text-xs text-stone-500">
                    Ukuran: {(selectedFile.size / 1024).toFixed(1)} KB · Klik untuk mengganti berkas
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100/70 flex items-center justify-center text-emerald-800">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">
                    Tarik dan lepaskan berkas ke sini, atau <span className="text-emerald-700 underline">pilih dari perangkat</span>
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    Dokumen: PDF, DOCX, XLSX · Foto Kegiatan: JPG, JPEG, PNG (Maks 25 MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pilihan Jenis Arsip & Dusun */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Jenis Arsip */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Jenis Arsip
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setArchiveType('Dokumen')}
                className={`py-2.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  archiveType === 'Dokumen'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                Dokumen Resmi
              </button>
              <button
                type="button"
                onClick={() => setArchiveType('Foto Kegiatan')}
                className={`py-2.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  archiveType === 'Foto Kegiatan'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Foto Kegiatan
              </button>
            </div>
          </div>

          {/* Dusun Giripurno */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Lokasi / Dusun
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['Pringsewu', 'Gintung', 'Jlegong', 'Gedegan'] as Dusun[]).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDusun(d)}
                  className={`py-2 px-1 text-center rounded-lg border text-xs font-medium transition-colors ${
                    dusun === d
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Judul & Kategori */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Judul / Nama Arsip <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Peraturan Desa No. 03 Tahun 2026 atau Foto Gotong Royong"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Kategori Arsip
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ArchiveCategory)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 bg-white"
            >
              <option value="Pemerintahan">Pemerintahan (SK, Perdes, Notulen)</option>
              <option value="Pembangunan">Pembangunan &amp; Infrastruktur</option>
              <option value="Pembinaan Masyarakat">Pembinaan Masyarakat &amp; Keagamaan</option>
              <option value="Pemberdayaan Masyarakat">Pemberdayaan Masyarakat (UMKM/Tani)</option>
              <option value="Keuangan Desa">Keuangan Desa (APBDes, Realisasi)</option>
              <option value="Penanggulangan Bencana">Penanggulangan Bencana &amp; Lingkungan</option>
              <option value="Umum">Umum / Lain-lain</option>
            </select>
          </div>
        </div>

        {/* Tanggal & Pengunggah */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Tanggal Berkas / Kegiatan
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Nama Pengunggah / Petugas
            </label>
            <input
              type="text"
              value={uploader}
              onChange={(e) => setUploader(e.target.value)}
              placeholder="Contoh: Budi Santoso (Sekretaris Desa)"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 bg-white"
            />
          </div>
        </div>

        {/* Keterangan */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
            Keterangan / Ringkasan Arsip (Opsional)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tuliskan ringkasan isi dokumen, tujuan kegiatan, atau catatan penting lainnya..."
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 bg-white"
          />
        </div>

        {/* Indikator Loading Saat Upload */}
        {isSubmitting && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{uploadStep}</span>
            </div>
            <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-700 h-full w-2/3 animate-pulse"></div>
            </div>
            <p className="text-xs text-emerald-700">
              Jangan menutup jendela saat proses penyimpanan berkas sedang berjalan.
            </p>
          </div>
        )}

        {/* Tombol Aksi */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
          {onCancel && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg transition-colors"
            >
              Batal
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 rounded-lg shadow-xs transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Simpan &amp; Unggah Arsip</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
