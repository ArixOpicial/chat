const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk melayani file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Route untuk halaman utama
app.get('/', (req, res) => {
  // Baca file script.js
  const scriptPath = path.join(__dirname, 'script.js');
  const scriptContent = fs.readFileSync(scriptPath, 'utf-8');

  // Baca file index.html
  const indexPath = path.join(__dirname, 'public', 'index.html');
  let indexContent = fs.readFileSync(indexPath, 'utf-8');

  // Sisipkan konten script.js sebagai inline script
  indexContent = indexContent.replace(
    '</body>',
    `<script>${scriptContent}</script></body>`
  );

  // Kirim hasilnya ke klien
  res.send(indexContent);
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
