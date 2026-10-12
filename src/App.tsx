/**
 * ARSIP DESA GIRIPURNO
 * Kecamatan Ngadirejo, Kabupaten Temanggung, Jawa Tengah
 * Aplikasi Manajemen Arsip Dokumen & Foto Kegiatan Berbasis Google Drive & Google Sheets
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderArchive, 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  Settings, 
  HelpCircle, 
  RefreshCw, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  ExternalLink,
  Info
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { StatsCards } from './components/StatsCards';
import { ArchiveTable } from './components/ArchiveTable';
import { UploadForm } from './components/UploadForm';
import { FilePreviewModal } from './components/FilePreviewModal';
import { GasGuideModal } from './components/GasGuideModal';
import { ConfigModal } from './components/ConfigModal';
import { Footer } from './components/Footer';

import { 
  ArchiveItem, 
  ArchiveStats, 
  GasSettings, 
  UploadFormData,
  Dusun
} from './types/archive';
import { 
  getSavedSettings, 
  saveSettings, 
  fetchArchives, 
  uploadArchive, 
  deleteArchiveItem 
} from './services/gasService';

import heroImg from './assets/images/hero_desa_giripurno_1791450499347.jpg';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'guide'>('dashboard');
  const [settings, setSettings] = useState<GasSettings>(() => getSavedSettings());
  const [archives, setArchives] = useState<ArchiveItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<string>('');

  // Selected filters
  const [selectedDusun, setSelectedDusun] = useState<string>('Semua Dusun');
  const [selectedType, setSelectedType] = useState<string>('Semua');

  // Modals state
  const [previewItem, setPreviewItem] = useState<ArchiveItem | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Load archives on mount & when settings change
  const loadData = async (currentSettings: GasSettings) => {
    setIsLoading(true);
    setSyncStatus('Memuat arsip...');
    try {
      const res = await fetchArchives(currentSettings);
      setArchives(res.archives);
      if (res.error) {
        showToast('info', res.error);
      }
    } catch (e: any) {
      console.error('Error fetching:', e);
      showToast('error', 'Gagal memuat arsip.');
    } finally {
      setIsLoading(false);
      setSyncStatus('');
    }
  };

  useEffect(() => {
    loadData(settings);
  }, []);

  const handleSaveSettings = (newSettings: GasSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    showToast('success', 'Pengaturan berhasil disimpan!');
    loadData(newSettings);
  };

  // Handle Upload
  const handleUploadSubmit = async (data: UploadFormData) => {
    try {
      const res = await uploadArchive(data, settings);
      if (res.success) {
        // Tambahkan ke data state aktif
        setArchives(prev => [res.item, ...prev]);
        showToast('success', res.message);
        setActiveTab('dashboard');
        return { success: true, message: res.message };
      } else {
        showToast('error', res.message);
        return { success: false, message: res.message };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Gagal mengunggah berkas.';
      showToast('error', errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // Handle Delete
  const handleDelete = async (item: ArchiveItem) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus arsip: "${item.title}"?`);
    if (!confirmDelete) return;

    try {
      await deleteArchiveItem(item, settings);
      setArchives(prev => prev.filter(a => a.id !== item.id));
      showToast('success', 'Arsip berhasil dihapus.');
      if (previewItem?.id === item.id) {
        setPreviewItem(null);
      }
    } catch (e: any) {
      showToast('error', 'Gagal menghapus arsip.');
    }
  };

  // Calculate statistics
  const stats: ArchiveStats = useMemo(() => {
    const s: ArchiveStats = {
      total: archives.length,
      dokumen: 0,
      foto: 0,
      perDusun: {
        Pringsewu: 0,
        Gintung: 0,
        Jlegong: 0,
        Gedegan: 0
      },
      perCategory: {}
    };

    archives.forEach(item => {
      if (item.archiveType === 'Foto Kegiatan' || item.archiveType === 'Foto' as any) {
        s.foto++;
      } else {
        s.dokumen++;
      }

      if (s.perDusun[item.dusun] !== undefined) {
        s.perDusun[item.dusun]++;
      }

      s.perCategory[item.category] = (s.perCategory[item.category] || 0) + 1;
    });

    return s;
  }, [archives]);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col text-stone-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navbar Utama */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        onOpenSettings={() => setIsConfigOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top-2 fade-in">
          <div className={`p-4 rounded-xl shadow-lg border text-xs flex items-start gap-3 ${
            toast.type === 'success'
              ? 'bg-emerald-800 text-white border-emerald-900'
              : toast.type === 'error'
              ? 'bg-rose-800 text-white border-rose-900'
              : 'bg-stone-900 text-white border-stone-800'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-300" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-300" />}
            {toast.type === 'info' && <Info className="w-4 h-4 shrink-0 mt-0.5 text-sky-300" />}
            <div className="flex-1">
              <p className="font-semibold">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-white/70 hover:text-white">
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Hero Header Section */}
      <section className="relative bg-emerald-900 text-white overflow-hidden border-b border-emerald-800">
        {/* Background Image Scrim */}
        <div className="absolute inset-0 z-0 opacity-25 mix-blend-overlay">
          <img
            src={heroImg}
            alt="Pemandangan Lereng Sindoro Giripurno"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/80 to-emerald-950/90 z-0"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold tracking-wider uppercase">
                <MapPin className="w-3.5 h-3.5" />
                <span>Kecamatan Ngadirejo · Kabupaten Temanggung</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white text-balance">
                Sistem Arsip Digital Desa Giripurno
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                Pusat data terpadu berkas keputusan desa, peraturan, dan dokumentasi foto kegiatan masyarakat untuk 4 dusun: <span className="font-semibold text-white">Pringsewu, Gintung, Jlegong,</span> dan <span className="font-semibold text-white">Gedegan</span>.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => setActiveTab('upload')}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-emerald-950 bg-emerald-300 hover:bg-emerald-200 rounded-lg shadow-xs transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-emerald-900" />
                <span>Unggah Berkas Baru</span>
              </button>

              <button
                onClick={() => loadData(settings)}
                disabled={isLoading}
                className="px-3.5 py-2.5 text-xs sm:text-sm font-medium text-white bg-emerald-800/80 hover:bg-emerald-800 border border-emerald-700/60 rounded-lg transition-colors flex items-center gap-1.5"
                title="Segarkan Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Segarkan</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Tabs on Main View */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
              }`}
            >
              <FolderArchive className="w-4 h-4" />
              <span>Rekapitulasi Arsip</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Form Unggah</span>
            </button>
          </div>

          <div className="text-xs text-stone-500 hidden sm:flex items-center gap-2">
            {settings.isLiveMode ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                Tersinkronisasi Google Drive
              </span>
            ) : (
              <span className="text-amber-700 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Mode Lokal (Bebas Biaya)
              </span>
            )}
          </div>
        </div>

        {/* Tab 1: Dashboard / Rekapitulasi */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Kartu Statistik Ringkas */}
            <StatsCards
              stats={stats}
              selectedDusun={selectedDusun}
              onSelectDusun={(dusun) => setSelectedDusun(dusun)}
              selectedType={selectedType}
              onSelectType={(type) => setSelectedType(type)}
            />

            {/* Tabel & Rekapitulasi Utama */}
            <ArchiveTable
              archives={archives}
              selectedDusun={selectedDusun}
              setSelectedDusun={setSelectedDusun}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              onPreview={(item) => setPreviewItem(item)}
              onDelete={handleDelete}
            />
          </div>
        )}

        {/* Tab 2: Form Unggah Berkas */}
        {activeTab === 'upload' && (
          <div className="max-w-3xl mx-auto">
            <UploadForm
              settings={settings}
              onUploadSubmit={handleUploadSubmit}
              onCancel={() => setActiveTab('dashboard')}
            />
          </div>
        )}

        {/* Tab 3: Panduan & Pengaturan Cepat */}
        {activeTab === 'guide' && (
          <div className="bg-white rounded-xl border border-stone-200 p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-700" />
                Panduan Integrasi Google Apps Script &amp; Vercel
              </h2>
              <button
                onClick={() => setIsGuideOpen(true)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
              >
                Buka Popup Lengkap &amp; Salin Code.gs
              </button>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Aplikasi ini dirancang khusus untuk Desa Giripurno dengan model arsitektur <em>serverless &amp; zero-cost</em>: frontend statis di Vercel/GitHub dan backend Google Apps Script yang terhubung langsung ke Google Drive dan Google Sheets milik desa.
            </p>
          </div>
        )}
      </main>

      {/* Modals */}
      <FilePreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />

      <GasGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onOpenSettings={() => setIsConfigOpen(true)}
      />

      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Footer Desa */}
      <Footer
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenSettings={() => setIsConfigOpen(true)}
      />
    </div>
  );
}
