# SIRINE: Persiapan Backend (API, WhatsApp, Speech-to-Text, AI)

## 1. Akun dan akses yang harus disiapkan (Dev A)

| Kebutuhan | Keterangan |
|---|---|
| Akun Meta for Developers | Buat App bertipe Business, tambahkan produk WhatsApp |
| WhatsApp test number | Diberikan Meta secara gratis untuk pengembangan. Penerima uji hanya nomor yang didaftarkan (ada batas jumlahnya) |
| Token akses | Token sementara untuk uji. Untuk demo lebih lama buat System User token permanen |
| Phone Number ID | Dipakai di URL pengiriman pesan |
| Webhook Verify Token | String bebas buatan sendiri |
| App Secret | Untuk memverifikasi signature webhook |
| API key LLM | Pilih satu penyedia (Anthropic, OpenAI, Google, dll.) |
| API key / akun STT | Lihat bagian 4 |
| Tunnel publik | ngrok atau Cloudflare Tunnel, karena webhook butuh URL HTTPS publik |

Cek dokumentasi resmi Meta untuk versi Graph API terbaru dan batasan akun uji, karena bisa berubah.

## 2. Variabel `.env`

```env
# WhatsApp Cloud API
WA_GRAPH_VERSION=v21.0
WA_PHONE_NUMBER_ID=
WA_ACCESS_TOKEN=
WA_VERIFY_TOKEN=isi_string_rahasia_sendiri
WA_APP_SECRET=

# LLM
LLM_PROVIDER=anthropic
LLM_API_KEY=
LLM_MODEL=

# Speech-to-Text
STT_PROVIDER=openai_whisper
STT_API_KEY=

# Aplikasi
QUEUE_CONNECTION=database
MAX_FOLLOWUP_QUESTIONS=4
CONVERSATION_EXPIRE_MINUTES=60
```

Semua token hanya dibaca di backend (`config/services.php`). Jangan pernah dikirim ke frontend.

## 3. Daftar endpoint API

### Webhook WhatsApp (Dev A)

| Method | Path | Fungsi |
|---|---|---|
| GET | `/webhook/whatsapp` | Verifikasi Meta: cocokkan `hub.verify_token`, balas `hub.challenge` |
| POST | `/webhook/whatsapp` | Terima pesan. Validasi signature, simpan ke `messages`, dispatch job, **langsung balas 200** |

Penting: proses berat (STT, LLM) jangan dikerjakan di dalam request webhook. Meta akan mengirim ulang jika respons lambat, sehingga bisa terjadi pemrosesan ganda. Jadi:
1. Validasi `X-Hub-Signature-256` (HMAC SHA256 dengan App Secret).
2. Insert `messages` dengan `wa_message_id` unik. Jika sudah ada, abaikan (TC-08).
3. Dispatch `ProcessIncomingMessage`.
4. Return 200.

### Endpoint dashboard (Dev B, dilindungi session auth)

| Method | Path | Fungsi |
|---|---|---|
| GET | `/login`, POST `/login`, POST `/logout` | Autentikasi admin |
| GET | `/admin` | Dashboard utama (statistik) |
| GET | `/admin/reports` | Daftar laporan (filter: status, tanggal, jenis, pencarian) |
| GET | `/admin/reports/{id}` | Detail laporan |
| PATCH | `/admin/reports/{id}/status` | Ubah status, tulis `report_histories` |
| GET | `/admin/reports/{id}/audio` | Streaming audio, hanya untuk admin login |
| GET | `/admin/map` | Peta semua laporan berkoordinat |

Karena memakai Inertia, sebagian besar tidak perlu API JSON terpisah. Controller mengembalikan `Inertia::render(...)`.

### Endpoint pengembangan (hanya `APP_ENV=local`)

| Method | Path | Fungsi |
|---|---|---|
| POST | `/dev/simulate-message` | Simulasikan pesan masuk (teks/lokasi) tanpa WhatsApp, supaya Dev B bisa mengisi data nyata dan pengujian tidak tergantung HP |

## 4. Speech-to-Text

Voice note WhatsApp berformat **OGG dengan codec Opus**. Pilih layanan yang menerimanya langsung, supaya tidak perlu konversi.

| Opsi | Catatan |
|---|---|
| OpenAI Whisper API | Menerima OGG, bahasa Indonesia bagus, mudah dipakai (satu request upload file) |
| Groq (Whisper) | Cepat dan sering ada tier gratis. Cek batas terbaru |
| Google Cloud Speech-to-Text | Mendukung OGG_OPUS dan bahasa `id-ID`. Setup lebih panjang (service account) |
| Whisper lokal (`faster-whisper`) | Tanpa biaya API, tetapi butuh mesin kuat dan setup lebih rumit |

**Saran untuk hackathon:** Whisper API atau Groq. Setup tercepat. Cek harga dan batas gratis terbaru di situs masing-masing sebelum memutuskan.

Cadangan: jika voice note > durasi tertentu atau gagal, minta pelapor mengetik (sesuai UC-02 alternatif).

Alur pengambilan audio dari WhatsApp:
1. Webhook membawa `audio.id`.
2. `GET https://graph.facebook.com/{version}/{media-id}` dengan header `Authorization: Bearer <token>`, hasilnya berisi `url`.
3. `GET {url}` dengan header Authorization yang sama, hasilnya file biner. Simpan ke `storage/app/private/audio/`.
4. Kirim file ke STT, simpan hasil ke `messages.transcript`.

## 5. Kontrak ekstraksi AI (disepakati Dev A dan Dev B)

LLM wajib mengembalikan JSON dengan format tetap berikut. Setiap field punya `value` dan `status`.

