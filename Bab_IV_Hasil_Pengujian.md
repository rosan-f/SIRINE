# BAB IV — HASIL DAN PEMBAHASAN

## 4.1 Lingkungan Implementasi

Pengujian dilaksanakan pada lingkungan lokal pengembangan dengan konfigurasi berikut.

| Komponen | Lingkungan yang digunakan |
|---|---|
| Sistem operasi | Microsoft Windows, versi kernel yang dilaporkan sistem `10.0.26300.0` |
| PHP dan framework | PHP 8.5.12; Laravel Framework 13.39.0 |
| Pengujian backend | Pest 5.3.5; PHPUnit 13.4.5 |
| Runtime frontend | Node.js 24.20.0; npm 11.19.0 |
| Paket antarmuka utama | React 19.3.1; Inertia React 3.11.0; Tailwind CSS 4.3.4; TypeScript 5.9.3; Vite Plus 1.4.0 |
| Basis data pengujian | SQLite melalui PDO, versi 3.53.4; basis data sementara di memori (`:memory:`), sesuai `phpunit.xml` |
| Basis data konfigurasi lokal | Konfigurasi aplikasi menunjukkan driver MySQL sebagai nilai bawaan. Pengujian yang dilaporkan tidak menggunakan basis data MySQL tersebut. |
| Telegram | Pengujian menggunakan payload update Telegram sintetis. Pemanggilan Telegram Bot API dibuat palsu atau diganti mock; bot dan server Telegram tidak dihubungi langsung. |
| Layanan AI | Aplikasi membaca nama model dari `LLM_MODEL`, dengan nilai bawaan `gemini-3.5-flash`. Pemanggilan Gemini pada skenario pengujian diisolasi menggunakan mock/HTTP fake; kualitas model langsung tidak diuji. |
| Perangkat, browser, dan jaringan | Proses berjalan pada host Windows dengan identitas prosesor yang diekspos sistem `Intel64 Family 6 Model 183 Stepping 1` dan 20 logical processor. Kapasitas RAM, nama model CPU komersial, browser, dan kondisi jaringan tidak diukur. Tidak dilakukan pengujian browser nyata. |

Versi perangkat lunak di atas diperoleh dari runtime atau paket yang terpasang saat pengujian, bukan dari perkiraan. Informasi konfigurasi rahasia seperti token bot dan kunci API tidak dicantumkan.

## 4.2 Implementasi Sistem

### 4.2.1 Implementasi Penerimaan Update Telegram

Sistem menyediakan dua jalur penerimaan update. `TelegramPollCommand` menjalankan long polling dengan `getUpdates`, sedangkan `TelegramWebhookController` menerima payload melalui endpoint webhook dan dapat memeriksa secret token apabila dikonfigurasi. Pemrosesan isi update diteruskan ke `IncidentReportService`. Pengujian pada bab ini memanggil alur layanan dengan payload sintetis dan memalsukan komunikasi keluar; pengujian ini tidak membuktikan koneksi bot Telegram langsung atau keberhasilan deployment webhook.

### 4.2.2 Implementasi Alur Pelaporan

`IncidentReportService` menangani perintah `/start`, pesan teks, lokasi GPS, voice note, serta tindakan konfirmasi, koreksi, dan pembatalan. Identitas pelapor, pesan masuk, percakapan, draf, dan laporan disimpan melalui model aplikasi. Dalam skenario lokasi, titik koordinat diterima terlebih dahulu, kemudian data kejadian dilengkapi melalui teks sebelum laporan disimpan.

### 4.2.3 Implementasi Transkripsi dan Ekstraksi

`GeminiService` menangani transkripsi audio dan ekstraksi informasi dari teks laporan. Dalam pengujian transkripsi, respons layanan disimulasikan agar masukan dan keluaran dapat diperiksa tanpa memakai layanan eksternal. Pengujian tersebut memeriksa penanganan hasil transkripsi berhasil maupun kosong; pengujian tidak mengukur akurasi transkripsi atau ekstraksi Gemini secara langsung.

### 4.2.4 Implementasi Penyimpanan Data

Model yang terlibat mencakup `Reporter`, `Report`, `Conversation`, `Message`, `ReportDetail`, `ReportHistory`, dan `User`. Data laporan dapat menyimpan jenis kejadian, deskripsi, keterangan lokasi, koordinat, status, dan hubungan dengan pelapor. Pengujian menggunakan SQLite sementara di memori dan data sintetis yang dihapus setelah setiap kasus.

### 4.2.5 Implementasi Dashboard Admin

