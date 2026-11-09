# SIRINE diagram sources

Diagram di bawah memakai sumber Mermaid dengan tema hitam putih.

%% FIG-01 - Arsitektur Sistem
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
flowchart LR
    Reporter["Pelapor"] --> Telegram["Telegram Bot API"]
    Telegram --> Backend["Laravel backend<br/>Poller / Webhook / Services"]
    Admin["Admin"] --> Dashboard["Dashboard web<br/>Inertia.js + React"]
    Dashboard <--> Backend
    Backend <--> Database["Basis data relasional"]
    Backend <--> Gemini["Gemini API"]
    Backend --> Telegram
```

%% FIG-02 - Use Case Sistem SIRINE
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
flowchart TB
    Admin(("Admin"))
    Reporter(("Pelapor"))
    subgraph SIRINE["Sistem Informasi SIRINE"]
        direction LR
        subgraph UCGroup1
            direction TB
            U01(("UC-01 Login Admin"))
            U02(("UC-02 Pantau Dashboard dan Bot"))
            U03(("UC-03 Lihat dan Filter Laporan"))
            U04(("UC-04 Lihat Detail Laporan"))
            U01 ~~~ U04
        end
        subgraph UCGroup2
            direction TB
            U05(("UC-05 Lihat Peta Laporan"))
            U06(("UC-06 Ubah Status Laporan"))
            U07(("UC-07 Mulai Pelaporan"))
            U08(("UC-08 Kirim Lokasi Kejadian"))
            U05 ~~~ U08
        end
        subgraph UCGroup3
            direction TB
            U09(("UC-09 Kirim Laporan Teks"))
            U10(("UC-10 Kirim Voice Note"))
            U11(("UC-11 Konfirmasi, Koreksi, atau Batalkan Laporan"))
            U09 ~~~ U11
        end
    end
    Admin --- U01
    Admin --- U02
    Admin --- U03
    Admin --- U04
    Admin --- U05
    Admin --- U06
    Reporter --- U07
    Reporter --- U08
    Reporter --- U09
    Reporter --- U10
    Reporter --- U11
    style UCGroup1 fill:#ffffff,stroke:#ffffff,color:#ffffff
    style UCGroup2 fill:#ffffff,stroke:#ffffff,color:#ffffff
    style UCGroup3 fill:#ffffff,stroke:#ffffff,color:#ffffff
```

%% AD-01 - UC-01 Activity Diagram Login Admin
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
flowchart TD
    S((Mulai))
    A01["Buka halaman login dan masukkan kredensial"]
    S --> A01
    A02["Validasi kredensial"]
    A01 --> A02
    D{"Kredensial valid?"}
    A02 --> D
    P01["Buat sesi admin"]
    D -->|Ya| P01
    P02["Tampilkan pesan gagal"]
    D -->|Tidak| P02
    J(( ))
    P01 --> J
    P02 --> J
    Z01["Tampilkan hasil proses"]
    J --> Z01
    E(((Selesai)))
    Z01 --> E
```

%% AD-02 - UC-02 Activity Diagram Pantau Dashboard dan Bot
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
flowchart TD
    S((Mulai))
    A01["Buka dashboard"]
    S --> A01
    A02["Ambil ringkasan laporan dan status poller"]
    A01 --> A02
    D{"Admin mengubah status poller?"}
    A02 --> D
    P01["Mulai atau hentikan poller"]
    D -->|Ya| P01
    P02["Lanjutkan pemantauan"]
    D -->|Tidak| P02
    J(( ))
    P01 --> J
    P02 --> J
    Z01["Tampilkan status terbaru"]
    J --> Z01
    E(((Selesai)))
    Z01 --> E
```

%% AD-03 - UC-03 Activity Diagram Lihat dan Filter Laporan
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
flowchart TD
    S((Mulai))
    A01["Buka daftar laporan"]
    S --> A01
    A02["Ambil data laporan dan pelapor"]
    A01 --> A02
    D{"Filter dimasukkan?"}
    A02 --> D
    P01["Terapkan pencarian atau filter"]
    D -->|Ya| P01
    P02["Tampilkan semua laporan"]
    D -->|Tidak| P02
    J(( ))
    P01 --> J
    P02 --> J
    Z01["Tampilkan daftar laporan"]
    J --> Z01
    E(((Selesai)))
    Z01 --> E