```json
{
  "incident_type":        {"value": "kecelakaan lalu lintas", "status": "known"},
  "incident_time":        {"value": "2026-11-03T20:00:00+07:00", "status": "known"},
  "location_description": {"value": "Jalan Merdeka dekat persimpangan", "status": "known"},
  "description":          {"value": "Dua sepeda motor bertabrakan", "status": "known"},
  "victim_count":         {"value": null, "status": "unknown"},
  "victim_condition":     {"value": "Satu orang terlihat terjatuh dan terluka", "status": "known"},
  "extra_info":           {"value": null, "status": "unknown"},
  "conflicts":            [],
  "next_question_field":  "victim_count"
}
```

`status` hanya boleh: `known`, `unknown`, `ambiguous`.

**Aturan prompt sistem (wajib, sesuai RPL 3.6):**
- Hanya isi dari yang dikatakan pelapor. Jangan menebak jumlah korban, tingkat luka, atau penyebab.
- Jika tidak disebut, `value: null` dan `status: unknown`.
- Jika kabur, `status: ambiguous`.
- Jika bertentangan dengan data sebelumnya, masukkan ke `conflicts`.
- Jangan menganggap lokasi pelapor sebagai lokasi kejadian.
- Waktu relatif ("tadi malam jam 8") dikonversi memakai tanggal dan zona waktu yang dikirim sebagai konteks (Asia/Jakarta atau sesuai pelapor).
- Keluaran hanya JSON, tanpa teks lain. Validasi di backend. Jika JSON rusak, ulangi sekali lalu tandai `process_status = failed`.

Field wajib untuk dianggap lengkap: `incident_type`, `incident_time`, `location_description`, `description`. Field `victim_count` dan `victim_condition` ditanyakan bila relevan, tetapi boleh "tidak diketahui".

## 6. Struktur kode backend yang disarankan

```
app/
├── Http/Controllers/
│   ├── WebhookController.php          (Dev A)
│   └── Admin/                         (Dev B)
│       ├── DashboardController.php
│       ├── ReportController.php
│       └── MapController.php
├── Jobs/
│   └── ProcessIncomingMessage.php     (Dev A)
├── Services/
│   ├── WhatsApp/
│   │   ├── WhatsAppClient.php         kirim teks, unduh media
│   │   └── SignatureVerifier.php
│   ├── Speech/
│   │   └── SpeechToTextService.php    satu interface, banyak penyedia
│   ├── AI/
│   │   ├── ExtractionService.php      panggil LLM, parse JSON
│   │   ├── CompletenessChecker.php    tentukan field yang kurang
│   │   └── SummaryService.php
│   └── Conversation/
│       └── ConversationManager.php    state, batas pertanyaan, expire
├── Models/                            (Dev B)
└── Enums/ReportStatus.php, InformationStatus.php   (bersama)
```

`SpeechToTextService` dibuat sebagai interface supaya penyedia bisa diganti lewat `.env` tanpa mengubah alur.

## 7. Alur pemrosesan satu pesan

```
POST webhook
  -> verifikasi signature
  -> simpan messages (unik wa_message_id) -> 200 OK
  -> [queue] ProcessIncomingMessage
       -> jika audio: unduh -> STT -> simpan transcript
       -> jika location: simpan koordinat, tanyakan konfirmasi
       -> ExtractionService (LLM) -> JSON
       -> update reports + report_details
       -> CompletenessChecker
            -> kurang & followup_count < MAX: kirim pertanyaan lanjutan
            -> cukup / batas tercapai: SummaryService -> kirim ringkasan
       -> update status laporan & conversation
```

## 8. Hal penting yang sering terlewat

- **Jendela 24 jam WhatsApp:** pesan bebas hanya boleh dibalas dalam 24 jam sejak pesan terakhir pelapor. Untuk MVP ini aman karena pelapor selalu memulai percakapan.
- **Queue worker:** jalankan `php artisan queue:work` saat demo. Banyak yang lupa dan menyangka bot "mati".
- **Batas waktu & retry:** atur `tries` dan `backoff` pada job. Jika LLM atau STT gagal, pesan tetap tercatat dan bisa diproses ulang (TC-12).
- **Percakapan kedaluwarsa:** scheduler Laravel menandai `expired` bila tidak ada pesan lebih dari `CONVERSATION_EXPIRE_MINUTES`, dan laporan sementara tetap tersimpan.
- **Pengingat 119:** template awal wajib memuat peringatan untuk menghubungi 119 langsung.
- **Privasi:** audio disimpan di storage privat (bukan `public`), diakses hanya lewat route admin. Tentukan kebijakan hapus audio (misalnya setelah N hari).
- **Log:** simpan log request/response LLM tanpa token, untuk debugging saat demo.
- **Biaya:** batasi panjang input dan jumlah pertanyaan lanjutan agar pemakaian API terkendali.
- **Data demo:** siapkan beberapa skenario pesan (lengkap, kurang lokasi, voice note, jawaban "tidak tahu") untuk dicoba berulang.

## 9. Urutan setup (checklist Dev A)

1. Buat app Meta, aktifkan WhatsApp, catat Phone Number ID dan token.
2. Jalankan tunnel, daftarkan URL webhook dan verify token di dashboard Meta, subscribe ke event `messages`.
3. Buat `WebhookController` GET lalu uji verifikasi.
4. Buat POST, log payload mentah, kirim pesan dari HP, pastikan payload masuk.
5. Implementasi `WhatsAppClient::sendText()` dan balas template awal.
6. Tambahkan queue, signature check, dan anti-duplikat.
7. Tambahkan `ExtractionService` dengan prompt di atas.
8. Lanjut ke `CompletenessChecker` dan pertanyaan lanjutan.
9. Baru tambahkan STT dan lokasi.
