# BAB IV

# HASIL DAN PEMBAHASAN

## 4.1 Lingkungan Implementasi

Implementasi dan pengujian aplikasi SIRINE dilaksanakan pada satu perangkat kerja dengan lingkungan pengembangan lokal. Seluruh versi perangkat lunak pada bab ini diperoleh dari pemeriksaan langsung terhadap runtime dan paket yang terpasang, bukan dari perkiraan. Konfigurasi lingkungan implementasi dirangkum pada Tabel 4.1.

**Tabel 4.1 Lingkungan Implementasi**

| Komponen | Keterangan |
|---|---|
| Sistem operasi | Microsoft Windows 11 Home Single Language, versi 10.0.26300 |
| PHP dan Laravel | PHP 8.5.12 (ZTS, Visual C++ 2022 x64); Laravel Framework 13.39.0; Composer 2.10.3 |
| Pustaka backend | Inertia Laravel 3.7.0; Laravel Fortify 1.41.0; Laravel Wayfinder 0.1.23; Pest 5.3.5; PHPUnit 13.4.5 |
| Node.js dan paket frontend | Node.js 24.20.0; npm 11.19.0; React 19.3.1; Inertia React 3.11.0; Tailwind CSS 4.3.4; TypeScript 5.9.3; Vite Plus 1.4.0 |
| Basis data | MySQL Server 8.0.46 (layanan MySQL80); driver `mysql`; basis data `sigap`; charset `utf8mb4`; collation `utf8mb4_unicode_ci`; port aplikasi 3307 |
| Basis data pengujian | SQLite 3.53.4 mode `:memory:` sesuai konfigurasi `phpunit.xml`; data uji dibersihkan setiap kasus dengan `RefreshDatabase` |
| Telegram | Telegram Bot API; mode long polling melalui `TelegramPollCommand` dengan metode `getUpdates`; endpoint webhook `POST /api/telegram/webhook` tersedia sebagai jalur alternatif |
| Layanan AI | Gemini API `generativelanguage.googleapis.com` versi `v1beta`; model `gemini-3.5-flash`; `LLM_PROVIDER` dan `STT_PROVIDER` bernilai `gemini`; suhu generasi 0,1; kunci API tidak dicantumkan |
| Perangkat uji | Prosesor Intel Core i7-13650HX dengan 20 logical processor; RAM 15,7 GB; penyimpanan lokal |
| Peramban | Google Chrome 157.0.8103.50 dan Microsoft Edge 157.0.4341.42 |

Lingkungan aplikasi menggunakan MySQL 8.0.46, sedangkan pengujian otomatis menggunakan SQLite di memori agar setiap kasus uji berjalan terisolasi dan dapat diulang tanpa mengubah data pengembangan. Perbedaan ini disengaja: MySQL dipakai untuk operasional aplikasi, sedangkan SQLite dipakai khusus oleh test suite melalui variabel lingkungan pada `phpunit.xml`.

@@LEFT@@Konfigurasi layanan eksternal yang tidak bersifat rahasia dicatat sebagai berikut. Nilai `TELEGRAM_BOT_USERNAME` adalah `RosanSigapBot`. Nilai `TELEGRAM_WEBHOOK_SECRET` kosong, sehingga validasi secret token pada webhook tidak diaktifkan. Nilai `LLM_MODEL` adalah `gemini-3.5-flash`, sedangkan `LLM_PROVIDER` dan `STT_PROVIDER` bernilai `gemini`. Nilai `TELEGRAM_BOT_TOKEN`, `LLM_API_KEY`, dan `STT_API_KEY` sengaja tidak dituliskan. Pada saat pengujian, mode Telegram yang digunakan adalah long polling, yaitu proses `php artisan telegram:poll` menghapus webhook aktif melalui `deleteWebhook()` lalu mengambil update secara berkala melalui `getUpdates()`.

## 4.2 Implementasi Sistem

