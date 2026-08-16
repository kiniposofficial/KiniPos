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
  supabase,
  subInfo,
  setShowSubscriptionModal,
  onOpenInstallGuide,
  qrisImage,
  setQrisImage
}) {
  return (
    <div className="space-y-4 max-w-xl mx-auto font-metropolis">

      {/* Status Langganan / Membership Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/bell.png" alt="Pro" className="w-4 h-4 object-contain brightness-0" />
            <h3 className="text-base font-extrabold text-slate-900">Status Keanggotaan</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${subInfo?.isSubscribed
              ? 'bg-slate-900 text-white shadow-sm'
              : subInfo?.isExpired
                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
            {subInfo?.isSubscribed ? 'PRO MEMBER' : subInfo?.isExpired ? 'EXPIRED' : 'TRIAL MEMBER'}
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-slate-500">
            <span className="font-medium">Tipe Akses Lapak</span>
            <strong className="text-slate-900 font-bold">{subInfo?.isSubscribed ? 'KiniPos Pro (Akses Penuh)' : 'Uji Coba Gratis (Trial)'}</strong>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span className="font-medium">Sisa Masa Aktif</span>
            <strong className="text-slate-900 font-bold">{subInfo?.text}</strong>
          </div>
          {(() => {
            const untilStr = user?.user_metadata?.subscribed_until;
            let validDate = null;
            if (untilStr) {
              validDate = new Date(untilStr);
            } else if (user?.created_at) {
              validDate = new Date(new Date(user.created_at).getTime() + 30 * 24 * 60 * 60 * 1000);
            }
            if (!validDate) return null;
            return (
              <div className="flex justify-between items-center text-slate-500 pt-2 border-t border-slate-200/60">
                <span className="font-medium">Berlaku Hingga</span>
                <strong className="text-slate-900 font-extrabold">
                  {validDate.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </strong>
              </div>
            );
          })()}
        </div>

        <button
          type="button"
          onClick={() => setShowSubscriptionModal && setShowSubscriptionModal(true)}
          className="w-full py-3 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200/90 hover:border-slate-300 text-slate-900 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
        >
          <img src="/bell.png" alt="Pro" className="w-3.5 h-3.5 object-contain brightness-0" />
          <span>{subInfo?.isSubscribed ? 'Kelola / Perpanjang Masa Pro' : 'Upgrade ke KiniPos Pro Sekarang'}</span>
        </button>
      </div>

      {/* Pengaturan Toko */}
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
                  } catch (err) { }
                }
                if (playSound) playSound('success');
                if (showNotification) showNotification('Nama toko berhasil disimpan! 🏪', 'success');
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${isSoundMuted ? 'bg-slate-100 text-slate-500 border-slate-300' : 'bg-emerald-500 text-white border-emerald-600'
              }`}
            onClick={() => {
              const newMuted = !isSoundMuted;
              setIsSoundMuted(newMuted);
              localStorage.setItem('kinipos_sound_muted', newMuted.toString());
              if (!newMuted && playSound) playSound('click');
              if (showNotification) showNotification(newMuted ? 'Suara aplikasi DIMATIKAN' : 'Suara aplikasi DIAKTIFKAN', 'sound_' + (newMuted ? 'off' : 'on'));
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

      {/* Stiker QRIS Toko */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <img src="/qr-code.png" alt="QRIS" className="w-4 h-4 object-contain" /> Stiker QRIS Toko
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload foto stiker QRIS (DANA Bisnis, BCA, GoPay, DANA, dll) untuk kasir.
            </p>
          </div>
        </div>

        {qrisImage ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
            <img src={qrisImage} alt="Stiker QRIS Toko" className="w-20 h-20 object-contain rounded-lg border border-slate-200 bg-white shadow-sm" />
            <div className="flex-1 space-y-1.5">
              <span className="text-xs font-bold text-slate-800 block">Stiker QRIS Aktif ✅</span>
              <p className="text-[11px] text-slate-500">Tampil otomatis saat pembeli memilih bayar via QRIS.</p>
              <div className="flex gap-2 pt-1">
                <label className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition shadow-sm">
                  Ganti Stiker
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const base64 = evt.target.result;
                          if (setQrisImage) setQrisImage(base64);
                          localStorage.setItem('kinipos_qris_image', base64);
                        };
                        reader.readAsDataURL(file);

                        if (user && supabase) {
                          try {
                            const fileExt = file.name.split('.').pop() || 'jpg';
                            const filePath = `qris/qris_${user.id}_${Date.now()}.${fileExt}`;
                            const { error: uploadError } = await supabase.storage
                              .from('products')
                              .upload(filePath, file, { upsert: true });

                            if (!uploadError) {
                              const { data: publicUrlData } = supabase.storage
                                .from('products')
                                .getPublicUrl(filePath);

                              const publicUrl = publicUrlData?.publicUrl;
                              if (publicUrl) {
                                await supabase.auth.updateUser({
                                  data: { qris_image: publicUrl }
                                });
                                if (setQrisImage) setQrisImage(publicUrl);
                                localStorage.setItem('kinipos_qris_image', publicUrl);
                              }
                            } else {
                              console.error('Storage upload error:', uploadError);
                            }
                          } catch (err) {
                            console.error('Failed to upload QRIS image:', err);
                          }
                        }
                        if (playSound) playSound('success');
                        if (showNotification) showNotification('Stiker QRIS Toko berhasil diperbarui! 📸', 'success');
                      }
                    }}
                  />
                </label>
                <button
                  type="button"
                  className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                  onClick={async () => {
                    localStorage.removeItem('kinipos_qris_image');
                    if (setQrisImage) setQrisImage('');
                    if (user) {
                      try {
                        await supabase.auth.updateUser({
                          data: { qris_image: '' }
                        });
                      } catch (err) { }
                    }
                    if (showNotification) showNotification('Stiker QRIS dihapus', 'info');
                  }}
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ) : (
          <label className="border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl p-5 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-slate-50 hover:bg-slate-100">
            <img src="/qr-code.png" alt="Upload QRIS" className="w-8 h-8 object-contain opacity-50" />
            <div>
              <span className="text-xs font-bold text-slate-800 block">Upload Stiker QRIS Toko</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Format JPG / PNG (DANA, BCA, GoPay, DANA Bisnis, dll)</span>
            </div>
            <span className="bg-white text-slate-900 border border-slate-200 font-bold text-xs px-4 py-2 rounded-xl mt-1 shadow-sm flex items-center gap-1.5 hover:bg-slate-50 transition">
              <img src="/image-.png" alt="QRIS Icon" className="w-3.5 h-3.5 object-contain rounded" /> Pilih Foto QRIS
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    const base64 = evt.target.result;
                    if (setQrisImage) setQrisImage(base64);
                    localStorage.setItem('kinipos_qris_image', base64);
                  };
                  reader.readAsDataURL(file);

                  if (user && supabase) {
                    (async () => {
                      try {
                        const fileExt = file.name.split('.').pop() || 'jpg';
                        const filePath = `qris/qris_${user.id}_${Date.now()}.${fileExt}`;
                        const { error: uploadError } = await supabase.storage
                          .from('products')
                          .upload(filePath, file, { upsert: true });

                        if (!uploadError) {
                          const { data: publicUrlData } = supabase.storage
                            .from('products')
                            .getPublicUrl(filePath);

                          const publicUrl = publicUrlData?.publicUrl;
                          if (publicUrl) {
                            await supabase.auth.updateUser({
                              data: { qris_image: publicUrl }
                            });
                            if (setQrisImage) setQrisImage(publicUrl);
                            localStorage.setItem('kinipos_qris_image', publicUrl);
                          }
                        } else {
                          console.error('Storage upload error:', uploadError);
                        }
                      } catch (err) {
                        console.error('Failed to upload QRIS image:', err);
                      }
                    })();
                  }
                  if (playSound) playSound('success');
                  if (showNotification) showNotification('Stiker QRIS Toko berhasil disimpan! 📸', 'success');
                }
              }}
            />
          </label>
        )}
      </div>

      {/* Akun Lapak */}
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