Dashboard menyajikan statistik dan aktivitas laporan. Halaman laporan menyediakan daftar, filter pada antarmuka, detail, dan peta untuk laporan yang memiliki koordinat. Halaman riwayat menyajikan penerimaan serta perubahan status. Perubahan status diuji terhadap penyimpanan riwayat dan pesan keluar yang dimock. Endpoint pembacaan log poller juga diuji, tetapi proses daemon tidak dijalankan sebagai bot Telegram langsung.

## 4.3 Prosedur Pengujian

Pengujian fungsional menggunakan pendekatan black-box pada kontrak yang dapat diamati melalui endpoint Laravel dan alur layanan. Test ditulis menggunakan Pest dan dijalankan pada konfigurasi `testing` yang menetapkan SQLite di memori. Untuk setiap skenario, test menyiapkan pengguna, pelapor, laporan, atau payload sintetis; menjalankan satu permintaan atau alur; lalu memeriksa respons, data tersimpan, dan efek samping yang relevan.

Komunikasi keluar dikendalikan agar pengujian dapat diulang dan tidak mengirim pesan atau permintaan ke layanan sungguhan. Telegram diuji dengan mock atau HTTP fake. Permintaan Gemini diuji dengan mock/HTTP fake, dan kasus transkripsi layanan juga diuji dengan respons sintetis. Oleh sebab itu, hasil yang lulus menunjukkan bahwa aplikasi menangani input dan respons simulasi sesuai kontrak yang diperiksa, bukan bukti bahwa kredensial, jaringan, webhook, bot, atau kualitas AI di lingkungan produksi telah berhasil.

Suite lengkap dijalankan dengan Pest. Karena pemanggilan standar test runner pada host ini tidak dapat membaca bootstrap melalui `is_readable` pada drive proyek, runner dijalankan memakai bootstrap sementara yang memuat autoloader proyek. Konfigurasi suite tetap memakai `phpunit.xml`, termasuk database SQLite di memori. Bootstrap sementara dihapus setelah proses selesai. Build frontend diverifikasi menggunakan `npm run build`.

### 4.3.1 Menjalankan Pengujian per Fitur

Test dijalankan satu per satu dari PowerShell pada direktori utama proyek. Pada komputer pengujian ini, `php artisan test` tanpa opsi `--bootstrap` berhenti karena PHPUnit tidak dapat membuka bootstrap `vendor/autoload.php` pada drive proyek. Preamble berikut membuat bootstrap sementara di direktori temporer. Jalankan sekali, lalu gunakan perintah sesuai fitur.

