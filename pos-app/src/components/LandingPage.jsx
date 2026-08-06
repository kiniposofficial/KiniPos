import React, { useState } from 'react';
import InstallGuideModal from './InstallGuideModal';

export default function LandingPage({ onOpenApp }) {
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto px-4 py-4 sm:px-8 sm:py-6 overflow-y-auto font-metropolis bg-white">
      {/* Navbar Minimalis */}
      <header className="flex justify-between items-center pb-4 border-b border-[#000000]/10">
        <div className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tight text-[#000000]">
          <img src="/kinipos_logo.png" alt="KiniPos Logo" className="w-7 h-7 object-contain" />
          <span>KiniPos</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            className="text-[#000000]/80 font-medium text-xs hover:text-[#000000] transition px-3 py-1.5 rounded-xl hover:bg-[#000000]/5"
            onClick={() => setShowInstallGuide(true)}
          >
            Cara Install
          </button>
          <button 
            className="text-[#000000] font-semibold text-xs hover:opacity-70 transition px-3 py-1.5"
            onClick={onOpenApp}
          >
            Masuk / Login
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center py-10 sm:py-16 flex flex-col items-center">
        <span className="bg-[#000000]/5 border border-[#000000]/15 text-[#000000] font-medium text-xs px-3.5 py-1.5 rounded-full mb-4 shadow-sm">
          Aplikasi Kasir Pedagang Mikro & Kedai
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold text-[#000000] tracking-tight leading-tight mb-4">
          Kasir Cepat & Praktis.<br />Tanpa Ribet.
        </h1>
        <p className="text-sm sm:text-base text-[#000000]/70 max-w-lg mb-6 leading-relaxed font-normal">
          Didesain khusus untuk kedai kopi, warung makan, booth es teh, & UMKM. Pantau omset harian langsung dari HP!
        </p>

        <div className="w-full max-w-2xl my-6 overflow-hidden rounded-3xl border border-[#000000]/15 shadow-md">
          <img 
            src="/streetbooth.jpg" 
            alt="Suasana Street Booth & Kedai" 
            className="w-full h-60 sm:h-80 object-cover object-bottom" 
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm justify-center">
          <button 
            className="flex-1 bg-[#000000] text-white font-semibold text-sm px-6 py-3.5 rounded-2xl hover:bg-slate-800 active:scale-95 transition shadow-lg shadow-[#000000]/20"
            onClick={onOpenApp}
          >
            Mulai Sekarang
          </button>
          <button 
            type="button"
            className="flex-1 bg-white border border-[#000000]/20 text-[#000000] font-semibold text-sm px-6 py-3.5 rounded-2xl hover:bg-[#000000]/5 active:scale-95 transition flex items-center justify-center gap-2 shadow-sm"
            onClick={() => setShowInstallGuide(true)}
          >
            <img src="/downloads.png" alt="Download" className="w-4 h-4 object-contain" /> Cara Install HP
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
        <div className="bg-white border border-[#000000]/10 rounded-2xl p-5 space-y-2 shadow-sm hover:border-[#000000]/30 transition">
          <h3 className="font-semibold text-base text-[#000000]">Super Cepat & Ringan</h3>
          <p className="text-xs text-[#000000]/70 leading-relaxed font-normal">Langsung terbuka di browser HP tanpa install aplikasi berat. Anti lemot.</p>
        </div>
        <div className="bg-white border border-[#000000]/10 rounded-2xl p-5 space-y-2 shadow-sm hover:border-[#000000]/30 transition">
          <h3 className="font-semibold text-base text-[#000000]">Mudah & Praktis</h3>
          <p className="text-xs text-[#000000]/70 leading-relaxed font-normal">Tampilan simpel dan ramah pemula. Kasir dan karyawan bisa langsung pakai.</p>
        </div>
        <div className="bg-white border border-[#000000]/10 rounded-2xl p-5 space-y-2 shadow-sm hover:border-[#000000]/30 transition">
          <h3 className="font-semibold text-base text-[#000000]">Pantau Omset Realtime</h3>
          <p className="text-xs text-[#000000]/70 leading-relaxed font-normal">Pemilik usaha bisa pantau pemasukan harian kapan saja dari mana saja.</p>
        </div>
      </section>

      <footer className="mt-auto pt-6 border-t border-[#000000]/10 text-center text-xs text-[#000000]/50 font-normal">
        <p>© 2026 KiniPos Micro • Dibuat Sederhana untuk UMKM Indonesia</p>
      </footer>

      {/* Modal Panduan Install */}
      <InstallGuideModal
        isOpen={showInstallGuide}
        onClose={() => setShowInstallGuide(false)}
      />
    </div>
  );
}
