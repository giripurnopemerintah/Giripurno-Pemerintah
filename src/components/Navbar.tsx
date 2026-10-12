import React, { useState } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Settings, 
  HelpCircle, 
  Menu, 
  X, 
  FolderArchive,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { GasSettings } from '../types/archive';
import logoImg from '../assets/logo_giripurno.svg';

interface NavbarProps {
  activeTab: 'dashboard' | 'upload' | 'guide';
  setActiveTab: (tab: 'dashboard' | 'upload' | 'guide') => void;
  settings: GasSettings;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  onOpenSettings,
  onOpenGuide
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-stone-200 shadow-xs bg-white shrink-0 p-1 flex items-center justify-center">
              <img
                src={logoImg}
                alt="Logo Giripurno Mulyo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-sky-700 text-white font-bold text-xs -z-10">
                GM
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-stone-900 leading-tight">
                ARSIP DESA GIRIPURNO
              </span>
              <span className="text-xs text-stone-500 font-medium hidden sm:inline-block">
                Giripurno Mulyo · Kec. Ngadirejo, Kab. Temanggung
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-emerald-700" />
                Daftar Arsip
              </span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'upload'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-emerald-700" />
                Unggah Berkas
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('guide');
                onOpenGuide();
              }}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'guide'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-700" />
                Panduan &amp; Kode GAS
              </span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions & Connection State */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200"
              title="Pengaturan Koneksi Google Apps Script"
            >
              {settings.isLiveMode && settings.webAppUrl ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-emerald-800 font-semibold">Live Google Drive</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Mode Lokal / Demo</span>
                </>
              )}
              <Settings className="w-3.5 h-3.5 ml-1 text-stone-500" />
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Unggah Arsip</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="p-2 text-stone-600 hover:text-stone-900 rounded-lg bg-stone-100 border border-stone-200"
              aria-label="Pengaturan"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-stone-900 rounded-lg hover:bg-stone-100 focus:outline-none"
              aria-label="Toggle menu navigasi"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <div className="px-3 py-2 mb-2 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between text-xs">
            <span className="text-stone-600">Status Penyimpanan:</span>
            <span className={`font-semibold flex items-center gap-1 ${settings.isLiveMode ? 'text-emerald-700' : 'text-amber-700'}`}>
              <span className={`w-2 h-2 rounded-full ${settings.isLiveMode ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              {settings.isLiveMode ? 'Terhubung Google Drive' : 'Penyimpanan Lokal'}
            </span>
          </div>

          <button
            onClick={() => {
              setActiveTab('dashboard');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left ${
              activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <FolderArchive className="w-4 h-4 text-emerald-700" />
            Daftar Rekap Arsip
          </button>

          <button
            onClick={() => {
              setActiveTab('upload');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left ${
              activeTab === 'upload' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-emerald-700" />
            Form Unggah Arsip
          </button>

          <button
            onClick={() => {
              onOpenGuide();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100 text-left"
          >
            <HelpCircle className="w-4 h-4 text-emerald-700" />
            Panduan &amp; Kode Apps Script (Code.gs)
          </button>

          <button
            onClick={() => {
              onOpenSettings();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100 text-left"
          >
            <Settings className="w-4 h-4 text-stone-600" />
            Pengaturan URL Google Apps Script
          </button>
        </div>
      )}
    </header>
  );
};
