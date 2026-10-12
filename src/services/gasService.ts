import { ArchiveItem, GasSettings, UploadFormData } from '../types/archive';
import { INITIAL_ARCHIVES } from '../data/initialArchives';

const SETTINGS_STORAGE_KEY = 'giripurno_gas_settings';
const ARCHIVES_STORAGE_KEY = 'giripurno_local_archives';

export const DEFAULT_SETTINGS: GasSettings = {
  webAppUrl: '',
  isLiveMode: false,
  spreadsheetUrl: '',
  lastSyncTimestamp: ''
};

// Baca pengaturan dari LocalStorage
export function getSavedSettings(): GasSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Gagal membaca pengaturan:', e);
  }
  return DEFAULT_SETTINGS;
}

// Simpan pengaturan ke LocalStorage
export function saveSettings(settings: GasSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Gagal menyimpan pengaturan:', e);
  }
}

// Baca daftar arsip lokal
export function getLocalArchives(): ArchiveItem[] {
  try {
    const raw = localStorage.getItem(ARCHIVES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Gagal membaca arsip lokal:', e);
  }
  // Default awal jika kosong
  return INITIAL_ARCHIVES;
}

// Simpan daftar arsip lokal
export function saveLocalArchives(archives: ArchiveItem[]): void {
  try {
    localStorage.setItem(ARCHIVES_STORAGE_KEY, JSON.stringify(archives));
  } catch (e) {
    console.error('Gagal menyimpan arsip lokal:', e);
  }
}

// Helper ubah File browser menjadi Base64 string
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

// Tes koneksi ke Web App Google Apps Script
export async function testGasConnection(url: string): Promise<{ success: boolean; message: string; details?: any }> {
  if (!url || !url.trim().startsWith('https://script.google.com/macros/s/')) {
    return {
      success: false,
      message: 'Format URL tidak valid. Harus dimulai dengan: https://script.google.com/macros/s/.../exec'
    };
  }

  try {
    const cleanUrl = url.trim();
    const testUrl = `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}action=ping&_t=${Date.now()}`;
    
    const response = await fetch(testUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.status === 'success') {
      return {
        success: true,
        message: data.message || 'Koneksi ke Google Apps Script berhasil terhubung!',
        details: data
      };
    } else {
      return {
        success: false,
        message: data.message || 'Script mengembalikan status error.'
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal menghubungi server Apps Script: ${err.message || 'Periksa koneksi internet atau izin deploy Web App (harus Who has access: Anyone).'}`
    };
  }
}

// Fetch arsip dari GAS Web App atau Local Storage
export async function fetchArchives(settings: GasSettings): Promise<{ archives: ArchiveItem[]; source: 'live' | 'local'; error?: string }> {
  // Jika live mode aktif dan ada URL GAS
  if (settings.isLiveMode && settings.webAppUrl?.trim()) {
    try {
      const cleanUrl = settings.webAppUrl.trim();
      const getUrl = `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}action=getArchives&_t=${Date.now()}`;
      
      const response = await fetch(getUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error(`Server GAS mengembalikan kode ${response.status}`);
      }

      const resJson = await response.json();
      if (resJson.status === 'success' && Array.isArray(resJson.data)) {
        // Simpan salinan ke local storage sebagai cache
        if (resJson.data.length > 0) {
          saveLocalArchives(resJson.data);
          return { archives: resJson.data, source: 'live' };
        }
      }
    } catch (err: any) {
      console.warn('Gagal sinkronisasi dengan Google Apps Script, beralih ke cache lokal:', err);
      const local = getLocalArchives();
      return {
        archives: local,
        source: 'local',
        error: `Koneksi Google Apps Script gagal (${err.message}). Menampilkan arsip tersimpan lokal.`
      };
    }
  }

  // Default mode lokal/demo
  return { archives: getLocalArchives(), source: 'local' };
}

// Upload arsip ke GAS Web App & update data lokal
export async function uploadArchive(
  formData: UploadFormData,
  settings: GasSettings
): Promise<{ success: boolean; item: ArchiveItem; message: string; savedToGas: boolean }> {
  if (!formData.file) {
    throw new Error('Berkas file wajib dipilih');
  }

  const file = formData.file;
  const base64Data = await fileToBase64(file);
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0];
  const timestamp = `${dateStr} ${timeStr}`;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const localId = `ARS-${dateStr.replace(/-/g, '')}-${randomSuffix}`;
  const fileSizeKB = Math.round(file.size / 1024);

  // Buat URL preview sementara di memori browser
  const previewBlobUrl = URL.createObjectURL(file);

  let gasResultData: any = null;
  let savedToGas = false;
  let responseMsg = 'Arsip berhasil disimpan!';

  // Coba kirim ke Google Apps Script jika URL terpasang
  if (settings.isLiveMode && settings.webAppUrl?.trim()) {
    try {
      const payload = {
        action: 'upload',
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        fileBase64: base64Data,
        title: formData.title,
        archiveType: formData.archiveType,
        dusun: formData.dusun,
        category: formData.category,
        date: formData.date || dateStr,
        description: formData.description,
        uploader: formData.uploader || 'Petugas Desa'
      };

      // Catatan teknis: menggunakan 'text/plain' untuk menghindari browser CORS preflight OPTIONS blocking di Apps Script
      const response = await fetch(settings.webAppUrl.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const json = await response.json();
        if (json.status === 'success' && json.data) {
          gasResultData = json.data;
          savedToGas = true;
          responseMsg = 'File berhasil diunggah ke Google Drive dan dicatat di Google Sheets!';
        }
      }
    } catch (gasErr: any) {
      console.warn('Gagal upload ke Google Apps Script:', gasErr);
      responseMsg = 'File disimpan di arsip lokal (Gagal terhubung ke GAS: ' + gasErr.message + ')';
    }
  }

  // Rakit ArchiveItem akhir
  const newItem: ArchiveItem = {
    id: gasResultData?.id || localId,
    timestamp: gasResultData?.timestamp || timestamp,
    title: formData.title || file.name,
    archiveType: formData.archiveType,
    dusun: formData.dusun,
    category: formData.category,
    date: formData.date || dateStr,
    description: formData.description || 'Tidak ada keterangan tambahan.',
    uploader: formData.uploader || 'Petugas Desa',
    fileSizeKB: gasResultData?.fileSizeKB || fileSizeKB,
    mimeType: file.type || (formData.archiveType === 'Foto Kegiatan' ? 'image/jpeg' : 'application/pdf'),
    fileUrl: gasResultData?.fileUrl || previewBlobUrl,
    fileId: gasResultData?.fileId || undefined,
    viewUrl: gasResultData?.viewUrl || previewBlobUrl,
    thumbnailUrl: formData.archiveType === 'Foto Kegiatan' ? previewBlobUrl : undefined
  };

  // Simpan ke daftar lokal
  const currentArchives = getLocalArchives();
  const updatedArchives = [newItem, ...currentArchives];
  saveLocalArchives(updatedArchives);

  return {
    success: true,
    item: newItem,
    message: responseMsg,
    savedToGas
  };
}

// Hapus arsip
export async function deleteArchiveItem(
  item: ArchiveItem,
  settings: GasSettings
): Promise<{ success: boolean; message: string }> {
  // Coba hapus di GAS jika terhubung
  if (settings.isLiveMode && settings.webAppUrl?.trim() && item.fileId) {
    try {
      await fetch(settings.webAppUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'delete', id: item.id, fileId: item.fileId })
      });
    } catch (err) {
      console.warn('Gagal menghapus dari GAS:', err);
    }
  }

  const current = getLocalArchives();
  const filtered = current.filter(a => a.id !== item.id);
  saveLocalArchives(filtered);

  return { success: true, message: 'Arsip berhasil dihapus.' };
}