Aplikasi dibangun dengan pola arsitektur Laravel pada sisi peladen dan Inertia React pada sisi antarmuka. Struktur ini memisahkan penerimaan pesan, pemrosesan laporan, penyimpanan data, dan penyajian dashboard admin ke dalam kelas serta controller yang berbeda. Bagian ini menjelaskan implementasi setiap bagian tersebut.

### 4.2.1 Implementasi Penerimaan Update Telegram

Penerimaan update Telegram disediakan melalui dua jalur. Jalur pertama adalah `TelegramPollCommand` dengan perintah `telegram:poll` yang menerima opsi `--timeout` (15 detik) dan `--once`. Perintah ini menyimpan PID proses ke `storage/app/poller.pid`, menghapus webhook aktif, lalu menjalankan perulangan `getUpdates` dengan batas waktu 15 detik. Setiap update yang diterima diteruskan ke `IncidentReportService`. Pesan teks, voice note, audio, dan lokasi diperlakukan berbeda pada tahap ini. Perintah juga menuliskan log ke `storage/logs/telegram_poll.log` dan menghapus berkas PID ketika proses berhenti.

Jalur kedua adalah `TelegramWebhookController` yang melayani `POST /api/telegram/webhook`. Controller memeriksa header `X-Telegram-Bot-Api-Secret-Token` apabila `TELEGRAM_WEBHOOK_SECRET` diisi, meneruskan payload ke `IncidentReportService`, menangani pengecualian agar server tetap merespons, dan mengembalikan JSON `{"ok": true}`. Pada implementasi yang diuji, jalur yang digunakan untuk demonstrasi adalah long polling. `TelegramService` menyediakan operasi `sendMessage`, `getFile`, `downloadFile`, `getUpdates`, `setWebhook`, dan `deleteWebhook`.

@@GAMBAR 4.1|Proses polling dan log penerimaan update Telegram@@

### 4.2.2 Implementasi Alur Pelaporan

`IncidentReportService` mengatur seluruh alur percakapan pelapor. Ketika pelapor mengirim `/start`, layanan membuat data `Reporter` berdasarkan `chat_id` Telegram, menutup percakapan aktif sebelumnya, lalu mengirim pesan sambutan berisi petunjuk tiga langkah dan tombol `Kirim Lokasi`. Pesan berikutnya diproses sesuai jenisnya: teks, voice note, audio, atau lokasi.

Apabila pelapor mengirim lokasi, layanan menyimpan lintang dan bujur pada pesan masuk, menetapkan `location_source` bernilai `gps`, dan menganjurkan pelapor mengirim keterangan kejadian. Apabila pelapor mengirim teks atau voice note sebelum lokasi tersedia, layanan menyimpan keterangan tersebut dan meminta lokasi terlebih dahulu. Setelah lokasi dan keterangan tersedia, layanan menyusun pratinjau laporan dan mengirimkannya kepada pelapor bersama pilihan `Konfirmasi Laporan`, `Koreksi`, dan `Batalkan`.

Konfirmasi pelapor memicu pembuatan `Report` di dalam transaksi basis data. Koreksi mengosongkan draf dan meminta pelapor mengirim ulang keterangan, sedangkan pembatalan menutup percakapan tanpa membuat laporan. Setiap pesan masuk dicatat pada tabel `messages` dengan `wa_message_id` berbentuk `tg_{message_id}_{chat_id}`, tipe masukan, isi pesan, transkrip bila ada, serta status pemrosesan `pending` atau `processed`.

@@GAMBAR 4.2|Percakapan bot saat perintah /start@@

@@GAMBAR 4.3|Percakapan bot saat pengiriman lokasi dan laporan teks@@

@@GAMBAR 4.4|Pratinjau laporan dan tombol konfirmasi@@

### 4.2.3 Implementasi Transkripsi dan Ekstraksi

`GeminiService` menangani dua fungsi utama, yaitu transkripsi audio dan ekstraksi atribut kejadian. Fungsi `transcribeAudio` mengirim data audio dalam bentuk `inline_data` berformat Base64 ke Gemini API dengan suhu 0,1 dan batas waktu 30 detik. Hasil transkripsi kemudian digunakan sebagai teks pesan. Apabila transkripsi gagal atau kosong, layanan tidak membuat laporan dan mengirimkan pesan agar pelapor mengirim ulang voice note atau mengetik laporan.

