/**
 * ============================================================================
 * BACKEND GOOGLE APPS SCRIPT (Code.gs)
 * SISTEM INFORMASI ARSIP DIGITAL DESA GIRIPURNO
 * Kecamatan Ngadirejo, Kabupaten Temanggung, Jawa Tengah
 * ============================================================================
 * 
 * PANDUAN PEMASANGAN CEPAT:
 * 1. Buka Google Drive (https://drive.google.com).
 * 2. Buat Google Spreadsheet baru, beri nama: "DATABASE ARSIP DESA GIRIPURNO".
 * 3. Di menu atas Spreadsheet, klik: Ekstensi (Extensions) > Apps Script.
 * 4. Hapus seluruh isi kode lama di editor, lalu salin (paste) SELURUH isi file Code.gs ini.
 * 5. Klik ikon Simpan (Save) atau Ctrl+S.
 * 6. Jalankan fungsi `inisialisasiAwal()` sekali dari tombol "Run / Jalankan" di atas editor 
 *    untuk membuat header sheet dan folder Google Drive otomatis. Berikan izin (Review Permissions).
 * 7. Klik tombol biru "Terapkan" (Deploy) di kanan atas > "Penerapan baru" (New deployment).
 * 8. Pilih jenis: "Aplikasi web" (Web app).
 * 9. Konfigurasi:
 *    - Deskripsi: Arsip Giripurno v1
 *    - Jalankan sebagai (Execute as): "Saya" (Me - akun Anda)
 *    - Yang memiliki akses (Who has access): "Siapa saja" (Anyone) -> PENTING agar web app bisa kirim file!
 * 10. Klik "Terapkan" (Deploy). Salin "URL Aplikasi Web" (contoh: https://script.google.com/macros/s/AKfycb.../exec).
 * 11. Tempelkan URL tersebut ke konfigurasi web aplikasi Arsip Desa Giripurno.
 */

// KONFIGURASI NAMA FOLDER & SHEET
const CONFIG = {
  FOLDER_UTAMA_NAMA: "ARSIP DESA GIRIPURNO",
  SHEET_NAME: "Rekap_Arsip",
  DUSUN_LIST: ["Pringsewu", "Gintung", "Jlegong", "Gedegan"],
  HEADERS: [
    "ID Arsip",
    "Waktu Upload",
    "Judul / Nama File",
    "Jenis Arsip",
    "Dusun",
    "Kategori",
    "Tanggal Kegiatan",
    "Keterangan",
    "Nama Pengunggah",
    "Ukuran File (KB)",
    "Tipe MIME",
    "URL Google Drive",
    "ID File Drive"
  ]
};

/**
 * Fungsi untuk inisialisasi awal Google Sheet & Folder Google Drive
 * Jalankan fungsi ini 1x dari Apps Script Editor
 */
function inisialisasiAwal() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    // Hapus sheet default jika ada
    const defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Sheet 1");
    if (defaultSheet && ss.getSheets().length > 1) {
      // biarkan saja atau simpan
    }
  }

  // Cek apakah header sudah ada
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(CONFIG.HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, CONFIG.HEADERS.length);
    headerRange.setBackground("#166534"); // Forest green Giripurno
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    Logger.log("Header sheet berhasil dibuat!");
  }

  // Buat folder utama di Google Drive jika belum ada
  const folderUtama = dapatkanAtauBuatFolder(CONFIG.FOLDER_UTAMA_NAMA);
  Logger.log("Folder Google Drive siap: " + folderUtama.getName() + " (ID: " + folderUtama.getId() + ")");
  
  return "Inisialisasi berhasil diselesaikan!";
}

