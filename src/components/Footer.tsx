import React from 'react';
import { MapPin, Mail, Shield, CheckCircle, ExternalLink, Heart } from 'lucide-react';
import logoImg from '../assets/logo_giripurno.svg';

interface FooterProps {
  onOpenGuide: () => void;
  onOpenSettings: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenGuide, onOpenSettings }) => {
  return (
    <footer className="mt-16 bg-stone-900 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Identitas Desa */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-stone-700 bg-white p-1 flex items-center justify-center shrink-0">
                <img
                  src={logoImg}
                  alt="Logo Giripurno Mulyo"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  PEMERINTAH DESA GIRIPURNO
                </h3>
                <p className="text-xs text-emerald-400 font-medium">
                  Kecamatan Ngadirejo · Kabupaten Temanggung · Jawa Tengah
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed max-w-md">
              Sistem Informasi Arsip Digital Resmi Desa Giripurno untuk pengelolaan, penyimpanan aman, dan rekapitulasi dokumen kedinasan serta dokumentasi foto kegiatan masyarakat 4 dusun di lereng Gunung Sindoro.
            </p>

            <div className="space-y-1.5 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Kantor Balai Desa Giripurno, Kec. Ngadirejo, Kab. Temanggung, 56257</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>giripurnopemerintah@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Wilayah 4 Dusun */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-200 mb-3">
              Wilayah 4 Dusun
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Dusun Pringsewu</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Dusun Gintung</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Dusun Jlegong</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Dusun Gedegan</span>
              </li>
            </ul>
          </div>

          {/* Navigasi Teknis */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-200 mb-3">
              Infrastruktur &amp; Bantuan
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={onOpenGuide}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Panduan Google Apps Script
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSettings}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Pengaturan URL Web App
                </button>
              </li>
              <li>
                <span className="text-stone-400">Penyimpanan: Google Drive</span>
              </li>
              <li>
                <span className="text-stone-400">Basis Data: Google Sheets</span>
              </li>
              <li>
                <span className="text-stone-400">Frontend: GitHub + Vercel</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Baris Bawah */}
        <div className="mt-10 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>
            &copy; {new Date().getFullYear()} Pemerintah Desa Giripurno. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Kecamatan Ngadirejo</span>
            <span aria-hidden="true">·</span>
            <span>Kabupaten Temanggung</span>
            <span aria-hidden="true">·</span>
            <span>Jawa Tengah 56257</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
