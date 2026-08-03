import React from 'react';

export default function Toast({ toast }) {
  if (!toast?.show) return null;

  const borderColor = toast.type === 'error' ? 'border-l-red-400' : toast.type === 'success' ? 'border-l-emerald-400' : 'border-l-blue-400';

  const getIcon = () => {
    if (toast.type === 'sound_off') return '/no-sound.png';
    if (toast.type === 'sound_on') return '/volume.png';
    if (toast.type === 'error') return '/bin.png';
    return '/check.png';
  };

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[99999] bg-white text-slate-900 px-5 py-2.5 rounded-full border border-slate-200 border-l-4 ${borderColor} shadow-xl flex items-center gap-2.5 whitespace-nowrap toast-animate`}>
      <img
        src={getIcon()}
        alt="icon"
        className="w-4 h-4 object-contain"
      />
      <span className="text-[13px] font-semibold tracking-tight">{toast.message}</span>
    </div>
  );
}