```

%% AD-04 - UC-04 Activity Diagram Lihat Detail Laporan
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
flowchart TD
    S((Mulai))
    A01["Pilih laporan"]
    S --> A01
    A02["Ambil detail, pesan, dan riwayat"]
    A01 --> A02
    D{"Koordinat tersedia?"}
    A02 --> D
    P01["Siapkan tautan peta"]
    D -->|Ya| P01
    P02["Lanjut tanpa tautan peta"]
    D -->|Tidak| P02
    J(( ))
    P01 --> J
    P02 --> J
    Z01["Tampilkan detail laporan"]
    J --> Z01
    E(((Selesai)))
    Z01 --> E
```

%% AD-05 - UC-05 Activity Diagram Lihat Peta Laporan
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
flowchart TD
    S((Mulai))
    A01["Buka halaman peta"]
    S --> A01
    A02["Ambil laporan berkoordinat"]
    A01 --> A02
    D{"Koordinat laporan tersedia?"}
    A02 --> D
    P01["Tampilkan penanda lokasi"]
    D -->|Ya| P01
    P02["Tampilkan peta tanpa penanda"]
    D -->|Tidak| P02
    E(((Selesai)))
    P01 --> E
    P02 --> E
```

%% AD-06 - UC-06 Activity Diagram Ubah Status Laporan
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
flowchart TD
    S((Mulai))
    A01["Pilih tindakan dan catatan"]
    S --> A01
    A02["Validasi masukan"]
    A01 --> A02
    D{"Masukan valid?"}
    A02 --> D
    P01["Simpan status dan riwayat"]
    D -->|Ya| P01
    P02["Tampilkan kesalahan"]
    D -->|Tidak| P02
    J(( ))
    P01 --> J
    P02 --> J
    Z01["Kirim notifikasi Telegram bila tersedia"]
    J --> Z01
    E(((Selesai)))
    Z01 --> E
```

%% AD-07 - UC-07 Activity Diagram Mulai Pelaporan
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
flowchart TD
    S((Mulai))
    A01["Terima perintah start"]
    S --> A01
    A02["Cari atau buat pelapor dan tutup sesi lama"]
    A01 --> A02
    D{"Panduan berhasil dikirim?"}
    A02 --> D
    P01["Tunggu lokasi pelapor"]
    D -->|Ya| P01
    P02["Catat kegagalan pengiriman"]
    D -->|Tidak| P02
    E(((Selesai)))
    P01 --> E
    P02 --> E
```

%% AD-08 - UC-08 Activity Diagram Kirim Lokasi Kejadian
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
flowchart TD
    S((Mulai))
    A01["Terima lokasi GPS atau teks lokasi"]
    S --> A01
    A02["Simpan pesan lokasi"]
    A01 --> A02
    D{"Koordinat tersedia?"}
    A02 --> D
    P01["Simpan koordinat"]
    D -->|Ya| P01
    P02["Simpan keterangan teks"]
    D -->|Tidak| P02
    J(( ))
    P01 --> J
    P02 --> J
    Z01["Minta keterangan kejadian"]
    J --> Z01
    E(((Selesai)))
    Z01 --> E
```

%% AD-09 - UC-09 Activity Diagram Kirim Laporan Teks
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
flowchart TD
    S((Mulai))
    A01["Terima teks laporan"]
    S --> A01
    A02["Periksa pesan sebagai laporan potensial"]
    A01 --> A02
    D{"Pesan berkaitan dengan kejadian?"}
    A02 --> D
    P01["Ekstrak atribut dan simpan draf"]
    D -->|Ya| P01
    P02["Minta keterangan kejadian"]
    D -->|Tidak| P02
    J(( ))
    P01 --> J
    P02 --> J
    Z01["Kirim pratinjau bila berhasil"]
    J --> Z01
    E(((Selesai)))
    Z01 --> E
```

%% AD-10 - UC-10 Activity Diagram Kirim Voice Note
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
flowchart TD
    S((Mulai))
    A01["Terima voice note"]
    S --> A01
    A02["Unduh audio dan minta transkripsi"]
    A01 --> A02
    D{"Transkrip tersedia?"}
    A02 --> D
    P01["Proses transkrip sebagai teks"]
    D -->|Ya| P01
    P02["Minta kirim ulang atau ketik"]
    D -->|Tidak| P02
    J(( ))
    P01 --> J
    P02 --> J
    Z01["Simpan hasil dan kirim pratinjau bila berhasil"]
    J --> Z01
    E(((Selesai)))
    Z01 --> E
```

