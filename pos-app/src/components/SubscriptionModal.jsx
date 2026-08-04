import React, { useState } from 'react';
import { supabase } from '../supabase';

export default function SubscriptionModal({ isOpen, onClose, user, onSubscriptionSuccess, isExpired = false }) {
  const [plan, setPlan] = useState('monthly'); // 'monthly' | 'yearly'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const monthlyLink = import.meta.env.VITE_MIDTRANS_MONTHLY_LINK || 'https://app.sandbox.midtrans.com/payment-links/81184c9f-1b76-4e5c-bd0e-b5a67484f49a-O5fG92IZ';
  const yearlyLink = import.meta.env.VITE_MIDTRANS_YEARLY_LINK || 'https://app.sandbox.midtrans.com/payment-links/1f04ce49-2f64-4243-9ca5-f97a61452ee3-1vfGuxd4';

  const handlePayment = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const targetUrl = plan === 'monthly' ? monthlyLink : yearlyLink;

      // Open official Midtrans Payment Link page in new tab
      window.open(targetUrl, '_blank');
      setLoading(false);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal mengarahkan ke halaman pembayaran.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl border border-slate-100 text-slate-900 relative">

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
            KINI POS PRO
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            {isExpired ? 'Masa Percobaan Selesai' : 'Pilih Paket Berlangganan'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            {isExpired
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
            onClick={() => setPlan('monthly')}
            className={`p-4 rounded-2xl border text-left transition-all relative ${plan === 'monthly'
              ? 'border-slate-900 bg-slate-900/[0.03] ring-1 ring-slate-900'
              : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
          >
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bulanan</div>
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5 sm:mt-1">Rp 19.000</div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-medium">/ bulan</div>
          </button>

          <button
            type="button"
            onClick={() => setPlan('yearly')}
            className={`p-4 rounded-2xl border text-left transition-all relative ${plan === 'yearly'
              ? 'border-slate-900 bg-slate-900/[0.03] ring-1 ring-slate-900'
              : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
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
          disabled={loading}
          className="w-full py-3.5 sm:py-4 px-4 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm shadow-xl shadow-slate-900/10 tracking-wide"
        >
          {loading ? (
            <span>Memproses...</span>
          ) : (
            <span>Lanjutkan Pembayaran ({plan === 'monthly' ? 'Rp 19.000' : 'Rp 189.000'})</span>
          )}
        </button>

        <p className="text-[10px] text-center text-slate-400 mt-3 font-normal">
          Pembayaran aman & verifikasi otomatis via QRIS / Bank Transfer (Midtrans).
        </p>
      </div>
    </div>
  );
}
