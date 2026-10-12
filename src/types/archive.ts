export type Dusun = 'Pringsewu' | 'Gintung' | 'Jlegong' | 'Gedegan';

export type ArchiveType = 'Dokumen' | 'Foto Kegiatan';

export type ArchiveCategory =
  | 'Pemerintahan'
  | 'Pembangunan'
  | 'Pembinaan Masyarakat'
  | 'Pemberdayaan Masyarakat'
  | 'Penanggulangan Bencana'
  | 'Keuangan Desa'
  | 'Umum';

export interface ArchiveItem {
  id: string;
  timestamp: string;
  title: string;
  archiveType: ArchiveType;
  dusun: Dusun;
  category: ArchiveCategory;
  date: string;
  description: string;
  uploader: string;
  fileSizeKB: number;
  mimeType: string;
  fileUrl: string;
  fileId?: string;
  viewUrl?: string;
  thumbnailUrl?: string;
}

export interface UploadFormData {
  title: string;
  archiveType: ArchiveType;
  dusun: Dusun;
  category: ArchiveCategory;
  date: string;
  description: string;
  uploader: string;
  file: File | null;
}

export interface ArchiveStats {
  total: number;
  dokumen: number;
  foto: number;
  perDusun: Record<Dusun, number>;
  perCategory: Record<string, number>;
}

export interface GasSettings {
  webAppUrl: string;
  isLiveMode: boolean;
  spreadsheetUrl?: string;
  lastSyncTimestamp?: string;
}