%% AD-11 - UC-11 Activity Diagram Konfirmasi, Koreksi, atau Batalkan Laporan
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
flowchart TD
    S((Mulai))
    A01["Tampilkan pratinjau"]
    S --> A01
    A02["Validasi percakapan aktif"]
    A01 --> A02
    D{"Tindakan pelapor?"}
    A02 --> D
    P01["Finalisasi laporan"]
    D -->|Konfirmasi| P01
    P02["Lanjutkan pengumpulan data"]
    D -->|Koreksi| P02
    P03["Tutup percakapan"]
    D -->|Batalkan| P03
    E(((Selesai)))
    P01 --> E
    P02 --> E
    P03 --> E
```

%% SD-01 - UC-01 Sequence Diagram Login Admin
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
sequenceDiagram
actor A as Admin
participant B as Browser
participant L as Laravel Auth
participant DB as Database
    A->>B: Buka halaman login
    B->>L: Minta halaman login
    L->>DB: Ambil dan verifikasi akun
    DB->>L: Kirim hasil verifikasi
    L->>B: Kirim dashboard atau pesan gagal
    B->>A: Tampilkan hasil
```

%% SD-02 - UC-02 Sequence Diagram Pantau Dashboard dan Bot
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
sequenceDiagram
actor A as Admin
participant B as Browser
participant C as DashboardController
participant DB as Database
participant T as Telegram Bot
    A->>B: Buka dashboard
    B->>C: Minta data dashboard
    C->>DB: Ambil laporan dan aktivitas
    DB->>C: Kirim ringkasan
    C->>B: Kirim data dashboard dan status poller
    A->>B: Pilih mulai atau berhenti poller
    B->>C: Kirim perintah poller
    C->>T: Mulai atau hentikan polling
    C->>B: Tampilkan status terbaru
```

%% SD-03 - UC-03 Sequence Diagram Lihat dan Filter Laporan
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
sequenceDiagram
actor A as Admin
participant B as Browser
participant C as ReportController
participant DB as Database
    A->>B: Buka daftar atau isi filter
    B->>C: Minta daftar laporan
    C->>DB: Query laporan dan pelapor
    DB->>C: Kirim hasil query
    C->>B: Kirim daftar laporan
    B->>A: Tampilkan hasil
```

%% SD-04 - UC-04 Sequence Diagram Lihat Detail Laporan
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
sequenceDiagram
actor A as Admin
participant B as Browser
participant C as ReportController
participant DB as Database
    A->>B: Pilih laporan
    B->>C: Minta detail laporan
    C->>DB: Ambil laporan, pesan, detail, dan riwayat
    DB->>C: Kirim data laporan terkait
    C->>B: Kirim detail dan tautan peta bila tersedia
    B->>A: Tampilkan detail laporan
```

%% SD-05 - UC-05 Sequence Diagram Lihat Peta Laporan
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
sequenceDiagram
actor A as Admin
participant B as Browser
participant C as ReportMapController
participant DB as Database
    A->>B: Buka halaman peta
    B->>C: Minta data laporan berkoordinat
    C->>DB: Ambil laporan berkoordinat
    DB->>C: Kirim data lokasi
    C->>B: Kirim koordinat untuk dipetakan
    B->>A: Tampilkan peta laporan
```

%% SD-06 - UC-06 Sequence Diagram Ubah Status Laporan
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
sequenceDiagram
actor A as Admin
participant B as Browser
participant C as ReportController
participant DB as Database
participant T as TelegramService
actor P as Pelapor
    A->>B: Pilih tindakan status
    B->>C: Kirim perubahan status
    C->>DB: Simpan status dan riwayat
    DB->>C: Konfirmasi penyimpanan
    C->>T: Kirim pemberitahuan status
    T->>P: Pesan status laporan
    C->>B: Kirim hasil perubahan
```

%% SD-07 - UC-07 Sequence Diagram Mulai Pelaporan
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
sequenceDiagram
actor P as Pelapor
participant T as Telegram
participant C as TelegramPollCommand
participant S as IncidentReportService
participant DB as Database
    P->>T: Kirim perintah start
    T->>C: Teruskan update
    C->>S: Proses perintah start
    S->>DB: Cari atau buat pelapor dan tutup sesi lama
    DB->>S: Kirim hasil operasi
    S->>T: Kirim panduan dan tombol lokasi
    T->>P: Tampilkan panduan
```

