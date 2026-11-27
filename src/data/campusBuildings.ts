/**
 * ============================================================================
 * FILE: src/data/campusBuildings.ts
 * PERAN: Basis data terpusat (Single Source of Truth) untuk 16 gedung Kampus 2 UNSIL.
 * PENJELASAN PRESENTASI:
 * Menyimpan seluruh konfigurasi denah target AR (`CAMPUS_MAP_CONFIG`) serta data
 * modular 16 gedung: kode pin, fakultas, warna identitas (FT=Biru, Faperta=Hijau),
 * koordinat peta 2D (`mapCoord` dalam persen), koordinat ruang AR 3D (`arCoord`
 * dalam satuan X,Y,Z di atas marker), daftar fasilitas, dan galeri foto WebP.
 * ============================================================================
 */
export interface BuildingPhoto {
  url: string;
  caption: string;
  tag: string;
  orientation: "landscape" | "portrait";
}

export interface CampusBuilding {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  faculty: string;
  category: "gate" | "academic" | "facility" | "worship";
  categoryLabel: string;
  color: string;
  accentColor: string;
  hasMapPin: boolean;
  mapCoord?: {
    xPercent: number;
    yPercent: number;
  };
  arCoord?: {
    x: number;
    y: number;
    z: number;
  };
  shortDesc: string;
  fullDesc: string;
  facilities: string[];
  gallery: BuildingPhoto[];
}

export type MappedCampusBuilding = CampusBuilding & {
  hasMapPin: true;
  mapCoord: {
    xPercent: number;
    yPercent: number;
  };
  arCoord: {
    x: number;
    y: number;
    z: number;
  };
};

export const CAMPUS_MAP_CONFIG = {
  arTargetSrc: "/targets/denah-kampus2-ar.webp",
  printTargetSrc: "/assets/denah-kampus2-ar.png",
  originalNewSrc: "/assets/denah-kampus2-clean.webp",
  mindSrc: "/targets/kampus2.mind",
  width: 1024,
  height: 1448,
  aspectRatio: 1448 / 1024,
} as const;

