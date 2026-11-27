# 🏛️ Peta Interaktif Kampus 2 Universitas Siliwangi (Marker-Based WebAR)

> **Aplikasi Peta Interaktif Kawasan Kampus 2 Mugarsari Universitas Siliwangi (Tasikmalaya) Berbasis Marker-Based Web Augmented Reality, Maket 3D, dan Penunjuk Rute Kampus.**  
> Berjalan langsung melalui browser smartphone (Android Chrome & iOS Safari) dan Desktop, serta mendukung instalasi **PWA (Add to Home Screen)**.

🌐 **Akses Live Publik (HTTPS Resmi):** **[https://webar-kampus2-unsil.vercel.app](https://webar-kampus2-unsil.vercel.app)**

---

## 🌟 Fitur Unggulan

1. **Tiga Mode Utama (WebAR, Maket 3D, & Denah 2D):**
   - **Mode WebAR Kamera (`Scan AR`):** Memindai denah masterplan fisik Kampus 2 Mugarsari Unsil dan menampilkan 16 pin lokasi 3D interaktif tepat di atas denah secara presisi dan stabil (termasuk kontrol putar kamera depan/belakang dan matikan kamera).
   - **Mode Maket 3D Interaktif (`Maket 3D`):** Visualisasi maket bangunan 3D layar penuh dengan pembedaan warna **Fakultas Teknik (Biru)** dan **Fakultas Pertanian (Hijau)**, filter fakultas/kategori, sudut pandang *Isometrik / Tampak Atas*, *pinch-to-zoom* 2 jari di mobile, jalur rute 3D bercahaya, serta *camera fly-to* otomatis.
   - **Mode Eksplorasi Denah Digital 2D (`Denah 2D`):** Peta interaktif dengan *pan & zoom*, filter kategori, toggle lapisan **Denah WebAR** vs **Denah Polos**, dan jalur rute SVG teranimasi tanpa memerlukan kamera.
2. **Penunjuk Rute Kampus (*Campus Wayfinding*) — Jalan Kaki vs Kendaraan:**
   - Menggunakan algoritma shortest-path **Dijkstra** di atas graf jaringan jalan riil Kampus 2 Mugarsari (~30 ha).
   - **Mode Jalan Kaki (Garis Hijau–Emas):** Mengarahkan pejalan kaki lewat rute tercepat sisi kanan/depan (`Jalan Depan Rektorat → Simpang Utama → Depan Faperta → Kompleks FT`).
   - **Mode Kendaraan (Garis Biru):** Mewajibkan kendaraan melalui jalur kiri/lingkar barat menuju gedung-gedung kampus.
   - Dilengkapi estimasi jarak (meter), estimasi waktu tempuh (menit), tombol tukar arah, dan sinkronisasi otomatis antara Denah 2D dan Maket 3D.
3. **16 Titik Gedung & Fasilitas Kampus 2 Mugarsari:**
   - **PIN 01 — Gerbang Depan (Gerbang Selatan):** Akses utama mobil & motor, pos keamanan terpadu.
   - **PIN 02 — Gedung Rektorat Kampus 2:** Pusat layanan administrasi & pimpinan universitas.
   - **PIN 03 — Gerbang Belakang (Gerbang Utara):** Pintu gerbang sisi utara kawasan kampus.
   - **PIN 04 — Masjid Letjen. Mashudi:** Pusat kegiatan keislaman & peribadatan civitas.
   - **PIN 05 — Rusunawa Kampus 2:** Fasilitas asrama dan hunian bertingkat mahasiswa.
   - **PIN 06 — Gedung FT 1 (Informatika & Sistem Informasi):** Gedung perkuliahan Prodi IF & SI *(Biru)*.
   - **PIN 07 — Gedung FT 2 (Teknik Elektro):** Gedung perkuliahan Prodi Teknik Elektro *(Biru)*.
   - **PIN 08 — Gedung FT 3 (Teknik Sipil):** Gedung perkuliahan Prodi Teknik Sipil *(Biru)*.
   - **PIN 09 — Gedung FT Labtek 1 (IF & SI):** Laboratorium komputasi Informatika & Sistem Informasi *(Biru)*.
   - **PIN 10 — Gedung FT Labtek 2 (Teknik Elektro):** Laboratorium Teknik Elektro & pusat ujian berbasis komputer *(Biru)*.
   - **PIN 11 — Gedung FT Labtek 3 (Teknik Sipil):** Laboratorium Teknik Sipil & pengujian material *(Biru)*.
   - **PIN 12 — Gedung SBAP Fakultas Teknik:** Sub Bagian Akademik & Kemahasiswaan Fakultas Teknik *(Biru)*.
   - **PIN 13 — Gedung Fakultas Pertanian (Faperta):** Dekanat & pusat administrasi Fakultas Pertanian *(Hijau)*.
   - **PIN 14 — Laboratorium Fakultas Pertanian (Lab. Biometrik):** Lab riset biometrik & praktikum Faperta *(Hijau)*.
   - **PIN 15 — Powerhouse Kampus 2:** Sentral utilitas & distribusi kelistrikan kawasan.
   - **PIN 16 — Ruang Kuliah Fakultas Pertanian:** Gedung ruang kelas perkuliahan Faperta *(Hijau)*.
4. **Kartu Profil Gedung Komprehensif (`BuildingDetailSheet`):**
   - **Auto-Lock / Freeze State & Swipe-Down:** Saat detail gedung terbuka di mode AR, informasi tetap terkunci di layar meski kamera bergeser, dan di perangkat mobile dapat ditutup cepat dengan gestur *swipe* ke bawah.
   - **Tombol Aksi Langsung:** **Rute Peta** (1-klik navigasi ke gedung), **Google Maps** (GPS lapangan nyata), dan **Bagikan** (*Web Share API* / salin *deep-link* `/?gedung=unsil-XX`).
   - **Galeri Foto Dokumentasi:** Pratinjau foto asli gedung (landscape & portrait) teroptimasi WebP dengan navigasi slide dan *modal zoom lightbox*.
   - **Aksesibilitas & Ketahanan Error:** Mendukung standar WCAG 2.2 (*Focus Trap*, *Skip-to-Content*, `aria-live`), Light & Dark Mode, serta Error Boundary khusus WebGL/AR dengan pemulihan 1-klik ke Denah 2D.

---

## 📖 Panduan Penggunaan Aplikasi (Cara Pakai)

### A. Persiapan Gambar Denah Target (Marker)
Aplikasi ini menggunakan teknologi **Marker-Based AR**, artinya kamera membutuhkan gambar denah sebagai jangkar titik koordinat:
1. Anda dapat mencetak gambar denah pada kertas (ukuran A4/A3 disarankan) atau cukup **menampilkannya di layar laptop/tablet/HP lain**.
2. File denah resmi versi terbaru (teroptimasi pelacakan WebAR) dapat dibuka/diunduh melalui:
   - Link langsung: [`public/assets/denah-kampus2-ar.png`](/assets/denah-kampus2-ar.png)
   - Atau klik tombol **"Target Denah"** di navbar / **"Unduh target denah AR"** di halaman beranda.

### B. Menggunakan Mode WebAR (Kamera Smartphone)
1. Buka aplikasi di browser smartphone (disarankan Google Chrome di Android atau Safari di iOS).
2. Pada halaman utama, ketuk tombol **"Scan Denah WebAR"** (atau tab **"AR"** di navbar).
3. Berikan izin akses kamera saat browser meminta persetujuan.
4. Arahkan kamera smartphone menghadap tegak lurus ke gambar denah kampus (posisi portrait A4).
5. Indikator di bagian atas akan berubah dari `"Arahkan kamera ke Denah Kampus 2 Unsil..."` menjadi **`"Denah Terdeteksi: Ketuk Pin Gedung"`**.
6. **Melihat Informasi:**
   - **Ketuk langsung pin nomor (01 - 16)** yang mengambang di atas denah pada layar, ATAU
   - **Ketuk pill nama gedung** di dock bagian bawah layar.
7. Kartu informasi gedung (*Bottom Sheet*) akan muncul menampilkan galeri foto, profil, dan daftar fasilitas. Di mobile, tarik (*swipe*) handle atas ke bawah untuk menutupnya kembali.

### C. Menggunakan Mode Maket 3D Interaktif
1. Ketuk tombol **"Jelajahi Maket 3D"** di beranda atau tab **"Maket 3D"** / **"3D"** pada navbar.
2. Geser layar untuk memutar sudut kamera, cubit 2 jari (*pinch-to-zoom*) di mobile atau scroll mouse di desktop untuk memperbesar, dan gunakan kontrol kanan atas untuk **Tampak Atas / Isometrik**, **Pause/Play**, atau **Reset**.
3. Gunakan filter di kiri atas (`Semua`, `F. Teknik`, `F. Pertanian`, `Fasilitas`, `Ibadah`, `Akses`) atau dock bawah **Fokus Gedung** agar kamera terbang otomatis ke gedung pilihan dan membuka detailnya.

### D. Menggunakan Mode Eksplorasi Digital 2D (Tanpa Kamera)
1. Pada menu atas, alihkan tombol ke tab **"Denah 2D"** / **"2D"** (atau klik **"Buka Denah 2D"** di beranda).
2. Geser denah untuk navigasi (*pan*) dan cubit atau gunakan tombol `+` / `-` untuk memperbesar (*zoom*).
3. Gunakan tombol lapisan di kanan atas untuk beralih antara **Denah WebAR** dan **Denah Polos**, serta filter kategori di kiri atas.
4. Ketuk pin gedung mana saja (01 - 16) untuk membuka informasi lengkap.

---

## 🛠️ Instalasi & Menjalankan Proyek (Bagi Pengembang)

### 1. Clone Repository
```bash
git clone https://github.com/IkhsanFreya/webar-kampus2-unsil.git
cd webar-kampus2-unsil
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Menjalankan Server Lokal
```bash
npm run dev
```
Buka `http://localhost:3000` pada browser laptop.

---

## 📱 Cara Mencoba di Smartphone Melalui Jaringan Wi-Fi Lokal

Browser smartphone memerlukan konteks aman (Secure Context) untuk mengizinkan akses kamera (`getUserMedia`). Karena IP lokal (`192.168.x.x`) berprotokol HTTP biasa, pilih salah satu metode di bawah ini:

### Opsi 1: Mengaktifkan Flag di Android Chrome (Paling Cepat)
1. Pastikan laptop dan HP terhubung ke **Wi-Fi yang sama**.
2. Cek IP laptop via terminal (`ipconfig` di Windows), misal: `192.168.1.9`.
3. Jalankan server di laptop:
   ```bash
   npm run start
   ```
4. Di HP Anda, buka tab baru di Google Chrome dan ketik:
   ```text
   chrome://flags/#unsafely-treat-insecure-origin-as-secure
   ```
5. Masukkan alamat IP dan port laptop Anda: `http://192.168.1.9:3000` (atau sesuaikan IP laptop Anda).
6. Ubah status menjadi **Enabled**, lalu ketuk tombol **Relaunch** di pojok bawah.
7. Buka `http://192.168.1.9:3000` di HP Anda -> Kamera WebAR akan langsung aktif dengan lancar!

### Opsi 2: Menggunakan Proxy HTTPS Bawaan
Telah disediakan skrip proxy SSL otomatis di folder proyek:
```bash
node scripts/https-proxy.js
```
Akses di browser HP: `https://<IP_LAPTOP_ANDA>:3443` (klik *Advanced / Lanjutan* -> *Proceed / Lanjutkan ke situs* untuk menyetujui sertifikat lokal).

---

## 🌐 Rekomendasi: Deploy Online (Vercel / Cloudflare)
Agar aplikasi dapat diakses langsung oleh dosen, penguji, dan teman tanpa perlu repot menyamakan jaringan Wi-Fi, Anda dapat menghubungkan repository GitHub ini ke **[Vercel](https://vercel.com)**:
1. Buka [vercel.com](https://vercel.com) dan login menggunakan akun GitHub Anda.
2. Klik **Add New Project** -> Pilih repository `webar-kampus2-unsil`.
3. Klik **Deploy**.
4. Dalam 1 menit, Anda akan mendapatkan URL publik ber-HTTPS resmi (misal: `https://webar-kampus2-unsil.vercel.app`) yang bisa langsung dibuka di semua HP di mana saja!

---

## 👥 Panduan Kolaborasi Tim (Collaborator Workflow)

Bagi rekan tim yang ingin menambahkan fitur atau data:
1. Pastikan telah diundang sebagai Collaborator di tab *Settings* -> *Collaborators*.
2. Clone repository dan buat branch kerja baru:
   ```bash
   git checkout -b fitur/nama-fitur
   ```
3. Lakukan commit & push:
   ```bash
   git add .
   git commit -m "feat: deskripsi perubahan"
   git push origin fitur/nama-fitur
   ```

---

## 📁 Menambah Titik Gedung Baru
Seluruh data gedung dikelola secara modular pada file:
[`src/data/campusBuildings.ts`](/src/data/campusBuildings.ts)

Contoh struktur data objek gedung:
```typescript
{
  id: "unsil-17",
  code: "17",
  name: "Gedung Kuliah Bersama",
  subtitle: "Ruang Perkuliahan Terpadu",
  faculty: "Universitas Siliwangi",
  category: "academic",
  categoryLabel: "Akademik",
  color: "#15803d",
  accentColor: "rgba(21, 128, 61, 0.2)",
  hasMapPin: true,
  mapCoord: { xPercent: 55.0, yPercent: 42.0 },  // Koordinat denah 2D (%)
  arCoord: { x: 0.05, y: 0.113, z: 0.06 },       // Koordinat AR 3D di atas marker
  shortDesc: "Deskripsi singkat fungsi gedung...",
  fullDesc: "Penjelasan lengkap sejarah, fungsi, dan ruangan...",
  facilities: ["Ruang Kuliah Ber-AC", "Smart TV Interaktif", "Wi-Fi Kampus"],
  gallery: [
    {
      url: "/assets/buildings/gkb-1.webp",
      caption: "Tampak Depan",
      tag: "Eksterior",
      orientation: "landscape",
    }
  ]
}
```

---

## 🛡️ Lisensi & Hak Cipta
Proyek ini dikembangkan untuk keperluan **UAS Rekayasa Sistem Multimedia (RSM) 2026** — Program Studi Informatika, Fakultas Teknik, Universitas Siliwangi (Tasikmalaya).
