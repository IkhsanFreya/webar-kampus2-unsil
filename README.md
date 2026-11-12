# 🏛️ Peta Interaktif Kampus 2 Universitas Siliwangi (Marker-Based WebAR)

> **Aplikasi Peta Interaktif Kawasan Kampus 2 Mugarsari Universitas Siliwangi (Tasikmalaya) Berbasis Marker-Based Web Augmented Reality.**
> Tanpa instalasi aplikasi tambahan, berjalan langsung melalui browser smartphone (iOS Safari & Android Chrome) dan Desktop.

---

## 🌟 Fitur Unggulan

1. **Dual Access Mode:**
   - **Mode WebAR Kamera:** Memindai denah masterplan fisik Kampus 2 Mugarsari Unsil dan menampilkan pin lokasi 3D interaktif tepat di atas denah secara presisi.
   - **Mode Eksplorasi Denah Digital 2D:** Simulasi peta interaktif dengan fitur *pan & zoom*, pergantian layer *blueprint/vektor*, dan interaksi klik tanpa kamera (cocok untuk pengujian di laptop atau kondisi minim cahaya).
2. **6 Titik Gedung Utama Kampus 2 Mugarsari:**
   - **PIN 01 — Gerbang Selatan (Pintu Masuk Utama):** Akses utama kendaraan roda 4 & 2, pos keamanan 24 jam.
   - **PIN 02 — Masjid Letjen. Mashudi:** Pusat kegiatan keislaman dan peribadatan sivitas akademika Unsil.
   - **PIN 03 — Gedung FP Lab. Biometrik:** Fasilitas laboratorium riset hayati Fakultas Pertanian Unsil.
   - **PIN 04 — Gedung FT Labtek 2 (Fakultas Teknik):** Lab Komputer Praktikum 3 & Sekretariat Pusat UTBK-SNBT Kampus 2.
   - **PIN 05 — Gedung FT Labtek 3 (Fakultas Teknik):** Kompleks laboratorium uji bahan Teknik Sipil & lab informatika/IoT.
   - **PIN 06 — Gerbang Utara Kampus 2:** Pintu gerbang sisi utara khusus kendaraan roda dua (sepeda motor).
3. **Kartu Profil Gedung Komprehensif (`BuildingDetailSheet`):**
   - **Auto-Lock / Freeze State:** Informasi gedung tetap terkunci di layar saat kartu dibuka, meskipun kamera ponsel bergeser dari kertas denah.
   - **Galeri Foto:** Pratinjau foto dokumentasi asli gedung dengan kontrol navigasi dan modal *lightbox zoom*.
   - **Profil & Fasilitas:** Ringkasan fungsi gedung dan chip fasilitas utama.
   - **Pemutar Audio Narasi:** Pemutar suara panduan interaktif dilengkapi visualisasi gelombang audio dan *fallback synthesizer* Web Audio API.
4. **Quick-Select Floating Dock:** Akses cepat satu ketukan di bagian bawah layar untuk mengantisipasi tangan pengguna yang bergoyang saat memegang ponsel.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript (`strict: true`)
- **WebAR Engine:** MindAR (`mindar-image`) & A-Frame (Loaded dynamically client-side only)
- **Styling:** Tailwind CSS (Dark Slate, Siliwangi Emerald & Gold accents)
- **Icons & Motion:** `lucide-react` & `framer-motion`

---

## 🚀 Panduan Instalasi & Menjalankan Proyek

### 1. Clone Repository
```bash
git clone https://github.com/IkhsanFreya/webar-kampus2-unsil.git
cd webar-kampus2-unsil
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Jalankan Server Pengembangan
```bash
npm run dev
```
Akses aplikasi melalui browser di `http://localhost:3000`.

---

## 📱 Cara Mencoba di Smartphone (Jaringan Wi-Fi yang Sama)

1. Pastikan laptop dan HP terhubung ke **jaringan Wi-Fi yang sama**.
2. Cek alamat IP lokal laptop Anda melalui terminal (`ipconfig` di Windows). Contoh: `192.168.1.9`.
3. Jalankan server dengan bind host `0.0.0.0`:
   ```bash
   npm run start
   ```
4. Di browser HP (Android Chrome), aktifkan izin kamera untuk IP lokal sekali saja:
   - Buka tab: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
   - Masukkan: `http://192.168.1.9:3000` -> Ubah ke **Enabled** -> Ketuk **Relaunch**.
5. Buka `http://192.168.1.9:3000` di HP Anda, lalu arahkan kamera ke gambar denah di layar laptop Anda di `http://localhost:3000/targets/denah-kampus2.jpg`.

---

## 👥 Panduan Kolaborasi Tim (Colaborators Workflow)

Untuk rekan tim yang ingin berkontribusi:
1. Pastikan Anda telah diundang sebagai **Collaborator** di menu *Settings* -> *Collaborators* repository ini.
2. Buat branch baru sebelum mengedit kode:
   ```bash
   git checkout -b fitur/nama-fitur-baru
   ```
3. Lakukan commit dengan pesan yang jelas:
   ```bash
   git add .
   git commit -m "feat: tambah titik gedung laboratorium baru"
   ```
4. Push branch ke GitHub dan buat Pull Request (PR):
   ```bash
   git push origin fitur/nama-fitur-baru
   ```

---

## 📁 Struktur Data Gedung
Untuk menambah titik gedung baru, cukup sunting file:
`src/data/campusBuildings.ts`

Setiap gedung memiliki struktur modular:
```typescript
{
  id: "unsil-07",
  code: "07",
  name: "Nama Gedung",
  subtitle: "Fungsi Singkat",
  faculty: "Fakultas / Unit",
  category: "academic",
  categoryLabel: "Kategori",
  color: "#10b981",
  mapCoord: { xPercent: 50.0, yPercent: 50.0 },
  arCoord: { x: 0.0, y: 0.0, z: 0.06 },
  shortDesc: "Deskripsi singkat...",
  fullDesc: "Penjelasan lengkap profil dan fungsi...",
  facilities: ["Fasilitas 1", "Fasilitas 2"],
  gallery: [{ url: "/assets/buildings/foto.jpg", caption: "...", tag: "Eksterior" }],
  audioPath: "/assets/audio/narasi-gedung.wav",
  audioTitle: "Judul Audio",
  audioDuration: 15
}
```

---

© 2026 Universitas Siliwangi Tasikmalaya • Proyek UAS Rekayasa Sistem Multimedia (RSM)
