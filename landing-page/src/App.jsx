import React, { useState } from 'react';

const APP_URL = "https://kinipos-official.web.app";

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    businessName: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate successful form submission
    setFormSubmitted(true);
    // Clear form
    setFormData({
      name: '',
      phone: '',
      businessName: '',
      message: ''
    });
    setTimeout(() => {
      setFormSubmitted(false);
    }, 5000);
  };

  return (
    <div className="bg-white text-brand-darkText overflow-x-hidden min-h-screen flex flex-col justify-between">
      
      {/* Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-brand-navy/95 backdrop-blur-md border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <span className="text-white text-xl font-bold tracking-wide">Kini<span className="text-brand-gold">Pos</span></span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#fitur" className="text-gray-300 hover:text-white transition-colors font-medium">Fitur</a>
            <a href="#layanan" className="text-gray-300 hover:text-white transition-colors font-medium">Layanan</a>
            <a href="#testimoni" className="text-gray-300 hover:text-white transition-colors font-medium">Testimoni</a>
            <a href="#harga" className="text-gray-300 hover:text-white transition-colors font-medium">Harga</a>
            <a href="#kontak" className="text-gray-300 hover:text-white transition-colors font-medium">Kontak</a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <a href={APP_URL} target="_blank" rel="noopener noreferrer" className="bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-bold px-6 py-2.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-brand-gold/20 transform hover:-translate-y-0.5 inline-block">
              Buka Aplikasi
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden text-white hover:text-brand-gold focus:outline-none"
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-2xl`}></i>
          </button>
        </div>

        {/* Mobile Nav Menu */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-brand-navy border-t border-white/5 px-6 py-6 absolute top-20 left-0 w-full transition-all duration-300 ease-in-out`}>
          <div className="flex flex-col gap-5">
            <a href="#fitur" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors font-medium text-lg py-1">Fitur</a>
            <a href="#layanan" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors font-medium text-lg py-1">Layanan</a>
            <a href="#testimoni" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors font-medium text-lg py-1">Testimoni</a>
            <a href="#harga" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors font-medium text-lg py-1">Harga</a>
            <a href="#kontak" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors font-medium text-lg py-1">Kontak</a>
            <a href={APP_URL} target="_blank" rel="noopener noreferrer" className="bg-brand-gold text-brand-navy text-center font-bold py-3 rounded-xl transition-all duration-300 mt-2 block">
              Buka Aplikasi
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-hero pt-32 pb-24 md:pt-44 md:pb-36 text-white relative overflow-hidden flex-grow">
        {/* Decorative background elements */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-brand-teal/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-brand-gold text-sm font-semibold tracking-wide uppercase mx-auto">
            <i className="fa-solid fa-sparkles"></i> Aplikasi POS Laundry Modern
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            Kelola Bisnis Laundry <br />
            Lebih Cepat & <span className="gold-gradient-text">Profesional</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Kini Pos menghadirkan kemudahan kasir digital khusus laundry dengan fitur scan barcode, pelacakan status cucian, kelola voucher, hingga laporan laba rugi otomatis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a href={APP_URL} target="_blank" rel="noopener noreferrer" className="bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-bold px-8 py-4 rounded-xl text-center transition-all duration-300 hover:shadow-xl hover:shadow-brand-gold/20 transform hover:-translate-y-0.5 block">
              Coba Gratis Sekarang
            </a>
            <a href="#fitur" className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium px-8 py-4 rounded-xl text-center transition-all duration-300 transform hover:-translate-y-0.5 block">
              Pelajari Fitur <i className="fa-solid fa-arrow-right ml-2 text-sm"></i>
            </a>
          </div>
        </div>
      </section>

      {/* Statistics Banner */}
      <section className="bg-brand-lightGray py-10 border-y border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <h3 className="text-3xl md:text-4xl font-extrabold text-brand-navy">10k+</h3>
              <p className="text-gray-500 text-sm md:text-base">Transaksi Sukses</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl md:text-4xl font-extrabold text-brand-navy">99.9%</h3>
              <p className="text-gray-500 text-sm md:text-base">Sistem Uptime</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl md:text-4xl font-extrabold text-brand-navy">500+</h3>
              <p className="text-gray-500 text-sm md:text-base">Mitra Laundry</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl md:text-4xl font-extrabold text-brand-navy">4.9/5</h3>
              <p className="text-gray-500 text-sm md:text-base">Rating Kepuasan</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-brand-teal text-sm font-semibold tracking-widest uppercase">Fitur Unggulan</h2>
            <p className="text-3xl md:text-4xl font-bold text-brand-navy">Didesain Khusus Untuk Bisnis Laundry Anda</p>
            <p className="text-gray-500 font-light">Kini Pos menyediakan fitur lengkap yang dirancang presisi untuk mengatasi masalah operasional laundry sehari-hari.</p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-brand-lightGray/50 border border-gray-100 p-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-brand-navy/5 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-xl bg-brand-navy text-brand-gold flex items-center justify-center text-xl mb-6 shadow-md shadow-brand-navy/10">
                <i className="fa-solid fa-qrcode"></i>
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-3">Barcode Scanner</h3>
              <p className="text-gray-600 font-light leading-relaxed">Cari dan proses transaksi cucian pelanggan hanya dengan sekali scan barcode unik pada struk belanja.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-brand-lightGray/50 border border-gray-100 p-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-brand-navy/5 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-xl bg-brand-navy text-brand-gold flex items-center justify-center text-xl mb-6 shadow-md shadow-brand-navy/10">
                <i className="fa-solid fa-tags"></i>
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-3">Voucher & Diskon</h3>
              <p className="text-gray-600 font-light leading-relaxed">Tingkatkan retensi pelanggan dengan membuat kode voucher khusus dan persentase diskon fleksibel.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-brand-lightGray/50 border border-gray-100 p-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-brand-navy/5 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-xl bg-brand-navy text-brand-gold flex items-center justify-center text-xl mb-6 shadow-md shadow-brand-navy/10">
                <i className="fa-solid fa-file-pdf"></i>
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-3">Laporan PDF Instan</h3>
              <p className="text-gray-600 font-light leading-relaxed">Ekspor invoice, struk, dan rekapitulasi keuangan bulanan Anda langsung ke file PDF yang rapi dan profesional.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-brand-lightGray/50 border border-gray-100 p-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-brand-navy/5 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-xl bg-brand-navy text-brand-gold flex items-center justify-center text-xl mb-6 shadow-md shadow-brand-navy/10">
                <i className="fa-brands fa-whatsapp"></i>
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-3">Notifikasi WhatsApp</h3>
              <p className="text-gray-600 font-light leading-relaxed">Kirim struk digital dan notifikasi otomatis saat cucian pelanggan selesai langsung ke nomor WhatsApp mereka.</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-brand-lightGray/50 border border-gray-100 p-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-brand-navy/5 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-xl bg-brand-navy text-brand-gold flex items-center justify-center text-xl mb-6 shadow-md shadow-brand-navy/10">
                <i className="fa-solid fa-cloud-arrow-up"></i>
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-3">Penyimpanan Cloud Aman</h3>
              <p className="text-gray-600 font-light leading-relaxed">Keamanan data terjamin dengan sinkronisasi Firebase Cloud yang tersinkron otomatis secara real-time.</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-brand-lightGray/50 border border-gray-100 p-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-brand-navy/5 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-xl bg-brand-navy text-brand-gold flex items-center justify-center text-xl mb-6 shadow-md shadow-brand-navy/10">
                <i className="fa-solid fa-mobile-screen-button"></i>
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-3">Dukungan Offline</h3>
              <p className="text-gray-600 font-light leading-relaxed">Tetap bisa input transaksi bahkan ketika jaringan internet terputus dengan sinkronisasi otomatis saat online.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase / Delivery Section */}
      <section id="layanan" className="py-20 bg-brand-lightGray scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Image illustration */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-brand-gold/10 rounded-3xl blur-2xl transform -rotate-3"></div>
                <img src="/images/delivery.png" alt="Layanan Antar Jemput Laundry" className="relative rounded-3xl shadow-xl w-full object-cover transition-transform duration-300 hover:scale-[1.01]" />
              </div>
            </div>

            {/* Text details */}
            <div className="lg:col-span-6 space-y-6">
              <h2 className="text-brand-teal text-sm font-semibold tracking-widest uppercase">Fitur Eksklusif</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-brand-navy leading-tight">Layanan Antar-Jemput yang Terorganisir</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Kelola pengiriman cucian dengan mudah melalui sistem pemetaan kurir bawaan. Lacak posisi kurir Anda dan beri tahu pelanggan saat cucian siap dikirim ke rumah mereka.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="h-6 w-6 rounded-full bg-brand-teal/15 text-brand-teal flex items-center justify-center shrink-0 mt-0.5"><i className="fa-solid fa-check text-xs"></i></span>
                  <div>
                    <strong className="text-brand-navy block">Optimasi Rute Kurir</strong>
                    <span className="text-gray-500 font-light text-sm">Kurir dapat mengelompokkan cucian berdasarkan rute terdekat.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="h-6 w-6 rounded-full bg-brand-teal/15 text-brand-teal flex items-center justify-center shrink-0 mt-0.5"><i className="fa-solid fa-check text-xs"></i></span>
                  <div>
                    <strong className="text-brand-navy block">Pelacakan Status Pesanan</strong>
                    <span className="text-gray-500 font-light text-sm">Pelanggan bisa langsung mengecek status cucian sedang dicuci, disetrika, atau siap kirim.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimoni" className="py-24 text-white relative overflow-hidden scroll-mt-20" style={{ backgroundImage: "url('/images/testimonial-bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {/* Dark overlay to ensure text contrast */}
        <div className="absolute inset-0 bg-brand-navy/90 backdrop-blur-[2px]"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-brand-gold text-sm font-semibold tracking-widest uppercase">Testimoni Mitra</h2>
            <h3 className="text-3xl md:text-4xl font-bold">Apa Kata Mereka Tentang Kami?</h3>
          </div>

          {/* Testimonial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex text-brand-gold gap-1">
                  <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                </div>
                <p className="text-gray-300 font-light italic leading-relaxed">
                  "Semenjak pakai Kini Pos, omset laundry kami naik 30% karena pencatatan keuangan jadi rapi banget. Fitur kirim nota WhatsApp otomatis paling disukai pelanggan kami."
                </p>
              </div>
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/10">
                <div className="h-10 w-10 rounded-full bg-brand-gold text-brand-navy flex items-center justify-center font-bold text-lg">H</div>
                <div>
                  <h4 className="font-bold text-white text-sm">Hendra Wijaya</h4>
                  <p className="text-gray-400 text-xs font-light">Owner Clean & Fresh Laundry</p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex text-brand-gold gap-1">
                  <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                </div>
                <p className="text-gray-300 font-light italic leading-relaxed">
                  "Gak ada lagi drama cucian hilang atau salah label. Fitur cetak label barcode di Kini Pos bener-bener ngebantu operasional tim di lapangan."
                </p>
              </div>
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/10">
                <div className="h-10 w-10 rounded-full bg-brand-gold text-brand-navy flex items-center justify-center font-bold text-lg">S</div>
                <div>
                  <h4 className="font-bold text-white text-sm">Siti Rahmawati</h4>
                  <p className="text-gray-400 text-xs font-light">Manager Operasional Premium Wash</p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex text-brand-gold gap-1">
                  <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                </div>
                <p className="text-gray-300 font-light italic leading-relaxed">
                  "User interfacenya minimalis dan gampang dipahami sama staf kasir baru. Offline modenya juga ngebantu banget pas internet lagi bermasalah."
                </p>
              </div>
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/10">
                <div className="h-10 w-10 rounded-full bg-brand-gold text-brand-navy flex items-center justify-center font-bold text-lg">B</div>
                <div>
                  <h4 className="font-bold text-white text-sm">Budi Santoso</h4>
                  <p className="text-gray-400 text-xs font-light">Owner Express Laundry</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="harga" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-brand-teal text-sm font-semibold tracking-widest uppercase">Rencana Harga</h2>
            <p className="text-3xl md:text-4xl font-bold text-brand-navy">Investasi Terjangkau untuk Bisnis Anda</p>
            <p className="text-gray-500 font-light">Pilih paket harga terbaik yang sesuai dengan skala bisnis laundry Anda saat ini.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Plan 1: Gratis */}
            <div className="bg-white border border-gray-200 p-8 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-all duration-300">
              <div className="space-y-6">
                <div>
                  <h4 className="text-brand-navy font-bold text-lg">Starter (Gratis)</h4>
                  <p className="text-gray-400 text-sm font-light mt-1">Sempurna untuk laundry rumahan baru mencoba sistem digital.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-brand-navy font-extrabold text-3xl">Rp 0</span>
                  <span className="text-gray-400 text-sm font-light">/ selamanya</span>
                </div>
                <ul className="space-y-3.5 border-t border-gray-100 pt-6">
                  <li className="flex items-center gap-3 text-sm text-gray-600"><i className="fa-solid fa-check text-brand-teal"></i> 1 Outlet Kasir</li>
                  <li className="flex items-center gap-3 text-sm text-gray-600"><i className="fa-solid fa-check text-brand-teal"></i> Up to 150 Transaksi / Bulan</li>
                  <li className="flex items-center gap-3 text-sm text-gray-600"><i className="fa-solid fa-check text-brand-teal"></i> Cetak Struk PDF Standar</li>
                  <li className="flex items-center gap-3 text-sm text-gray-400 line-through"><i className="fa-solid fa-xmark"></i> Barcode Scanner</li>
                  <li className="flex items-center gap-3 text-sm text-gray-400 line-through"><i className="fa-solid fa-xmark"></i> Integrasi Notifikasi WhatsApp</li>
                </ul>
              </div>
              <a href={APP_URL} target="_blank" rel="noopener noreferrer" className="mt-8 block text-center font-bold border border-brand-navy text-brand-navy py-3.5 rounded-xl hover:bg-brand-navy hover:text-white transition-all duration-300">Mulai Gratis</a>
            </div>

            {/* Plan 2: Berbayar (Pro) */}
            <div className="bg-brand-navy text-white p-8 rounded-2xl flex flex-col justify-between shadow-xl shadow-brand-navy/15 relative border border-brand-gold/30">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-gold text-brand-navy font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full">Rekomendasi</div>
              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-bold text-lg">Pro Business</h4>
                  <p className="text-gray-400 text-sm font-light mt-1">Solusi komplit tanpa batas untuk bisnis laundry berkembang.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-brand-gold font-extrabold text-3xl">Rp 149.000</span>
                  <span className="text-gray-400 text-sm font-light">/bulan</span>
                </div>
                <ul className="space-y-3.5 border-t border-white/10 pt-6">
                  <li className="flex items-center gap-3 text-sm text-gray-300"><i className="fa-solid fa-check text-brand-gold"></i> Outlet & Kasir Unlimited</li>
                  <li className="flex items-center gap-3 text-sm text-gray-300"><i className="fa-solid fa-check text-brand-gold"></i> Transaksi Tanpa Batas</li>
                  <li className="flex items-center gap-3 text-sm text-gray-300"><i className="fa-solid fa-check text-brand-gold"></i> Cetak Struk PDF & Label Barcode</li>
                  <li className="flex items-center gap-3 text-sm text-gray-300"><i className="fa-solid fa-check text-brand-gold"></i> Scan Barcode Kamera & Hardware</li>
                  <li className="flex items-center gap-3 text-sm text-gray-300"><i className="fa-solid fa-check text-brand-gold"></i> Kirim WhatsApp Nota Otomatis</li>
                  <li className="flex items-center gap-3 text-sm text-gray-300"><i className="fa-solid fa-check text-brand-gold"></i> Laporan Keuangan Lengkap</li>
                </ul>
              </div>
              <a href={APP_URL} target="_blank" rel="noopener noreferrer" className="mt-8 block text-center font-bold bg-brand-gold text-brand-navy py-3.5 rounded-xl hover:bg-brand-gold/90 transition-all duration-300">Pilih Paket Pro</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Download Section */}
      <section id="download" className="py-20 gradient-hero text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.15),transparent)] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">Siap Naik Kelas Bersama Kini Pos?</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto font-light">
            Kini Pos menggunakan teknologi PWA terkini. Cukup buka melalui browser handphone atau komputer Anda, lalu pasang langsung ke layar utama secara instan tanpa perlu ke Play Store.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 pt-4">
            <a href={APP_URL} target="_blank" rel="noopener noreferrer" className="bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-bold px-10 py-5 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-gold/30 transform hover:-translate-y-1 text-lg">
              <i className="fa-solid fa-cloud-arrow-down"></i>
              Buka & Pasang Aplikasi POS
            </a>
            <p className="text-gray-400 text-xs font-light">
              ⚡ Terbuka instan, mendukung offline, dan langsung terpasang di layar utama HP/PC Anda.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="kontak" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-brand-teal text-sm font-semibold tracking-widest uppercase">Kontak Kami</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-brand-navy">Punya Pertanyaan Sebelum Memulai?</h3>
            <p className="text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
              Tim support kami selalu siap sedia membantu Anda menjelaskan skema integrasi, demo langsung, atau penawaran harga khusus.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            {/* Phone */}
            <div className="bg-brand-lightGray/40 border border-gray-100 p-6 rounded-2xl flex flex-col items-center text-center space-y-3 hover:shadow-lg hover:shadow-brand-navy/5 transition-all duration-300">
              <span className="h-12 w-12 rounded-2xl bg-brand-navy text-white flex items-center justify-center text-xl"><i className="fa-solid fa-phone"></i></span>
              <h4 className="text-brand-navy font-bold">Telepon / WA</h4>
              <p className="text-gray-600 font-light text-sm">+62 812-3456-7890</p>
            </div>
            {/* Email */}
            <div className="bg-brand-lightGray/40 border border-gray-100 p-6 rounded-2xl flex flex-col items-center text-center space-y-3 hover:shadow-lg hover:shadow-brand-navy/5 transition-all duration-300">
              <span className="h-12 w-12 rounded-2xl bg-brand-navy text-white flex items-center justify-center text-xl"><i className="fa-solid fa-envelope"></i></span>
              <h4 className="text-brand-navy font-bold">Email</h4>
              <p className="text-gray-600 font-light text-sm">support@kinipos.com</p>
            </div>
            {/* Location */}
            <div className="bg-brand-lightGray/40 border border-gray-100 p-6 rounded-2xl flex flex-col items-center text-center space-y-3 hover:shadow-lg hover:shadow-brand-navy/5 transition-all duration-300">
              <span className="h-12 w-12 rounded-2xl bg-brand-navy text-white flex items-center justify-center text-xl"><i className="fa-solid fa-location-dot"></i></span>
              <h4 className="text-brand-navy font-bold">Lokasi</h4>
              <p className="text-gray-600 font-light text-sm">Jakarta, Indonesia</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-navy text-gray-400 pt-16 pb-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <a href="#" className="flex items-center gap-3">
              <span className="text-white text-xl font-bold tracking-wide">Kini<span className="text-brand-gold">Pos</span></span>
            </a>
            <p className="text-sm font-light leading-relaxed">
              Kini Pos adalah aplikasi Point of Sales (POS) cerdas yang merevolusi cara operasional kasir dan manajemen bisnis laundry modern di Indonesia.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Navigasi</h4>
            <ul className="space-y-2 text-sm font-light">
              <li><a href="#fitur" className="hover:text-white transition-colors">Fitur</a></li>
              <li><a href="#layanan" className="hover:text-white transition-colors">Layanan</a></li>
              <li><a href="#testimoni" className="hover:text-white transition-colors">Testimoni</a></li>
              <li><a href="#harga" className="hover:text-white transition-colors">Harga</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm font-light">
              <li><a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Disclaimer</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Sosial Media</h4>
            <div className="flex gap-4">
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 border border-white/10 hover:border-brand-gold hover:text-brand-gold flex items-center justify-center transition-colors"><i className="fa-brands fa-instagram"></i></a>
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 border border-white/10 hover:border-brand-gold hover:text-brand-gold flex items-center justify-center transition-colors"><i className="fa-brands fa-facebook"></i></a>
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 border border-white/10 hover:border-brand-gold hover:text-brand-gold flex items-center justify-center transition-colors"><i className="fa-brands fa-youtube"></i></a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-8 text-center text-xs font-light">
          <p>&copy; 2026 Kini Pos Laundry. Seluruh Hak Cipta Dilindungi Undang-Undang.</p>
        </div>
      </footer>

    </div>
  );
}

export default App;
