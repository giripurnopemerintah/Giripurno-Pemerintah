import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Code, 
  ExternalLink, 
  FileSpreadsheet, 
  HardDrive, 
  Globe, 
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface GasGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const GasGuideModal: React.FC<GasGuideModalProps> = ({ isOpen, onClose, onOpenSettings }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'tutorial' | 'code' | 'sheets'>('tutorial');

  if (!isOpen) return null;

  const sampleGasCode = `/**
 * SISTEM INFORMASI ARSIP DIGITAL DESA GIRIPURNO
 * Kecamatan Ngadirejo, Kabupaten Temanggung
 * File: Code.gs (Google Apps Script)
 */

const CONFIG = {
  FOLDER_UTAMA_NAMA: "ARSIP DESA GIRIPURNO",
  SHEET_NAME: "Rekap_Arsip",
  DUSUN_LIST: ["Pringsewu", "Gintung", "Jlegong", "Gedegan"],
  HEADERS: [
    "ID Arsip", "Waktu Upload", "Judul / Nama File", "Jenis Arsip",
    "Dusun", "Kategori", "Tanggal Kegiatan", "Keterangan",
    "Nama Pengunggah", "Ukuran File (KB)", "Tipe MIME", "URL Google Drive", "ID File Drive"
  ]
};

function inisialisasiAwal() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(CONFIG.SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(CONFIG.HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, CONFIG.HEADERS.length);
    headerRange.setBackground("#166534").setFontColor("#FFFFFF").setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return "Inisialisasi selesai!";
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "getArchives";
  if (action === "ping") {
    return kirimResponJson({
      status: "success",
      message: "Server Google Apps Script Desa Giripurno aktif!",
      timestamp: new Date().toISOString()
    });
  }
  if (action === "getArchives") {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.getSheets()[0];
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return kirimResponJson({ status: "success", data: [] });
    
    const rows = sheet.getRange(2, 1, lastRow - 1, CONFIG.HEADERS.length).getValues();
    const result = rows.map(r => ({
      id: String(r[0]),
      timestamp: String(r[1]),
      title: String(r[2]),
      archiveType: String(r[3]),
      dusun: String(r[4]),
      category: String(r[5]),
      date: String(r[6]),
      description: String(r[7]),
      uploader: String(r[8]),
      fileSizeKB: Number(r[9]) || 0,
      mimeType: String(r[10]),
      fileUrl: String(r[11]),
      fileId: String(r[12])
    })).reverse();

    return kirimResponJson({ status: "success", data: result });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === "upload") {
      const decodedBytes = Utilities.base64Decode(data.fileBase64.replace(/^data:.*;base64,/, ""));
      const blob = Utilities.newBlob(decodedBytes, data.mimeType, data.fileName);
      
      const folderUtama = dapatkanAtauBuatFolder(CONFIG.FOLDER_UTAMA_NAMA);
      const folderDusun = dapatkanAtauBuatSubfolder(folderUtama, "Dusun " + (data.dusun || "Pringsewu"));
      const folderTujuan = dapatkanAtauBuatSubfolder(folderDusun, data.archiveType || "Dokumen");
      
      const file = folderTujuan.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      const timestamp = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
      const idArsip = "ARS-" + Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyyMMdd") + "-" + Math.floor(1000 + Math.random() * 9000);
      
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
      if (!sheet) { inisialisasiAwal(); sheet = ss.getSheetByName(CONFIG.SHEET_NAME); }
      
      sheet.appendRow([
        idArsip, timestamp, data.title, data.archiveType, data.dusun,
        data.category, data.date, data.description, data.uploader,
        Math.round(file.getSize() / 1024), data.mimeType, file.getUrl(), file.getId()
      ]);

      return kirimResponJson({
        status: "success",
        message: "File tersimpan ke Google Drive & Sheets!",
        data: { id: idArsip, title: data.title, fileUrl: file.getUrl(), fileId: file.getId() }
      });
    }
  } catch(err) {
    return kirimResponJson({ status: "error", message: err.toString() });
  }
}

function dapatkanAtauBuatFolder(nama) {
  const f = DriveApp.getFoldersByName(nama);
  return f.hasNext() ? f.next() : DriveApp.createFolder(nama);
}

function dapatkanAtauBuatSubfolder(parent, nama) {
  const f = parent.getFoldersByName(nama);
  return f.hasNext() ? f.next() : parent.createFolder(nama);
}

function kirimResponJson(res) {
  const out = ContentService.createTextOutput(JSON.stringify(res));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}`;

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(sampleGasCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-start justify-between gap-3 bg-stone-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                Dokumentasi &amp; Panduan Integrasi
              </span>
              <h3 className="text-base font-bold text-stone-900 leading-snug">
                Panduan Setup Backend Google Apps Script (Code.gs)
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

        {/* Tab Selector */}
        <div className="px-6 pt-3 border-b border-stone-200 flex gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('tutorial')}
            className={`py-2 px-3 border-b-2 transition-colors ${
              activeTab === 'tutorial'
                ? 'border-emerald-700 text-emerald-800 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Langkah-Langkah Setup (5 Menit)
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-2 px-3 border-b-2 transition-colors ${
              activeTab === 'code'
                ? 'border-emerald-700 text-emerald-800 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Salin Kode Lengkap (Code.gs)
          </button>
          <button
            onClick={() => setActiveTab('sheets')}
            className={`py-2 px-3 border-b-2 transition-colors ${
              activeTab === 'sheets'
                ? 'border-emerald-700 text-emerald-800 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Struktur Google Sheet &amp; Drive
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-stone-700 text-sm">
          {activeTab === 'tutorial' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                <strong>Gratis &amp; Bebas Biaya Server:</strong> Menggunakan Google Apps Script, Google Drive (15 GB gratis), dan Google Sheets sebagai database real-time tanpa memerlukan server berbayar.
              </div>

              <ol className="space-y-4 text-xs">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold shrink-0 text-xs">
                    1
                  </span>
                  <div>
                    <strong className="text-stone-900 block text-sm">Buat Google Spreadsheet Baru</strong>
                    <p className="text-stone-600 mt-0.5">
                      Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-medium">sheets.new</a> dengan akun Google Desa Giripurno (<code className="bg-stone-100 px-1 py-0.5 rounded text-emerald-800">giripurnopemerintah@gmail.com</code>). Beri nama spreadsheet: <strong>DATABASE ARSIP DESA GIRIPURNO</strong>.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold shrink-0 text-xs">
                    2
                  </span>
                  <div>
                    <strong className="text-stone-900 block text-sm">Buka Apps Script Editor</strong>
                    <p className="text-stone-600 mt-0.5">
                      Di menu atas Google Sheets, klik menu <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold shrink-0 text-xs">
                    3
                  </span>
                  <div>
                    <strong className="text-stone-900 block text-sm">Salin Kode &amp; Jalankan Inisialisasi</strong>
                    <p className="text-stone-600 mt-0.5">
                      Hapus semua kode lama di tab <code className="bg-stone-100 px-1 rounded">Code.gs</code>, lalu tempel kode dari tab <em>"Salin Kode Lengkap"</em> di modal ini. Klik tombol <strong>Simpan (Save)</strong>, lalu klik tombol <strong>Jalankan (Run)</strong> untuk fungsi <code className="text-emerald-800 font-mono">inisialisasiAwal</code>. Berikan izin saat muncul konfirmasi (Review Permissions).
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold shrink-0 text-xs">
                    4
                  </span>
                  <div>
                    <strong className="text-stone-900 block text-sm">Deploy sebagai Aplikasi Web (Web App)</strong>
                    <p className="text-stone-600 mt-0.5">
                      Klik tombol biru <strong>Terapkan (Deploy)</strong> di pojok kanan atas &gt; <strong>Penerapan baru (New deployment)</strong>.
                    </p>
                    <ul className="list-disc pl-5 mt-1.5 space-y-1 text-stone-600">
                      <li>Pilih jenis (roda gigi): <strong>Aplikasi web (Web app)</strong></li>
                      <li>Jalankan sebagai (Execute as): <strong>Saya (Me)</strong></li>
                      <li>Yang memiliki akses (Who has access): <strong className="text-emerald-800">Siapa saja (Anyone)</strong> <em>(Wajib agar frontend dari Vercel/Web dapat mengunggah file tanpa login)</em></li>
                    </ul>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold shrink-0 text-xs">
                    5
                  </span>
                  <div>
                    <strong className="text-stone-900 block text-sm">Salin URL Web App ke Aplikasi Ini</strong>
                    <p className="text-stone-600 mt-0.5">
                      Salin URL Web App yang berakhiran <code className="bg-stone-100 px-1 rounded">/exec</code>. Lalu buka tombol <strong>Pengaturan Koneksi</strong> di aplikasi ini dan tempelkan URL tersebut.
                    </p>
                  </div>
                </li>
              </ol>

              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenSettings();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
                >
                  Buka Pengaturan URL Sekarang &rarr;
                </button>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  File ini sudah tersedia di root proyek: <code className="text-emerald-800 font-semibold font-mono">/Code.gs</code>
                </span>
                <button
                  onClick={copyCodeToClipboard}
                  className="px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Tersalin ke Clipboard!' : 'Salin Seluruh Kode'}</span>
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-stone-800 bg-stone-950 text-stone-100 text-xs font-mono p-4 max-h-96 overflow-y-auto">
                <pre>{sampleGasCode}</pre>
              </div>
            </div>
          )}

          {activeTab === 'sheets' && (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-stone-900 mb-1">
                  1. Struktur Kolom Google Sheets ("Rekap_Arsip")
                </h4>
                <p className="text-stone-600 mb-2">
                  Header dibuat secara otomatis saat menjalankan <code className="bg-stone-100 px-1 rounded">inisialisasiAwal()</code>:
                </p>
                <div className="p-3 bg-stone-100 rounded-lg border border-stone-200 font-mono text-[11px] overflow-x-auto whitespace-nowrap">
                  A: ID Arsip | B: Waktu Upload | C: Judul / Nama File | D: Jenis Arsip | E: Dusun | F: Kategori | G: Tanggal Kegiatan | H: Keterangan | I: Nama Pengunggah | J: Ukuran File | K: Tipe MIME | L: URL Google Drive | M: ID File Drive
                </div>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 mb-1">
                  2. Struktur Otomatis Folder Google Drive
                </h4>
                <p className="text-stone-600 mb-2">
                  Saat warga/perangkat desa mengunggah, file otomatis disusun di Google Drive:
                </p>
                <div className="p-3 bg-stone-100 rounded-lg border border-stone-200 font-mono text-[11px] space-y-1">
                  <div>📁 ARSIP DESA GIRIPURNO/</div>
                  <div className="pl-4">├── 📁 Dusun Pringsewu/ (Dokumen &amp; Foto)</div>
                  <div className="pl-4">├── 📁 Dusun Gintung/ (Dokumen &amp; Foto)</div>
                  <div className="pl-4">├── 📁 Dusun Jlegong/ (Dokumen &amp; Foto)</div>
                  <div className="pl-4">└── 📁 Dusun Gedegan/ (Dokumen &amp; Foto)</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs">
          <span className="text-stone-500">
            Pemerintah Desa Giripurno · Ngadirejo, Temanggung
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
