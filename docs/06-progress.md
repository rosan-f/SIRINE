# SIRINE: Progress Tracker

Legenda: `[ ]` belum, `[~]` sedang dikerjakan, `[x]` selesai
Pemilik: **A** = Chatbot & AI, **B** = Data & Dashboard, **A+B** = bersama

Terakhir diperbarui: ____ / ____ / ______

## Ringkasan

| Fase | Target | Status |
|---|---|---|
| 0. Fondasi bersama | | [ ] |
| 1. Jalur paralel | | [ ] |
| 2. Integrasi pertama | | [ ] |
| 3. Pendalaman | | [ ] |
| 4. Fitur prioritas 2 | | [ ] |
| 5. Pengujian dan demo | | [ ] |

## Fase 0: Fondasi

| Tugas | Pemilik | Status |
|---|---|---|
| Repo Git, aturan branch | A+B | [ ] |
| Inisialisasi Laravel + React + Inertia | A+B | [ ] |
| Sepakati skema DB dan enum | A+B | [ ] |
| Sepakati format JSON ekstraksi AI | A+B | [ ] |
| Akun Meta Developer + test number | A | [ ] |
| Tunnel webhook (ngrok/Cloudflare) | A | [ ] |
| `.env.example` lengkap | A+B | [ ] |

## Fase 1: Jalur paralel

| Tugas | Pemilik | Status |
|---|---|---|
| Webhook GET (verifikasi) | A | [ ] |
| Webhook POST + simpan `messages` | A | [ ] |
| Verifikasi signature | A | [ ] |
| Kirim template awal | A | [ ] |
| Queue + job dasar | A | [ ] |
| Migration semua tabel | B | [ ] |
| Seeder admin + data dummy laporan | B | [ ] |
| Login/logout admin | B | [ ] |
| Layout dashboard | B | [ ] |
| Daftar laporan + filter | B | [ ] |

## Fase 2: Integrasi pertama

| Tugas | Pemilik | Status |
|---|---|---|
| `ExtractionService` (LLM -> JSON) | A | [ ] |
| Simpan ke `reports` dan `report_details` | A | [ ] |
| Dashboard membaca data nyata | B | [ ] |
| Uji end-to-end teks | A+B | [ ] |

## Fase 3: Pendalaman

| Tugas | Pemilik | Status |
|---|---|---|
| `CompletenessChecker` | A | [ ] |
| Pertanyaan lanjutan otomatis | A | [ ] |
| Batas tanya-jawab dan "tidak tahu" | A | [ ] |
| `ConversationManager` + expire | A | [ ] |
| Ringkasan laporan | A | [ ] |
| Halaman detail laporan | B | [ ] |
| Ubah status + `report_histories` | B | [ ] |
| Dashboard utama (statistik) | B | [ ] |
| Log aktivitas admin | B | [ ] |

## Fase 4: Prioritas 2

| Tugas | Pemilik | Status |
|---|---|---|
| Unduh media audio | A | [ ] |
| Integrasi Speech-to-Text | A | [ ] |
| Terima Share Location + konfirmasi lokasi | A | [ ] |
| Pemutar audio + transkrip di detail | B | [ ] |
| Peta di detail laporan | B | [ ] |
| Peta gabungan semua laporan | B | [ ] |

## Fase 5: Pengujian dan demo

| ID | Skenario | Hasil diharapkan | Status |
|---|---|---|---|
| TC-01 | Teks lengkap | Laporan terstruktur | [ ] |
| TC-02 | Teks tidak lengkap | Chatbot menanyakan yang kurang | [ ] |
| TC-03 | Voice note | Tertranskripsi | [ ] |
| TC-04 | Voice note tidak jelas | Minta konfirmasi/teks | [ ] |
| TC-05 | Jumlah korban tidak diketahui | Disimpan sebagai belum diketahui | [ ] |
| TC-06 | Share location | Koordinat tersimpan | [ ] |
| TC-07 | Pelapor tidak merespons | Laporan sementara tersimpan | [ ] |
| TC-08 | Pesan WA dikirim ulang | Tidak ada laporan duplikat | [ ] |
| TC-09 | Admin buka detail | Informasi tampil | [ ] |
| TC-10 | Admin ubah status | Status dan riwayat tersimpan | [ ] |
| TC-11 | Informasi bertentangan | Chatbot minta klarifikasi | [ ] |
| TC-12 | AI gagal memproses | Pesan tercatat, bisa diproses ulang | [ ] |

| Tugas penutup | Pemilik | Status |
|---|---|---|
| Skenario dan data demo | A+B | [ ] |
| Rekaman layar cadangan | A+B | [ ] |
| Slide / pitch | A+B | [ ] |
| Laporan akhir (RPL) | A+B | [ ] |

## Catatan harian

| Tanggal | Dev | Selesai | Kendala / keputusan |
|---|---|---|---|
| | | | |

## Risiko dan antisipasi

| Risiko | Antisipasi |
|---|---|
| Akun WhatsApp test tidak bisa mengirim ke nomor tertentu | Daftarkan nomor penguji di dashboard Meta sejak awal |
| Internet/ngrok bermasalah saat demo | Rekaman cadangan + endpoint simulasi lokal |
| LLM mengembalikan JSON rusak | Validasi + retry sekali + status `failed` |
| STT salah dengar (nama jalan) | Tampilkan transkrip di dashboard, konfirmasi lokasi ke pelapor |
| Waktu tidak cukup | Fokus Prioritas 1, voice note dan peta jadi bonus |
