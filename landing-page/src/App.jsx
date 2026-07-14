import React, { useState } from 'react';

const APP_URL = "https://kinipos-official.web.app";

const features = [
  { icon: "fa-qrcode", title: "Barcode Scanner", desc: "Cari dan proses transaksi cucian pelanggan hanya dengan sekali scan barcode unik pada struk belanja." },
  { icon: "fa-tags", title: "Voucher & Diskon", desc: "Tingkatkan retensi pelanggan dengan membuat kode voucher khusus dan persentase diskon fleksibel." },
  { icon: "fa-file-pdf", title: "Laporan PDF Instan", desc: "Ekspor invoice, struk, dan rekapitulasi keuangan bulanan langsung ke file PDF yang rapi dan profesional." },
  { icon: "fa-brands fa-whatsapp", title: "Notifikasi WhatsApp", desc: "Kirim struk digital dan notifikasi otomatis saat cucian pelanggan selesai ke nomor WhatsApp mereka." },
  { icon: "fa-cloud-arrow-up", title: "Penyimpanan Cloud", desc: "Keamanan data terjamin dengan sinkronisasi Firebase Cloud yang tersinkron otomatis secara real-time." },
  { icon: "fa-mobile-screen-button", title: "Dukungan Offline", desc: "Tetap bisa input transaksi bahkan ketika jaringan internet terputus dengan sinkronisasi otomatis saat online." },
];

