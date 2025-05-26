const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ✅ Ganti ke path file kamu
const FILE_PATH = 'D:/bot-wa-baileys/backupsheetexport.json';

// ✅ Tambahkan route ini
app.get('/api/export', (req, res) => {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      return res.status(404).json({ error: '❌ File tidak ditemukan.' });
    }

    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    const data = JSON.parse(raw);

    if (!Array.isArray(data)) {
      return res.status(500).json({ error: '❌ Format file tidak valid, harus berupa array.' });
    }

    res.json(data);
  } catch (err) {
    console.error('❌ Gagal baca file:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Jalankan server
app.listen(PORT, () => {
  console.log(`✅ Backend berjalan di http://localhost:${PORT}`);
});
