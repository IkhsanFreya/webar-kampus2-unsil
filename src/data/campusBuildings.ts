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

export const CAMPUS_BUILDINGS: CampusBuilding[] = [
  {
    id: "unsil-01",
    code: "01",
    name: "Gerbang Selatan (Pintu Masuk Utama)",
    subtitle: "Akses Utama Kendaraan Roda 4 & Roda 2",
    faculty: "Fasilitas Umum & Keamanan Kampus",
    category: "gate",
    categoryLabel: "Akses Utama",
    color: "#f59e0b",
    accentColor: "rgba(245, 158, 11, 0.2)",
    hasMapPin: true,
    mapCoord: {
      xPercent: 30.9,
      yPercent: 76.3,
    },
    arCoord: {
      x: -0.191,
      y: -0.327,
      z: 0.06,
    },
    shortDesc:
      "Akses masuk utama kawasan Kampus 2 Mugarsari Universitas Siliwangi dengan pos keamanan terpadu dan jalur sirkulasi kendaraan.",
    fullDesc:
      "Gerbang Selatan merupakan pintu gerbang utama yang menghubungkan akses jalan kawasan Mugarsari dengan area internal Kampus 2 Universitas Siliwangi. Dilengkapi pos penjagaan keamanan, jalur keluar-masuk kendaraan roda empat dan roda dua, serta akses pedestrian menuju fasilitas ibadah dan gedung perkuliahan.",
    facilities: [
      "Pos Pengamanan & Penjagaan Gerbang",
      "Jalur Masuk & Keluar Kendaraan Terpisah",
      "Area Drop-Off Tamu & Civitas Akademika",
      "Akses Pedestrian Menuju Kawasan Kampus",
    ],
    gallery: [
      {
        url: "/assets/buildings/Gerbang_Depan.jpg",
        caption: "Tampak depan Gerbang Selatan (Gerbang Depan) Kampus 2 Unsil",
        tag: "Tampak Depan",
        orientation: "landscape",
      },
    ],
  },
  {
    id: "unsil-02",
    code: "02",
    name: "Masjid Letjen. Mashudi",
    subtitle: "Pusat Ibadah & Kegiatan Keislaman Kampus 2",
    faculty: "Fasilitas Sosial & Ibadah Civitas",
    category: "worship",
    categoryLabel: "Pusat Ibadah",
    color: "#10b981",
    accentColor: "rgba(16, 185, 129, 0.2)",
    hasMapPin: true,
    mapCoord: {
      xPercent: 24.7,
      yPercent: 72.3,
    },
    arCoord: {
      x: -0.253,
      y: -0.277,
      z: 0.06,
    },
    shortDesc:
      "Pusat peribadatan dan pembinaan keagamaan bagi mahasiswa, dosen, serta warga sekitar Kampus 2 Mugarsari.",
    fullDesc:
      "Masjid Letjen. Mashudi berdiri di sisi barat gerbang utama Kampus 2 Mugarsari. Menjadi pusat ibadah harian civitas akademika Universitas Siliwangi, pelaksanaan sholat berjamaah, kajian keislaman mahasiswa, serta aktivitas sosial keagamaan kampus.",
    facilities: [
      "Ruang Sholat Utama Berkapasitas Besar",
      "Area Wudhu & Sanitasi Terpisah",
      "Pelataran Terbuka & Selasar Masjid",
      "Area Parkir Kendaraan Jamaah",
    ],
    gallery: [
      {
        url: "/assets/buildings/Faperta/Landscape/Masjid_Letjen_Mashudi.jpg",
        caption: "Fasad eksterior Masjid Letjen. Mashudi Kampus 2 Mugarsari",
        tag: "Eksterior",
        orientation: "landscape",
      },
      {
        url: "/assets/buildings/Faperta/Potrait/Masjid_Letjen.jpg",
        caption: "Tampak vertikal bangunan dan menara Masjid Letjen. Mashudi",
        tag: "Arsitektur",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "unsil-03",
    code: "03",
    name: "Gedung FP: Lab. Biometrik & Laboratorium Faperta",
    subtitle: "Fakultas Pertanian Universitas Siliwangi",
    faculty: "Fakultas Pertanian (Agroteknologi & Agribisnis)",
    category: "academic",
    categoryLabel: "Lab Riset Pertanian",
    color: "#10b981",
    accentColor: "rgba(16, 185, 129, 0.2)",
    hasMapPin: true,
    mapCoord: {
      xPercent: 21.3,
      yPercent: 49.4,
    },
    arCoord: {
      x: -0.287,
      y: 0.008,
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
        url: "/assets/buildings/Faperta/Landscape/Lab_Faperta.jpg",
        caption: "Tampak menyeluruh gedung Laboratorium Fakultas Pertanian",
        tag: "Tampak Depan",
        orientation: "landscape",
      },
      {
        url: "/assets/buildings/Faperta/Potrait/Lab_Faperta.jpg",
        caption: "Sudut vertikal bangunan Laboratorium Fakultas Pertanian",
        tag: "Eksterior",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "unsil-04",
    code: "04",
    name: "Gedung FT Labtek 2 (Fakultas Teknik)",
    subtitle: "Laboratorium Fakultas Teknik & Pusat Ujian",
    faculty: "Fakultas Teknik (Teknik Elektro & Informatika)",
    category: "academic",
    categoryLabel: "Labtek Teknik",
    color: "#f59e0b",
    accentColor: "rgba(245, 158, 11, 0.2)",
    hasMapPin: true,
    mapCoord: {
      xPercent: 43.1,
      yPercent: 38.9,
    },
    arCoord: {
      x: -0.069,
      y: 0.138,
      z: 0.06,
    },
    shortDesc:
      "Kompleks laboratorium teknik dan komputasi yang digunakan untuk praktikum Fakultas Teknik serta kegiatan ujian berbasis komputer.",
    fullDesc:
      "Gedung FT Labtek 2 merupakan salah satu gedung laboratorium terpadu Fakultas Teknik di kawasan tengah Kampus 2 Mugarsari. Gedung ini menopang kegiatan praktikum laboratorium Teknik Elektro, praktikum komputer, serta pelaksanaan ujian berbasis komputer tingkat universitas.",
    facilities: [
      "Ruang Laboratorium Teknik Elektro",
      "Ruang Praktikum Komputer & CBT",
      "Ruang Pengelola & Teknisi Laboratorium",
      "Akses Jaringan Internet Kampus",
    ],
    gallery: [
      {
        url: "/assets/buildings/Fakultas_Teknik/Landscape/Labtek2_Elektro.jpg",
        caption: "Fasad Gedung FT Labtek 2 (Lab. Teknik Elektro)",
        tag: "Tampak Depan",
        orientation: "landscape",
      },
      {
        url: "/assets/buildings/Fakultas_Teknik/Potrait/Labtek2_Elektro_Potrait.jpg",
        caption: "Tampak vertikal Gedung FT Labtek 2",
        tag: "Eksterior",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "unsil-05",
    code: "05",
    name: "Gedung FT Labtek 3 (Fakultas Teknik)",
    subtitle: "Kompleks Lab Teknik Sipil & Teknik Informatika",
    faculty: "Fakultas Teknik",
    category: "academic",
    categoryLabel: "Lab Riset Rekayasa",
    color: "#10b981",
    accentColor: "rgba(16, 185, 129, 0.2)",
    hasMapPin: true,
    mapCoord: {
      xPercent: 49.0,
      yPercent: 43.0,
    },
    arCoord: {
      x: -0.010,
      y: 0.087,
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
        url: "/assets/buildings/Fakultas_Teknik/Landscape/Labtek3_Sipil.jpg",
        caption: "Tampak depan Gedung FT Labtek 3 (Lab. Teknik Sipil)",
        tag: "Tampak Depan",
        orientation: "landscape",
      },
      {
        url: "/assets/buildings/Fakultas_Teknik/Potrait/Labtek3_Sipil_Potrait.jpg",
        caption: "Tampak vertikal Gedung FT Labtek 3",
        tag: "Eksterior",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "unsil-06",
    code: "06",
    name: "Gerbang Utara Kampus 2",
    subtitle: "Pintu Masuk & Keluar Sisi Utara (Gerbang Belakang)",
    faculty: "Fasilitas Sirkulasi Kampus",
    category: "gate",
    categoryLabel: "Akses Utara",
    color: "#f59e0b",
    accentColor: "rgba(245, 158, 11, 0.2)",
    hasMapPin: true,
    mapCoord: {
      xPercent: 50.1,
      yPercent: 7.8,
    },
    arCoord: {
      x: 0.001,
      y: 0.523,
      z: 0.06,
    },
    shortDesc:
      "Akses gerbang sisi utara kawasan Kampus 2 Mugarsari untuk mengurai kepadatan lalu lintas menuju area fakultas bagian utara.",
    fullDesc:
      "Gerbang Utara (Gerbang Belakang) melayani akses keluar-masuk sisi utara Kampus 2 Mugarsari, khususnya bagi mahasiswa dan sivitas yang menuju kawasan gedung perkuliahan utara dan kompleks Labtek tanpa harus memutar lewat gerbang utama selatan.",
    facilities: [
      "Pos Penjagaan Sisi Utara",
      "Akses Cepat Menuju Kompleks Perkuliahan Utara",
      "Jalur Sirkulasi Kendaraan Roda Dua",
      "Konektivitas Jalan Lingkar Kampus",
    ],
    gallery: [
      {
        url: "/assets/buildings/Gerbang_Belakang.jpg",
        caption: "Gerbang Utara (Gerbang Belakang) Kampus 2 Unsil",
        tag: "Aksesibilitas",
        orientation: "landscape",
      },
    ],
  },
  {
    id: "unsil-07",
    code: "07",
    name: "Gedung Rektorat Kampus 2",
    subtitle: "Pusat Layanan Administrasi & Pimpinan Universitas",
    faculty: "Universitas Siliwangi",
    category: "facility",
    categoryLabel: "Administrasi Pusat",
    color: "#047857",
    accentColor: "rgba(4, 120, 87, 0.2)",
    hasMapPin: false,
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
        url: "/assets/buildings/Gedung_Rektor.jpg",
        caption: "Fasad utama Gedung Rektorat Kampus 2 Mugarsari",
        tag: "Eksterior",
        orientation: "landscape",
      },
    ],
  },
  {
    id: "unsil-08",
    code: "08",
    name: "Rusunawa Kampus 2",
    subtitle: "Rumah Susun Sederhana Sewa Mahasiswa",
    faculty: "Fasilitas Hunian Kampus",
    category: "facility",
    categoryLabel: "Hunian Mahasiswa",
    color: "#047857",
    accentColor: "rgba(4, 120, 87, 0.2)",
    hasMapPin: false,
    shortDesc:
      "Fasilitas asrama dan hunian bertingkat di dalam kawasan Kampus 2 Mugarsari untuk mahasiswa Universitas Siliwangi.",
    fullDesc:
      "Rusunawa Kampus 2 menyediakan tempat tinggal terpadu bagi mahasiswa Universitas Siliwangi di dalam kawasan Mugarsari, sehingga memudahkan akses menuju gedung perkuliahan dan fasilitas kampus.",
    facilities: [
      "Unit Kamar Hunian Mahasiswa Bertingkat",
      "Area Bersama & Koridor Penghubung",
      "Area Parkir Penghuni",
      "Lingkungan Kampus Terjangkau Jalan Kaki",
    ],
    gallery: [
      {
        url: "/assets/buildings/Rusunawa.jpg",
        caption: "Tampak bangunan Rusunawa di kawasan Kampus 2 Unsil",
        tag: "Eksterior",
        orientation: "landscape",
      },
    ],
  },
  {
    id: "unsil-09",
    code: "09",
    name: "Gedung FT 1 (Informatika & Sistem Informasi)",
    subtitle: "Gedung Perkuliahan Prodi Informatika dan Sistem Informasi",
    faculty: "Fakultas Teknik",
    category: "academic",
    categoryLabel: "Perkuliahan FT",
    color: "#10b981",
    accentColor: "rgba(16, 185, 129, 0.2)",
    hasMapPin: false,
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
        url: "/assets/buildings/Fakultas_Teknik/Landscape/FT1_IF_dan_SI.jpg",
        caption: "Tampak depan Gedung FT 1 (Informatika & Sistem Informasi)",
        tag: "Tampak Depan",
        orientation: "landscape",
      },
      {
        url: "/assets/buildings/Fakultas_Teknik/Potrait/FT1_IF_dan_SI_Potrait.jpg",
        caption: "Sudut vertikal bangunan Gedung FT 1",
        tag: "Eksterior",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "unsil-10",
    code: "10",
    name: "Gedung FT 2 (Teknik Elektro)",
    subtitle: "Gedung Perkuliahan Prodi Teknik Elektro",
    faculty: "Fakultas Teknik",
    category: "academic",
    categoryLabel: "Perkuliahan FT",
    color: "#10b981",
    accentColor: "rgba(16, 185, 129, 0.2)",
    hasMapPin: false,
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
        url: "/assets/buildings/Fakultas_Teknik/Landscape/FT2_Elektro.jpg",
        caption: "Tampak depan Gedung FT 2 (Teknik Elektro)",
        tag: "Tampak Depan",
        orientation: "landscape",
      },
      {
        url: "/assets/buildings/Fakultas_Teknik/Potrait/FT2_Elektro_Potrait.jpg",
        caption: "Tampak vertikal Gedung FT 2 (Teknik Elektro)",
        tag: "Eksterior",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "unsil-11",
    code: "11",
    name: "Gedung FT 3 (Teknik Sipil)",
    subtitle: "Gedung Perkuliahan Prodi Teknik Sipil",
    faculty: "Fakultas Teknik",
    category: "academic",
    categoryLabel: "Perkuliahan FT",
    color: "#10b981",
    accentColor: "rgba(16, 185, 129, 0.2)",
    hasMapPin: false,
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
        url: "/assets/buildings/Fakultas_Teknik/Landscape/FT3_Sipil.jpg",
        caption: "Tampak depan Gedung FT 3 (Teknik Sipil)",
        tag: "Tampak Depan",
        orientation: "landscape",
      },
      {
        url: "/assets/buildings/Fakultas_Teknik/Potrait/FT3_Sipil_Potrait.jpg",
        caption: "Tampak vertikal Gedung FT 3 (Teknik Sipil)",
        tag: "Eksterior",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "unsil-12",
    code: "12",
    name: "Gedung FT Labtek 1 (SI & Informatika)",
    subtitle: "Laboratorium Sistem Informasi & Informatika",
    faculty: "Fakultas Teknik",
    category: "academic",
    categoryLabel: "Labtek Teknik",
    color: "#f59e0b",
    accentColor: "rgba(245, 158, 11, 0.2)",
    hasMapPin: false,
    shortDesc:
      "Gedung laboratorium komputer dan praktikum terpadu untuk Program Studi Sistem Informasi dan Informatika.",
    fullDesc:
      "Gedung FT Labtek 1 merupakan fasilitas laboratorium komputasi Fakultas Teknik yang menunjang praktikum pemrograman, rekayasa perangkat lunak, jaringan, dan analisis sistem informasi.",
    facilities: [
      "Laboratorium Praktikum Informatika & Sistem Informasi",
      "Ruang Praktikum Komputasi & Pemrograman",
      "Ruang Teknisi & Pengelolaan Jaringan Lab",
    ],
    gallery: [
      {
        url: "/assets/buildings/Fakultas_Teknik/Landscape/Labtek1_SI_IF.jpg",
        caption: "Tampak depan Gedung FT Labtek 1 (SI & Informatika)",
        tag: "Tampak Depan",
        orientation: "landscape",
      },
      {
        url: "/assets/buildings/Fakultas_Teknik/Potrait/Labtek1_SI_IF_Potrait.jpg",
        caption: "Tampak vertikal Gedung FT Labtek 1",
        tag: "Eksterior",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "unsil-13",
    code: "13",
    name: "Gedung SBAP Fakultas Teknik",
    subtitle: "Sub Bagian Akademik & Kemahasiswaan Fakultas Teknik",
    faculty: "Fakultas Teknik",
    category: "facility",
    categoryLabel: "Layanan Akademik FT",
    color: "#047857",
    accentColor: "rgba(4, 120, 87, 0.2)",
    hasMapPin: false,
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
        url: "/assets/buildings/Fakultas_Teknik/Landscape/SBAP_Teknik.jpg",
        caption: "Gedung SBAP Fakultas Teknik Kampus 2 Mugarsari",
        tag: "Layanan Akademik",
        orientation: "landscape",
      },
    ],
  },
  {
    id: "unsil-14",
    code: "14",
    name: "Gedung Fakultas Pertanian (Faperta)",
    subtitle: "Gedung Dekanat & Pusat Kegiatan Fakultas Pertanian",
    faculty: "Fakultas Pertanian (Agroteknologi & Agribisnis)",
    category: "academic",
    categoryLabel: "Fakultas Pertanian",
    color: "#10b981",
    accentColor: "rgba(16, 185, 129, 0.2)",
    hasMapPin: false,
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
        url: "/assets/buildings/Faperta/Landscape/Gedung_Pertanian.jpg",
        caption: "Tampak depan Gedung Fakultas Pertanian (Faperta)",
        tag: "Tampak Depan",
        orientation: "landscape",
      },
      {
        url: "/assets/buildings/Faperta/Potrait/Gedung_Faperta.jpg",
        caption: "Tampak vertikal Gedung Fakultas Pertanian",
        tag: "Eksterior",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "unsil-15",
    code: "15",
    name: "Ruang Kuliah Fakultas Pertanian",
    subtitle: "Gedung Perkuliahan Terpadu Mahasiswa Faperta",
    faculty: "Fakultas Pertanian",
    category: "academic",
    categoryLabel: "Perkuliahan Faperta",
    color: "#10b981",
    accentColor: "rgba(16, 185, 129, 0.2)",
    hasMapPin: false,
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
        url: "/assets/buildings/Faperta/Landscape/R.Kuliah_Faperta.jpg",
        caption: "Tampak depan gedung Ruang Kuliah Fakultas Pertanian",
        tag: "Tampak Depan",
        orientation: "landscape",
      },
      {
        url: "/assets/buildings/Faperta/Potrait/R.Kuliah_Faperta.jpg",
        caption: "Tampak vertikal gedung Ruang Kuliah Faperta",
        tag: "Eksterior",
        orientation: "portrait",
      },
    ],
  },
  {
    id: "unsil-16",
    code: "16",
    name: "Powerhouse Kampus 2",
    subtitle: "Sentral Utilitas & Distribusi Kelistrikan Kawasan",
    faculty: "Sarana & Prasarana Universitas",
    category: "facility",
    categoryLabel: "Utilitas Kampus",
    color: "#047857",
    accentColor: "rgba(4, 120, 87, 0.2)",
    hasMapPin: false,
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
        url: "/assets/buildings/Faperta/Landscape/Powerhouse.jpg",
        caption: "Tampak depan bangunan Powerhouse Kampus 2 Mugarsari",
        tag: "Utilitas",
        orientation: "landscape",
      },
      {
        url: "/assets/buildings/Faperta/Potrait/Powerhouse.jpg",
        caption: "Tampak vertikal bangunan Powerhouse Kampus 2",
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