Fungsi `extractReport` terlebih dahulu mencoba membaca format laporan terstruktur menggunakan ekspresi reguler. Format yang dikenali meliputi `Jenis Kejadian`, `Patokan/Alamat`, `Keterangan`, dan `Kondisi Korban`. Apabila teks tidak mengikuti format tersebut, layanan memanggil Gemini API dengan `responseMimeType` bernilai `application/json` untuk memperoleh atribut `incident_type`, `location_description`, `description`, `victim_count`, `victim_condition`, dan `summary`. Apabila pemanggilan layanan gagal, layanan menggunakan ekstraksi heuristik berbasis kata kunci sebagai cadangan. Pesan yang tidak mengandung indikasi kedaruratan ditolak sebelum diproses lebih lanjut.

@@GAMBAR 4.5|Voice note dan hasil transkripsi pada percakapan@@

### 4.2.4 Implementasi Penyimpanan Data

Data aplikasi disimpan pada tujuh model utama, yaitu `Reporter`, `Report`, `Conversation`, `Message`, `ReportDetail`, `ReportHistory`, dan `User`. Tabel `reporters` menyimpan identitas pelapor dengan `whatsapp_number` yang pada implementasi Telegram diisi `chat_id`. Tabel `reports` menyimpan kode laporan, jenis masukan, teks asli, jenis kejadian, waktu kejadian, deskripsi, jumlah dan kondisi korban, keterangan lokasi, koordinat, sumber lokasi, ringkasan, status kelengkapan, status verifikasi, serta status penanganan.

Tabel `messages` menyimpan arah pesan, tipe pesan, isi pesan, jalur audio, transkrip, koordinat, dan status pemrosesan. Tabel `report_details` menghubungkan atribut laporan dengan sumber pesan, sedangkan tabel `report_histories` mencatat status sebelumnya, status baru, status verifikasi sebelumnya dan baru, catatan, serta admin yang melakukan perubahan. Relasi utama menghubungkan `Report` dengan `Reporter`, `ReportDetail`, `ReportHistory`, dan `Message`, serta menghubungkan `ReportHistory` dengan `User` sebagai admin.

### 4.2.5 Implementasi Dashboard Admin

Dashboard admin menampilkan ringkasan jumlah laporan, jumlah laporan belum diverifikasi, laporan sedang ditangani, laporan selesai, dan laporan tidak valid. Dashboard juga menampilkan ringkasan status dalam bentuk grafik batang, aktivitas terbaru, serta status kendali bot beserta log polling. Status kendali bot diperoleh dari berkas PID dan dapat diperbarui melalui endpoint `poller/start`, `poller/stop`, serta `poller/logs`.

Halaman daftar laporan menampilkan seluruh laporan terbaru beserta data pelapor, lokasi, koordinat, status, dan tautan Google Maps. Penyaringan berdasarkan kata kunci, status penanganan, jenis kejadian, status verifikasi, dan filter cepat dilakukan pada sisi klien. Halaman detail laporan menampilkan informasi kejadian, koordinat, daftar pesan, serta riwayat perubahan status. Halaman peta hanya memuat laporan yang memiliki lintang dan bujur.

Perubahan status dilakukan melalui `ReportController@updateStatus` dengan aksi `dispatch`, `complete`, `invalid`, atau `custom`. Setiap perubahan status disimpan pada `Report`, dicatat pada `ReportHistory`, dan diikuti pengiriman pemberitahuan kepada pelapor melalui `TelegramService`. Pesan pemberitahuan juga dicatat sebagai pesan keluar pada tabel `messages`.

@@GAMBAR 4.6|Dashboard admin beserta status kendali bot@@

@@GAMBAR 4.7|Daftar laporan beserta filter@@

@@GAMBAR 4.8|Detail laporan dan riwayat status@@

@@GAMBAR 4.9|Peta sebaran laporan@@

