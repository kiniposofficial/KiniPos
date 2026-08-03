import React from 'react';

export default function PengaturanView({
  storeName,
  setStoreName,
  savedStoreName,
  setSavedStoreName,
  isSoundMuted,
  setIsSoundMuted,
  playSound,
  showNotification,
  user,
  setShowAuthModal,
  setAuthModalMode,
  handleLogout,
  supabase
}) {
  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <h3 className="text-base font-bold text-slate-900">Pengaturan Toko</h3>
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Usaha / Lapak:</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Nama Lapak/Toko"
            />
            <button
              type="button"
              className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-700 transition"
              onClick={async () => {
                if (!storeName.trim()) return;
                localStorage.setItem('kinipos_store_name', storeName);
                setSavedStoreName(storeName);
                if (user) {
                  try {
                    await supabase.auth.updateUser({
                      data: { store_name: storeName }
                    });
                  } catch (err) {}
                }
                playSound('success');
                showNotification('Nama toko berhasil disimpan! 🏪', 'success');
              }}
            >
              Simpan
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div>
            <strong className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <img src={isSoundMuted ? '/no-sound.png' : '/volume.png'} alt="Suara" className="w-4 h-4 object-contain" /> Suara & Efek Kasir
            </strong>
            <p className="text-xs text-slate-500">
              {isSoundMuted ? 'Suara beep & sukses MATI' : 'Suara beep & sukses AKTIF'}
            </p>
          </div>
          <button
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
              isSoundMuted ? 'bg-slate-100 text-slate-500 border-slate-300' : 'bg-emerald-500 text-white border-emerald-600'
            }`}
            onClick={() => {
              const newMuted = !isSoundMuted;
              setIsSoundMuted(newMuted);
              localStorage.setItem('kinipos_sound_muted', newMuted.toString());
              if (!newMuted) playSound('click');
              showNotification(newMuted ? 'Suara aplikasi DIMATIKAN' : 'Suara aplikasi DIAKTIFKAN', 'sound_' + (newMuted ? 'off' : 'on'));
            }}
          >
            <img
              src={isSoundMuted ? '/no-sound.png' : '/volume.png'}
              alt="Sound State"
              className={`w-3.5 h-3.5 object-contain ${isSoundMuted ? '' : 'brightness-0 invert'}`}
            />
            {isSoundMuted ? 'MATI' : 'AKTIF'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
        <h3 className="text-base font-bold text-slate-900">Akun Lapak</h3>
        {user ? (
          <div className="space-y-2">
            <p className="text-xs text-slate-600">Email: <strong className="text-slate-900">{user.email}</strong></p>
            <p className="text-xs text-slate-600">Nama Usaha: <strong className="text-slate-900">{savedStoreName}</strong></p>
            <button
              className="w-full bg-red-50 text-red-600 border border-red-200 font-bold py-2 rounded-lg text-xs hover:bg-red-100 transition mt-2 flex items-center justify-center gap-1.5"
              onClick={handleLogout}
            >
              <img src="/logout.png" alt="Logout" className="w-3.5 h-3.5 object-contain" /> Keluar Akun (Logout)
            </button>
          </div>
        ) : (
          <div>
            <button
              className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-lg text-xs hover:bg-slate-700 transition mt-1"
              onClick={() => {
                if (setAuthModalMode) setAuthModalMode('login');
                setShowAuthModal(true);
              }}
            >
              🔑 Login / Daftar Akun Lapak
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
