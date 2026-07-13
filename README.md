# KiniPOS PWA (Progressive Web App)

KiniPOS adalah aplikasi Point of Sale (Kasir) berbasis web PWA. PWA dipilih sebagai alternatif aplikasi native untuk mempermudah distribusi tanpa melalui proses verifikasi Google Play Store, namun tetap mempertahankan fungsionalitas mirip aplikasi native (bisa diinstal di HP/Desktop, berjalan secara offline, dan mengakses printer).

---

## 🚀 Fitur Utama PWA
1. **Installable:** Dapat diinstal langsung ke layar utama Android, iOS, maupun Desktop tanpa melalui App Store/Play Store.
2. **Offline Mode:** Menggunakan *Service Worker* dan *IndexedDB* agar kasir tetap bisa melakukan transaksi meskipun koneksi internet terputus. Data akan disinkronisasikan saat koneksi kembali.
3. **Cetak Struk Langsung:** Mendukung pencetakan struk belanja langsung ke printer thermal (Bluetooth/USB/Sistem).

---

## 📁 Struktur Folder Proyek (Vite + React)

Berikut adalah rekomendasi struktur folder untuk **KiniPOS PWA**:

```text
kinipos-pwa/
├── public/
│   ├── favicon.ico
│   ├── logo.png
│   ├── manifest.json          # Konfigurasi PWA (nama, warna, icon, dll)
│   └── robots.txt
├── src/
│   ├── assets/                # Gambar, logo, ikon statis
│   ├── components/            # Reusable UI Components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Sidebar.jsx
│   │   ├── POSCart.jsx        # Komponen keranjang belanja POS
│   │   └── ReceiptTemplate.jsx# Template struk belanja (khusus untuk print)
│   ├── hooks/                 # Custom React Hooks
│   │   ├── usePrinter.js      # Hook untuk manajemen koneksi printer
│   │   └── useOffline.js      # Hook untuk mendeteksi status internet
│   ├── layouts/               # Layout halaman (DashboardLayout, AuthLayout)
│   ├── pages/                 # Halaman/Views utama
│   │   ├── Dashboard.jsx      # Ringkasan penjualan
│   │   ├── POS.jsx            # Halaman kasir utama
│   │   ├── Transactions.jsx   # Riwayat transaksi
│   │   ├── Products.jsx       # Manajemen produk
│   │   └── Settings.jsx       # Pengaturan printer & profil
│   ├── services/              # Integrasi API & Database Lokal
│   │   ├── db.js              # IndexedDB (menggunakan Dexie.js) untuk offline storage
│   │   ├── supabase.js        # Integrasi Supabase client (Auth, Database, Storage)
│   │   └── printService.js    # Logika pengiriman data ke printer thermal
│   ├── utils/                 # Helper fungsi (format Rupiah, tanggal, dll)
│   ├── App.jsx                # Komponen utama & Routing
│   ├── index.css              # Styling (Tailwind / CSS)
│   └── main.jsx               # Entry point aplikasi
├── index.html
├── tailwind.config.js         # Konfigurasi Tailwind CSS (jika digunakan)
├── vite.config.js             # Konfigurasi Vite + VitePWA Plugin
├── package.json
└── README.md                  # Dokumentasi proyek ini
```

---

## ☁️ Integrasi Supabase & Offline-First Sync

Kita menggunakan **Supabase** sebagai Backend-as-a-Service (BaaS) menggantikan Firebase. 

### Mengapa Supabase?
1. **Bebas Tagihan Kejutan (No Firebase Loop Bills):** Supabase Free Tier memiliki batas limit sumber daya (Resource Limit). Jika limit tercapai, layanan akan di-pause (tidak akan otomatis menagih kartu kredit seperti Firebase Blaze Plan).
2. **PostgreSQL Relasional:** Sangat cocok untuk aplikasi kasir (POS) yang membutuhkan relasi data yang kuat antara tabel `users`, `products`, `transactions`, dan `transaction_items`.
3. **Free Edge Functions:** Kita bisa menggunakan Edge Functions secara gratis tanpa perlu upgrade plan atau input kartu kredit.
4. **Supabase Auth & Storage:** Memudahkan login kasir serta upload gambar produk secara gratis.