## 4.3 Prosedur Pengujian

Pengujian fungsional dilakukan dengan pendekatan black-box. Setiap skenario disiapkan menggunakan akun admin hasil factory, pelapor sintetis, dan data laporan sintetis. Pengujian dijalankan secara berurutan, dimulai dari autentikasi admin, pemantauan dashboard, pengelolaan laporan, hingga alur pelaporan melalui Telegram. Data masukan, keluaran yang diharapkan, keluaran aktual, dan status hasil dicatat pada Tabel 4.2.

@@LEFT@@Pengujian otomatis menggunakan Pest dan dijalankan dengan perintah `php artisan test`. Konfigurasi pengujian pada `phpunit.xml` menetapkan `APP_ENV=testing`, `DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`, `CACHE_STORE=array`, `QUEUE_CONNECTION=sync`, `SESSION_DRIVER=array`, dan `MAIL_MAILER=array`. Setiap berkas uji menggunakan `RefreshDatabase` sehingga data antar-kasus tidak saling memengaruhi.

Pemanggilan layanan eksternal diisolasi agar pengujian dapat diulang dan tidak mengirim pesan atau permintaan sungguhan. Telegram diuji menggunakan mock `TelegramService` atau `Http::fake()`. Gemini diuji menggunakan mock `GeminiService` atau respons HTTP sintetis. Data uji yang digunakan antara lain pelapor bernama Rina, `chat_id` 987654321, koordinat 4,47123 dan 97,96541, jenis kejadian Kebakaran atau Kecelakaan lalu lintas, serta kode laporan `SIRINE-TEST-001`. Seluruh data tersebut merupakan data sintetis dan tidak memuat identitas nyata.

**Tabel 4.2 Skenario Pengujian Fungsional**

