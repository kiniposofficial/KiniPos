import React, { useState } from 'react';

export default function LaporanView({ history, sendWhatsappReceipt, handleCancelTransaction, formatRp }) {
  const [filterType, setFilterType] = useState('today');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const getTxDateObj = (tx) => {
    if (tx.created_at) return new Date(tx.created_at);
    if (tx.timestamp) return new Date(tx.timestamp);
    if (tx.id?.startsWith('TX-')) {
      const rawNum = tx.id.replace('TX-', '');
      const ts = parseInt(rawNum, 10);
      if (!isNaN(ts) && ts > 1000000000000) return new Date(ts);
    }
    // Parse Indonesian formatted date string if created_at/timestamp not present (e.g. "Jumat, 31 Juli 2026 18.43")
    if (tx.date && typeof tx.date === 'string') {
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      for (let i = 0; i < months.length; i++) {
        if (tx.date.includes(months[i])) {
          const match = tx.date.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
          if (match) {
            const day = parseInt(match[1], 10);
            const year = parseInt(match[3], 10);
            return new Date(year, i, day);
          }
        }
      }
      const d = new Date(tx.date);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date(0);
  };

  const getLocalDateStr = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isToday = (tx) => {
    const d = getTxDateObj(tx);
    const today = new Date();
    return getLocalDateStr(d) === getLocalDateStr(today);
  };

  const isThisMonth = (tx) => {
    const d = getTxDateObj(tx);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  };

  const isThisYear = (tx) => {
    const d = getTxDateObj(tx);
    const now = new Date();
    return d.getFullYear() === now.getFullYear();
  };

  const isSpecificDate = (tx) => {
    if (!selectedDate) return true;
    const d = getTxDateObj(tx);
    return getLocalDateStr(d) === selectedDate;
  };

  const filteredHistory = history.filter(tx => {
    if (filterType === 'today') return isToday(tx);
    if (filterType === 'month') return isThisMonth(tx);
    if (filterType === 'year') return isThisYear(tx);
    if (filterType === 'all') return true;
    if (filterType === 'custom') return isSpecificDate(tx);
    return true;
  });
  const totalOmset = filteredHistory.reduce((s, tx) => s + tx.total, 0);
  const totalProfit = filteredHistory.reduce((s, tx) => {
    if (tx.profit !== undefined && tx.profit !== null) return s + tx.profit;
    const cost = tx.costTotal || 0;
    return s + (tx.total - cost);
  }, 0);
  const totalCash = filteredHistory.filter(tx => tx.payMethod !== 'QRIS').reduce((s, tx) => s + tx.total, 0);
  const totalQris = filteredHistory.filter(tx => tx.payMethod === 'QRIS').reduce((s, tx) => s + tx.total, 0);

  // Hitung Produk Terlaris (Top 3)
  const productSales = {};
  filteredHistory.forEach(tx => {
    tx.items.forEach(item => {
      if (!productSales[item.name]) {
        productSales[item.name] = 0;
      }
      productSales[item.name] += item.qty;
    });
  });

  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const formatDateIndo = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
  };

  const getPeriodLabel = () => {
    if (filterType === 'today') return 'Hari Ini';
    if (filterType === 'month') return 'Bulan Ini';
    if (filterType === 'year') return 'Tahun Ini';
    if (filterType === 'all') return 'Semua Waktu';
    if (filterType === 'custom') return formatDateIndo(selectedDate);
    return '';
  };

  const btnBase = 'w-full py-2 px-2.5 rounded-lg text-xs font-semibold transition-all text-center flex items-center justify-center active:scale-[0.97]';

  return (
    <div className="space-y-4">
      {/* Period tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
        {[
          { key: 'today', label: 'Hari Ini' },
          { key: 'month', label: 'Bulan Ini' },
          { key: 'year', label: 'Tahun Ini' },
          { key: 'custom', label: 'Pilih Tanggal' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilterType(key)}
            className={`${btnBase} ${filterType === key ? 'bg-white shadow-sm text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {filterType === 'custom' && (
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
          <label className="text-xs font-semibold text-slate-500 shrink-0">Pilih Tanggal:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
          />
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs text-slate-500 font-semibold mb-1">
            Omset Penjualan ({getPeriodLabel()})
          </p>
          <p className="text-2xl font-extrabold text-slate-900 leading-tight">{formatRp(totalOmset)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Total uang penjualan masuk</p>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4">
          <p className="text-xs text-emerald-800 font-semibold mb-1">
            Keuntungan Bersih (Profit)
          </p>
          <p className="text-2xl font-extrabold text-emerald-600 leading-tight">{formatRp(totalProfit)}</p>
          <p className="text-[11px] text-emerald-600/80 mt-1">Omset dikurangi HPP (Modal)</p>
        </div>

        <div className="bg-white border border-blue-200 rounded-2xl p-4">
          <p className="text-xs text-slate-500 font-semibold mb-1">Total Pelanggan</p>
          <p className="text-2xl font-extrabold text-blue-600 leading-tight">{filteredHistory.length} Transaksi</p>
          <p className="text-[11px] text-slate-400 mt-1">Jumlah pesanan berhasil</p>
        </div>
      </div>

      {/* Payment breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3">
          <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
            <img src="/cash.png" alt="Cash" className="w-4 h-4" /> Cash (Tunai)
          </p>
          <p className="text-base font-bold text-slate-900">{formatRp(totalCash)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3">
          <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
            <img src="/qr-code.png" alt="QRIS" className="w-4 h-4" /> QRIS / Non-Tunai
          </p>
          <p className="text-base font-bold text-slate-900">{formatRp(totalQris)}</p>
        </div>
      </div>

      {/* Top 3 Produk Terlaris */}
      {topProducts.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <span>🔥</span> Top Menu Terlaris ({filterType === 'today' ? 'Hari Ini' : formatDateIndo(selectedDate)})
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {topProducts.map(([name, qty], index) => (
              <div key={name} className="bg-white border border-slate-200 rounded-lg p-2 text-center">
                <span className="text-[10px] font-bold text-slate-400 block">#{index + 1}</span>
                <p className="text-xs font-bold text-slate-800 truncate leading-tight mt-0.5">{name}</p>
                <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">{qty} terjual</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History list */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-2">Riwayat Transaksi</h3>
        {filteredHistory.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Belum ada transaksi di periode ini.</p>
        ) : (
          <div className="space-y-2">
            {filteredHistory.map((tx, idx) => (
              <div key={tx.id} className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex justify-between items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900">Pelanggan #{filteredHistory.length - idx}</span>
                    <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <img src={tx.payMethod === 'QRIS' ? '/qr-code.png' : '/cash.png'} alt="" className="w-3 h-3" />
                      {tx.payMethod === 'QRIS' ? 'QRIS' : 'Cash'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{tx.items.map(i => `${i.name} x${i.qty}`).join(', ')}</p>
                  <p className="text-[11px] text-slate-400">{tx.date}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-sm font-extrabold text-slate-900">{formatRp(tx.total)}</span>
                  <button
                    onClick={() => handleCancelTransaction(tx.id)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-red-500 border border-red-200 rounded-lg px-2 py-1 hover:bg-red-50 transition"
                  >
                    <img src="/bin.png" alt="Batal" className="w-3 h-3" /> Batal
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