const testimonials = [
  { name: "Hendra Wijaya", role: "Owner Clean & Fresh Laundry", initial: "H", text: "Semenjak pakai Kini Pos, omset laundry kami naik 30%. Fitur kirim nota WhatsApp otomatis paling disukai pelanggan kami." },
  { name: "Siti Rahmawati", role: "Manager Operasional Premium Wash", initial: "S", text: "Gak ada lagi drama cucian hilang atau salah label. Fitur cetak label barcode di Kini Pos bener-bener ngebantu operasional tim." },
  { name: "Budi Santoso", role: "Owner Express Laundry", initial: "B", text: "User interfacenya minimalis dan gampang dipahami sama staf kasir baru. Offline modenya juga ngebantu banget pas internet bermasalah." },
];

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white text-brand-dark overflow-x-hidden min-h-screen font-outfit">

      {/* ── NAVIGATION ── */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-primary flex items-center justify-center">
              <i className="fa-solid fa-cash-register text-white text-sm"></i>
            </div>
            <span className="text-brand-dark text-lg font-bold tracking-tight">Kini<span className="text-brand-primary">Pos</span></span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {["Fitur", "Layanan", "Testimoni", "Harga", "Kontak"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-brand-muted hover:text-brand-dark text-sm font-medium transition-colors">
                {item}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a href={APP_URL} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-muted hover:text-brand-dark transition-colors">
              Masuk
            </a>
            <a href={APP_URL} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm !px-4 !py-2">
              Coba Gratis
            </a>
          </div>

          {/* Hamburger */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-brand-dark">
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-brand-border px-6 py-6">
            <div className="flex flex-col gap-4">
              {["Fitur", "Layanan", "Testimoni", "Harga", "Kontak"].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="text-brand-muted hover:text-brand-dark font-medium text-base py-1">
                  {item}
                </a>
              ))}
              <a href={APP_URL} target="_blank" rel="noopener noreferrer" className="btn-primary text-center text-sm mt-2">
                Coba Gratis Sekarang
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="hero-bg pt-36 pb-28 md:pt-44 md:pb-36">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-7">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-light text-brand-primary text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider">
            <i className="fa-solid fa-circle-check text-xs"></i>
            Aplikasi POS Laundry Modern
          </div>
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-brand-dark">
            Kelola Bisnis Laundry <br />
            Lebih Cepat &{' '}
            <span className="text-gradient">Profesional</span>
          </h1>
          {/* Sub */}
          <p className="text-brand-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Kini Pos menghadirkan kemudahan kasir digital khusus laundry — scan barcode, lacak status cucian, kelola voucher, hingga laporan laba rugi otomatis.
          </p>
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a href={APP_URL} target="_blank" rel="noopener noreferrer" className="btn-primary text-base !px-8 !py-4">
              Coba Gratis Sekarang
            </a>
            <a href="#fitur" className="btn-outline text-base !px-8 !py-4">
              Pelajari Fitur <i className="fa-solid fa-arrow-down ml-2 text-xs"></i>
            </a>
          </div>
          <p className="text-brand-muted text-xs pt-2">Tanpa perlu kartu kredit. Tidak perlu download di Play Store.</p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white border-y border-brand-border py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10k+", label: "Transaksi Sukses" },
              { value: "99.9%", label: "Sistem Uptime" },
              { value: "500+", label: "Mitra Laundry" },
              { value: "4.9/5", label: "Rating Kepuasan" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-brand-primary">{stat.value}</div>
                <div className="text-brand-muted text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="fitur" className="py-24 bg-brand-surface scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-brand-primary text-xs font-semibold tracking-widest uppercase">Fitur Unggulan</span>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">Didesain Khusus untuk Bisnis Laundry</h2>
            <p className="text-brand-muted">Fitur lengkap yang dirancang presisi untuk mengatasi masalah operasional laundry sehari-hari.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white border border-brand-border p-7 rounded-2xl hover:shadow-soft hover:-translate-y-1 transition-all duration-300 group">
                <div className="h-11 w-11 rounded-xl bg-brand-light text-brand-primary flex items-center justify-center text-lg mb-5 group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                  <i className={`fa-solid ${f.icon}`}></i>
                </div>
                <h3 className="text-base font-bold text-brand-dark mb-2">{f.title}</h3>
                <p className="text-brand-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LAYANAN ── */}
      <section id="layanan" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Visual placeholder */}
            <div className="bg-brand-surface border border-brand-border rounded-3xl p-10 flex flex-col items-center justify-center text-center gap-5 min-h-[320px]">
              <div className="h-20 w-20 rounded-2xl bg-brand-light flex items-center justify-center text-brand-primary text-4xl">
                <i className="fa-solid fa-motorcycle"></i>
              </div>
              <p className="text-brand-muted text-sm font-medium">Sistem Antar-Jemput Laundry</p>
            </div>

            {/* Text */}
            <div className="space-y-6">
              <span className="text-brand-primary text-xs font-semibold tracking-widest uppercase">Fitur Eksklusif</span>
              <h2 className="text-3xl md:text-4xl font-bold text-brand-dark leading-tight">Layanan Antar-Jemput yang Terorganisir</h2>
              <p className="text-brand-muted leading-relaxed">
                Kelola pengiriman cucian dengan mudah melalui sistem pemetaan kurir bawaan. Lacak posisi kurir dan beri tahu pelanggan saat cucian siap dikirim ke rumah mereka.
              </p>
              <ul className="space-y-4">
                {[
                  { title: "Optimasi Rute Kurir", desc: "Kurir dapat mengelompokkan cucian berdasarkan rute terdekat." },
                  { title: "Pelacakan Status Pesanan", desc: "Pelanggan bisa langsung mengecek status cucian — dicuci, disetrika, atau siap kirim." },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <span className="h-6 w-6 rounded-full bg-brand-light text-brand-primary flex items-center justify-center shrink-0 mt-0.5">
                      <i className="fa-solid fa-check text-xs"></i>
                    </span>
                    <div>
                      <strong className="text-brand-dark text-sm block">{item.title}</strong>
                      <span className="text-brand-muted text-sm">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimoni" className="py-24 bg-brand-surface scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-brand-primary text-xs font-semibold tracking-widest uppercase">Testimoni Mitra</span>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">Apa Kata Mereka Tentang Kami?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white border border-brand-border p-7 rounded-2xl flex flex-col justify-between hover:shadow-soft transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => <i key={i} className="fa-solid fa-star text-xs"></i>)}
                  </div>
                  <p className="text-brand-muted text-sm leading-relaxed italic">"{t.text}"</p>
                </div>
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-brand-border">
                  <div className="h-9 w-9 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm shrink-0">{t.initial}</div>
                  <div>
                    <div className="text-brand-dark font-semibold text-sm">{t.name}</div>
                    <div className="text-brand-muted text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="harga" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-brand-primary text-xs font-semibold tracking-widest uppercase">Rencana Harga</span>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">Investasi Terjangkau untuk Bisnis Anda</h2>
            <p className="text-brand-muted">Pilih paket terbaik yang sesuai dengan skala bisnis laundry Anda saat ini.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Starter */}
            <div className="border border-brand-border p-8 rounded-2xl flex flex-col justify-between hover:shadow-soft transition-all duration-300">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-brand-dark text-lg">Starter</h3>
                  <p className="text-brand-muted text-sm mt-1">Sempurna untuk laundry rumahan baru mencoba sistem digital.</p>
                </div>
                <div>
                  <span className="text-4xl font-bold text-brand-dark">Rp 0</span>
                  <span className="text-brand-muted text-sm ml-1">/ selamanya</span>
                </div>
                <ul className="space-y-3 border-t border-brand-border pt-6">
                  {["1 Outlet Kasir", "Up to 150 Transaksi / Bulan", "Cetak Struk PDF Standar"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-brand-muted">
                      <i className="fa-solid fa-check text-brand-primary text-xs"></i> {item}
                    </li>
                  ))}
                  {["Barcode Scanner", "Notifikasi WhatsApp"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-brand-border line-through">
                      <i className="fa-solid fa-xmark text-xs"></i> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <a href={APP_URL} target="_blank" rel="noopener noreferrer" className="btn-outline text-center text-sm mt-8 block">
                Mulai Gratis
              </a>
            </div>

            {/* Pro */}
            <div className="border-2 border-brand-primary bg-brand-primary p-8 rounded-2xl flex flex-col justify-between relative shadow-xl shadow-indigo-200">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full">
                Rekomendasi
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-white text-lg">Pro Business</h3>
                  <p className="text-indigo-200 text-sm mt-1">Solusi komplit tanpa batas untuk bisnis laundry berkembang.</p>
                </div>
                <div>
                  <span className="text-4xl font-bold text-white">Rp 149.000</span>
                  <span className="text-indigo-200 text-sm ml-1">/bulan</span>
                </div>
                <ul className="space-y-3 border-t border-indigo-400/40 pt-6">
                  {[
                    "Outlet & Kasir Unlimited",
                    "Transaksi Tanpa Batas",
                    "Cetak Struk PDF & Label Barcode",
                    "Scan Barcode Kamera & Hardware",
                    "Kirim WhatsApp Nota Otomatis",
                    "Laporan Keuangan Lengkap",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-indigo-100">
                      <i className="fa-solid fa-check text-amber-300 text-xs"></i> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <a href={APP_URL} target="_blank" rel="noopener noreferrer" className="bg-white text-brand-primary font-semibold text-center text-sm mt-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-all duration-200 block">
                Pilih Paket Pro
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 bg-brand-primary">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">Siap Naik Kelas Bersama Kini Pos?</h2>
          <p className="text-indigo-200 text-base leading-relaxed">
            Cukup buka melalui browser dan pasang langsung ke layar utama tanpa perlu ke Play Store. Gratis, instan, dan langsung bisa dipakai.
          </p>
          <a href={APP_URL} target="_blank" rel="noopener noreferrer" className="bg-white text-brand-primary font-bold px-10 py-4 rounded-xl inline-flex items-center gap-3 hover:bg-indigo-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl text-base">
            <i className="fa-solid fa-rocket"></i>
            Buka & Pasang Aplikasi POS
          </a>
          <p className="text-indigo-300 text-xs pt-1">⚡ Terbuka instan, mendukung offline, dan langsung terpasang di layar utama HP/PC Anda.</p>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="kontak" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-10">
          <div className="space-y-3">
            <span className="text-brand-primary text-xs font-semibold tracking-widest uppercase">Kontak Kami</span>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">Punya Pertanyaan Sebelum Memulai?</h2>
            <p className="text-brand-muted leading-relaxed max-w-xl mx-auto">Tim support kami selalu siap membantu menjelaskan skema integrasi, demo langsung, atau penawaran harga khusus.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: "fa-phone", title: "Telepon / WA", value: "+62 812-3456-7890" },
              { icon: "fa-envelope", title: "Email", value: "support@kinipos.com" },
              { icon: "fa-location-dot", title: "Lokasi", value: "Jakarta, Indonesia" },
            ].map((c) => (
              <div key={c.title} className="border border-brand-border p-6 rounded-2xl flex flex-col items-center text-center gap-3 hover:border-brand-primary hover:shadow-soft transition-all duration-300">
                <span className="h-11 w-11 rounded-xl bg-brand-light text-brand-primary flex items-center justify-center text-lg">
                  <i className={`fa-solid ${c.icon}`}></i>
                </span>
                <div>
                  <div className="font-semibold text-brand-dark text-sm">{c.title}</div>
                  <div className="text-brand-muted text-sm mt-0.5">{c.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-brand-surface border-t border-brand-border pt-14 pb-8">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="space-y-3">
            <a href="#" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-brand-primary flex items-center justify-center">
                <i className="fa-solid fa-cash-register text-white text-xs"></i>
              </div>
              <span className="font-bold text-brand-dark">Kini<span className="text-brand-primary">Pos</span></span>
            </a>
            <p className="text-brand-muted text-sm leading-relaxed">
              Aplikasi POS cerdas khusus laundry yang merevolusi operasional kasir dan manajemen bisnis modern di Indonesia.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-brand-dark mb-4 text-sm">Navigasi</h4>
            <ul className="space-y-2">
              {["Fitur", "Layanan", "Testimoni", "Harga"].map((item) => (
                <li key={item}><a href={`#${item.toLowerCase()}`} className="text-brand-muted hover:text-brand-dark text-sm transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-brand-dark mb-4 text-sm">Legal</h4>
            <ul className="space-y-2">
              {["Kebijakan Privasi", "Syarat & Ketentuan", "Disclaimer"].map((item) => (
                <li key={item}><a href="#" className="text-brand-muted hover:text-brand-dark text-sm transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-brand-dark mb-4 text-sm">Sosial Media</h4>
            <div className="flex gap-3">
              {[["fa-instagram", "#"], ["fa-facebook", "#"], ["fa-youtube", "#"]].map(([icon, href]) => (
                <a key={icon} href={href} className="h-9 w-9 rounded-lg border border-brand-border bg-white hover:border-brand-primary hover:text-brand-primary text-brand-muted flex items-center justify-center text-sm transition-all duration-200">
                  <i className={`fa-brands ${icon}`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 border-t border-brand-border pt-6 text-center">
          <p className="text-brand-muted text-xs">&copy; 2026 Kini Pos Laundry. Seluruh Hak Cipta Dilindungi Undang-Undang.</p>
        </div>
      </footer>

    </div>
  );
}

export default App;