| ID | Skenario, langkah, dan masukan utama | Hasil yang diharapkan | Hasil aktual | Status |
|---|---|---|---|---|
| TC-01 | Login Admin. Admin membuka halaman login, memasukkan kredensial valid, kredensial salah, dan melakukan logout. | Admin terautentikasi atau tetap berada pada halaman login. | Lima pengujian autentikasi lulus: halaman login dapat ditampilkan, pengguna terautentikasi dengan kredensial valid, kata sandi salah ditolak, pengguna dapat logout, dan percobaan berulang dibatasi. | Lulus |
| TC-02 | Pantau Dashboard dan Bot. Admin membuka dashboard dan memuat log poller. | Admin melihat ringkasan serta status kendali bot. | Pengujian dashboard dan endpoint log poller lulus. Dashboard memuat `stats`, `statusSummary`, `activities`, dan `poller`; endpoint `/poller/logs` mengembalikan `is_running`, `pid`, dan `logs`. | Lulus |
| TC-03 | Lihat dan Filter Laporan. Admin membuka halaman daftar laporan dan memilih filter. | Daftar laporan tampil sesuai filter yang dipilih. | Pengujian endpoint daftar laporan lulus; komponen `reports/index` menerima koleksi laporan. Penyaringan kata kunci, status, jenis, dan verifikasi dilakukan di sisi klien dan diperiksa melalui antarmuka pada Gambar 4.7. | Lulus |
| TC-04 | Lihat Detail Laporan. Admin memilih salah satu laporan. | Admin melihat informasi laporan dan riwayatnya. | Pengujian halaman detail lulus; komponen `reports/show` memuat kode laporan dan koordinat sesuai data uji. Halaman riwayat aktivitas juga lulus menampilkan peristiwa penerimaan laporan dan perubahan status. | Lulus |
| TC-05 | Lihat Peta Laporan. Admin membuka halaman peta laporan. | Admin melihat sebaran lokasi laporan yang memiliki koordinat. | Pengujian halaman peta lulus; hanya laporan berkoordinat yang dikirim ke komponen peta, yaitu 1 dari 2 laporan pada data uji, dengan nilai lintang dan bujur yang sesuai. | Lulus |
| TC-06 | Ubah Status Laporan. Admin memilih tindakan dispatch. | Status dan riwayat tersimpan; pemberitahuan dikirim jika layanan tersedia. | Pengujian aksi dispatch lulus; status berubah menjadi `menuju_lokasi` dan verifikasi menjadi `terverifikasi`, `ReportHistory` tercatat, dan pesan keluar tersimpan. Pemanggilan Telegram diverifikasi melalui mock. | Lulus |
| TC-07 | Mulai Pelaporan. Pelapor mengirim perintah `/start`. | Pelapor menerima petunjuk dan percakapan siap menerima lokasi. | Pengujian perintah `/start` lulus; `Reporter` dibuat dengan nama dan `chat_id` sesuai payload, pesan sambutan berisi permintaan lokasi terkirim, dan belum ada `Report` yang dibuat. | Lulus |
| TC-08 | Kirim Lokasi Kejadian. Pelapor membagikan lokasi GPS. | Lokasi atau keterangan lokasi tersedia pada percakapan/laporan. | Pengujian alur dua langkah lulus; payload lokasi 4,47123 dan 97,96541 diproses, laporan tersimpan dengan `location_source` bernilai `gps` dan koordinat yang sama setelah konfirmasi. | Lulus |
| TC-09 | Kirim Laporan Teks. Pelapor mengirim keterangan kejadian sesuai format. | Data laporan atau draf tersimpan dan pratinjau dikirim bila pemrosesan berhasil. | Pengujian ekstraksi format laporan lulus; jenis kejadian, patokan/alamat, keterangan, jumlah korban, dan kondisi korban terbaca sesuai teks uji. Laporan tersimpan setelah konfirmasi. | Lulus |
| TC-10 | Kirim Voice Note. Pelapor mengirim voice note. | Transkrip diproses sebagai teks atau pelapor menerima permintaan input ulang. | Pengujian transkripsi lulus; transkrip tersimpan pada kolom `transcript` dan `body` pesan audio. Pengujian transkrip kosong juga lulus; sistem tidak membuat laporan dan mengirim permintaan input ulang. Respons Gemini disimulasikan. | Lulus |
| TC-11 | Konfirmasi, Koreksi, atau Batalkan Laporan. Pelapor membaca pratinjau laporan. | Laporan dikonfirmasi, draf diperbarui, atau sesi dibatalkan. | Pengujian koreksi dan konfirmasi lulus; draf diperbarui menjadi Kecelakaan lalu lintas lalu laporan dibuat. Pengujian pembatalan lulus; percakapan berstatus `completed` dan tidak ada laporan yang dibuat. | Lulus |

## 4.4 Hasil Pengujian

Seluruh skenario pada Tabel 4.2 telah dijalankan. Hasil eksekusi test suite ditunjukkan pada Gambar 4.10. Perintah `php artisan test` menghasilkan 46 test dengan 43 test lulus, 3 test dilewati, 0 test gagal, dan 216 assertion. Durasi eksekusi berkisar 2,3 sampai 2,5 detik pada eksekusi yang dilakukan.

Tiga test yang dilewati merupakan pengujian autentikasi dua faktor pada `tests/Feature/Settings/SecurityTest.php`. Test tersebut dilewati secara eksplisit karena fitur autentikasi dua faktor tidak diaktifkan pada `config/fortify.php`. Kondisi ini bukan kegagalan aplikasi, melainkan penyesuaian test terhadap fitur yang memang tidak digunakan. Dengan demikian, seluruh test yang benar-benar dijalankan, yaitu 43 test, dinyatakan lulus atau mencapai 100%.

**Tabel 4.3 Ringkasan Hasil Pengujian**

| Ringkasan | Nilai |
|---|---:|
| Jumlah skenario direncanakan | 11 |
| Jumlah skenario diuji | 11 |
| Jumlah hasil sesuai | 11 |
| Jumlah hasil tidak sesuai | 0 |
| Persentase keberhasilan skenario | 100% |
| Jumlah test otomatis dijalankan | 46 |
| Test otomatis lulus | 43 |
| Test otomatis dilewati | 3 |
| Test otomatis gagal | 0 |
| Jumlah assertion | 216 |
| Durasi eksekusi test | 2,3–2,5 detik |
| Hasil build frontend | Berhasil (14,04 detik) |

