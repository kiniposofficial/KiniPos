import React, { useState } from 'react';

export default function KasirView({
  DEFAULT_CATEGORIES,
  selectedCategory,
  setSelectedCategory,
  filteredProducts,
  addToCart,
  cart,
  clearCart,
  updateQty,
  removeFromCart,
  setExactQty,
  fixQtyOnBlur,
  cartTotal,
  handleOpenPayModal,
  formatRp
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const displayedProducts = filteredProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start">
      {/* Products Left */}
      <div className="flex-1">
        {/* Search Bar & Category Filters */}
        <div className="space-y-2 mb-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu / produk..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1"
                title="Hapus pencarian"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {DEFAULT_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        {displayedProducts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1.5">
            <img src="/search-interface-symbol.png" alt="Cari" className="w-9 h-9 object-contain opacity-35 mb-1" />
            <p className="text-xs font-bold text-slate-600">Menu tidak ditemukan</p>
            <p className="text-[11px] text-slate-400">Coba cari dengan kata kunci lain</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {displayedProducts.map(p => {
            const isOutOfStock = !p.is_unlimited && p.stock !== null && p.stock !== undefined && p.stock <= 0;
            const inCart = cart.find(c => c.id === p.id);
            return (
              <button
                key={p.id}
                onClick={() => !isOutOfStock && addToCart(p)}
                disabled={isOutOfStock}
                className={`relative bg-white border rounded-2xl p-3.5 flex flex-col justify-between items-start text-left transition-all active:scale-[0.96] min-h-[105px] shadow-sm hover:shadow-md ${
                  isOutOfStock
                    ? 'opacity-40 grayscale cursor-not-allowed border-red-200 shadow-none'
                    : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                {/* Cart badge */}
                {inCart && (
                  <span className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                    {inCart.qty}
                  </span>
                )}

                {p.image_url && (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-20 object-contain rounded-xl mb-2 bg-slate-50 p-1"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                
                <div className="w-full">
                  <span className="text-xs font-bold text-slate-800 leading-tight block line-clamp-2">{p.name}</span>
                  {isOutOfStock && (
                    <span className="text-[10px] text-red-500 font-bold block mt-0.5">Habis</span>
                  )}
                </div>

                <span className="text-sm font-extrabold text-slate-900 mt-2">{formatRp(p.price)}</span>
              </button>
            );
          })}
        </div>
      )}
      </div>

      {/* Cart Right */}
      <div className="w-full md:w-80 bg-white border border-slate-200 rounded-2xl p-4 sticky top-16 space-y-4 shadow-sm">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <img src="/shopping-cart.png" alt="Keranjang" className="w-4 h-4 object-contain" /> Pesanan ({cart.reduce((s, i) => s + (parseInt(i.qty) || 0), 0)})
          </h3>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[11px] text-red-500 font-bold px-2 py-1 rounded-lg hover:bg-red-50 transition"
            >
              Kosongkan
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-10 text-slate-300 space-y-2 flex flex-col items-center">
            <img src="/shopping-cart.png" alt="Keranjang Kosong" className="w-10 h-10 object-contain opacity-30 grayscale" />
            <p className="text-sm font-semibold text-slate-400">Belum ada pesanan</p>
            <p className="text-xs text-slate-400">Ketuk menu untuk menambahkan</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 gap-2">
                <button
                  onClick={() => removeFromCart(item.id)}
                  title="Hapus dari keranjang"
                  className="p-1.5 rounded-lg hover:bg-red-50 transition shrink-0 active:scale-90 opacity-70 hover:opacity-100"
                >
                  <img src="/bin.png" alt="Hapus" className="w-3.5 h-3.5 object-contain" />
                </button>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">{item.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{formatRp(item.price * item.qty)}</p>
                </div>
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-0.5 shrink-0">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="w-7 h-7 flex items-center justify-center font-extrabold text-base text-slate-500 hover:bg-slate-100 rounded-lg active:scale-90 transition shrink-0"
                  >
                    −
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={item.qty}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setExactQty(item.id, val);
                    }}
                    onFocus={(e) => e.target.select()}
                    onBlur={() => fixQtyOnBlur(item.id)}
                    className="w-9 h-7 text-center font-extrabold text-xs text-slate-900 bg-slate-50 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                  />
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="w-7 h-7 flex items-center justify-center font-extrabold text-base text-slate-500 hover:bg-slate-100 rounded-lg active:scale-90 transition shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-slate-100 pt-3 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500 font-semibold">Total</span>
            <span className="text-xl font-extrabold text-slate-900">{formatRp(cartTotal)}</span>
          </div>

          <button
            onClick={handleOpenPayModal}
            disabled={cart.length === 0}
            className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl text-sm hover:bg-slate-700 active:scale-[0.97] transition disabled:opacity-30 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
          >
            <img src="/wallet.png" alt="Bayar" className="w-4 h-4 object-contain brightness-0 invert" /> Bayar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
