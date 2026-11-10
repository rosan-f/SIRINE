# Catatan Pengerjaan Bukti Bab IV

Berkas ini **bukan bagian isi skripsi**. Isinya adalah daftar tindakan yang harus dilakukan sebelum Bab IV diserahkan: menjalankan pengujian, mengambil tangkapan layar, dan menempatkan bukti pada posisi gambar yang sudah disediakan.

## 1. Perintah yang dijalankan

Jalankan dari direktori proyek `X:\project\Sigap`.

```powershell
# Seluruh test suite (angka yang dipakai di Bab IV)
php artisan test

# Build frontend (bukti Tabel 4.3)
npm run build
```

Hasil yang harus terlihat pada layar terminal:

- 46 test, 43 passed, 3 skipped, 0 failed
- 216 assertions
- Tiga test yang dilewati berasal dari `tests/Feature/Settings/SecurityTest.php` karena fitur 2FA tidak aktif

Jika angka berbeda, jangan ubah tabel menjadi angka lain tanpa menjalankan ulang. Catat angka yang benar-benar muncul.

## 2. Daftar gambar yang harus diambil

Simpan berkas gambar di folder `docs/bab-4/gambar/` dengan nama seperti pada tabel. Setelah itu, ganti kotak placeholder pada dokumen Word dengan gambar tersebut, lalu pertahankan keterangan gambar di bawahnya.

| Gambar | Yang harus ditangkap | Nama berkas yang disarankan | Cara memperoleh |
|---|---|---|---|
| Gambar 4.1 | Terminal yang menjalankan `php artisan telegram:poll` dan menampilkan log `[READY]` serta `[PESAN MASUK]` | `4-1-polling.png` | Jalankan bot, kirim satu pesan dari akun Telegram uji, lalu tangkap layar terminal |
| Gambar 4.2 | Percakapan bot saat pelapor mengirim `/start`, tampak tombol `📍 Kirim Lokasi` dan `✖️ Batalkan` | `4-2-start.png` | Kirim `/start` ke bot uji |
| Gambar 4.3 | Percakapan saat pelapor mengirim lokasi GPS lalu mengirim laporan teks | `4-3-lokasi-teks.png` | Gunakan tombol `Kirim Lokasi`, lalu kirim teks format laporan |
| Gambar 4.4 | Pratinjau laporan beserta tombol `✅ Konfirmasi Laporan`, `✏️ Koreksi`, dan `✖️ Batalkan` | `4-4-pratinjau.png` | Kirim laporan sampai muncul pratinjau |
| Gambar 4.5 | Voice note yang berhasil ditranskripsikan dan tampil sebagai teks | `4-5-voice.png` | Kirim voice note berisi kalimat darurat yang jelas |
| Gambar 4.6 | Dashboard admin: kartu ringkasan, grafik status, aktivitas, status kendali bot, dan log | `4-6-dashboard.png` | Login sebagai admin, buka `/dashboard` |
| Gambar 4.7 | Halaman daftar laporan dengan filter yang sedang dipakai (misalnya status atau jenis kejadian) | `4-7-daftar-laporan.png` | Buka `/laporan`, pilih satu filter, tangkap layar sebelum dan sesudah filter bila perlu |
| Gambar 4.8 | Halaman detail laporan beserta bagian riwayat status | `4-8-detail-laporan.png` | Buka salah satu laporan dari daftar |
| Gambar 4.9 | Halaman peta dengan penanda lokasi laporan | `4-9-peta.png` | Buka `/peta` |
| Gambar 4.10 | Keluaran lengkap `php artisan test` yang memperlihatkan 46 test, 43 passed, 3 skipped, 216 assertions | `4-10-php-artisan-test.png` | Jalankan `php artisan test` di terminal |
| Gambar 4.11 | Halaman login admin yang sedang diuji | `4-11-login.png` | Buka halaman login |
| Gambar 4.12 | Pesan pemberitahuan status yang diterima pelapor di Telegram setelah admin mengubah status | `4-12-notifikasi.png` | Ubah status laporan menjadi dispatch/selesai, lalu tangkap pesan di Telegram pelapor |
| Gambar 4.13 | Keluaran `npm run build` yang berakhir dengan `✓ built in ...` | `4-13-build.png` | Jalankan `npm run build` di terminal |