Rekapitulasi pengujian otomatis per berkas pada direktori `tests/` disajikan pada Tabel 4.4.

**Tabel 4.4 Rekapitulasi Pengujian Otomatis per Berkas**

| No | Berkas pengujian | Jumlah test | Lulus | Dilewati | Gagal |
|---:|---|---:|---:|---:|---:|
| 1 | `Feature/ActivityLogTest.php` | 2 | 2 | 0 | 0 |
| 2 | `Feature/DashboardTest.php` | 4 | 4 | 0 | 0 |
| 3 | `Feature/ExampleTest.php` | 1 | 1 | 0 | 0 |
| 4 | `Feature/TelegramReportingTest.php` | 14 | 14 | 0 | 0 |
| 5 | `Feature/Auth/AuthenticationTest.php` | 5 | 5 | 0 | 0 |
| 6 | `Feature/Auth/PasswordConfirmationTest.php` | 2 | 2 | 0 | 0 |
| 7 | `Feature/Auth/PasswordResetTest.php` | 5 | 5 | 0 | 0 |
| 8 | `Feature/Auth/RegistrationTest.php` | 2 | 2 | 0 | 0 |
| 9 | `Feature/Settings/ProfileUpdateTest.php` | 5 | 5 | 0 | 0 |
| 10 | `Feature/Settings/SecurityTest.php` | 5 | 2 | 3 | 0 |
| 11 | `Unit/ExampleTest.php` | 1 | 1 | 0 | 0 |
|  | **Total** | **46** | **43** | **3** | **0** |

@@GAMBAR 4.10|Keluaran perintah php artisan test@@

@@GAMBAR 4.11|Halaman login admin pada skenario TC-01@@

@@GAMBAR 4.12|Pemberitahuan perubahan status pada Telegram pelapor@@

@@GAMBAR 4.13|Keluaran perintah npm run build@@

## 4.5 Pembahasan

Hasil pengujian menunjukkan bahwa seluruh skenario fungsional yang direncanakan dapat dipenuhi. Jalur autentikasi admin, penyajian dashboard, pengambilan detail dan riwayat laporan, penyaringan data peta, alur pelaporan berbasis teks dan lokasi GPS, penanganan transkripsi, perubahan status laporan, serta pencatatan efek samping berjalan sesuai dengan hasil yang diharapkan. Perubahan status tidak hanya memperbarui data laporan, tetapi juga menghasilkan entri riwayat dan pesan keluar yang dapat ditelusuri.

Pengujian alur Telegram memperlihatkan bahwa layanan mampu mempertahankan konteks percakapan, membedakan pesan kedaruratan dari pesan biasa, menyimpan pesan masuk beserta tipe masukannya, serta menangani kondisi gagal transkripsi tanpa membuat laporan yang tidak valid. Penggunaan mock dan HTTP fake membuat pengujian dapat diulang secara konsisten dan tidak bergantung pada ketersediaan jaringan maupun kuota layanan eksternal.

Keterbatasan pengujian perlu dinyatakan secara terbuka. Pertama, pemanggilan Telegram dan Gemini pada pengujian otomatis disimulasikan, sehingga hasil pengujian membuktikan kesesuaian kontrak aplikasi, bukan kualitas jaringan, kredensial, atau akurasi model AI di lingkungan produksi. Kedua, interaksi filter pada halaman daftar laporan, proses long polling dengan bot sungguhan, dan tampilan peta diverifikasi melalui pengamatan antarmuka yang dibuktikan pada gambar, bukan melalui pengujian browser otomatis. Ketiga, tiga test autentikasi dua faktor dilewati karena fitur tersebut tidak diaktifkan, sehingga keamanan dua faktor tidak termasuk cakupan pengujian ini. Pengujian performa, beban, dan penetrasi keamanan juga belum dilakukan dan dapat menjadi penelitian lanjutan.
