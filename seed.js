const mongoose = require('mongoose');
const Item = require('./src/models/Item');

const items = [
  {
    _id: new mongoose.Types.ObjectId("665f17c9e7ad7adfd1098f44"),
    name: "UU Energi Terbarukan",
    description: "Undang-undang ini mewajibkan perusahaan besar menggunakan minimal 30% energi terbarukan dalam operasional mereka mulai tahun 2026.",
    likes: 0,
    saves: 0,
  },
  {
    _id: new mongoose.Types.ObjectId("665f18c9e7ad7adfd1098f45"),
    name: "Suku Bunga Acuan 6%",
    description: "Keputusan ini diambil untuk menjaga stabilitas rupiah dan mengantisipasi tekanan inflasi yang masih tinggi di kuartal ini.",
    likes: 0,
    saves: 0,
  },
  {
    _id: new mongoose.Types.ObjectId("665f19c9e7ad7adfd1098f46"),
    name: "Peluncuran Satelit Nusantara-1",
    description: "Satelit komunikasi buatan dalam negeri ini akan meningkatkan akses internet di daerah terpencil Indonesia bagian timur hingga 10 kali lipat.",
    likes: 0,
    saves: 0,
  },
  {
    _id: new mongoose.Types.ObjectId("665f2000e7ad7adfd1098f50"),
    name: "Kurikulum AI untuk SMA",
    description: "Kemendikbud meluncurkan kurikulum dasar AI sebagai bagian dari program literasi digital nasional.",
    likes: 0,
    saves: 0,
  },
  {
    _id: new mongoose.Types.ObjectId("665f2001e7ad7adfd1098f51"),
    name: "Proyek MRT Fase 3",
    description: "Jalur baru menghubungkan Bandara Soekarno-Hatta ke Pondok Gede melalui koridor timur.",
    likes: 0,
    saves: 0,
  },
  {
    _id: new mongoose.Types.ObjectId("665f2002e7ad7adfd1098f52"),
    name: "Garuda Tambah Rute ASEAN",
    description: "Maskapai nasional menambah 7 rute internasional mendukung sektor pariwisata.",
    likes: 0,
    saves: 0,
  }
];

mongoose.connect('mongodb://localhost:27017/internship_db')
  .then(async () => {
    console.log('Connected to DB. Seeding...');
    await Item.deleteMany({}); // optional: clear previous items
    await Item.insertMany(items);
    console.log('Items seeded successfully.');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Seeding failed:', err);
    mongoose.disconnect();
  });
