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
  const [previewUrl, setPreviewUrl] = React.useState(null);

  React.useEffect(() => {
    setPreviewUrl(null);
  }, [showAddProductModal, editingProduct]);

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
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Foto Menu (Opsional):</label>
            {editingProduct && (editingProduct.image_url || previewUrl) ? (
              <div className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-2.5 flex items-center gap-3">
                <img
                  src={previewUrl || editingProduct.image_url}
                  alt="Preview Menu"
                  className="w-14 h-14 object-cover rounded-lg shadow-sm border border-slate-200 bg-white"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-800 block truncate">
                    {previewUrl ? 'Foto Baru Dipilih' : 'Foto Menu Terpasang'}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5 flex items-center gap-1">
                    ✓ Siap Di-upload
                  </span>
                </div>
                <label className="cursor-pointer bg-white text-slate-800 border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition active:scale-95">
                  Ganti
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setNewProdImageFile(file);
                        setPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              </div>
            ) : previewUrl ? (
              <div className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-2.5 flex items-center gap-3">
                <img
                  src={previewUrl}
                  alt="Preview Menu"
                  className="w-14 h-14 object-cover rounded-lg shadow-sm border border-slate-200 bg-white"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-800 block truncate">
                    Foto Baru Dipilih
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
                    ✓ Siap Di-upload
                  </span>
                </div>
                <label className="cursor-pointer bg-white text-slate-800 border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition active:scale-95">
                  Ganti
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setNewProdImageFile(file);
                        setPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl p-4 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-slate-50 hover:bg-slate-100/80 group">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center group-hover:scale-105 transition">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Upload Foto Menu</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Format JPG / PNG (Maks 5MB)</span>
                </div>
                <span className="bg-white text-slate-900 border border-slate-200 font-bold text-xs px-3.5 py-1.5 rounded-lg mt-0.5 shadow-sm flex items-center gap-1.5 hover:bg-slate-50 transition">
                  <img src="/image-.png" alt="Upload" className="w-3.5 h-3.5 object-contain" /> Pilih Foto
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setNewProdImageFile(file);
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
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
