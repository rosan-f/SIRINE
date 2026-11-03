# SIRINE: Alur Pengerjaan dan Pembagian Tugas (2 Orang)

## 1. Prinsip pembagian

Proyek dibagi berdasarkan **lapisan sistem**, bukan berdasarkan fitur, supaya dua orang bisa bekerja paralel tanpa saling menunggu.

| | **Dev A: Chatbot & AI Engine** | **Dev B: Data & Dashboard** |
|---|---|---|
| Fokus | Semua yang berhubungan dengan WhatsApp, STT, dan LLM | Database, autentikasi admin, dan antarmuka dashboard |
| Stack | Laravel (webhook, queue, service class) | Laravel (migration, model, controller) + React + Inertia |
| Output | Pesan masuk menjadi data laporan terstruktur | Data laporan tampil, bisa dikelola, ada peta |

**Titik temu (kontrak) yang harus disepakati bersama di Fase 0:**
1. Skema database (`03-erd-database.md` dan `04-schema.sql`).
2. Format JSON hasil ekstraksi AI (ada di `05-persiapan-backend.md`, bagian 5).
3. Nilai enum status (`report_status`, `verification_status`, `completeness_status`).

Setelah tiga hal ini disepakati, Dev A dan Dev B bisa jalan sendiri-sendiri.

## 2. Alur pengerjaan (fase)

```
Fase 0: Fondasi bersama (bareng)
   |
   +--> Fase 1A: Webhook & balas teks     (Dev A)
   +--> Fase 1B: Auth admin & CRUD laporan (Dev B)
            |
            v
Fase 2: Integrasi 1 (ekstraksi AI menyimpan ke DB, dashboard menampilkan data nyata)
            |
            +--> Fase 3A: Pertanyaan lanjutan & cek kelengkapan (Dev A)
            +--> Fase 3B: Detail laporan, riwayat status, filter (Dev B)
            |
            v
Fase 4: Fitur Prioritas 2 (voice note, share location, peta)
            |
            v
Fase 5: Pengujian (TC-01 s.d. TC-12), perbaikan, demo
```

### Fase 0: Fondasi bersama (hari 1-2)
Dikerjakan berdua, idealnya satu sesi.
- [ ] Buat repo Git, tentukan branch (`main`, `dev`, `feat/*`) dan aturan merge.
- [ ] Inisialisasi Laravel + React + Inertia, pastikan jalan di kedua laptop.
- [ ] Sepakati skema DB, jalankan migration pertama (Dev B yang menulis, Dev A review).
- [ ] Sepakati format JSON ekstraksi AI.
- [ ] Buat akun Meta Developer, WhatsApp Business test number (Dev A).
- [ ] Siapkan `.env.example` dan bagikan cara mengisi variabel.
- [ ] Siapkan tunnel untuk webhook (ngrok atau Cloudflare Tunnel).

### Fase 1: Jalur paralel (hari 3-6)

**Dev A**
- [ ] Endpoint webhook `GET` (verifikasi) dan `POST` (terima pesan).
- [ ] Verifikasi signature `X-Hub-Signature-256`.
- [ ] Simpan pesan masuk ke tabel `messages` dengan `wa_message_id` unik (anti-duplikat).
- [ ] Kirim template pertanyaan awal lewat Cloud API.
- [ ] Pasang queue (job `ProcessIncomingMessage`).

**Dev B**
- [ ] Seeder admin, login/logout (Laravel auth + Inertia).
- [ ] Layout dashboard (sidebar, navbar).
- [ ] Halaman daftar laporan (tabel, pagination, filter status).
- [ ] Seeder data dummy laporan supaya UI bisa dikerjakan tanpa menunggu Dev A.

### Fase 2: Integrasi pertama (hari 7-8)
- [ ] Dev A: LLM mengekstrak teks menjadi JSON, lalu disimpan ke `reports` dan `report_details`.
- [ ] Dev B: dashboard membaca data nyata, bukan dummy.
- [ ] Uji end-to-end: kirim WA, laporan muncul di dashboard.

### Fase 3: Pendalaman (hari 9-13)

**Dev A**
- [ ] Logika cek kelengkapan (`CompletenessChecker`).
- [ ] Generator pertanyaan lanjutan.
- [ ] State percakapan (`conversations.current_question`, status `active/completed/expired`).
- [ ] Batas tanya-jawab (maks. N pertanyaan lanjutan, opsi "belum diketahui").
- [ ] Generator ringkasan laporan.

**Dev B**
- [ ] Halaman detail laporan (pesan asli, transkrip, ringkasan, riwayat percakapan).
- [ ] Ubah status laporan + catat ke `report_histories`.
- [ ] Dashboard utama (kartu statistik).
- [ ] Log aktivitas admin.

### Fase 4: Prioritas 2 (hari 14-17)
- [ ] Dev A: voice note, yaitu ambil media, STT, simpan transkrip, lanjutkan ke ekstraksi.
- [ ] Dev A: terima pesan tipe `location` dan simpan koordinat.
- [ ] Dev B: pemutar audio di halaman detail, tampilan transkrip.
- [ ] Dev B: peta (Leaflet + OpenStreetMap, gratis) di detail laporan dan peta semua laporan.

### Fase 5: Pengujian dan demo (hari 18-21)
- [ ] Jalankan seluruh test case TC-01 s.d. TC-12 (lihat `06-progress.md`).
- [ ] Perbaiki bug, rapikan UI.
- [ ] Siapkan skenario demo, data demo, dan cadangan (rekaman layar) kalau internet bermasalah.
- [ ] Siapkan slide / pitch.

> Jumlah hari di atas adalah patokan 3 minggu. Sesuaikan dengan tenggat KMIPN. Jika waktu lebih pendek, potong Fase 4 dan jadikan "pengembangan lanjutan". Dokumen Anda sendiri sudah menetapkan Prioritas 1 harus selesai dulu.

## 3. Kebiasaan kerja berdua

- **Sinkron singkat tiap hari** (10 menit): kemarin selesai apa, hari ini apa, apa yang menghalangi.
- **Satu orang, satu area folder** supaya konflik merge kecil:
  - Dev A: `app/Services/WhatsApp`, `app/Services/AI`, `app/Services/Speech`, `app/Jobs`, `app/Http/Controllers/WebhookController.php`
  - Dev B: `app/Http/Controllers/Admin`, `resources/js`, `database/migrations`, `database/seeders`
- **Perubahan migration**: hanya lewat Dev B, dan diumumkan dulu ke Dev A.
- **Commit kecil**, pull request kecil, saling review sebelum merge ke `dev`.
- **Dev A** menyediakan `php artisan` command atau route khusus lokal untuk menyimulasikan pesan WA tanpa harus membuka HP, supaya Dev B juga bisa menguji.
