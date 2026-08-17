import React from 'react';

export default function ProdukView({ products, formatRp, openAddProductModal, deleteProduct }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900">Manajemen Menu ({products.length})</h3>
          <p className="text-xs text-slate-500">Kelola daftar produk & harga jual</p>
        </div>
        <button
          className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-slate-700 transition"
          onClick={() => openAddProductModal(null)}
        >
          + Tambah Menu Baru
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {products.map(p => (
          <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between space-y-3">
            <div className="flex items-start gap-3">
              {p.image_url && (
                <img src={p.image_url} alt={p.name} className="w-16 h-16 object-contain rounded-lg bg-slate-50 p-1 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">{p.category}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    p.is_unlimited ? 'bg-blue-50 text-blue-600' : (p.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600')
                  }`}>
                    {p.is_unlimited ? '∞ Unlimited' : (p.stock > 0 ? `Stok: ${p.stock}` : 'HABIS')}
                  </span>
                  {(p.pending_sync || (typeof p.id === 'string' && p.id.startsWith('offline_'))) && (
                    <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded border border-amber-200" title="Tersimpan di HP, otomatis sync saat online">
                      ⏳ Offline
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900 truncate mt-1">{p.name}</h4>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">{formatRp(p.price)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-slate-100 pt-2">
              <button
                className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                onClick={() => openAddProductModal(p)}
              >
                <img src="/edit.png" alt="Edit" className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-red-200 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                onClick={() => deleteProduct(p.id)}
              >
                <img src="/bin.png" alt="Hapus" className="w-3.5 h-3.5" /> Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
