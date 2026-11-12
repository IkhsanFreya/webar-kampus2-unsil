# 🏛️ Peta Interaktif Kampus 2 Universitas Siliwangi (Marker-Based WebAR)

> **Aplikasi Peta Interaktif Kawasan Kampus 2 Mugarsari Universitas Siliwangi (Tasikmalaya) Berbasis Marker-Based Web Augmented Reality.**  
> Berjalan langsung melalui browser smartphone (Android Chrome & iOS Safari) dan Desktop tanpa perlu menginstal aplikasi tambahan di Play Store/App Store.

---

## 🌟 Fitur Unggulan

1. **Dual Access Mode (Fleksibel & Siap Demo):**
   - **Mode WebAR Kamera:** Memindai denah masterplan fisik Kampus 2 Mugarsari Unsil dan menampilkan pin lokasi 3D interaktif tepat di atas denah secara presisi dan stabil.
   - **Mode Eksplorasi Denah Digital 2D:** Peta interaktif virtual dengan fitur *pan & zoom*, switch layer *Vektor vs Blueprint*, dan interaksi klik tanpa kamera (ideal untuk laptop, minim cahaya, atau pengujian cepat).
2. **6 Titik Gedung Utama Kampus 2 Mugarsari:**
   - **PIN 01 — Gerbang Selatan (Pintu Masuk Utama):** Akses utama mobil & motor, pos keamanan terpadu.
   - **PIN 02 — Masjid Letjen. Mashudi:** Pusat kegiatan keislaman & peribadatan kampus.
   - **PIN 03 — Gedung FP Lab. Biometrik:** Laboratorium riset biometrik & agronomi Fakultas Pertanian.
   - **PIN 04 — Gedung FT Labtek 2 (Fakultas Teknik):** Lab Komputer Praktikum 3 & Sekretariat Pusat UTBK-SNBT.
   - **PIN 05 — Gedung FT Labtek 3 (Fakultas Teknik):** Kompleks laboratorium Teknik Sipil & Teknik Informatika/IoT.
   - **PIN 06 — Gerbang Utara Kampus 2:** Pintu gerbang sisi utara khusus akses motor mahasiswa/dosen.
3. **Kartu Profil Gedung Komprehensif (`BuildingDetailSheet`):**
   - **Auto-Lock / Freeze State:** Saat detail gedung terbuka, informasi tetap terkunci di layar agar nyaman dibaca meski kamera digeser dari kertas denah.
   - **Galeri Foto Dokumentasi:** Pratinjau foto asli gedung dengan kontrol navigasi, badge ruangan, dan fitur *modal zoom lightbox*.
   - **Profil & Fasilitas:** Ringkasan fungsi gedung dan chip fasilitas utama.
   - **Pemutar Narasi Audio:** Pemutar audio interaktif dengan visualisasi gelombang dan *ambient synth fallback* otomatis via Web Audio API.
4. **Quick-Select Floating Dock:** Akses cepat satu ketukan di bagian bawah HUD kamera untuk memudahkan pemilihan gedung saat tangan pengguna bergoyang memegang ponsel.

---

## 📖 Panduan Penggunaan Aplikasi (Cara Pakai)

### A. Persiapan Gambar Denah Target (Marker)
Aplikasi ini menggunakan teknologi **Marker-Based AR**, artinya kamera membutuhkan gambar denah sebagai jangkar titik koordinat:
1. Anda dapat mencetak gambar denah pada kertas (ukuran A4/A3 disarankan) atau cukup **menampilkannya di layar laptop/tablet/HP lain**.
2. File denah resmi kampus dapat dibuka/diunduh melalui:
   - Link langsung: [`public/targets/denah-kampus2.jpg`](/targets/denah-kampus2.jpg)
   - Atau klik tombol **"Lihat / Cetak Target Denah"** di halaman awal aplikasi.

### B. Menggunakan Mode WebAR (Kamera Smartphone)
1. Buka aplikasi di browser smartphone (disarankan Google Chrome di Android atau Safari di iOS).
2. Pada halaman utama, ketuk tombol hijau **"Mulai Scan Denah (WebAR)"**.
3. Berikan izin akses kamera saat browser meminta persetujuan.
4. Arahkan kamera smartphone menghadap tegak lurus ke gambar denah kampus.
5. Indikator di bagian atas akan berubah dari `"Arahkan kamera ke Denah Kampus 2 Unsil..."` menjadi **`"Denah Terdeteksi — Ketuk Pin Gedung"`**.
6. **Melihat Informasi:**
   - **Ketuk langsung pin nomor (01 - 06)** yang mengambang di atas denah pada layar, ATAU
   - **Ketuk pill nama gedung** di dock bagian bawah layar.
7. Kartu informasi gedung (*Bottom Sheet*) akan muncul menampilkan galeri foto, deskripsi, fasilitas, serta pemutar audio narasi.

### C. Menggunakan Mode Eksplorasi Digital 2D (Tanpa Kamera)
1. Pada menu atas, alihkan tombol ke tab **"2D"** (atau pilih *"Mode Eksplorasi Denah Digital"* di halaman awal).
2. Geser denah untuk navigasi (*pan*) dan gunakan tombol `+` / `-` untuk memperbesar (*zoom*).
3. Anda dapat beralih antara tampilan **Vektor Modern** dan **Blueprint Klasik**.
4. Ketuk pin gedung mana saja untuk membuka informasi lengkap.

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
  id: "unsil-07",
  code: "07",
  name: "Gedung Kuliah Bersama",
  subtitle: "Ruang Perkuliahan Terpadu",
  faculty: "Universitas Siliwangi",
  category: "academic",
  categoryLabel: "Akademik",
  color: "#10b981",
  mapCoord: { xPercent: 55.0, yPercent: 42.0 },  // Koordinat denah 2D (%)
  arCoord: { x: 0.12, y: 0.05, z: 0.06 },        // Koordinat AR 3D di atas marker
  shortDesc: "Deskripsi singkat fungsi gedung...",
  fullDesc: "Penjelasan lengkap sejarah, fungsi, dan ruangan...",
  facilities: ["Ruang Kuliah Ber-AC", "Smart TV Interaktif", "Wi-Fi Kampus"],
  gallery: [
    { url: "/assets/buildings/gkb-1.jpg", caption: "Tampak Depan", tag: "Eksterior" }
  ],
  audioPath: "/assets/audio/narasi-gedung.wav",
  audioTitle: "Narasi Profil Gedung",
  audioDuration: 15
}
```

---

## 🛡️ Lisensi & Hak Cipta
Proyek ini dikembangkan untuk keperluan **UAS Rekayasa Sistem Multimedia (RSM) 2026** — Program Studi Informatika, Fakultas Teknik, Universitas Siliwangi (Tasikmalaya).
