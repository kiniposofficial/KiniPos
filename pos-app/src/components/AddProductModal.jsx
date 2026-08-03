import React from 'react';

export default function AddProductModal({
  showAddProductModal,
  setShowAddProductModal,
  editingProduct,
  handleSaveProduct,
  newProdName,
  setNewProdName,
  newProdPrice,
  setNewProdPrice,
  newProdCost,
  setNewProdCost,
  newProdCategory,
  setNewProdCategory,
  isUnlimitedStock,
  setIsUnlimitedStock,
  stockQty,
  setStockQty,
  setNewProdImageFile,
  uploadingImage,
  DEFAULT_CATEGORIES,
  formatRp
}) {
  if (!showAddProductModal) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          {editingProduct ? <><img src="/edit.png" alt="Edit" className="w-5 h-5" /> Edit Menu</> : '+ Tambah Menu Baru'}
        </h2>
        <form onSubmit={handleSaveProduct} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Menu:</label>
            <input
              type="text"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              required
              value={newProdName}
              onChange={(e) => setNewProdName(e.target.value)}
              placeholder="Misal: Es Teh Jumbo"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Harga Jual:</label>
            <input
              type="text"
              inputMode="numeric"
              className="input-money"
              required
              value={newProdPrice ? formatRp(newProdPrice) : ''}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, '');
                setNewProdPrice(raw);
              }}
              placeholder="Rp 0"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Harga Modal / HPP (Opsional):</label>
            <input
              type="text"
              inputMode="numeric"
              className="input-money"
              value={newProdCost ? formatRp(newProdCost) : ''}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, '');
                setNewProdCost(raw);
              }}
              placeholder="Rp 0 (untuk hitung profit)"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Kategori:</label>
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              value={newProdCategory}
              onChange={(e) => setNewProdCategory(e.target.value)}
            >
              {DEFAULT_CATEGORIES.filter(c => c !== 'Semua').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Tipe Stok:</label>
            <div className="flex gap-2">
              <button
                type="button"
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition ${
                  isUnlimitedStock ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
                onClick={() => setIsUnlimitedStock(true)}
              >
                ∞ Tak Terbatas
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition ${
                  !isUnlimitedStock ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
                onClick={() => setIsUnlimitedStock(false)}
              >
                📦 Terbatas
              </button>
            </div>
          </div>

          {!isUnlimitedStock && (
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Jumlah Stok Tersedia:</label>
              <input
                type="number"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                required={!isUnlimitedStock}
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                placeholder="Misal: 25"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Foto Menu (Opsional):</label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
              onChange={(e) => setNewProdImageFile(e.target.files[0])}
            />
            {editingProduct && editingProduct.image_url && (
              <small className="text-[11px] text-slate-400 block mt-1">
                *Foto saat ini sudah terpasang. Pilih file baru jika ingin mengganti.
              </small>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-sm hover:bg-slate-200 transition" onClick={() => setShowAddProductModal(false)}>Batal</button>
            <button type="submit" className="flex-1 bg-slate-900 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-slate-700 transition disabled:opacity-50" disabled={uploadingImage}>
              {uploadingImage ? 'Uploading...' : (editingProduct ? 'Perbarui Menu' : 'Simpan Menu')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