/**
 * Handle permintaan GET (Membaca data rekap arsip & cek koneksi)
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || "getArchives";

    // 1. Cek Koneksi / Ping
    if (action === "ping") {
      return kirimResponJson({
        status: "success",
        message: "Koneksi Google Apps Script Desa Giripurno AKTIF dan TERHUBUNG!",
        timestamp: new Date().toISOString(),
        spreadsheetName: SpreadsheetApp.getActiveSpreadsheet().getName(),
        dusun: CONFIG.DUSUN_LIST
      });
    }

    // 2. Ambil Daftar Arsip
    if (action === "getArchives") {
      const arsipList = ambilDaftarArsip();
      return kirimResponJson({
        status: "success",
        total: arsipList.length,
        data: arsipList
      });
    }

    // 3. Statistik Singkat
    if (action === "getStats") {
      const arsipList = ambilDaftarArsip();
      const stats = hitungStatistik(arsipList);
      return kirimResponJson({
        status: "success",
        data: stats
      });
    }

    return kirimResponJson({
      status: "error",
      message: "Action tidak dikenal: " + action
    });

  } catch (error) {
    return kirimResponJson({
      status: "error",
      message: "Gagal memproses GET: " + error.toString()
    });
  }
}

/**
 * Handle permintaan POST (Upload File & Simpan Metadata)
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return kirimResponJson({
        status: "error",
        message: "Tidak ada data yang dikirimkan (payload kosong)"
      });
    }

    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      // Coba periksa jika dikirim sebagai form parameters
      data = e.parameter || {};
    }

    const action = data.action || "upload";

    // Action 1: Upload File Dokumen / Foto
    if (action === "upload") {
      return prosesUploadArsip(data);
    }

    // Action 2: Hapus Arsip
    if (action === "delete") {
      return prosesHapusArsip(data.id, data.fileId);
    }

    return kirimResponJson({
      status: "error",
      message: "Action POST tidak valid: " + action
    });

  } catch (error) {
    return kirimResponJson({
      status: "error",
      message: "Gagal memproses POST: " + error.toString()
    });
  }
}

/**
 * Logika memproses upload file ke Google Drive dan mencatat ke Google Sheet
 */
function prosesUploadArsip(data) {
  // Validasi input wajib
  if (!data.fileBase64 || !data.fileName) {
    return kirimResponJson({
      status: "error",
      message: "File tidak ditemukan atau format base64 tidak valid"
    });
  }

  const judul = data.title || data.fileName;
  const dusun = data.dusun || "Pringsewu";
  const jenisArsip = data.archiveType || "Dokumen"; // "Dokumen" atau "Foto Kegiatan"
  const kategori = data.category || "Umum";
  const tanggalKegiatan = data.date || Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd");
  const keterangan = data.description || "-";
  const pengunggah = data.uploader || "Petugas Desa";
  const mimeType = data.mimeType || "application/octet-stream";

  // Decode file dari base64
  let fileBlob;
  try {
    let cleanBase64 = data.fileBase64;
    if (cleanBase64.indexOf(",") > -1) {
      cleanBase64 = cleanBase64.split(",")[1];
    }
    const decodedBytes = Utilities.base64Decode(cleanBase64);
    fileBlob = Utilities.newBlob(decodedBytes, mimeType, data.fileName);
  } catch (errDecode) {
    return kirimResponJson({
      status: "error",
      message: "Gagal mendecode base64 file: " + errDecode.toString()
    });
  }

  // Tentukan folder penyimpanan di Google Drive:
  // Root: ARSIP DESA GIRIPURNO -> Subfolder Dusun (Pringsewu, Gintung, Jlegong, Gedegan) -> Jenis Arsip
  const folderUtama = dapatkanAtauBuatFolder(CONFIG.FOLDER_UTAMA_NAMA);
  const folderDusun = dapatkanAtauBuatSubfolder(folderUtama, "Dusun " + dusun);
  const folderTujuan = dapatkanAtauBuatSubfolder(folderDusun, jenisArsip);

  // Simpan file ke Google Drive
  const driveFile = folderTujuan.createFile(fileBlob);
  
  // Berikan akses agar file bisa dilihat/didownload oleh pengguna arsip
  try {
    driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (permErr) {
    Logger.log("Peringatan izin sharing: " + permErr.toString());
  }

  const fileId = driveFile.getId();
  const fileUrl = driveFile.getUrl();
  const fileSizeKB = Math.round(driveFile.getSize() / 1024);
  const timestamp = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
  const idArsip = "ARS-" + Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyyMMdd") + "-" + Math.floor(1000 + Math.random() * 9000);

  // Simpan baris ke Google Sheets
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    inisialisasiAwal();
    sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  }

  const rowData = [
    idArsip,
    timestamp,
    judul,
    jenisArsip,
    dusun,
    kategori,
    tanggalKegiatan,
    keterangan,
    pengunggah,
    fileSizeKB,
    mimeType,
    fileUrl,
    fileId
  ];

  sheet.appendRow(rowData);

  return kirimResponJson({
    status: "success",
    message: "Arsip berhasil disimpan ke Google Drive dan Google Sheets!",
    data: {
      id: idArsip,
      title: judul,
      archiveType: jenisArsip,
      dusun: dusun,
      category: kategori,
      date: tanggalKegiatan,
      description: keterangan,
      uploader: pengunggah,
      fileSizeKB: fileSizeKB,
      fileUrl: fileUrl,
      fileId: fileId,
      timestamp: timestamp,
      viewUrl: "https://drive.google.com/uc?export=view&id=" + fileId
    }
  });
}