```powershell
$projectPath = (Get-Location).Path.Replace('\', '/')
$bootstrapPath = Join-Path $env:TEMP 'sigap-test-bootstrap.php'
Set-Content -LiteralPath $bootstrapPath -Value "<?php`nrequire '$projectPath/vendor/autoload.php';"
```

**TC-01 Login Admin**

```powershell
php artisan test --bootstrap="$bootstrapPath" --filter="login screen can be rendered" --compact
php artisan test --bootstrap="$bootstrapPath" --filter="users can authenticate using the login screen" --compact
php artisan test --bootstrap="$bootstrapPath" --filter="users can not authenticate with invalid password" --compact
php artisan test --bootstrap="$bootstrapPath" --filter="users can logout" --compact
php artisan test --bootstrap="$bootstrapPath" --filter="users are rate limited" --compact
```

**TC-02 Pantau Dashboard dan Bot**

```powershell
php artisan test --bootstrap="$bootstrapPath" --filter="authenticated users can visit the dashboard" --compact
php artisan test --bootstrap="$bootstrapPath" --filter="dashboard counts invalid reports separately from completed reports" --compact
php artisan test --bootstrap="$bootstrapPath" --filter="authenticated users can fetch poller logs endpoint" --compact
```

**TC-03 Lihat dan Filter Laporan**

```powershell
php artisan test --bootstrap="$bootstrapPath" --filter="authenticated user can view report index with real database reports and route link" --compact
```

Test di atas memeriksa endpoint daftar laporan. Pemilihan filter pada antarmuka React belum memiliki test browser otomatis, sehingga interaksi filter perlu diperiksa manual pada halaman dan hasilnya dicatat terpisah.

**TC-04 Lihat Detail Laporan dan Riwayat**

```powershell
php artisan test --bootstrap="$bootstrapPath" --filter="authenticated user can view report show detail page with maps and route info" --compact
php artisan test --bootstrap="$bootstrapPath" --filter="authenticated users can view report creation and handling activity" --compact
```

**TC-05 Lihat Peta Laporan**

```powershell
php artisan test --bootstrap="$bootstrapPath" --filter="authenticated user sees only reports with coordinates on the map" --compact
```

**TC-06 Ubah Status Laporan**

```powershell
php artisan test --bootstrap="$bootstrapPath" --filter="operator can confirm report and send dispatch notification to telegram" --compact
```

**TC-07 Mulai Pelaporan dengan `/start`**

```powershell
php artisan test --bootstrap="$bootstrapPath" --filter="telegram start command creates a reporter and requests the incident location" --compact
```

**TC-08 Kirim Lokasi Kejadian**

```powershell
php artisan test --bootstrap="$bootstrapPath" --filter="incident report service processes 2-step flow: location then template" --compact
```

**TC-09 Kirim Laporan Teks**

```powershell
php artisan test --bootstrap="$bootstrapPath" --filter="gemini service parses report template without calling external api" --compact
php artisan test --bootstrap="$bootstrapPath" --filter="incident report service processes 2-step flow: location then template" --compact
```

Test alur dua langkah yang sama digunakan untuk TC-08 dan TC-09 karena teks laporan melengkapi percakapan yang dimulai dengan pengiriman lokasi.

**TC-10 Kirim Voice Note**

```powershell
php artisan test --bootstrap="$bootstrapPath" --filter="gemini service extracts transcript text from audio response parts" --compact
php artisan test --bootstrap="$bootstrapPath" --filter="voice note transcript is saved as the incoming message text" --compact
php artisan test --bootstrap="$bootstrapPath" --filter="voice note without a transcript is not processed as a report" --compact
```

**TC-11 Konfirmasi, Koreksi, atau Batalkan Laporan**

```powershell
php artisan test --bootstrap="$bootstrapPath" --filter="incident report service processes 2-step flow: location then template" --compact
php artisan test --bootstrap="$bootstrapPath" --filter="reporter can cancel an in-progress report without creating a report" --compact
```

Setelah seluruh test selesai, hapus bootstrap sementara dengan `Remove-Item -LiteralPath $bootstrapPath`. Nilai `--filter` mengikuti nama test pada direktori `tests/Feature`. Test Telegram dan Gemini memakai data sintetis serta mock/fake, sehingga hasilnya tidak menunjukkan koneksi langsung ke bot atau layanan AI.

### Tabel 4.2 Skenario Pengujian Fungsional

| ID | Skenario | Hasil aktual | Status |
|---|---|---|---|
| TC-01 | Login Admin | Test memeriksa halaman login, autentikasi dengan kata sandi benar, penolakan kata sandi salah, pembatasan percobaan, dan logout. Respons serta status autentikasi sesuai yang diharapkan. | Lulus |
| TC-02 | Pantau Dashboard dan Bot | Dashboard admin menampilkan properti ringkasan dan status poller. Endpoint log poller merespons JSON dengan struktur `is_running`, `pid`, dan `logs`. Proses poller dan bot Telegram langsung tidak dijalankan dalam test. | Parsial |
| TC-03 | Lihat dan Filter Laporan | Endpoint daftar laporan dan data laporan diperiksa. Interaksi filter pencarian/status/jenis pada antarmuka React tidak dijalankan dalam browser, sehingga hasil filter UI belum terverifikasi secara interaktif. | Parsial |
| TC-04 | Lihat Detail Laporan | Halaman detail mengembalikan kode, koordinat, dan informasi laporan yang diuji. Halaman aktivitas juga diuji menampilkan penerimaan laporan dan entri riwayat perubahan status. | Lulus |
| TC-05 | Lihat Peta Laporan | Halaman peta mengembalikan laporan berkoordinat yang dibuat untuk test dan mengecualikan laporan tanpa koordinat. Kode serta koordinat laporan yang disertakan sesuai data uji. | Lulus |
| TC-06 | Ubah Status Laporan | Aksi dispatch mengubah status laporan, membuat entri riwayat dengan status sebelumnya dan sesudahnya, serta mencatat pesan keluar. Pengiriman Telegram diganti mock dan tidak dikirim ke pelapor sungguhan. | Lulus |
| TC-07 | Mulai Pelaporan | Payload `/start` menghasilkan pesan sambutan dan keyboard yang meminta lokasi, membuat data pelapor, dan belum membuat laporan. Pengiriman pesan Telegram diperiksa melalui mock. | Lulus |
| TC-08 | Kirim Lokasi Kejadian | Alur menerima koordinat GPS lalu teks laporan. Laporan tersimpan dengan koordinat yang sama dengan payload dan sumber lokasi `gps`. Pengujian menggunakan payload sintetis, bukan lokasi perangkat nyata. | Lulus |
| TC-09 | Kirim Laporan Teks | Teks dengan format laporan diproses menjadi atribut kejadian. Dalam alur uji, laporan dibuat setelah langkah konfirmasi dan nilai jenis kejadian serta keterangan lainnya diperiksa. | Lulus |
| TC-10 | Kirim Voice Note | Kasus transkripsi sukses memeriksa transkrip yang tersimpan sebagai teks pesan. Kasus transkripsi kosong memeriksa bahwa laporan tidak dibuat. Respons layanan Telegram/Gemini disimulasikan. | Lulus |
| TC-11 | Konfirmasi, Koreksi, atau Batalkan Laporan | Test mengoreksi draf lalu mengonfirmasi laporan dan memeriksa data laporan. Test pembatalan memeriksa bahwa percakapan selesai dan laporan tidak dibuat. | Lulus |

Status **Parsial** berarti bagian yang diuji lulus, tetapi sebagian langkah pada skenario belum diuji. Status tersebut tidak dihitung sebagai kegagalan maupun sebagai skenario yang sepenuhnya terverifikasi.

## 4.4 Hasil Pengujian

Suite otomatis mencatat 46 test: 43 lulus, 3 dilewati, dan 0 gagal, dengan 216 assertion. Tiga test yang dilewati berkaitan dengan autentikasi dua faktor yang dinonaktifkan pada konfigurasi Fortify aplikasi. Test tersebut dilewati oleh kondisi eksplisit di test, bukan karena kegagalan assertion. Di antara test yang dijalankan dan tidak dilewati, tingkat kelulusan suite adalah 43 dari 43 (100%).

Build frontend dengan `npm run build` juga berhasil. Hasil build memuat peringatan bahwa paket opsional `fontaine` tidak tersedia untuk optimasi fallback font; peringatan tersebut tidak menghentikan build.

### Tabel 4.3 Ringkasan Hasil Pengujian

| Ringkasan | Nilai |
|---|---:|
| Skenario fungsional yang direncanakan | 11 |
| Skenario dengan hasil lulus penuh | 9 |
| Skenario dengan hasil parsial | 2 |
| Skenario gagal | 0 |
| Test otomatis dijalankan | 46 |
| Test otomatis lulus | 43 |
| Test otomatis dilewati | 3 |
| Test otomatis gagal | 0 |
| Assertion | 216 |
| Kelulusan test yang dijalankan, tidak termasuk yang dilewati | 100% (43/43) |
| Build frontend | Berhasil |

Angka pada tabel skenario adalah hasil perhitungan berdasarkan status di Tabel 4.2. Persentase 100% merujuk hanya pada test otomatis yang dijalankan dan tidak dilewati; angka tersebut tidak menyatakan bahwa semua fungsi telah diuji pada browser atau terhadap layanan produksi.

## 4.5 Pembahasan

Hasil menunjukkan bahwa jalur autentikasi, penyajian dashboard, pengambilan detail dan riwayat, penyaringan data peta, alur pelaporan berbasis teks/GPS, penanganan transkripsi simulasi, perubahan status, serta pencatatan efek samping yang diuji memenuhi assertion. Pada pengujian perubahan status, pencatatan ke basis data diperiksa, sementara pesan keluar Telegram diganti mock agar tidak menghubungi pelapor.

TC-02 dan TC-03 berstatus parsial karena pengujian belum menyalakan proses long polling dengan bot sungguhan dan belum mengoperasikan filter React melalui browser. Pengujian halaman peta memverifikasi pemilihan data berkoordinat dari sisi server; pengujian tersebut tidak membuktikan ketersediaan tile atau embed Google Maps dari browser.

Transkripsi dan ekstraksi diuji dengan respons simulasi, sehingga hasil ini tidak dapat dipakai untuk menyimpulkan tingkat akurasi AI, ketahanan terhadap variasi aksen/noise, atau keberhasilan pemanggilan Gemini menggunakan kredensial dan jaringan produksi. Pengujian ini juga tidak mengukur waktu respons, kapasitas beban, keamanan deployment, usability, dan integrasi end-to-end Telegram. Hal-hal tersebut perlu diuji terpisah bila menjadi kriteria penerimaan sistem.

Saat pemeriksaan suite, ditemukan file test riwayat aktivitas yang sebelumnya tidak memiliki tag pembuka PHP sehingga isi file tercetak dan dua test di dalamnya tidak dieksekusi. Tag tersebut dan satu penutup ekspresi yang kurang diperbaiki, kemudian file diperiksa sintaksnya dan dijalankan kembali. Angka akhir pada bab ini berasal dari suite setelah perbaikan tersebut dan setelah test halaman peta serta `/start` ditambahkan.
