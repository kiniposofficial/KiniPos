import React, { useState } from 'react';
import { supabase } from '../supabase';

export default function SubscriptionModal({ isOpen, onClose, user, onSubscriptionSuccess, isExpired = false, subInfo, onLogout }) {
  const [plan, setPlan] = useState('monthly'); // 'monthly' | 'yearly'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isAlreadyProActive = subInfo?.isSubscribed && (subInfo?.daysLeft > 5);

  const monthlyLink = import.meta.env.VITE_MIDTRANS_MONTHLY_LINK || 'https://app.midtrans.com/payment-links/b91be6ad-a714-4557-8731-e570790dd461-6JhGlhaK';
  const yearlyLink = import.meta.env.VITE_MIDTRANS_YEARLY_LINK || 'https://app.midtrans.com/payment-links/c6401c0e-53b1-447e-b76b-8c3f938430d0-C9s3AmKZ';

  const handlePayment = async () => {
    if (isAlreadyProActive) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const targetUrl = plan === 'monthly' ? monthlyLink : yearlyLink;

      // Open official Midtrans Payment Link page in new tab
      window.open(targetUrl, '_blank');
      setLoading(false);
      onClose();
    } catch (err) {
      console.error('Payment redirect error:', err);
      setErrorMsg('Gagal membuka halaman pembayaran. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">

        {/* Close Button (Only if NOT expired) */}
        {!isExpired && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors text-sm z-10"
          >
            ✕
          </button>
        )}

        <div className="text-center mb-5 sm:mb-6">
          <span className="inline-block bg-slate-900 text-white text-[10px] font-extrabold tracking-widest px-3 py-1 rounded-full uppercase mb-2.5 shadow-sm">
            {isAlreadyProActive ? 'PRO MEMBER AKTIF' : 'KINI POS PRO'}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            {isAlreadyProActive
              ? 'Status Pro Anda Masih Aktif'
              : isExpired
                ? 'Masa Percobaan Selesai'
                : 'Pilih Paket Berlangganan'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            {isAlreadyProActive
              ? `Sisa langganan Anda saat ini: ${subInfo?.daysLeft} Hari. Pembayaran perpanjangan terkunci hingga H-5 kedaluwarsa.`
              : isExpired
                ? 'Lanjutkan pengelolaan transaksi & laporan keuangan tanpa batas.'
                : 'Nikmati akses penuh fitur kasir digital tanpa batasan.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Plan Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => !isAlreadyProActive && setPlan('monthly')}
            disabled={isAlreadyProActive}
            className={`p-4 rounded-2xl border text-left transition-all relative ${plan === 'monthly'
                ? 'border-slate-900 bg-slate-900/[0.03] ring-1 ring-slate-900'
                : 'border-slate-200 hover:border-slate-300 bg-white'
              } ${isAlreadyProActive ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bulanan</div>
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5 sm:mt-1">Rp 19.000</div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-medium">/ bulan</div>
          </button>

          <button
            type="button"
            onClick={() => !isAlreadyProActive && setPlan('yearly')}
            disabled={isAlreadyProActive}
            className={`p-4 rounded-2xl border text-left transition-all relative ${plan === 'yearly'
                ? 'border-slate-900 bg-slate-900/[0.03] ring-1 ring-slate-900'
                : 'border-slate-200 hover:border-slate-300 bg-white'
              } ${isAlreadyProActive ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <span className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              Hemat 17%
            </span>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tahunan</div>
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5 sm:mt-1">Rp 189.000</div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Rp 15.750 / bln</div>
          </button>
        </div>

        {/* Feature List */}
        <div className="space-y-2.5 mb-6 text-xs text-slate-600 border-t border-slate-100 pt-4 sm:pt-5">
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-slate-900 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Transaksi Kasir POS Tanpa Batas</span>
          </div>
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-slate-900 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Laporan Penjualan & Profit Real-time</span>
          </div>
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-slate-900 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Manajemen Produk & Stok Otomatis</span>
          </div>
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-slate-900 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Backup Data Cloud (Multi-Device)</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handlePayment}
          disabled={loading || isAlreadyProActive}
          className={`w-full py-3.5 sm:py-4 px-4 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wide ${isAlreadyProActive
              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
              : 'bg-slate-900 hover:bg-slate-800 active:bg-black text-white shadow-xl shadow-slate-900/10 disabled:opacity-50'
            }`}
        >
          {loading ? (
            <span>Memproses...</span>
          ) : isAlreadyProActive ? (
            <span>Status PRO Masih Aktif ({subInfo?.daysLeft} Hari Lagi)</span>
          ) : (
            <span>Lanjutkan Pembayaran ({plan === 'monthly' ? 'Rp 19.000' : 'Rp 189.000'})</span>
          )}
        </button>

        <p className="text-[10px] text-center text-slate-400 mt-3 font-normal">
          {isAlreadyProActive
            ? 'Pembayaran baru dapat dilakukan saat sisa masa berlangganan kurang dari 5 hari.'
            : 'Pembayaran aman & verifikasi otomatis via QRIS / Bank Transfer (Midtrans).'}
        </p>

        {/* Logout Option */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500 font-medium truncate">
            {user?.email ? `Akun: ${user.email}` : 'Akun Kasir'}
          </span>
          {onLogout && (
            <button
              type="button"
              onClick={() => {
                onClose && onClose();
                onLogout();
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shrink-0"
            >
              🚪 Keluar Akun
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