## 3. Data uji yang dipakai

Gunakan data sintetis, bukan identitas warga sungguhan:

- Nama pelapor: Rina Putri
- `chat_id` Telegram uji: gunakan akun bot uji, jangan akun pribadi
- Koordinat: 4,47123 dan 97,96541
- Jenis kejadian: Kebakaran atau Kecelakaan lalu lintas
- Lokasi: Simpang 4 dekat pasar
- Keterangan: Asap tebal keluar dari ruko bagian depan
- Kondisi korban: Nihil / Tidak ada korban

## 4. Hal yang wajib disamarkan pada tangkapan layar

- Token bot Telegram dan kunci API Gemini
- Nomor telepon, nama lengkap, atau username pribadi yang bukan data uji
- Alamat surel dan kata sandi pada halaman login
- Isi berkas `.env`
- ID chat pribadi pada log

Gunakan akun bot dan akun admin khusus pengujian. Jika terlanjur tertangkap, tutup bagian tersebut dengan kotak hitam sebelum gambar dimasukkan ke skripsi.

## 5. Verifikasi manual untuk TC-02 dan TC-03

Dua skenario ini memiliki bagian yang tidak dicakup test otomatis. Lakukan langkah berikut dan pastikan hasilnya sesuai sebelum menandai skenario sebagai lulus.

**TC-02 (status kendali bot)**

1. Buka dashboard admin.
2. Pastikan status kendali bot tampil.
3. Nyalakan poller dari dashboard dan pastikan log bertambah.
4. Hentikan poller dan pastikan status berubah menjadi berhenti.
5. Tangkap layar untuk Gambar 4.6.

**TC-03 (filter laporan)**

1. Buka halaman daftar laporan.
2. Pilih filter status, jenis kejadian, dan verifikasi satu per satu.
3. Pastikan jumlah serta isi kartu laporan berubah sesuai pilihan.
4. Gunakan kolom pencarian dan pastikan hasilnya menyempit.
5. Tangkap layar saat filter aktif untuk Gambar 4.7.

Jika salah satu langkah tidak berhasil, ubah status pada Tabel 4.2 menjadi `Tidak sesuai` dan sesuaikan Tabel 4.3. Jangan mempertahankan status `Lulus` bila bukti tidak mendukung.

## 6. Pengaturan format di Word

Berkas `Bab_IV_Implementasi_dan_Pengujian.docx` sudah memakai pengaturan berikut. Sesuaikan kembali bila digabung ke dokumen skripsi utama.

- Ukuran kertas A4, margin kiri 4 cm, atas 3 cm, kanan 3 cm, bawah 3 cm
- Jenis huruf Times New Roman 12 pt
- Jarak baris 1,5 dan perataan justify untuk paragraf isi
- Judul bab dan subbab dicetak tebal
- Keterangan tabel di atas tabel, keterangan gambar di bawah gambar, rata tengah
- Tabel menggunakan garis penuh dan huruf 8–9 pt agar muat
- Nomor halaman di bagian bawah tengah

Nomor halaman pada berkas ini dimulai dari 1 karena berdiri sendiri. Saat digabung ke skripsi, lanjutkan penomoran dari bab sebelumnya, lalu perbarui daftar tabel dan daftar gambar. Kotak placeholder gambar berukuran tinggi 6,6 cm; setelah gambar asli dimasukkan, hapus kotak tersebut dan atur tinggi gambar agar proporsional.

## 7. Sebelum menyerahkan

- [ ] Semua placeholder gambar sudah diganti gambar asli
- [ ] Angka pada Tabel 4.3 sama dengan keluaran `php artisan test` terakhir
- [ ] Tidak ada token, kunci API, atau data pribadi pada gambar dan teks
- [ ] Tiga test yang dilewati dijelaskan sebagai fitur 2FA yang tidak aktif, bukan kegagalan
- [ ] Status TC-02 dan TC-03 sudah diverifikasi manual
- [ ] Daftar pustaka dan penomoran tabel/gambar konsisten dengan bab lain