export const CAMPUS_BUILDINGS: CampusBuilding[] = [
  {
    id: "unsil-01",
    code: "01",
    name: "Gerbang Depan (Gerbang Selatan)",
    subtitle: "Akses Utama Kendaraan Roda 4 & Roda 2",
    faculty: "Fasilitas Umum & Keamanan Kampus",
    category: "gate",
    categoryLabel: "Akses Utama",
    color: "#b45309",
    accentColor: "rgba(180, 83, 9, 0.2)",
    hasMapPin: true,
    mapCoord: {
      xPercent: 20.6,
      yPercent: 75.4,
    },
    arCoord: {
      x: -0.294,
      y: -0.359,
      z: 0.06,
    },
    shortDesc:
      "Akses masuk utama kawasan Kampus 2 Mugarsari Universitas Siliwangi dengan pos keamanan terpadu dan jalur sirkulasi kendaraan.",
    fullDesc:
      "Gerbang Depan (Gerbang Selatan) merupakan pintu gerbang utama yang menghubungkan akses jalan kawasan Mugarsari dengan area internal Kampus 2 Universitas Siliwangi. Dilengkapi pos penjagaan keamanan, jalur keluar-masuk kendaraan roda empat dan roda dua, serta akses pedestrian menuju fasilitas ibadah dan gedung perkuliahan.",
    facilities: [
      "Pos Pengamanan & Penjagaan Gerbang",
      "Jalur Masuk & Keluar Kendaraan Terpisah",
      "Area Drop-Off Tamu & Civitas Akademika",
      "Akses Pedestrian Menuju Kawasan Kampus",
    ],
    gallery: [
      {
        url: "/assets/buildings/Gerbang_Depan.webp",
        caption: "Tampak depan Gerbang Depan (Gerbang Selatan) Kampus 2 Unsil",
        tag: "Tampak Depan",
        orientation: "landscape",
      },
    ],
  },
  {
    id: "unsil-02",
    code: "02",
    name: "Gedung Rektorat Kampus 2",
    subtitle: "Pusat Layanan Administrasi & Pimpinan Universitas",
    faculty: "Universitas Siliwangi",
    category: "facility",
    categoryLabel: "Administrasi Pusat",
    color: "#334155",
    accentColor: "rgba(51, 65, 85, 0.2)",
    hasMapPin: true,
    mapCoord: {
      xPercent: 17.8,
      yPercent: 60.1,
    },
    arCoord: {
      x: -0.322,
      y: -0.143,
      z: 0.06,
    },
    shortDesc:
      "Gedung pusat administrasi dan tata kelola universitas di kawasan Kampus 2 Mugarsari Universitas Siliwangi.",
    fullDesc:
      "Gedung Rektorat Kampus 2 menjadi pusat kegiatan administratif, layanan tata usaha universitas, serta ruang koordinasi pimpinan dan tamu institusi di lingkungan Kampus 2 Mugarsari.",
    facilities: [
      "Lobi Layanan Tamu & Informasi",
      "Ruang Tata Usaha & Administrasi Universitas",
      "Ruang Rapat & Pertemuan Institusi",
      "Area Parkir Resmi Gedung",
    ],
    gallery: [
      {
        url: "/assets/buildings/Gedung_Rektor.webp",
        caption: "Fasad utama Gedung Rektorat Kampus 2 Mugarsari",
        tag: "Eksterior",
        orientation: "landscape",
      },
    ],
  },
  {
    id: "unsil-03",
    code: "03",
    name: "Gerbang Belakang (Gerbang Utara)",
    subtitle: "Pintu Masuk & Keluar Sisi Utara",
    faculty: "Fasilitas Sirkulasi Kampus",
    category: "gate",
    categoryLabel: "Akses Utara",
    color: "#b45309",
    accentColor: "rgba(180, 83, 9, 0.2)",
    hasMapPin: true,
    mapCoord: {
      xPercent: 44.6,
      yPercent: 1.4,
    },
    arCoord: {
      x: -0.054,
      y: 0.688,
      z: 0.06,
    },
    shortDesc:
      "Akses gerbang sisi utara kawasan Kampus 2 Mugarsari untuk mengurai kepadatan lalu lintas menuju area Rusunawa dan fakultas.",
    fullDesc:
      "Gerbang Belakang (Gerbang Utara) melayani akses keluar-masuk sisi utara Kampus 2 Mugarsari, khususnya bagi mahasiswa dan sivitas yang menuju area Rusunawa dan kompleks perkuliahan tanpa harus memutar lewat gerbang utama selatan.",
    facilities: [
      "Pos Penjagaan Sisi Utara",
      "Akses Cepat Menuju Kompleks Rusunawa & FT",
      "Jalur Sirkulasi Kendaraan Roda Dua",
      "Konektivitas Jalan Lingkar Kampus",
    ],
    gallery: [
      {
        url: "/assets/buildings/Gerbang_Belakang.webp",
        caption: "Gerbang Belakang (Gerbang Utara) Kampus 2 Unsil",
        tag: "Aksesibilitas",
        orientation: "landscape",
      },
    ],
  },
  {
    id: "unsil-04",
    code: "04",
    name: "Masjid Letjen. Mashudi",
    subtitle: "Pusat Ibadah & Kegiatan Keislaman Kampus 2",
    faculty: "Fasilitas Sosial & Ibadah Civitas",
    category: "worship",
    categoryLabel: "Pusat Ibadah",
    color: "#0f766e",
    accentColor: "rgba(15, 118, 110, 0.2)",
    hasMapPin: true,
    mapCoord: {
      xPercent: 13.0,
      yPercent: 75.2,
    },
    arCoord: {
      x: -0.370,
      y: -0.356,
      z: 0.06,
    },
    shortDesc:
      "Pusat peribadatan dan pembinaan keagamaan bagi mahasiswa, dosen, serta warga sekitar Kampus 2 Mugarsari.",
    fullDesc:
      "Masjid Letjen. Mashudi berdiri di sisi barat gerbang depan Kampus 2 Mugarsari. Menjadi pusat ibadah harian civitas akademika Universitas Siliwangi, pelaksanaan sholat berjamaah, kajian keislaman mahasiswa, serta aktivitas sosial keagamaan kampus.",
    facilities: [
      "Ruang Sholat Utama Berkapasitas Besar",
      "Area Wudhu & Sanitasi Terpisah",
      "Pelataran Terbuka & Selasar Masjid",
      "Area Parkir Kendaraan Jamaah",
    ],
    gallery: [
      {
        url: "/assets/buildings/Faperta/Landscape/Masjid_Letjen_Mashudi.webp",
        caption: "Fasad eksterior Masjid Letjen. Mashudi Kampus 2 Mugarsari",
        tag: "Eksterior",
        orientation: "landscape",
      },
      {
        url: "/assets/buildings/Faperta/Potrait/Masjid_Letjen.webp",
        caption: "Tampak vertikal bangunan dan menara Masjid Letjen. Mashudi",
        tag: "Arsitektur",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "unsil-05",
    code: "05",
    name: "Rusunawa Kampus 2",
    subtitle: "Rumah Susun Sederhana Sewa Mahasiswa",
    faculty: "Fasilitas Hunian Kampus",
    category: "facility",
    categoryLabel: "Hunian Mahasiswa",
    color: "#334155",
    accentColor: "rgba(51, 65, 85, 0.2)",
    hasMapPin: true,
    mapCoord: {
      xPercent: 35.8,
      yPercent: 5.6,
    },
    arCoord: {
      x: -0.143,
      y: 0.628,
      z: 0.06,
    },
    shortDesc:
      "Fasilitas asrama dan hunian bertingkat di sisi utara kawasan Kampus 2 Mugarsari untuk mahasiswa Universitas Siliwangi.",
    fullDesc:
      "Rusunawa Kampus 2 menyediakan tempat tinggal terpadu bagi mahasiswa Universitas Siliwangi di dalam kawasan Mugarsari, dekat dengan akses Gerbang Belakang sehingga memudahkan mobilitas menuju gedung perkuliahan.",
    facilities: [
      "Unit Kamar Hunian Mahasiswa Bertingkat",
      "Area Bersama & Koridor Penghubung",
      "Area Parkir Penghuni",
      "Lingkungan Kampus Terjangkau Jalan Kaki",
    ],
    gallery: [
      {
        url: "/assets/buildings/Rusunawa.webp",
        caption: "Tampak bangunan Rusunawa di kawasan Kampus 2 Unsil",
        tag: "Eksterior",
        orientation: "landscape",
      },
    ],
  },
  {
    id: "unsil-06",
    code: "06",
    name: "Gedung FT 1 (Informatika & Sistem Informasi)",
    subtitle: "Gedung Perkuliahan Prodi Informatika dan Sistem Informasi",
    faculty: "Fakultas Teknik",
    category: "academic",
    categoryLabel: "Perkuliahan FT",
    color: "#1d4ed8",
    accentColor: "rgba(29, 78, 216, 0.2)",
    hasMapPin: true,
    mapCoord: {
      xPercent: 42.2,
      yPercent: 33.1,
    },
    arCoord: {
      x: -0.078,
      y: 0.238,
      z: 0.06,
    },
    shortDesc:
      "Gedung perkuliahan utama Fakultas Teknik untuk Program Studi Informatika dan Sistem Informasi.",
    fullDesc:
      "Gedung FT 1 mewadahi aktivitas perkuliahan tatap muka, seminar akademik, dan kegiatan mahasiswa Program Studi Informatika serta Sistem Informasi di Fakultas Teknik Universitas Siliwangi.",
    facilities: [
      "Ruang Kuliah Informatika & Sistem Informasi",
      "Ruang Seminar & Presentasi Akademik",
      "Selasar & Area Diskusi Mahasiswa",
      "Akses Terintegrasi Menuju Labtek",
    ],
    gallery: [
      {
        url: "/assets/buildings/Fakultas_Teknik/Landscape/FT1_IF_dan_SI.webp",
        caption: "Tampak depan Gedung FT 1 (Informatika & Sistem Informasi)",
        tag: "Tampak Depan",
        orientation: "landscape",
      },
      {
        url: "/assets/buildings/Fakultas_Teknik/Potrait/FT1_IF_dan_SI_Potrait.webp",
        caption: "Sudut vertikal bangunan Gedung FT 1",
        tag: "Eksterior",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "unsil-07",
    code: "07",
    name: "Gedung FT 2 (Teknik Elektro)",
    subtitle: "Gedung Perkuliahan Prodi Teknik Elektro",
    faculty: "Fakultas Teknik",
    category: "academic",
    categoryLabel: "Perkuliahan FT",
    color: "#1d4ed8",
    accentColor: "rgba(29, 78, 216, 0.2)",
    hasMapPin: true,
    mapCoord: {
      xPercent: 36.4,
      yPercent: 41.0,
    },
    arCoord: {
      x: -0.136,
      y: 0.128,
      z: 0.06,
    },
    shortDesc:
      "Gedung perkuliahan dan aktivitas akademik Program Studi Teknik Elektro Fakultas Teknik.",
    fullDesc:
      "Gedung FT 2 merupakan gedung perkuliahan Fakultas Teknik yang digunakan untuk kegiatan belajar mengajar, bimbingan akademik, dan aktivitas Program Studi Teknik Elektro.",
    facilities: [
      "Ruang Kuliah Teknik Elektro",
      "Ruang Sidang & Bimbingan Akademik",
      "Koridor Penghubung Kompleks FT",
    ],
    gallery: [
      {
        url: "/assets/buildings/Fakultas_Teknik/Landscape/FT2_Elektro.webp",
        caption: "Tampak depan Gedung FT 2 (Teknik Elektro)",
        tag: "Tampak Depan",
        orientation: "landscape",
      },
      {
        url: "/assets/buildings/Fakultas_Teknik/Potrait/FT2_Elektro_Potrait.webp",
        caption: "Tampak vertikal Gedung FT 2 (Teknik Elektro)",
        tag: "Eksterior",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "unsil-08",
    code: "08",
    name: "Gedung FT 3 (Teknik Sipil)",
    subtitle: "Gedung Perkuliahan Prodi Teknik Sipil",
    faculty: "Fakultas Teknik",
    category: "academic",
    categoryLabel: "Perkuliahan FT",
    color: "#1d4ed8",
    accentColor: "rgba(29, 78, 216, 0.2)",
    hasMapPin: true,
    mapCoord: {
      xPercent: 46.1,
      yPercent: 34.6,
    },
    arCoord: {
      x: -0.039,
      y: 0.217,
      z: 0.06,
    },
    shortDesc:
      "Gedung perkuliahan dan kegiatan akademik Program Studi Teknik Sipil Fakultas Teknik.",
    fullDesc:
      "Gedung FT 3 digunakan untuk perkuliahan reguler, kegiatan studio perancangan, dan aktivitas akademik mahasiswa Program Studi Teknik Sipil di Kampus 2 Mugarsari.",
    facilities: [
      "Ruang Kuliah Teknik Sipil",
      "Area Studio & Diskusi Tugas Perancangan",
      "Akses Langsung ke Labtek 3 Teknik Sipil",
    ],
    gallery: [
      {
        url: "/assets/buildings/Fakultas_Teknik/Landscape/FT3_Sipil.webp",
        caption: "Tampak depan Gedung FT 3 (Teknik Sipil)",
        tag: "Tampak Depan",
        orientation: "landscape",
      },
      {
        url: "/assets/buildings/Fakultas_Teknik/Potrait/FT3_Sipil_Potrait.webp",
        caption: "Tampak vertikal Gedung FT 3 (Teknik Sipil)",
        tag: "Eksterior",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "unsil-09",
    code: "09",
    name: "Gedung FT Labtek 1 (IF & SI)",
    subtitle: "Laboratorium Informatika & Sistem Informasi",
    faculty: "Fakultas Teknik",
    category: "academic",
    categoryLabel: "Labtek Teknik",
    color: "#1d4ed8",
    accentColor: "rgba(29, 78, 216, 0.2)",
    hasMapPin: true,
    mapCoord: {
      xPercent: 38.2,
      yPercent: 31.8,
    },
    arCoord: {
      x: -0.118,
      y: 0.258,
      z: 0.06,
    },
    shortDesc:
      "Gedung laboratorium komputer dan praktikum terpadu untuk Program Studi Informatika dan Sistem Informasi.",
    fullDesc:
      "Gedung FT Labtek 1 merupakan fasilitas laboratorium komputasi Fakultas Teknik yang menunjang praktikum pemrograman, rekayasa perangkat lunak, jaringan, dan analisis sistem informasi.",
    facilities: [
      "Laboratorium Praktikum Informatika & Sistem Informasi",
      "Ruang Praktikum Komputasi & Pemrograman",
      "Ruang Teknisi & Pengelolaan Jaringan Lab",
    ],
    gallery: [
      {
        url: "/assets/buildings/Fakultas_Teknik/Landscape/Labtek1_SI_IF.webp",
        caption: "Tampak depan Gedung FT Labtek 1 (IF & SI)",
        tag: "Tampak Depan",
        orientation: "landscape",
      },
      {
        url: "/assets/buildings/Fakultas_Teknik/Potrait/Labtek1_SI_IF_Potrait.webp",
        caption: "Tampak vertikal Gedung FT Labtek 1",
        tag: "Eksterior",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "unsil-10",
    code: "10",
    name: "Gedung FT Labtek 2 (Teknik Elektro)",
    subtitle: "Laboratorium Teknik Elektro & Pusat Ujian",
    faculty: "Fakultas Teknik",
    category: "academic",
    categoryLabel: "Labtek Teknik",
    color: "#1d4ed8",
    accentColor: "rgba(29, 78, 216, 0.2)",
    hasMapPin: true,
    mapCoord: {
      xPercent: 32.4,
      yPercent: 39.6,
    },
    arCoord: {
      x: -0.176,
      y: 0.147,
      z: 0.06,
    },
    shortDesc:
      "Kompleks laboratorium teknik elektro dan komputasi yang digunakan untuk praktikum serta kegiatan ujian berbasis komputer.",
    fullDesc:
      "Gedung FT Labtek 2 merupakan gedung laboratorium terpadu Fakultas Teknik di kawasan tengah Kampus 2 Mugarsari. Gedung ini menopang kegiatan praktikum laboratorium Teknik Elektro, praktikum komputer, serta pelaksanaan ujian berbasis komputer.",
    facilities: [
      "Ruang Laboratorium Teknik Elektro",
      "Ruang Praktikum Komputer & CBT",
      "Ruang Pengelola & Teknisi Laboratorium",
      "Akses Jaringan Internet Kampus",
    ],
    gallery: [
      {
        url: "/assets/buildings/Fakultas_Teknik/Landscape/Labtek2_Elektro.webp",
        caption: "Fasad Gedung FT Labtek 2 (Lab. Teknik Elektro)",
        tag: "Tampak Depan",
        orientation: "landscape",
      },
      {
        url: "/assets/buildings/Fakultas_Teknik/Potrait/Labtek2_Elektro_Potrait.webp",
        caption: "Tampak vertikal Gedung FT Labtek 2",
        tag: "Eksterior",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "unsil-11",
    code: "11",
    name: "Gedung FT Labtek 3 (Teknik Sipil)",
    subtitle: "Kompleks Lab Teknik Sipil & Pengujian Rekayasa",
    faculty: "Fakultas Teknik",
    category: "academic",
    categoryLabel: "Labtek Teknik",
    color: "#1d4ed8",
    accentColor: "rgba(29, 78, 216, 0.2)",
    hasMapPin: true,
    mapCoord: {
      xPercent: 40.3,
      yPercent: 42.4,
    },
    arCoord: {
      x: -0.097,
      y: 0.108,
      z: 0.06,
    },
    shortDesc:
      "Fasilitas laboratorium pengujian material dan rekayasa Teknik Sipil serta praktikum riset Fakultas Teknik.",
    fullDesc:
      "Gedung FT Labtek 3 mewadahi aktivitas praktikum dan pengujian rekayasa Teknik Sipil (material konstruksi, mekanika tanah, dan struktur) sekaligus menunjang aktivitas riset terpadu mahasiswa Fakultas Teknik di Kampus 2 Mugarsari.",
    facilities: [
      "Laboratorium Teknik Sipil & Uji Material",
      "Ruang Praktikum & Pengukuran Rekayasa",
      "Ruang Diskusi Riset Mahasiswa",
      "Area Kerja Teknis & Peralatan Uji",
    ],
    gallery: [
      {
        url: "/assets/buildings/Fakultas_Teknik/Landscape/Labtek3_Sipil.webp",
        caption: "Tampak depan Gedung FT Labtek 3 (Lab. Teknik Sipil)",
        tag: "Tampak Depan",
        orientation: "landscape",
      },
      {
        url: "/assets/buildings/Fakultas_Teknik/Potrait/Labtek3_Sipil_Potrait.webp",
        caption: "Tampak vertikal Gedung FT Labtek 3",
        tag: "Eksterior",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "unsil-12",
    code: "12",
    name: "Gedung SBAP Fakultas Teknik",
    subtitle: "Sub Bagian Akademik & Kemahasiswaan Fakultas Teknik",
    faculty: "Fakultas Teknik",
    category: "facility",
    categoryLabel: "Layanan Akademik FT",
    color: "#1d4ed8",
    accentColor: "rgba(29, 78, 216, 0.2)",
    hasMapPin: true,
    mapCoord: {
      xPercent: 31.5,
      yPercent: 34.3,
    },
    arCoord: {
      x: -0.185,
      y: 0.222,
      z: 0.06,
    },
    shortDesc:
      "Pusat layanan administrasi akademik, surat-menyurat, dan kemahasiswaan Fakultas Teknik.",
    fullDesc:
      "Gedung SBAP Fakultas Teknik melayani kebutuhan administratif mahasiswa dan dosen Fakultas Teknik, mulai dari pengurusan berkas akademik, jadwal kuliah, hingga layanan administrasi kemahasiswaan.",
    facilities: [
      "Loket Pelayanan Administrasi Akademik FT",
      "Ruang Layanan Kemahasiswaan & Alumni",
      "Ruang Arsip & Pengelolaan Dokumen Fakultas",
    ],
    gallery: [
      {
        url: "/assets/buildings/Fakultas_Teknik/Landscape/SBAP_Teknik.webp",
        caption: "Gedung SBAP Fakultas Teknik Kampus 2 Mugarsari",
        tag: "Layanan Akademik",
        orientation: "landscape",
      },
    ],
  },
  {
    id: "unsil-13",
    code: "13",
    name: "Gedung Fakultas Pertanian (Faperta)",
    subtitle: "Gedung Dekanat & Pusat Kegiatan Fakultas Pertanian",
    faculty: "Fakultas Pertanian (Agroteknologi & Agribisnis)",
    category: "academic",
    categoryLabel: "Fakultas Pertanian",
    color: "#15803d",
    accentColor: "rgba(21, 128, 61, 0.2)",
    hasMapPin: true,
    mapCoord: {
      xPercent: 17.6,
      yPercent: 48.5,
    },
    arCoord: {
      x: -0.324,
      y: 0.021,
      z: 0.06,
    },
    shortDesc:
      "Gedung utama Fakultas Pertanian yang menjadi pusat administrasi dekanat, ruang dosen, dan layanan akademik Faperta.",
    fullDesc:
      "Gedung Fakultas Pertanian berfungsi sebagai pusat pengelolaan akademik Fakultas Pertanian Universitas Siliwangi di Kampus 2 Mugarsari, mencakup ruang pimpinan fakultas, administrasi akademik, serta ruang kerja dosen.",
    facilities: [
      "Ruang Dekanat & Pimpinan Fakultas Pertanian",
      "Layanan Administrasi Akademik Faperta",
      "Ruang Dosen & Ruang Pertemuan Fakultas",
    ],
    gallery: [
      {
        url: "/assets/buildings/Faperta/Landscape/Gedung_Pertanian.webp",
        caption: "Tampak depan Gedung Fakultas Pertanian (Faperta)",
        tag: "Tampak Depan",
        orientation: "landscape",
      },
      {
        url: "/assets/buildings/Faperta/Potrait/Gedung_Faperta.webp",
        caption: "Tampak vertikal Gedung Fakultas Pertanian",
        tag: "Eksterior",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "unsil-14",
    code: "14",
    name: "Laboratorium Fakultas Pertanian (Lab. Biometrik)",
    subtitle: "Kompleks Lab Riset & Praktikum Faperta",
    faculty: "Fakultas Pertanian (Agroteknologi & Agribisnis)",
    category: "academic",
    categoryLabel: "Lab Riset Pertanian",
    color: "#15803d",
    accentColor: "rgba(21, 128, 61, 0.2)",
    hasMapPin: true,
    mapCoord: {
      xPercent: 5.7,
      yPercent: 47.7,
    },
    arCoord: {
      x: -0.443,
      y: 0.032,
      z: 0.06,
    },
    shortDesc:
      "Pusat riset komputasi hayati, analisis varietas tanaman, dan laboratorium praktikum terpadu Fakultas Pertanian Unsil.",
    fullDesc:
      "Kompleks Laboratorium Fakultas Pertanian dan Lab. Biometrik mendukung kegiatan praktikum dan penelitian mahasiswa serta dosen Agroteknologi dan Agribisnis, termasuk preparasi sampel hayati, biometrika pertanian, dan fasilitas penunjang riset lapangan.",
    facilities: [
      "Laboratorium Biometrik & Komputasi Pertanian",
      "Ruang Praktikum & Preparasi Sampel",
      "Area Pendukung Riset Agroteknologi",
      "Ruang Kerja Dosen & Asisten Laboratorium",
    ],
    gallery: [
      {
        url: "/assets/buildings/Faperta/Landscape/Lab_Faperta.webp",
        caption: "Tampak menyeluruh gedung Laboratorium Fakultas Pertanian",
        tag: "Tampak Depan",
        orientation: "landscape",
      },
      {
        url: "/assets/buildings/Faperta/Potrait/Lab_Faperta.webp",
        caption: "Sudut vertikal bangunan Laboratorium Fakultas Pertanian",
        tag: "Eksterior",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "unsil-15",
    code: "15",
    name: "Powerhouse Kampus 2",
    subtitle: "Sentral Utilitas & Distribusi Kelistrikan Kawasan",
    faculty: "Sarana & Prasarana Universitas",
    category: "facility",
    categoryLabel: "Utilitas Kampus",
    color: "#334155",
    accentColor: "rgba(51, 65, 85, 0.2)",
    hasMapPin: true,
    mapCoord: {
      xPercent: 4.5,
      yPercent: 56.3,
    },
    arCoord: {
      x: -0.455,
      y: -0.089,
      z: 0.06,
    },
    shortDesc:
      "Fasilitas panel induk dan pengelolaan distribusi daya listrik untuk menunjang operasional gedung di Kampus 2.",
    fullDesc:
      "Powerhouse Kampus 2 merupakan bangunan utilitas teknis yang menampung instalasi kelistrikan utama dan distribusi daya cadangan bagi gedung perkuliahan, laboratorium, dan fasilitas umum di Kampus 2 Mugarsari.",
    facilities: [
      "Sentral Panel Distribusi Listrik Kawasan",
      "Sistem Daya Cadangan Operasional Gedung",
      "Area Teknis Terbatas untuk Petugas Sarpras",
    ],
    gallery: [
      {
        url: "/assets/buildings/Faperta/Landscape/Powerhouse.webp",
        caption: "Tampak depan bangunan Powerhouse Kampus 2 Mugarsari",
        tag: "Utilitas",
        orientation: "landscape",
      },
      {
        url: "/assets/buildings/Faperta/Potrait/Powerhouse.webp",
        caption: "Tampak vertikal bangunan Powerhouse Kampus 2",
        tag: "Eksterior",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "unsil-16",
    code: "16",
    name: "Ruang Kuliah Fakultas Pertanian",
    subtitle: "Gedung Perkuliahan Terpadu Mahasiswa Faperta",
    faculty: "Fakultas Pertanian",
    category: "academic",
    categoryLabel: "Perkuliahan Faperta",
    color: "#15803d",
    accentColor: "rgba(21, 128, 61, 0.2)",
    hasMapPin: true,
    mapCoord: {
      xPercent: 25.5,
      yPercent: 50.0,
    },
    arCoord: {
      x: -0.245,
      y: 0.000,
      z: 0.06,
    },
    shortDesc:
      "Gedung ruang kelas untuk kegiatan perkuliahan teori mahasiswa Fakultas Pertanian di Kampus 2 Mugarsari.",
    fullDesc:
      "Gedung Ruang Kuliah Fakultas Pertanian menyediakan ruang kelas bagi mahasiswa Program Studi Agroteknologi dan Agribisnis, berdekatan dengan Gedung Dekanat Faperta dan kompleks laboratorium.",
    facilities: [
      "Ruang Perkuliahan Teori Faperta",
      "Selasar & Area Tunggu Mahasiswa",
      "Akses Terhubung ke Lab. Fakultas Pertanian",
    ],
    gallery: [
      {
        url: "/assets/buildings/Faperta/Landscape/R.Kuliah_Faperta.webp",
        caption: "Tampak depan gedung Ruang Kuliah Fakultas Pertanian",
        tag: "Tampak Depan",
        orientation: "landscape",
      },
      {
        url: "/assets/buildings/Faperta/Potrait/R.Kuliah_Faperta.webp",
        caption: "Tampak vertikal gedung Ruang Kuliah Faperta",
        tag: "Eksterior",
        orientation: "portrait",
      },
    ],
  },
];

export const MAPPED_BUILDINGS: MappedCampusBuilding[] = CAMPUS_BUILDINGS.filter(
  (b): b is MappedCampusBuilding =>
    b.hasMapPin && Boolean(b.mapCoord && b.arCoord)
);