### Arsitektur Offline-First (Dexie.js + Supabase)
Aplikasi kasir harus tetap bisa beroperasi meski internet mati/lambat di lokasi toko.
* **Write Local First:** Setiap transaksi kasir baru akan langsung disimpan ke **IndexedDB** (via library `Dexie.js`) di browser.
* **Background Sync:** Ketika `navigator.onLine` bernilai `true`, Service Worker atau hooks sinkronisasi akan mendeteksi status online dan otomatis melakukan *push* data transaksi lokal ke **Supabase Database**.

---

## 🖨️ Cetak Struk di PWA (Apakah Bisa?)

**Bisa sekali!** Di PWA, ada 3 cara utama untuk mencetak struk langsung ke printer thermal:

### 1. Menggunakan CSS Print & `window.print()` (Sangat Direkomendasikan & Stabil)
Cara termudah dan paling kompatibel di semua browser/perangkat. 
* **Cara kerja:** Kita membuat elemen HTML khusus untuk struk belanja (`ReceiptTemplate.jsx`), lalu menggunakan CSS `@media print` untuk menyembunyikan semua elemen dashboard kasir dan hanya menampilkan struk tersebut saat proses cetak berjalan.
* **Kelebihan:** Sangat stabil, kompatibel di Android, iOS, Windows, Mac. Bisa disesuaikan dengan ukuran kertas printer thermal (58mm atau 80mm).
* **Kekurangan:** Memunculkan dialog print bawaan browser terlebih dahulu sebelum mencetak.

### 2. Web Bluetooth API (Cetak Langsung via Bluetooth)
Jika ingin struk langsung keluar saat tombol "Bayar" diklik tanpa memunculkan dialog print browser.
* **Cara kerja:** PWA menggunakan fitur `navigator.bluetooth` untuk mendeteksi dan menghubungkan perangkat langsung ke printer thermal Bluetooth. Data dikirimkan dalam bentuk kode byte perintah **ESC/POS** (standar printer thermal).
* **Kelebihan:** Tanpa dialog print (langsung cetak), pengalaman pengguna seperti aplikasi native.
* **Kekurangan:** Membutuhkan browser berbasis Chromium (Google Chrome, Edge). Belum didukung secara penuh oleh Safari di iOS.

### 3. Web USB / Web Serial API (Cetak Langsung via Kabel USB)
Digunakan jika kasir menggunakan komputer desktop atau tablet Android yang terhubung langsung ke printer thermal menggunakan kabel USB.
* **Cara kerja:** Menggunakan `navigator.usb` untuk berkomunikasi langsung dengan printer USB yang dicolokkan ke perangkat.
* **Kelebihan:** Sangat cepat dan stabil karena menggunakan kabel fisik.
* **Kekurangan:** Sama seperti Bluetooth, membutuhkan browser berbasis Chromium dan memerlukan konfigurasi driver USB yang kompatibel.

---

## 🛠️ Konfigurasi Penting PWA

Agar web dikenali sebagai PWA yang bisa diinstal (Installable), pastikan konfigurasi di file `public/manifest.json` sudah diatur seperti ini:

```json
{
  "short_name": "KiniPOS",
  "name": "KiniPOS - Aplikasi Kasir Pintar",
  "icons": [
    {
      "src": "icons/icon-192x192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "icons/icon-512x512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": "/",
  "background_color": "#ffffff",
  "display": "standalone",
  "theme_color": "#0F172A",
  "description": "KiniPOS PWA - Kasir Handal Tanpa Ribet"
}
```

---

## 📦 Rekomendasi Library PWA & POS

* **Vite PWA Plugin (`vite-plugin-pwa`):** Membantu konfigurasi Service Worker dan caching aset secara otomatis saat build.
* **Dexie.js:** Library wrapper IndexedDB yang sangat mudah digunakan untuk menyimpan data transaksi, produk, dan keranjang secara offline.
* **esc-pos-encoder:** Untuk menyusun teks/gambar menjadi format biner ESC/POS yang dimengerti oleh printer thermal Bluetooth/USB.
