/**
 * Konfigurasi Aplikasi ARSIP DESA GIRIPURNO
 * Kecamatan Ngadirejo, Kabupaten Temanggung
 * 
 * Silakan ganti GOOGLE_APPS_SCRIPT_URL dengan URL Web App hasil deploy dari Google Apps Script (Code.gs).
 * Format URL: https://script.google.com/macros/s/AKfycb.../exec
 */

const CONFIG = {
  // Nama & Identitas Desa
  DESA_NAME: "Desa Giripurno",
  KECAMATAN: "Kecamatan Ngadirejo",
  KABUPATEN: "Kabupaten Temanggung",
  PROVINSI: "Jawa Tengah",
  KODE_POS: "56257",
  EMAIL_RESMI: "giripurnopemerintah@gmail.com",

  // 4 Dusun di Desa Giripurno
  DUSUN_LIST: ["Pringsewu", "Gintung", "Jlegong", "Gedegan"],

  // URL Google Apps Script Web App (Kosongkan atau isi URL hasil deploy Anda)
  // Aplikasi ini juga menyediakan pengaturan URL langsung melalui UI di aplikasi web.
  GOOGLE_APPS_SCRIPT_URL: "",

  // Batas ukuran file yang diizinkan untuk upload via Google Apps Script (maks 25 MB)
  MAX_FILE_SIZE_MB: 25,

  // Format file yang didukung
  ALLOWED_EXTENSIONS: {
    dokumen: ["pdf", "docx", "doc", "xlsx", "xls", "pptx"],
    foto: ["jpg", "jpeg", "png", "webp"]
  }
};

// Export untuk modul jika diperlukan
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}
