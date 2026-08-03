import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [isForgotPassword, setIsForgotPassword] = useState(initialMode === 'forgot');
  const [isUpdatePassword, setIsUpdatePassword] = useState(initialMode === 'reset');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [storeNameInput, setStoreNameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setErrorMsg('');
    setSuccessMsg('');
    if (initialMode === 'reset') {
      setIsUpdatePassword(true);
      setIsForgotPassword(false);
      setIsLogin(false);
    } else if (initialMode === 'forgot') {
      setIsForgotPassword(true);
      setIsUpdatePassword(false);
      setIsLogin(false);
    } else {
      setIsLogin(true);
      setIsForgotPassword(false);
      setIsUpdatePassword(false);
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isUpdatePassword) {
        if (!newPassword || newPassword.length < 6) {
          setErrorMsg('Password baru minimal 6 karakter!');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) throw error;

        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }

        setSuccessMsg('Password Anda berhasil diperbarui! 🎉');
        setTimeout(async () => {
          setIsUpdatePassword(false);
          setIsLogin(true);
          setSuccessMsg('');
          
          const { data: userData } = await supabase.auth.getUser();
          const activeUser = data?.user || userData?.user;
          const userStore = activeUser?.user_metadata?.store_name || activeUser?.email?.split('@')[0];

          if (activeUser) {
            onAuthSuccess(activeUser, userStore, 'Password Berhasil Diperbarui! 🎉');
          }
          onClose();
        }, 1200);
      } else if (isForgotPassword) {
        if (!email) {
          setErrorMsg('Masukkan email Anda!');
          setLoading(false);
          return;
        }

        const redirectUrl = window.location.hostname === 'localhost' 
          ? 'http://localhost:5173' 
          : 'https://kinipos.com';

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });

        if (error) throw error;

        setSuccessMsg('Link reset password telah dikirim ke email Anda! Silakan periksa email Anda 📩');
      } else if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        const userStore = data?.user?.user_metadata?.store_name || email.split('@')[0];
        onAuthSuccess(data.user, userStore);
        onClose();
      } else {
        const redirectUrl = window.location.hostname === 'localhost' 
          ? 'http://localhost:5173' 
          : 'https://kinipos.com';

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              store_name: storeNameInput || 'Usaha Saya',
            },
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) throw error;

        if (data?.user && !data?.session) {
          setSuccessMsg('Pendaftaran berhasil! 📩 Silakan periksa email Anda untuk mengonfirmasi akun sebelum login.');
        } else if (data?.user) {
          const userStore = storeNameInput || email.split('@')[0];
          onAuthSuccess(data.user, userStore, 'Berhasil Daftar Lapak! 🎉');
          onClose();
        }
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Invalid login credentials')) {
        setErrorMsg('Email atau password salah. Silakan periksa kembali!');
      } else if (msg.includes('Email not confirmed')) {
        setErrorMsg('Email Anda belum dikonfirmasi. Silakan periksa email Anda untuk melakukan verifikasi!');
      } else if (msg.includes('User already registered') || msg.includes('already exists')) {
        setErrorMsg('Email ini sudah terdaftar. Silakan pindah ke tab Login!');
      } else if (msg.includes('Password should be at least')) {
        setErrorMsg('Password minimal 6 karakter!');
      } else if (msg.includes('Unable to validate email address')) {
        setErrorMsg('Format email tidak valid!');
      } else {
        setErrorMsg(msg || 'Terjadi kesalahan. Coba lagi!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-4.5 shadow-2xl relative">
        <button 
          onClick={() => {
            setIsUpdatePassword(false);
            setIsForgotPassword(false);
            setIsLogin(true);
            if (window.location.hash) {
              window.history.replaceState(null, '', window.location.pathname);
            }
            onClose();
          }} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-xl p-1"
        >
          ✕
        </button>

        <div className="text-center space-y-1">
          <img src="/kinipos_logo.png" alt="KiniPos Logo" className="w-12 h-12 mx-auto object-contain mb-1" />
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
            {isUpdatePassword 
              ? 'Buat Password Baru' 
              : isForgotPassword ? 'Reset Password' : isLogin ? 'Masuk ke KiniPos' : 'Daftar Lapak Baru'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {isUpdatePassword
              ? 'Ketikkan password baru untuk akun toko Anda'
              : isForgotPassword 
                ? 'Masukkan email toko untuk menerima link reset'
                : isLogin ? 'Kelola kasir & omset toko Anda' : 'Mulai kelola kasir toko Anda dengan mudah'}
          </p>
        </div>

        {!isForgotPassword && !isUpdatePassword && (
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button 
              type="button"
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${isLogin ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`} 
              onClick={() => { setIsLogin(true); setErrorMsg(''); setSuccessMsg(''); }}
            >
              Masuk (Login)
            </button>
            <button 
              type="button"
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${!isLogin ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`} 
              onClick={() => { setIsLogin(false); setErrorMsg(''); setSuccessMsg(''); }}
            >
              Daftar Lapak
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-lg font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-lg font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isUpdatePassword ? (
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Password Baru:</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 pr-10 transition"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ketik password baru Anda..."
                  autoFocus
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <>
              {!isLogin && !isForgotPassword && (
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Usaha / Toko:</label>
                  <input 
                    type="text" 
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                    required
                    value={storeNameInput}
                    onChange={(e) => setStoreNameInput(e.target.value)}
                    placeholder="Misal: Es Teh Berkah"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Email Toko:</label>
                <input 
                  type="email" 
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tokosaya@gmail.com"
                />
              </div>

              {!isForgotPassword && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-600">Password:</label>
                    {isLogin && (
                      <button 
                        type="button"
                        className="text-[11px] font-semibold text-blue-600 hover:underline"
                        onClick={() => { setIsForgotPassword(true); setErrorMsg(''); setSuccessMsg(''); }}
                      >
                        Lupa Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 pr-10 transition"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {isForgotPassword && (
            <button 
              type="button"
              className="text-xs text-slate-500 font-semibold hover:underline block text-center pt-1"
              onClick={() => { setIsForgotPassword(false); setErrorMsg(''); setSuccessMsg(''); }}
            >
              ← Kembali ke halaman Login
            </button>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl text-sm hover:bg-slate-700 active:scale-[0.98] transition disabled:opacity-50 shadow-md mt-2"
          >
            {loading ? 'Memproses...' : (isUpdatePassword ? 'Simpan Password Baru' : isForgotPassword ? 'Kirim Link Reset' : isLogin ? 'Masuk Lapak' : 'Daftar Lapak Sekarang')}
          </button>
        </form>
      </div>
    </div>
  );
}
