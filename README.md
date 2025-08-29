# Jengges Multiplayer - Game Kartu Remi Online

Game kartu Remi multiplayer yang dapat dimainkan online dengan teman-teman dari PC yang berbeda secara real-time.

## Fitur

- **Multiplayer Real-time**: 2-4 pemain dapat bermain bersamaan dari PC berbeda
- **Room System**: Buat room pribadi atau gabung ke room teman
- **Chat Room**: Komunikasi dengan pemain lain selama bermain
- **Sinkronisasi Otomatis**: Semua aksi tersinkronisasi secara real-time
- **Antarmuka Modern**: UI yang responsif dan mudah digunakan

## Persyaratan Sistem

- Node.js versi 14.0.0 atau lebih baru
- Browser modern (Chrome, Firefox, Safari, Edge)
- Koneksi internet

## Instalasi dan Menjalankan Server

### 1. Download/Clone Project
```bash
# Jika menggunakan Git
git clone <repository-url>
cd jenges

# Atau download dan extract file ZIP
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Jalankan Server
```bash
npm start
```

Atau untuk development dengan auto-reload:
```bash
npm run dev
```

### 4. Buka Game di Browser
Setelah server berjalan, buka browser dan akses:
```
http://localhost:3000
```

## Cara Bermain Multiplayer

### Membuat Room Baru
1. Masukkan nama Anda di kolom "Nama Pemain"
2. Klik tombol **"Buat Room Baru"**
3. Bagikan **Room ID** yang muncul kepada teman-teman Anda

### Bergabung ke Room
1. Masukkan nama Anda di kolom "Nama Pemain"
2. Masukkan **Room ID** yang diberikan teman Anda
3. Klik tombol **"Gabung Room"**

### Memulai Game
1. Tunggu hingga semua pemain bergabung (minimal 2, maksimal 4 pemain)
2. Setiap pemain (kecuali host) harus klik **"Siap"**
3. Host klik **"Mulai Game"** untuk memulai permainan

### Bermain
- **Giliran Anda**: Ambil kartu dari Deck atau Discard, lalu buang 1 kartu
- **Meld**: Buat kombinasi kartu (Run Angka, Run JQK, Set As)
- **Menang**: Habiskan semua kartu di tangan dengan meld dan buang terakhir

## Aturan Permainan

### Kombinasi yang Valid
1. **Run Angka**: 3-6 kartu berurutan dengan suit sama (contoh: 4♠ 5♠ 6♠)
2. **Run JQK**: J-Q-K dengan suit sama
3. **Set As**: 3-4 kartu As dengan suit berbeda

### Kartu Wild
- Satu rank kartu dipilih secara random sebagai WILD setiap ronde
- Kartu WILD dapat menggantikan kartu apapun dalam kombinasi
- **TIDAK BOLEH** membuang kartu WILD (penalty -250 poin)

### Aturan Khusus
- Tidak boleh buang As sebelum pernah meld
- Jika ambil dari Discard, harus bisa membuat kombinasi valid
- Set As dari Discard hanya boleh jika sudah pernah meld sebelumnya

## Penskoran

### Poin Meld
- Run Angka: 5 poin × jumlah kartu
- Run JQK: 10 poin × jumlah kartu  
- Set As: 15 poin × jumlah kartu

### Penalty Kartu di Tangan
- Kartu angka (2-10): -5 poin
- J, Q, K: -10 poin
- As: -15 poin
- WILD: -25 poin

### Bonus Penutupan
Pemain yang menutup ronde mendapat bonus dari pemain yang kartunya terpakai:
- Berdasarkan kartu terakhir yang dibuang saat menutup
- Wild: -250, As: -150, JQK: -100, Angka: -50

## Troubleshooting

### Server Tidak Bisa Diakses dari PC Lain
1. **Firewall**: Pastikan port 3000 tidak diblokir firewall
2. **Network**: Pastikan semua PC terhubung ke jaringan yang sama
3. **IP Address**: Gunakan IP address komputer server, bukan localhost
   ```
   http://192.168.1.100:3000  (ganti dengan IP server)
   ```

### Mengetahui IP Address Server
**Windows:**
```cmd
ipconfig
```
**Mac/Linux:**
```bash
ifconfig
```

### Koneksi Terputus
- Refresh halaman browser
- Server akan otomatis reconnect
- Jika room hilang, buat room baru

## Menjalankan di Jaringan Lokal (LAN)

### Untuk Host (yang menjalankan server):
1. Jalankan server dengan `npm start`
2. Cari IP address komputer Anda
3. Bagikan alamat: `http://[IP-ADDRESS]:3000` ke teman-teman

### Untuk Pemain Lain:
1. Buka browser dan akses alamat yang diberikan host
2. Masukkan nama dan bergabung ke room

## Menjalankan di Internet (Online)

Untuk bermain melalui internet, Anda perlu:

1. **Deploy ke Cloud Platform** (Heroku, Railway, Vercel, dll)
2. **Atau gunakan ngrok untuk testing:**
   ```bash
   # Install ngrok
   npm install -g ngrok
   
   # Jalankan server
   npm start
   
   # Di terminal lain
   ngrok http 3000
   ```
   Bagikan URL ngrok yang muncul ke teman-teman

## File Structure

```
jenges/
├── server.js          # Server Node.js dengan Socket.IO
├── jengges.html       # Client game dengan UI multiplayer
├── package.json       # Dependencies dan scripts
└── README.md         # Dokumentasi ini
```

## Dependencies

- **express**: Web server framework
- **socket.io**: Real-time communication
- **nodemon**: Auto-reload untuk development

## Support

Jika mengalami masalah:
1. Pastikan semua dependencies terinstall dengan benar
2. Periksa console browser untuk error messages
3. Restart server dan refresh browser
4. Pastikan koneksi internet stabil

## Tips Bermain

- Gunakan chat untuk berkomunikasi dengan pemain lain
- Perhatikan giliran pemain di panel kiri
- Kartu yang bisa diklik hanya saat giliran Anda
- Drag & drop untuk mengurutkan kartu di tangan
- Gunakan tombol Sort untuk mengurutkan kartu otomatis

Selamat bermain! 🎮
