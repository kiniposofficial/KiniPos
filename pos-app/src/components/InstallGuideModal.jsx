import React, { useState } from 'react';

export default function InstallGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('android'); // 'android' | 'ios'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#000000]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border border-[#000000]/15 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto font-metropolis">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#000000]/40 hover:text-[#000000] p-2 rounded-full hover:bg-[#000000]/5 transition-colors text-sm"
        >
          ✕
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <span className="inline-block bg-[#000000]/5 border border-[#000000]/15 text-[#000000] text-[10px] font-semibold tracking-widest px-3 py-1 rounded-full uppercase mb-2">
            PWA APP INSTALL
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#000000] tracking-tight">
            Cara Install KiniPos di HP
          </h2>
          <p className="text-xs text-[#000000]/60 mt-1 font-normal">
            Gunakan KiniPos seperti aplikasi biasa langsung dari layar utama HP Anda (Tanpa PlayStore / AppStore).
          </p>
        </div>

        {/* Device Tabs */}
        <div className="flex bg-[#000000]/5 p-1 rounded-2xl mb-6 border border-[#000000]/10">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 ${
              activeTab === 'android' ? 'bg-[#000000] text-white shadow-sm' : 'text-[#000000]/60 hover:text-[#000000]'
            }`}
          >
            <img src="/android.png" alt="Android" className={`w-4 h-4 object-contain ${activeTab === 'android' ? 'brightness-0 invert' : ''}`} /> Android (Chrome)
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 ${
              activeTab === 'ios' ? 'bg-[#000000] text-white shadow-sm' : 'text-[#000000]/60 hover:text-[#000000]'
            }`}
          >
            <img src="/apple.png" alt="Apple" className={`w-4 h-4 object-contain ${activeTab === 'ios' ? 'brightness-0 invert' : ''}`} /> iPhone (Safari)
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'android' ? (
          <div className="space-y-4 text-xs font-normal">
            <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="w-6 h-6 rounded-full bg-[#000000] text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
              <div>
                <strong className="text-[#000000] block font-semibold mb-0.5">Buka Browser Chrome</strong>
                <p className="text-[#000000]/70">Buka link <span className="font-mono font-medium text-[#000000] bg-white px-1.5 py-0.5 rounded border border-slate-200">kinipos.com</span> di Google Chrome HP Android Anda.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="w-6 h-6 rounded-full bg-[#000000] text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
              <div>
                <strong className="text-[#000000] block font-semibold mb-0.5">Klik Opsi Titik Tiga (⋮)</strong>
                <p className="text-[#000000]/70">Ketuk ikon titik tiga <strong className="text-[#000000] font-semibold">⋮</strong> di sudut kanan atas layar Chrome.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="w-6 h-6 rounded-full bg-[#000000] text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
              <div>
                <strong className="text-[#000000] block font-semibold mb-0.5">Pilih "Tambahkan ke Layar Utama"</strong>
                <p className="text-[#000000]/70">Pilih menu <strong className="text-[#000000] font-semibold">"Tambahkan ke Layar Utama"</strong> (atau <i>"Install Aplikasi"</i>).</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">✓</span>
              <div>
                <strong className="block font-semibold mb-0.5">Selesai!</strong>
                <p className="text-emerald-700">Icon KiniPos akan muncul di beranda HP Anda dan bisa dibuka kapan saja seperti aplikasi biasa.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs font-normal">
            <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="w-6 h-6 rounded-full bg-[#000000] text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
              <div>
                <strong className="text-[#000000] block font-semibold mb-0.5">Buka Browser Safari</strong>
                <p className="text-[#000000]/70">Buka link <span className="font-mono font-medium text-[#000000] bg-white px-1.5 py-0.5 rounded border border-slate-200">kinipos.com</span> di browser Safari bawaan iPhone.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="w-6 h-6 rounded-full bg-[#000000] text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
              <div>
                <strong className="text-[#000000] block font-semibold mb-0.5">Klik Tombol Share (⎋)</strong>
                <p className="text-[#000000]/70">Ketuk ikon <strong className="text-[#000000] font-semibold">Share</strong> (kotak dengan panah ke atas) di bagian bawah layar.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="w-6 h-6 rounded-full bg-[#000000] text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
              <div>
                <strong className="text-[#000000] block font-semibold mb-0.5">Pilih "Add to Home Screen"</strong>
                <p className="text-[#000000]/70">Geser ke bawah dan ketuk menu <strong className="text-[#000000] font-semibold">"Add to Home Screen"</strong> (<i>Tambahkan ke Layar Utama</i>).</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">✓</span>
              <div>
                <strong className="block font-semibold mb-0.5">Selesai!</strong>
                <p className="text-emerald-700">Icon KiniPos siap digunakan di layar utama iPhone Anda tanpa makan banyak memori.</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 bg-[#000000] hover:bg-slate-800 text-white font-semibold py-3.5 rounded-2xl transition text-xs sm:text-sm shadow-md"
        >
          Tutup Panduan
        </button>

      </div>
    </div>
  );
}
