<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Report;
use App\Models\ReportDetail;
use App\Models\Reporter;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ReportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $dummyReports = [
            [
                'reporter_name' => 'Budi Santoso',
                'reporter_phone' => '628123456701',
                'incident_type' => 'Kecelakaan Lalu Lintas',
                'location' => 'Jl. Merdeka No. 45, dekat Masjid Al-Falah',
                'lat' => 4.47124,
                'lng' => 97.96542,
                'desc' => 'Sepeda motor menabrak pejalan kaki di dekat Masjid Al-Falah. Korban mengalami luka pada tangan dan membutuhkan bantuan medis.',
                'victims_count' => 1,
                'victim_condition' => 'Pejalan kaki mengalami luka pada tangan dan sadar',
                'status' => 'menuju_lokasi',
                'verification' => 'terverifikasi',
                'minutes_ago' => 15,
            ],
            [
                'reporter_name' => 'Siti Rahma',
                'reporter_phone' => '628123456702',
                'incident_type' => 'Kecelakaan Lalu Lintas',
                'location' => 'Simpang Empat Lampu Merah Jl. Ahmad Yani',
                'lat' => 4.47350,
                'lng' => 97.96810,
                'desc' => 'Tabrakan antara mobil minibus dan sepeda motor, korban pengendara motor tergeletak di aspal.',
                'victims_count' => 2,
                'victim_condition' => '1 luka berat patah kaki, 1 luka lecet',
                'status' => 'menuju_lokasi',
                'verification' => 'terverifikasi',
                'minutes_ago' => 28,
            ],
            [
                'reporter_name' => 'Andi Pratama',
                'reporter_phone' => '628123456703',
                'incident_type' => 'Kecelakaan Lalu Lintas',
                'location' => 'Jl. Cut Nyak Dien depan SMP Negeri 1',
                'lat' => 4.46890,
                'lng' => 97.96120,
                'desc' => 'Sepeda motor tergelincir di depan SMP Negeri 1 dan pengendaranya terjatuh. Arus lalu lintas melambat karena kendaraan berhenti di lokasi.',
                'victims_count' => 1,
                'victim_condition' => 'Pengendara mengalami luka lecet dan sadar',
                'status' => 'baru_diterima',
                'verification' => 'belum_terkonfirmasi',
                'minutes_ago' => 35,
            ],
            [
                'reporter_name' => 'Dewi Lestari',
                'reporter_phone' => '628123456704',
                'incident_type' => 'Kecelakaan Lalu Lintas',
                'location' => 'Kawasan Perumahan Griya Indah Blok C',
                'lat' => 4.47610,
                'lng' => 97.97150,
                'desc' => 'Mobil dan sepeda motor bertabrakan di kawasan Perumahan Griya Indah. Dua orang mengalami luka dan perlu mendapat pertolongan.',
                'victims_count' => 2,
                'victim_condition' => 'Dua korban mengalami luka ringan dan sadar',
                'status' => 'dalam_penanganan',
                'verification' => 'terverifikasi',
                'minutes_ago' => 50,
            ],
            [
                'reporter_name' => 'Hendra Wijaya',
                'reporter_phone' => '628123456705',
                'incident_type' => 'Kecelakaan Lalu Lintas',
                'location' => 'Kawasan Pertokoan Pasar Lama Los B-12',
                'lat' => 4.47050,
                'lng' => 97.96400,
                'desc' => 'Sebuah mobil menabrak sepeda motor di kawasan Pertokoan Pasar Lama. Kendaraan menghalangi sebagian jalan dan perlu penanganan petugas.',
                'victims_count' => 1,
                'victim_condition' => 'Pengendara motor mengeluhkan nyeri pada kaki',
                'status' => 'menuju_lokasi',
                'verification' => 'terverifikasi',
                'minutes_ago' => 65,
            ],
            [
                'reporter_name' => 'Faisal Reza',
                'reporter_phone' => '628123456706',
                'incident_type' => 'Kecelakaan Lalu Lintas',
                'location' => 'Tebing Jalan Lintas Lingkar Luar Km 4',
                'lat' => 4.48200,
                'lng' => 97.98000,
                'desc' => 'Dua sepeda motor bertabrakan di Jalan Lintas Lingkar Luar Km 4. Korban dan kendaraan masih berada di tepi jalan.',
                'victims_count' => 2,
                'victim_condition' => 'Dua pengendara mengalami luka ringan',
                'status' => 'baru_diterima',
                'verification' => 'belum_terkonfirmasi',
                'minutes_ago' => 80,
            ],
            [
                'reporter_name' => 'Maya Anggraini',
                'reporter_phone' => '628123456707',
                'incident_type' => 'Kecelakaan Lalu Lintas',
                'location' => 'Jembatan Krueng dekat SPBU',
                'lat' => 4.46500,
                'lng' => 97.95800,
                'desc' => 'Truk engkel oleng menabrak pembatas jembatan, solar tumpah ke badan jalan menimbulkan risiko licin.',
                'victims_count' => 1,
                'victim_condition' => 'Supir luka lecet dan syok ringan',
                'status' => 'selesai',
                'verification' => 'terverifikasi',
                'minutes_ago' => 120,
            ],
            [
                'reporter_name' => 'Zulfikar',
                'reporter_phone' => '628123456708',
                'incident_type' => 'Kecelakaan Lalu Lintas',
                'location' => 'Jalan masuk Terminal Terpadu',
                'lat' => 4.47850,
                'lng' => 97.97400,
                'desc' => 'Truk engkel menabrak pembatas jembatan dekat SPBU. Solar tumpah ke badan jalan dan membuat permukaan jalan licin.',
                'victims_count' => 1,
                'victim_condition' => 'Pengemudi mengalami luka lecet dan syok ringan',
                'status' => 'selesai',
                'verification' => 'terverifikasi',
                'minutes_ago' => 180,
            ],
            [
                'reporter_name' => 'Nurul Hidayah',
                'reporter_phone' => '628123456709',
                'incident_type' => 'Kecelakaan Lalu Lintas',
                'location' => 'Balai Pertemuan Warga RW 03',
                'lat' => 4.47210,
                'lng' => 97.96650,
                'desc' => 'Sepeda motor menabrak pesepeda di dekat Balai Pertemuan Warga RW 03. Korban perlu diperiksa oleh petugas medis.',
                'victims_count' => 1,
                'victim_condition' => 'Pesepeda mengalami luka dan tetap sadar',
                'status' => 'selesai',
                'verification' => 'terverifikasi',
                'minutes_ago' => 240,
            ],
            [
                'reporter_name' => 'Rizki Maulana',
                'reporter_phone' => '628123456710',
                'incident_type' => 'Kecelakaan Lalu Lintas',
                'location' => 'Jl. Teuku Umar samping Kantor Pos',
                'lat' => 4.46950,
                'lng' => 97.96310,
                'desc' => 'Sepeda motor menabrak gerobak di Jl. Teuku Umar samping Kantor Pos. Gerobak rusak dan pengendara terjatuh.',
                'victims_count' => 1,
                'victim_condition' => 'Pengendara mengalami luka lecet; tidak ada korban jiwa',
                'status' => 'selesai',
                'verification' => 'terverifikasi',
                'minutes_ago' => 300,
            ],
        ];

        foreach ($dummyReports as $data) {
            $reporter = Reporter::firstOrCreate(
                ['whatsapp_number' => $data['reporter_phone']],
                ['name' => $data['reporter_name']]
            );

            $code = 'SIRINE-'.date('Ymd').'-'.strtoupper(Str::random(4));
            $createdAt = now()->subMinutes($data['minutes_ago']);

            $report = Report::create([
                'report_code' => $code,
                'reporter_id' => $reporter->id,
                'input_type' => 'text',
                'original_text' => $data['desc'],
                'incident_type' => $data['incident_type'],
                'incident_time' => $createdAt,
                'description' => $data['desc'],
                'victim_count' => $data['victims_count'],
                'victim_condition' => $data['victim_condition'],
                'location_description' => $data['location'],
                'latitude' => $data['lat'],
                'longitude' => $data['lng'],
                'location_source' => 'gps',
                'location_confirmed' => 'confirmed',
                'summary' => "Laporan {$data['incident_type']} di {$data['location']}.",
                'completeness_status' => 'complete',
                'verification_status' => $data['verification'],
                'report_status' => $data['status'],
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            $conversation = Conversation::create([
                'reporter_id' => $reporter->id,
                'report_id' => $report->id,
                'conversation_status' => 'completed',
                'last_message_at' => $createdAt,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            // Pesan lokasi
            Message::create([
                'conversation_id' => $conversation->id,
                'report_id' => $report->id,
                'wa_message_id' => 'tg_in_seed_loc_'.Str::random(8),
                'direction' => 'inbound',
                'message_type' => 'location',
                'latitude' => $data['lat'],
                'longitude' => $data['lng'],
                'body' => "Lokasi GPS: {$data['lat']}, {$data['lng']}",
                'process_status' => 'processed',
                'created_at' => $createdAt->subMinutes(2),
            ]);

            // Pesan teks laporan
            Message::create([
                'conversation_id' => $conversation->id,
                'report_id' => $report->id,
                'wa_message_id' => 'tg_in_seed_msg_'.Str::random(8),
                'direction' => 'inbound',
                'message_type' => 'text',
                'body' => "[FORMAT LAPORAN SIRINE]\nJenis Kejadian: {$data['incident_type']}\nPatokan/Alamat: {$data['location']}\nKeterangan: {$data['desc']}\nKondisi Korban: {$data['victim_condition']}",
                'process_status' => 'processed',
                'created_at' => $createdAt,
            ]);

            // Detail laporan
            ReportDetail::create([
                'report_id' => $report->id,
                'field_name' => 'incident_type',
                'field_value' => $data['incident_type'],
                'information_status' => 'known',
                'created_at' => $createdAt,
            ]);
            ReportDetail::create([
                'report_id' => $report->id,
                'field_name' => 'location_description',
                'field_value' => $data['location'],
                'information_status' => 'known',
                'created_at' => $createdAt,
            ]);
            ReportDetail::create([
                'report_id' => $report->id,
                'field_name' => 'description',
                'field_value' => $data['desc'],
                'information_status' => 'known',
                'created_at' => $createdAt,
            ]);
            ReportDetail::create([
                'report_id' => $report->id,
                'field_name' => 'victim_condition',
                'field_value' => $data['victim_condition'],
                'information_status' => 'known',
                'created_at' => $createdAt,
            ]);
        }
    }
}