%% SD-08 - UC-08 Sequence Diagram Kirim Lokasi Kejadian
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
sequenceDiagram
actor P as Pelapor
participant T as Telegram
participant S as IncidentReportService
participant DB as Database
    P->>T: Bagikan lokasi
    T->>S: Kirim update lokasi
    S->>DB: Simpan pesan dan koordinat
    DB->>S: Konfirmasi tersimpan
    S->>T: Minta keterangan kejadian
    T->>P: Tampilkan pertanyaan berikutnya
```

%% SD-09 - UC-09 Sequence Diagram Kirim Laporan Teks
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
sequenceDiagram
actor P as Pelapor
participant T as Telegram
participant S as IncidentReportService
participant G as GeminiService
participant DB as Database
    P->>T: Kirim keterangan kejadian
    T->>S: Kirim update teks
    S->>G: Klasifikasi dan ekstrak informasi
    G->>S: Kembalikan atribut terstruktur
    S->>DB: Simpan pesan, draf, dan detail
    DB->>S: Konfirmasi penyimpanan
    S->>T: Kirim pratinjau
    T->>P: Tampilkan pratinjau
```

%% SD-10 - UC-10 Sequence Diagram Kirim Voice Note
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
sequenceDiagram
actor P as Pelapor
participant T as Telegram
participant S as IncidentReportService
participant G as GeminiService
participant DB as Database
    P->>T: Kirim voice note
    T->>S: Kirim identitas file audio
    S->>T: Minta file audio
    T->>S: Kirim file audio
    S->>G: Kirim audio untuk transkripsi
    G->>S: Kirim transkrip atau kegagalan
    S->>DB: Simpan pesan dan transkrip bila tersedia
    S->>T: Kirim pratinjau atau instruksi ulang
```

%% SD-11 - UC-11 Sequence Diagram Konfirmasi, Koreksi, atau Batalkan Laporan
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
sequenceDiagram
actor P as Pelapor
participant T as Telegram
participant S as IncidentReportService
participant DB as Database
    P->>T: Pilih konfirmasi, koreksi, atau batalkan
    T->>S: Kirim perintah
    S->>DB: Ambil dan validasi draf serta sesi
    DB->>S: Kirim keadaan percakapan
    S->>DB: Finalisasi, perbarui, atau tutup sesi
    DB->>S: Konfirmasi perubahan
    S->>T: Kirim hasil tindakan
    T->>P: Tampilkan status
```

%% FIG-25 - Class Diagram Data SIRINE
```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#ffffff","primaryTextColor":"#000000","primaryBorderColor":"#000000","lineColor":"#000000","secondaryColor":"#ffffff","tertiaryColor":"#ffffff","background":"#ffffff","mainBkg":"#ffffff","textColor":"#000000","actorBkg":"#ffffff","actorBorder":"#000000","actorTextColor":"#000000","signalColor":"#000000","signalTextColor":"#000000","labelBoxBkgColor":"#ffffff","labelBoxBorderColor":"#000000","noteBkgColor":"#ffffff","noteBorderColor":"#000000","noteTextColor":"#000000","classText":"#000000"}}}%%
classDiagram
    direction LR
    class Reporter {
        +int id
        +string name
        +string whatsapp_number
    }
    class Report {
        +int id
        +string report_code
        +int reporter_id
        +string incident_type
        +datetime incident_time
        +decimal latitude
        +decimal longitude
        +string summary
        +string report_status
    }
    class Conversation {
        +int id
        +int reporter_id
        +int report_id
        +string conversation_status
        +string current_question
        +json report_draft
    }
    class Message {
        +int id
        +int conversation_id
        +int report_id
        +string direction
        +string message_type
        +text body
        +text transcript
    }
    class ReportDetail {
        +int id
        +int report_id
        +string field_name
        +text field_value
        +int source_message_id
    }
    class ReportHistory {
        +int id
        +int report_id
        +int admin_id
        +string previous_status
        +string new_status
        +text notes
    }
    class User {
        +int id
        +string name
        +string email
    }
    Reporter "1" --> "0..*" Report : reports
    Reporter "1" --> "0..*" Conversation : conversations
    Report "1" --> "0..*" Conversation : conversations
    Conversation "1" --> "0..*" Message : messages
    Report "1" --> "0..*" Message : messages
    Report "1" --> "0..*" ReportDetail : details
    Message "0..1" --> "0..*" ReportDetail : source message
    Report "1" --> "0..*" ReportHistory : histories
    User "0..1" --> "0..*" ReportHistory : admin
```
