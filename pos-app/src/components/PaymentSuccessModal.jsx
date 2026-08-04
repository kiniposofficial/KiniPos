import React from 'react';

export default function PaymentSuccessModal({ isOpen, onClose, addedDays = 30 }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-slate-900 text-center relative">
        
        {/* Top Badge */}
        <span className="inline-block bg-slate-900 text-white text-[10px] font-extrabold tracking-widest px-3 py-1 rounded-full uppercase mb-3.5 shadow-sm">
          PEMBAYARAN DIVERIFIKASI
        </span>

        {/* Success Icon */}
        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          KiniPos Pro Aktif
        </h3>

        <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
          Terima kasih! Pembayaran Anda telah berhasil terverifikasi. Masa aktif Pro Anda telah bertambah <strong className="text-slate-900 font-bold">+{addedDays} Hari</strong>.
        </p>

        <div className="my-6 p-4 bg-slate-900/[0.03] rounded-2xl border border-slate-200/70 text-left space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-slate-500">
            <span className="font-medium">Status Akun</span>
            <span className="font-extrabold text-slate-900 tracking-wider">PRO MEMBER</span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span className="font-medium">Tambahan Masa Aktif</span>
            <span className="font-extrabold text-emerald-700">+{addedDays} Hari</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 px-4 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold rounded-2xl transition-all shadow-xl shadow-slate-900/10 text-xs sm:text-sm tracking-wide"
        >
          Mulai Menggunakan KiniPos Pro
        </button>

      </div>
    </div>
  );
}
