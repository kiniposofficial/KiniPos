import React from 'react';

export default function PayModal({
  showPayModal,
  setShowPayModal,
  completedTx,
  cartTotal,
  payMethod,
  setPayMethod,
  amountPaidInput,
  setAmountPaidInput,
  handleFinishTransaction,
  resetAllTx,
  formatRp,
  qrisImage,
  setQrisImage,
  storeName,
  setAppTab
}) {
  if (!showPayModal) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto font-metropolis">
        {!completedTx ? (
          <>
            <h2 className="text-lg font-extrabold text-slate-900 text-center">Pembayaran Kasir</h2>
            <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3.5 text-center">
              <span className="text-xs text-slate-500 font-semibold block">Total Tagihan</span>
              <strong className="text-2xl sm:text-3xl font-extrabold text-slate-900">{formatRp(cartTotal)}</strong>
            </div>

            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${payMethod === 'CASH' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'
                  }`}
                onClick={() => { setPayMethod('CASH'); setAmountPaidInput(cartTotal.toString()); }}
              >
                <img src="/cash.png" alt="Cash" className="w-4 h-4 object-contain" /> Tunai (Cash)
              </button>
              <button
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${payMethod === 'QRIS' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'
                  }`}
                onClick={() => { setPayMethod('QRIS'); setAmountPaidInput(cartTotal.toString()); }}
              >
                <img src="/qr-code.png" alt="QRIS" className="w-4 h-4 object-contain" /> QRIS / Non-Tunai
              </button>
            </div>

            {payMethod === 'CASH' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  <button
                    type="button"
                    className="bg-slate-100 hover:bg-slate-900 hover:text-white border border-slate-200 text-slate-800 font-bold py-2 px-1 rounded-xl text-xs transition active:scale-95 text-center truncate"
                    onClick={() => setAmountPaidInput(cartTotal.toString())}
                  >
                    Uang Pas
                  </button>
                  <button
                    type="button"
                    className="bg-slate-100 hover:bg-slate-900 hover:text-white border border-slate-200 text-slate-800 font-bold py-2 px-1 rounded-xl text-xs transition active:scale-95 text-center truncate"
                    onClick={() => setAmountPaidInput('10000')}
                  >
                    {formatRp(10000)}
                  </button>
                  <button
                    type="button"
                    className="bg-slate-100 hover:bg-slate-900 hover:text-white border border-slate-200 text-slate-800 font-bold py-2 px-1 rounded-xl text-xs transition active:scale-95 text-center truncate"
                    onClick={() => setAmountPaidInput('20000')}
                  >
                    {formatRp(20000)}
                  </button>
                  <button
                    type="button"
                    className="bg-slate-100 hover:bg-slate-900 hover:text-white border border-slate-200 text-slate-800 font-bold py-2 px-1 rounded-xl text-xs transition active:scale-95 text-center truncate"
                    onClick={() => setAmountPaidInput('50000')}
                  >
                    {formatRp(50000)}
                  </button>
                  <button
                    type="button"
                    className="bg-slate-100 hover:bg-slate-900 hover:text-white border border-slate-200 text-slate-800 font-bold py-2 px-1 rounded-xl text-xs transition active:scale-95 text-center truncate"
                    onClick={() => setAmountPaidInput('100000')}
                  >
                    {formatRp(100000)}
                  </button>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">Uang dari Pembeli:</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="input-money w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-base font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                    value={amountPaidInput ? formatRp(amountPaidInput) : ''}
                    onChange={(e) => {
                      const rawVal = e.target.value.replace(/[^0-9]/g, '');
                      setAmountPaidInput(rawVal);
                    }}
                    placeholder="Ketik nominal..."
                    autoFocus
                  />
                </div>

                {amountPaidInput !== '' && parseFloat(amountPaidInput) >= cartTotal ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex justify-between items-center">
                    <span className="text-xs font-semibold text-emerald-800">Uang Kembalian:</span>
                    <strong className="text-lg font-extrabold text-emerald-700">{formatRp(parseFloat(amountPaidInput) - cartTotal)}</strong>
                  </div>
                ) : amountPaidInput !== '' && parseFloat(amountPaidInput) < cartTotal ? (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex justify-between items-center">
                    <span className="text-xs font-semibold text-rose-800">Uang Pembayaran Kurang:</span>
                    <strong className="text-lg font-extrabold text-rose-600">{formatRp(cartTotal - (parseFloat(amountPaidInput) || 0))}</strong>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="space-y-3">
                {qrisImage ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-3 shadow-inner">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">QRIS TOKO</span>
                      <span className="text-xs font-extrabold text-slate-900">{storeName || 'Usaha Saya'}</span>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 inline-block shadow-sm">
                      <img src={qrisImage} alt="QRIS Toko" className="max-h-56 max-w-full object-contain mx-auto rounded-lg" />
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                      <span className="text-xs text-blue-800 font-semibold block">Minta pembeli scan QRIS di atas senilai:</span>
                      <strong className="text-lg font-extrabold text-blue-900 block mt-0.5">{formatRp(cartTotal)}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-center space-y-3">
                    <img src="/qr-code.png" alt="QRIS" className="w-10 h-10 object-contain mx-auto opacity-50" />
                    <div>
                      <strong className="text-sm font-bold text-slate-900 block">Belum ada Stiker QRIS Toko</strong>
                      <p className="text-xs text-slate-500 mt-0.5">Upload stiker QRIS (DANA Bisnis, BCA, GoPay, DANA, dll) di menu Pengaturan Toko.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPayModal(false);
                        if (setAppTab) setAppTab('pengaturan');
                      }}
                      className="bg-white text-slate-900 border border-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition shadow-sm inline-flex items-center gap-2"
                    >
                      <img src="/image-.png" alt="QRIS Icon" className="w-4 h-4 object-contain rounded" /> Upload Stiker QRIS Sekarang
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-2xl text-xs hover:bg-slate-200 transition"
                onClick={() => setShowPayModal(false)}
              >
                Batal
              </button>
              <button
                className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-2xl text-xs hover:bg-slate-800 transition flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                onClick={handleFinishTransaction}
              >
                <img src="/check.png" alt="Check" className="w-4 h-4 object-contain brightness-0 invert" />
                {payMethod === 'QRIS' ? 'Konfirmasi Lunas' : 'Selesai'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4 py-2">
            <img src="/check.png" alt="Sukses" className="w-12 h-12 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">Transaksi Sukses!</h2>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-600 space-y-1">
              <p>Total Belanja: <strong>{formatRp(completedTx.total)}</strong></p>
              {completedTx.payMethod === 'CASH' && <p>Bayar: <strong>{formatRp(completedTx.paid)}</strong></p>}
            </div>

            {completedTx.payMethod === 'CASH' ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <span className="text-xs font-bold text-emerald-800 block uppercase tracking-wider">UANG KEMBALIAN</span>
                <h1 className="text-3xl font-extrabold text-emerald-700 mt-1">{formatRp(completedTx.change)}</h1>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <span className="text-xs font-bold text-blue-800 block uppercase tracking-wider">METODE PEMBAYARAN</span>
                <h1 className="text-lg font-bold text-blue-900 mt-1">QRIS ({formatRp(completedTx.total)})</h1>
              </div>
            )}

            <button
              className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-md active:scale-95"
              onClick={resetAllTx}
            >
              <img src="/cashier-machine.png" alt="Kasir" className="w-4 h-4 object-contain brightness-0 invert" /> Transaksi Baru
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
