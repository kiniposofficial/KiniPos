import React from 'react';

export default function LandingPage({ onOpenApp }) {
  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto px-4 py-4 sm:px-8 sm:py-6 overflow-y-auto">
      {/* Navbar Minimalis */}
      <header className="flex justify-between items-center pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 font-black text-lg sm:text-xl tracking-tight text-slate-900">
          <img src="/kinipos_logo.png" alt="KiniPos Logo" className="w-7 h-7 object-contain" />
          <span>KiniPos</span>
        </div>
        <button 
          className="text-slate-700 font-bold text-xs hover:text-slate-900 transition px-2 py-1"
          onClick={onOpenApp}
        >
          Masuk / Login
        </button>
      </header>

      {/* Hero Section */}
      <section className="text-center py-10 sm:py-16 flex flex-col items-center">
        <span className="bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs px-3 py-1 rounded-full mb-4">
          Aplikasi Kasir Pedagang Mikro & Kedai
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
          Kasir Cepat & Praktis.<br />Tanpa Ribet.
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-lg mb-6">
          Didesain khusus untuk kedai kopi, warung makan, booth es teh, & UMKM. Pantau omset harian langsung dari HP!
        </p>

        <div className="w-full max-w-2xl my-6 overflow-hidden rounded-3xl border border-slate-200/80 shadow-sm">
          <img 
            src="/streetbooth.jpg" 
            alt="Suasana Street Booth & Kedai" 
            className="w-full h-60 sm:h-80 object-cover object-bottom" 
          />
        </div>

        <div>
          <button 
            className="bg-slate-900 text-white font-bold text-sm px-8 py-3.5 rounded-xl hover:bg-slate-700 active:scale-95 transition shadow-lg"
            onClick={onOpenApp}
          >
            Mulai Sekarang
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
          <h3 className="font-bold text-base text-slate-900">Super Cepat & Ringan</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Langsung terbuka di browser HP tanpa install aplikasi berat. Anti lemot.</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
          <h3 className="font-bold text-base text-slate-900">Mudah & Praktis</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Tampilan simpel dan ramah pemula. Kasir dan karyawan bisa langsung pakai.</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
          <h3 className="font-bold text-base text-slate-900">Pantau Omset Realtime</h3>
          <p className="text-xs text-slate-500 leading-relaxed">Pemilik usaha bisa pantau pemasukan harian kapan saja dari mana saja.</p>
        </div>
      </section>

      <footer className="mt-auto pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
        <p>© 2026 KiniPos Micro • Dibuat Sederhana untuk UMKM Indonesia</p>
      </footer>
    </div>
  );
}
