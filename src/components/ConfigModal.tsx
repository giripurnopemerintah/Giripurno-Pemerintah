import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  HelpCircle, 
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { GasSettings } from '../types/archive';
import { testGasConnection } from '../services/gasService';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GasSettings;
  onSaveSettings: (settings: GasSettings) => void;
  onOpenGuide: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onOpenGuide
}) => {
  const [webAppUrl, setWebAppUrl] = useState(settings.webAppUrl || '');
  const [isLiveMode, setIsLiveMode] = useState(settings.isLiveMode ?? false);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState(settings.spreadsheetUrl || '');
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!webAppUrl.trim()) {
      setTestResult({
        success: false,
        message: 'Masukkan URL Web App terlebih dahulu sebelum menguji koneksi.'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await testGasConnection(webAppUrl.trim());
      setTestResult(res);
      if (res.success) {
        setIsLiveMode(true);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Gagal menghubungi server Apps Script.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveSettings({
      webAppUrl: webAppUrl.trim(),
      isLiveMode: isLiveMode && Boolean(webAppUrl.trim()),
      spreadsheetUrl: spreadsheetUrl.trim(),
      lastSyncTimestamp: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-lg w-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-start justify-between gap-3 bg-stone-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                Konfigurasi Penyimpanan
              </span>
              <h3 className="text-base font-bold text-stone-900 leading-snug">
                Integrasi Google Apps Script &amp; Drive
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

        {/* Form Body */}
        <div className="p-6 space-y-5 text-xs text-stone-700">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-stone-800 mb-1.5">
              URL Web App Google Apps Script
            </label>
            <input
              type="url"
              value={webAppUrl}
              onChange={(e) => {
                setWebAppUrl(e.target.value);
                setTestResult(null);
              }}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 font-mono"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              Dihasilkan dari menu <em>Deploy &gt; New deployment &gt; Web App</em> di Google Apps Script editor.
            </p>
          </div>

          {/* Test Button & Result */}
          <div className="space-y-2">
            <button
              type="button"
              disabled={isTesting || !webAppUrl.trim()}
              onClick={handleTestConnection}
              className="px-3.5 py-2 rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                  <span>Menguji Koneksi ke Google...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Uji Koneksi (Test Ping)</span>
                </>
              )}
            </button>

            {testResult && (
              <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-semibold">{testResult.success ? 'Koneksi Sukses!' : 'Koneksi Gagal'}</p>
                  <p className="text-[11px] leading-relaxed">{testResult.message}</p>
                  {!testResult.success && (
                    <p className="text-[11px] text-rose-700 underline cursor-pointer" onClick={onOpenGuide}>
                      Buka panduan pengaturan akses Apps Script &rarr;
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mode Switcher */}
          <div className="pt-3 border-t border-stone-200 space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isLiveMode}
                onChange={(e) => setIsLiveMode(e.target.checked)}
                disabled={!webAppUrl.trim()}
                className="w-4 h-4 text-emerald-700 rounded border-stone-300 focus:ring-emerald-600"
              />
              <div>
                <span className="font-semibold text-stone-900 block">
                  Aktifkan Mode Live (Google Drive &amp; Sheets)
                </span>
                <span className="text-[11px] text-stone-500 block">
                  Jika dinonaktifkan atau offline, sistem otomatis menyimpan ke penyimpanan lokal browser.
                </span>
              </div>
            </label>
          </div>

          {/* Quick Help Link */}
          <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between">
            <span className="text-[11px] text-stone-600">Belum punya Web App Google Apps Script?</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenGuide();
              }}
              className="text-emerald-700 font-semibold text-xs hover:underline"
            >
              Lihat Tutorial
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
          >
            Simpan Konfigurasi
          </button>
        </div>
      </div>
    </div>
  );
};
