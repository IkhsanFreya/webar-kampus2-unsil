export interface BuildingPhoto {
  url: string;
  caption: string;
  tag: string;
}

export interface CampusBuilding {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  faculty: string;
  category: 'gate' | 'academic' | 'facility' | 'worship';
  categoryLabel: string;
  color: string;
  accentColor: string;
  mapCoord: {
    xPercent: number;
    yPercent: number;
  };
  arCoord: {
    x: number;
    y: number;
    z: number;
  };
  shortDesc: string;
  fullDesc: string;
  facilities: string[];
  gallery: BuildingPhoto[];
  audioPath: string;
  audioTitle: string;
  audioDuration: number;
}

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
    mapCoord: {
      xPercent: 30.9,
      yPercent: 76.3,
    },
    arCoord: {
      x: -0.191,
      y: -0.327,
      z: 0.06,
    },
    shortDesc: "Akses masuk utama kawasan Kampus 2 Mugarsari Universitas Siliwangi dengan pos keamanan terpadu dan sistem sirkulasi kendaraan dua arah.",
    fullDesc: "Gerbang Selatan merupakan pintu gerbang utama yang menghubungkan jalan protokol Mugarsari dengan kawasan internal Kampus 2 Universitas Siliwangi. Dilengkapi pos penjagaan terpadu 24 jam, sistem portal otomatis, trotoar ramah disabilitas, dan bundaran sirkulasi kendaraan untuk memastikan kelancaran lalu lintas civitas akademika dan tamu universitas.",
    facilities: [
      "Pos Pengamanan & Satpam 24 Jam",
      "Portal Barrier Otomatis (RFID Ready)",
      "Drop-off Zone Mobil & Bus Kampus",
      "Trotoar Jalur Pejalan Kaki Berkanopi",
      "Papan Informasi & Peta Kawasan Fisik",
    ],
    gallery: [
      {
        url: "/assets/buildings/gerbang-selatan.jpg",
        caption: "Akses Masuk Gerbang Selatan Kampus 2 Unsil",
        tag: "Tampak Depan",
      },
      {
        url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80",
        caption: "Jalur Sirkulasi Masuk dan Drop-Off Tamu",
        tag: "Infrastruktur",
      },
    ],
    audioPath: "/assets/audio/narasi-gedung.wav",
    audioTitle: "Panduan Gerbang Utama & Akses Masuk Kampus",
    audioDuration: 15,
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
    mapCoord: {
      xPercent: 24.7,
      yPercent: 72.3,
    },
    arCoord: {
      x: -0.253,
      y: -0.277,
      z: 0.06,
    },
    shortDesc: "Pusat peribadatan dan pembinaan spiritual bagi seluruh mahasiswa, dosen, serta masyarakat di sekitar Kampus 2 Mugarsari.",
    fullDesc: "Masjid Letjen. Mashudi berdiri megah tepat di sebelah barat gerbang selatan Kampus 2. Memiliki arsitektur heksagonal modern dengan pencahayaan alami yang sejuk, masjid ini menjadi pusat sholat berjamaah lima waktu, sholat Jumat berjamaah, mentoring keagamaan mahasiswa, serta kajian keislaman terpadu di lingkungan Universitas Siliwangi.",
    facilities: [
      "Ruang Sholat Utama 2 Lantai (Kapasitas 800 Jamaah)",
      "Area Wudhu & Sanitasi Higienis Terpisah",
      "Perpustakaan Mini & Pojok Kajian Qur'ani",
      "Pelataran Terbuka untuk Kegiatan Mahasiswa",
      "Area Parkir Khusus Jamaah Berkanopi",
    ],
    gallery: [
      {
        url: "/assets/buildings/masjid-kampus.jpg",
        caption: "Kubah dan Arsitektur Masjid Letjen. Mashudi",
        tag: "Eksterior",
      },
      {
        url: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&q=80",
        caption: "Ruang Utama Sholat dengan Akustik Alami",
        tag: "Interior",
      },
    ],
    audioPath: "/assets/audio/narasi-gedung.wav",
    audioTitle: "Narasi Profil Masjid Letjen. Mashudi",
    audioDuration: 15,
  },
  {
    id: "unsil-03",
    code: "03",
    name: "Gedung FP — Lab. Biometrik",
    subtitle: "Fakultas Pertanian Universitas Siliwangi",
    faculty: "Fakultas Pertanian (Agroteknologi & Agribisnis)",
    category: "academic",
    categoryLabel: "Lab Riset Pertanian",
    color: "#10b981",
    accentColor: "rgba(16, 185, 129, 0.2)",
    mapCoord: {
      xPercent: 21.3,
      yPercent: 49.4,
    },
    arCoord: {
      x: -0.287,
      y: 0.008,
      z: 0.06,
    },
    shortDesc: "Pusat riset komputasi hayati, analisis data varietas tanaman, dan laboratorium terpadu Fakultas Pertanian Unsil.",
    fullDesc: "Gedung Laboratorium Biometrik Fakultas Pertanian dirancang khusus untuk mendukung penelitian biometrika pertanian, pemuliaan tanaman, analisis statistika hayati, serta praktikum mahasiswa Agroteknologi dan Agribisnis. Kompleks ini terintegrasi langsung dengan greenhouse riset dan lahan percobaan agroteknologi.",
    facilities: [
      "Laboratorium Komputasi Biometrik Ber-AC",
      "Ruang Preparasi Sampel Hasil Panen Riset",
      "Smart Greenhouse Otomatisasi Suhu & Kelembaban",
      "Ruang Konsultasi Analisis Data Mahasiswa Akhir",
      "Koneksi Internet Fiber Optic Riset Dedicated",
    ],
    gallery: [
      {
        url: "/assets/buildings/lab-biometrik.jpg",
        caption: "Fasilitas Instrumen Laboratorium Biometrik",
        tag: "Laboratorium",
      },
      {
        url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80",
        caption: "Area Praktikum Penelitian Hayati & Benih",
        tag: "Area Riset",
      },
    ],
    audioPath: "/assets/audio/narasi-gedung.wav",
    audioTitle: "Panduan Laboratorium Biometrik Fakultas Pertanian",
    audioDuration: 15,
  },
  {
    id: "unsil-04",
    code: "04",
    name: "Gedung FT Labtek 2 (Fakultas Teknik)",
    subtitle: "Lab Praktikum 3 & Sekretariat Pusat UTBK",
    faculty: "Fakultas Teknik (Informatika, Sipil, Elektro)",
    category: "academic",
    categoryLabel: "Pusat CBT & Labtek",
    color: "#f59e0b",
    accentColor: "rgba(245, 158, 11, 0.2)",
    mapCoord: {
      xPercent: 43.1,
      yPercent: 38.9,
    },
    arCoord: {
      x: -0.069,
      y: 0.138,
      z: 0.06,
    },
    shortDesc: "Kompleks laboratorium komputer berkapasitas besar sekaligus menjadi markas Sekretariat Pusat UTBK-SNBT Kampus 2.",
    fullDesc: "Gedung FT Labtek 2 adalah fasilitas strategis Fakultas Teknik yang menaungi laboratorium komputer skala besar untuk praktikum rekayasa perangkat lunak, komputasi visual, serta pusat ujian berbasis komputer (CBT). Setiap tahunnya, gedung ini menjadi lokasi utama pelaksanaan Ujian Tulis Berbasis Komputer (UTBK-SNBT) Universitas Siliwangi dengan standar pengawasan tinggi.",
    facilities: [
      "Laboratorium Praktikum Komputer 3 (120 PC Workstation)",
      "Sekretariat Pusat Panitia UTBK Kampus 2",
      "Ruang Server Cadangan dengan Genset Otomatis",
      "Ruang Pengawas & Ruang Sterilisasi Peserta Ujian",
      "Akses WiFi Eduroam High-Speed untuk Mahasiswa",
    ],
    gallery: [
      {
        url: "/assets/buildings/labtek-2.jpg",
        caption: "Fasad Utama Gedung FT Labtek 2",
        tag: "Tampak Depan",
      },
      {
        url: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80",
        caption: "Laboratorium Komputer & Pusat Ujian CBT",
        tag: "Lab Komputer",
      },
    ],
    audioPath: "/assets/audio/narasi-gedung.wav",
    audioTitle: "Profil FT Labtek 2 & Sekretariat UTBK",
    audioDuration: 15,
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
    mapCoord: {
      xPercent: 49.0,
      yPercent: 43.0,
    },
    arCoord: {
      x: -0.010,
      y: 0.087,
      z: 0.06,
    },
    shortDesc: "Fasilitas pengujian bahan dan rekayasa sipil terpadu serta laboratorium artificial intelligence & jaringan Informatika.",
    fullDesc: "Gedung FT Labtek 3 mewadahi pengujian material konstruksi, mekanika tanah, hidrolika bagi Jurusan Teknik Sipil, serta ruang riset Internet of Things (IoT), kecerdasan buatan, dan keamanan siber bagi Jurusan Informatika. Gedung ini dibangun dengan spesifikasi lantai beban tinggi untuk mengakomodasi mesin pengujian tekan beton dan alat ukur presisi.",
    facilities: [
      "Laboratorium Mekanika Tanah & Uji Bahan Beton",
      "Laboratorium Jaringan Komputer, Cloud & IoT",
      "Studio Desain Rekayasa Sipil & CAD/BIM",
      "Ruang Diskusi Proyek Tugas Akhir Mahasiswa",
      "Alat Ukur Total Station & GPS Geodetik",
    ],
    gallery: [
      {
        url: "/assets/buildings/labtek-3.jpg",
        caption: "Area Laboratorium Pengujian Rekayasa",
        tag: "Laboratorium",
      },
      {
        url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&q=80",
        caption: "Peralatan Riset Teknik Sipil & Instrumentasi",
        tag: "Peralatan",
      },
    ],
    audioPath: "/assets/audio/narasi-gedung.wav",
    audioTitle: "Panduan Labtek 3 Teknik Sipil & Informatika",
    audioDuration: 15,
  },
  {
    id: "unsil-06",
    code: "06",
    name: "Gerbang Utara Kampus 2",
    subtitle: "Pintu Masuk & Keluar Khusus Sepeda Motor",
    faculty: "Fasilitas Sirkulasi Kampus",
    category: "gate",
    categoryLabel: "Akses Motor",
    color: "#f59e0b",
    accentColor: "rgba(245, 158, 11, 0.2)",
    mapCoord: {
      xPercent: 50.1,
      yPercent: 7.8,
    },
    arCoord: {
      x: 0.001,
      y: 0.523,
      z: 0.06,
    },
    shortDesc: "Pintu gerbang sisi utara yang dikhususkan bagi akses cepat pengendara sepeda motor mahasiswa dan staf kampus.",
    fullDesc: "Gerbang Utara Kampus 2 Mugarsari berfungsi untuk memecah kepadatan arus lalu lintas di gerbang utama, khusus melayani akses masuk dan keluar kendaraan roda dua. Berdekatan dengan kompleks kantin mahasiswa utara dan area parkir motor teduh, gerbang ini sangat aktif pada jam pergantian perkuliahan.",
    facilities: [
      "Pos Jaga Pengawasan Sepeda Motor",
      "Kantung Parkir Motor Beratap Kapasitas 500 Unit",
      "Jalur Khusus Pejalan Kaki ke Gedung Labtek",
      "Penerangan Jalan Tenaga Surya (Solar Cell)",
    ],
    gallery: [
      {
        url: "/assets/buildings/gerbang-utara.jpg",
        caption: "Akses Gerbang Utara Khusus Kendaraan Roda Dua",
        tag: "Aksesibilitas",
      },
      {
        url: "https://images.unsplash.com/photo-1525921429624-479b6a26d84d?w=1200&q=80",
        caption: "Kawasan Parkir dan Koridor Menuju Fakultas",
        tag: "Kawasan Utara",
      },
    ],
    audioPath: "/assets/audio/narasi-gedung.wav",
    audioTitle: "Informasi Akses Gerbang Utara Kampus 2",
    audioDuration: 15,
  },
];