/**
 * Mengambil seluruh data arsip dari Google Sheet
 */
function ambilDaftarArsip() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    inisialisasiAwal();
    sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  }

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return [];
  }

  const dataRange = sheet.getRange(2, 1, lastRow - 1, CONFIG.HEADERS.length);
  const values = dataRange.getValues();
  const result = [];

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    if (!row[0]) continue; // Lewati baris kosong

    const fileId = String(row[12] || "");
    const directViewUrl = fileId ? "https://drive.google.com/uc?export=view&id=" + fileId : String(row[11] || "");

    result.push({
      id: String(row[0]),
      timestamp: String(row[1]),
      title: String(row[2]),
      archiveType: String(row[3]),
      dusun: String(row[4]),
      category: String(row[5]),
      date: String(row[6]),
      description: String(row[7]),
      uploader: String(row[8]),
      fileSizeKB: Number(row[9]) || 0,
      mimeType: String(row[10]),
      fileUrl: String(row[11]),
      fileId: fileId,
      viewUrl: directViewUrl
    });
  }

  // Urutkan dari yang terbaru
  return result.reverse();
}

/**
 * Menghapus arsip dari Google Sheet dan Google Drive (opsional)
 */
function prosesHapusArsip(idArsip, fileId) {
  if (!idArsip) {
    return kirimResponJson({ status: "error", message: "ID arsip tidak diberikan" });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) return kirimResponJson({ status: "error", message: "Sheet tidak ditemukan" });

  const lastRow = sheet.getLastRow();
  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();

  let targetRow = -1;
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(idArsip)) {
      targetRow = i + 2;
      break;
    }
  }

  if (targetRow === -1) {
    return kirimResponJson({ status: "error", message: "Arsip dengan ID tersebut tidak ditemukan" });
  }

  // Hapus baris dari sheet
  sheet.deleteRow(targetRow);

  // Coba hapus file dari drive jika fileId ada
  if (fileId) {
    try {
      const file = DriveApp.getFileById(fileId);
      file.setTrashed(true);
    } catch (err) {
      Logger.log("Gagal memindahkan file ke sampah: " + err.toString());
    }
  }

  return kirimResponJson({
    status: "success",
    message: "Arsip berhasil dihapus"
  });
}

/**
 * Helper untuk menghitung statistik arsip
 */
function hitungStatistik(arsipList) {
  const stats = {
    total: arsipList.length,
    dokumen: 0,
    foto: 0,
    perDusun: {
      Pringsewu: 0,
      Gintung: 0,
      Jlegong: 0,
      Gedegan: 0
    }
  };

  arsipList.forEach(item => {
    if (item.archiveType === "Foto Kegiatan" || item.archiveType === "Foto") {
      stats.foto++;
    } else {
      stats.dokumen++;
    }

    if (stats.perDusun[item.dusun] !== undefined) {
      stats.perDusun[item.dusun]++;
    }
  });

  return stats;
}

/**
 * Helper mencari atau membuat folder di Google Drive Root
 */
function dapatkanAtauBuatFolder(namaFolder) {
  const folders = DriveApp.getFoldersByName(namaFolder);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(namaFolder);
}

/**
 * Helper mencari atau membuat subfolder di dalam folder induk
 */
function dapatkanAtauBuatSubfolder(folderInduk, namaSubfolder) {
  const subfolders = folderInduk.getFoldersByName(namaSubfolder);
  if (subfolders.hasNext()) {
    return subfolders.next();
  }
  return folderInduk.createFolder(namaSubfolder);
}

/**
 * Helper untuk response JSON dengan header CORS yang tepat
 */
function kirimResponJson(payload) {
  const output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
