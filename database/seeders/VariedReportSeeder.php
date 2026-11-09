<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Report;
use App\Models\ReportDetail;
use App\Models\Reporter;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * @phpstan-type DemoReport array{
 *     report_code: string,
 *     reporter_name: string,
 *     reporter_phone: string,
 *     incident_type: string,
 *     location: string,
 *     latitude: float|null,
 *     longitude: float|null,
 *     description: string,
 *     victim_count: int|null,
 *     victim_condition: string|null,
 *     report_status: string,
 *     verification_status: string,
 *     completeness_status: string,
 *     location_source: string,
 *     location_confirmed: string,
 *     input_type: string,
 *     hours_ago: int,
 *     conversation_status: string,
 *     followup_count: int,
 *     current_question: string|null
 * }
 */
class VariedReportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->demoReports() as $reportData) {
            $this->seedReport($reportData);
        }
    }

    /**
     * @return list<DemoReport>
     */
    private function demoReports(): array
    {
        return [
            [
                'report_code' => 'SIRINE-DEMO-001',
                'reporter_name' => 'Budi Santoso',
                'reporter_phone' => '628123450001',
                'incident_type' => 'Kecelakaan Lalu Lintas',
                'location' => 'Simpang Paya Bujok, Langsa Barat',
                'latitude' => 4.4771,
                'longitude' => 97.9568,
                'description' => 'Dua sepeda motor bertabrakan di persimpangan. Satu pengendara mengeluhkan nyeri pada kaki dan masih sadar.',
                'victim_count' => 1,
                'victim_condition' => 'Satu pengendara mengalami nyeri pada kaki dan tetap sadar',
                'report_status' => 'baru_diterima',
                'verification_status' => 'belum_terkonfirmasi',
                'completeness_status' => 'complete',
                'location_source' => 'gps',
                'location_confirmed' => 'confirmed',
                'input_type' => 'text',
                'hours_ago' => 1,
                'conversation_status' => 'completed',
                'followup_count' => 0,
                'current_question' => null,
            ],
            [
                'report_code' => 'SIRINE-DEMO-002',
                'reporter_name' => 'Siti Rahma',
                'reporter_phone' => '628123450002',
                'incident_type' => 'Kebakaran',
                'location' => 'Deretan kios Pasar Langsa, dekat pintu utara',
                'latitude' => 4.4712,
                'longitude' => 97.9684,
                'description' => 'Asap terlihat dari salah satu kios. Api mulai merambat ke bagian atap kios sebelah, warga sedang menjauh dari lokasi.',
                'victim_count' => 0,
                'victim_condition' => 'Belum ada korban yang dilaporkan',
                'report_status' => 'dalam_penanganan',
                'verification_status' => 'terverifikasi',
                'completeness_status' => 'complete',
                'location_source' => 'gps',
                'location_confirmed' => 'confirmed',
                'input_type' => 'voice',
                'hours_ago' => 2,
                'conversation_status' => 'completed',
                'followup_count' => 1,
                'current_question' => null,
            ],
            [
                'report_code' => 'SIRINE-DEMO-003',
                'reporter_name' => 'Andi Pratama',
                'reporter_phone' => '628123450003',
                'incident_type' => 'Banjir',
                'location' => 'Gang Melati, Gampong Teungoh',
                'latitude' => null,
                'longitude' => null,
                'description' => 'Air mulai masuk ke beberapa rumah setelah hujan deras. Warga membutuhkan bantuan untuk memeriksa ketinggian air.',
                'victim_count' => null,
                'victim_condition' => null,
                'report_status' => 'baru_diterima',
                'verification_status' => 'belum_terkonfirmasi',
                'completeness_status' => 'incomplete',
                'location_source' => 'text',
                'location_confirmed' => 'unconfirmed',
                'input_type' => 'text',
                'hours_ago' => 4,
                'conversation_status' => 'active',
                'followup_count' => 1,
                'current_question' => 'Mohon kirim patokan lokasi yang paling dekat.',
            ],
            [
                'report_code' => 'SIRINE-DEMO-004',
                'reporter_name' => 'Dewi Lestari',
                'reporter_phone' => '628123450004',
                'incident_type' => 'Pohon Tumbang',
                'location' => 'Jalan Cut Nyak Dien, dekat SMP Negeri 1 Langsa',
                'latitude' => 4.4694,
                'longitude' => 97.9617,
                'description' => 'Pohon besar tumbang dan menutup sebagian badan jalan. Pengendara masih bisa melintas bergantian dengan hati-hati.',
                'victim_count' => 0,
                'victim_condition' => 'Tidak ada korban yang terlihat',
                'report_status' => 'menuju_lokasi',
                'verification_status' => 'terverifikasi',
                'completeness_status' => 'complete',
                'location_source' => 'gps',
                'location_confirmed' => 'confirmed',
                'input_type' => 'text',
                'hours_ago' => 6,
                'conversation_status' => 'completed',
                'followup_count' => 0,
                'current_question' => null,
            ],
            [
                'report_code' => 'SIRINE-DEMO-005',
                'reporter_name' => 'Hendra Wijaya',
                'reporter_phone' => '628123450005',
                'incident_type' => 'Medis Darurat',
                'location' => 'Jalan Iskandar Muda, Gampong Jawa',
                'latitude' => 4.4756,
                'longitude' => 97.9631,
                'description' => 'Seorang warga lanjut usia tiba-tiba sesak napas di rumah. Keluarga sudah mendampingi dan membutuhkan bantuan medis.',
                'victim_count' => 1,
                'victim_condition' => 'Sesak napas, sadar, dan didampingi keluarga',
                'report_status' => 'selesai',
                'verification_status' => 'terverifikasi',
                'completeness_status' => 'complete',
                'location_source' => 'gps',
                'location_confirmed' => 'confirmed',
                'input_type' => 'voice',
                'hours_ago' => 10,
                'conversation_status' => 'completed',
                'followup_count' => 2,
                'current_question' => null,
            ],
            [
                'report_code' => 'SIRINE-DEMO-006',
                'reporter_name' => 'Faisal Reza',
                'reporter_phone' => '628123450006',
                'incident_type' => 'Kecelakaan Lalu Lintas',
                'location' => 'Jalan Ahmad Yani, depan Kantor Pos Langsa',
                'latitude' => 4.4701,
                'longitude' => 97.9652,
                'description' => 'Laporan suara benturan keras di sekitar Kantor Pos telah diklarifikasi. Tidak ditemukan kecelakaan atau korban di lokasi.',
                'victim_count' => 0,
                'victim_condition' => 'Tidak ditemukan korban setelah pemeriksaan lokasi',
                'report_status' => 'selesai',
                'verification_status' => 'tidak_valid',
                'completeness_status' => 'complete',
                'location_source' => 'gps',
                'location_confirmed' => 'confirmed',
                'input_type' => 'text',
                'hours_ago' => 15,
                'conversation_status' => 'completed',
                'followup_count' => 1,
                'current_question' => null,
            ],
            [
                'report_code' => 'SIRINE-DEMO-007',
                'reporter_name' => 'Maya Anggraini',
                'reporter_phone' => '628123450007',
                'incident_type' => 'Kebakaran',
                'location' => 'Permukiman Gampong Jawa, dekat meunasah',
                'latitude' => null,
                'longitude' => null,
                'description' => 'Warga melihat asap dari bagian belakang rumah. Kondisi penghuni dan titik tepat kejadian masih belum diketahui.',
                'victim_count' => null,
                'victim_condition' => null,
                'report_status' => 'baru_diterima',
                'verification_status' => 'belum_terkonfirmasi',
                'completeness_status' => 'incomplete',
                'location_source' => 'text',
                'location_confirmed' => 'unconfirmed',
                'input_type' => 'text',
                'hours_ago' => 19,
                'conversation_status' => 'active',
                'followup_count' => 2,
                'current_question' => 'Apakah ada penghuni yang membutuhkan pertolongan?',
            ],
            [
                'report_code' => 'SIRINE-DEMO-008',
                'reporter_name' => 'Zulfikar',
                'reporter_phone' => '628123450008',
                'incident_type' => 'Banjir',
                'location' => 'Jalan Medan-Banda Aceh, kawasan Paya Bujok Seuleumak',
                'latitude' => 4.4832,
                'longitude' => 97.9793,
                'description' => 'Genangan air menutup satu lajur jalan setelah hujan. Petugas membantu mengatur arus kendaraan dan memeriksa saluran air.',
                'victim_count' => 0,
                'victim_condition' => 'Tidak ada korban; arus kendaraan dialihkan sementara',
                'report_status' => 'dalam_penanganan',
                'verification_status' => 'terverifikasi',
                'completeness_status' => 'complete',
                'location_source' => 'gps',
                'location_confirmed' => 'confirmed',
                'input_type' => 'text',
                'hours_ago' => 24,
                'conversation_status' => 'completed',
                'followup_count' => 1,
                'current_question' => null,
            ],
            [
                'report_code' => 'SIRINE-DEMO-009',
                'reporter_name' => 'Nurul Hidayah',
                'reporter_phone' => '628123450009',
                'incident_type' => 'Medis Darurat',
                'location' => 'Pasar Langsa, area parkir sisi timur',
                'latitude' => 4.4725,
                'longitude' => 97.9696,
                'description' => 'Seorang pengunjung pingsan di area parkir pasar. Petugas keamanan berada di lokasi, tetapi kondisi korban belum diketahui.',
                'victim_count' => 1,
                'victim_condition' => 'Pingsan; kondisi lanjutan belum diketahui',
                'report_status' => 'baru_diterima',
                'verification_status' => 'belum_terkonfirmasi',
                'completeness_status' => 'incomplete',
                'location_source' => 'gps',
                'location_confirmed' => 'confirmed',
                'input_type' => 'voice',
                'hours_ago' => 29,
                'conversation_status' => 'active',
                'followup_count' => 1,
                'current_question' => 'Mohon kabari apakah korban sudah sadar.',
            ],
            [
                'report_code' => 'SIRINE-DEMO-010',
                'reporter_name' => 'Rizki Maulana',
                'reporter_phone' => '628123450010',
                'incident_type' => 'Kecelakaan Lalu Lintas',
                'location' => 'Jalan Medan-Banda Aceh Km 440, dekat SPBU',
                'latitude' => 4.4807,
                'longitude' => 97.9741,
                'description' => 'Mobil dan sepeda motor bersenggolan di dekat SPBU. Dua pengendara mengalami luka ringan dan sudah mendapat pertolongan.',
                'victim_count' => 2,
                'victim_condition' => 'Dua korban mengalami luka ringan dan sadar',
                'report_status' => 'selesai',
                'verification_status' => 'terverifikasi',
                'completeness_status' => 'complete',
                'location_source' => 'gps',
                'location_confirmed' => 'confirmed',
                'input_type' => 'text',
                'hours_ago' => 34,
                'conversation_status' => 'completed',
                'followup_count' => 1,
                'current_question' => null,
            ],
            [
                'report_code' => 'SIRINE-DEMO-011',
                'reporter_name' => 'Rina Oktaviani',
                'reporter_phone' => '628123450011',
                'incident_type' => 'Kebocoran Gas',
                'location' => 'Warung makan Jalan Teuku Umar, Gampong Teungoh',
                'latitude' => 4.4688,
                'longitude' => 97.9662,
                'description' => 'Tercium bau gas kuat dari dapur warung. Pemilik sudah menutup tabung dan meminta warga menjauh dari area.',
                'victim_count' => 0,
                'victim_condition' => 'Tidak ada korban yang dilaporkan',
                'report_status' => 'menuju_lokasi',
                'verification_status' => 'terverifikasi',
                'completeness_status' => 'complete',
                'location_source' => 'gps',
                'location_confirmed' => 'confirmed',
                'input_type' => 'text',
                'hours_ago' => 40,
                'conversation_status' => 'completed',
                'followup_count' => 1,
                'current_question' => null,
            ],
            [
                'report_code' => 'SIRINE-DEMO-012',
                'reporter_name' => 'Yusuf Iskandar',
                'reporter_phone' => '628123450012',
                'incident_type' => 'Pohon Tumbang',
                'location' => 'Jalan Kebun Baru, dekat jembatan kecil',
                'latitude' => 4.4851,
                'longitude' => 97.9638,
                'description' => 'Dahan besar patah dan menimpa kabel di tepi jalan. Petugas telah mengamankan area dan membersihkan akses.',
                'victim_count' => 0,
                'victim_condition' => 'Tidak ada korban',
                'report_status' => 'selesai',
                'verification_status' => 'terverifikasi',
                'completeness_status' => 'complete',
                'location_source' => 'gps',
                'location_confirmed' => 'confirmed',
                'input_type' => 'text',
                'hours_ago' => 48,
                'conversation_status' => 'completed',
                'followup_count' => 0,
                'current_question' => null,
            ],
            [
                'report_code' => 'SIRINE-DEMO-013',
                'reporter_name' => 'Laila Fitri',
                'reporter_phone' => '628123450013',
                'incident_type' => 'Kecelakaan Lalu Lintas',
                'location' => 'Simpang Remi, Langsa Baro',
                'latitude' => 4.4838,
                'longitude' => 97.9564,
                'description' => 'Pengendara sepeda motor terjatuh saat menghindari kendaraan yang berbelok. Korban mengeluhkan nyeri pada bahu.',
                'victim_count' => 1,
                'victim_condition' => 'Sadar dan mengalami nyeri pada bahu',
                'report_status' => 'menuju_lokasi',
                'verification_status' => 'terverifikasi',
                'completeness_status' => 'complete',
                'location_source' => 'gps',
                'location_confirmed' => 'confirmed',
                'input_type' => 'voice',
                'hours_ago' => 55,
                'conversation_status' => 'completed',
                'followup_count' => 1,
                'current_question' => null,
            ],
            [
                'report_code' => 'SIRINE-DEMO-014',
                'reporter_name' => 'M. Irfan',
                'reporter_phone' => '628123450014',
                'incident_type' => 'Kebakaran',
                'location' => 'Gudang mebel, Langsa Lama',
                'latitude' => 4.4926,
                'longitude' => 97.9697,
                'description' => 'Asap tipis terlihat dari gudang mebel yang tertutup. Pelapor belum memastikan apakah ada orang di dalam.',
                'victim_count' => null,
                'victim_condition' => null,
                'report_status' => 'baru_diterima',
                'verification_status' => 'belum_terkonfirmasi',
                'completeness_status' => 'incomplete',
                'location_source' => 'gps',
                'location_confirmed' => 'confirmed',
                'input_type' => 'text',
                'hours_ago' => 62,
                'conversation_status' => 'active',
                'followup_count' => 1,
                'current_question' => 'Apakah ada orang di dalam gudang?',
            ],
            [
                'report_code' => 'SIRINE-DEMO-015',
                'reporter_name' => 'Fitri Handayani',
                'reporter_phone' => '628123450015',
                'incident_type' => 'Medis Darurat',
                'location' => 'Gampong Teungoh, dekat kantor geuchik',
                'latitude' => 4.4679,
                'longitude' => 97.9713,
                'description' => 'Seorang warga mengalami luka pada tangan saat bekerja. Korban sadar dan sedang mendapat pertolongan pertama dari tetangga.',
                'victim_count' => 1,
                'victim_condition' => 'Luka pada tangan, sadar, pertolongan pertama sudah diberikan',
                'report_status' => 'dalam_penanganan',
                'verification_status' => 'terverifikasi',
                'completeness_status' => 'complete',
                'location_source' => 'gps',
                'location_confirmed' => 'confirmed',
                'input_type' => 'text',
                'hours_ago' => 70,
                'conversation_status' => 'completed',
                'followup_count' => 1,
                'current_question' => null,
            ],
            [
                'report_code' => 'SIRINE-DEMO-016',
                'reporter_name' => 'Rahmat Hidayat',
                'reporter_phone' => '628123450016',
                'incident_type' => 'Banjir',
                'location' => 'Dusun Damai, Gampong Daulat',
                'latitude' => 4.4627,
                'longitude' => 97.9589,
                'description' => 'Air yang sempat menggenangi halaman rumah mulai surut. Warga memastikan tidak ada korban dan akses jalan sudah dapat dilalui.',
                'victim_count' => 0,
                'victim_condition' => 'Tidak ada korban',
                'report_status' => 'selesai',
                'verification_status' => 'terverifikasi',
                'completeness_status' => 'complete',
                'location_source' => 'gps',
                'location_confirmed' => 'confirmed',
                'input_type' => 'text',
                'hours_ago' => 84,
                'conversation_status' => 'completed',
                'followup_count' => 1,
                'current_question' => null,
            ],
        ];
    }

    /**
     * @param  DemoReport  $reportData
     */
    private function seedReport(array $reportData): void
    {
        $reporter = Reporter::firstOrCreate(
            ['whatsapp_number' => $reportData['reporter_phone']],
            ['name' => $reportData['reporter_name']],
        );

        $createdAt = now()->subHours($reportData['hours_ago']);

        $report = Report::updateOrCreate(
            ['report_code' => $reportData['report_code']],
            [
                'reporter_id' => $reporter->id,
                'input_type' => $reportData['input_type'],
                'original_text' => $reportData['description'],
                'incident_type' => $reportData['incident_type'],
                'incident_time' => $createdAt,
                'description' => $reportData['description'],
                'victim_count' => $reportData['victim_count'],
                'victim_condition' => $reportData['victim_condition'],
                'location_description' => $reportData['location'],
                'latitude' => $reportData['latitude'],
                'longitude' => $reportData['longitude'],
                'location_source' => $reportData['location_source'],
                'location_confirmed' => $reportData['location_confirmed'],
                'summary' => "Laporan {$reportData['incident_type']} di {$reportData['location']}.",
                'completeness_status' => $reportData['completeness_status'],
                'verification_status' => $reportData['verification_status'],
                'report_status' => $reportData['report_status'],
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ],
        );
        $report->forceFill([
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ])->save();

        $conversation = Conversation::updateOrCreate(
            ['report_id' => $report->id],
            [
                'reporter_id' => $reporter->id,
                'conversation_status' => $reportData['conversation_status'],
                'current_question' => $reportData['current_question'],
                'followup_count' => $reportData['followup_count'],
                'last_message_at' => $createdAt,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ],
        );
        $conversation->forceFill([
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ])->save();

        $messageType = $reportData['input_type'] === 'voice' ? 'audio' : 'text';
        $inboundMessage = Message::updateOrCreate(
            ['wa_message_id' => Str::slug($reportData['report_code']).'-inbound'],
            [
                'conversation_id' => $conversation->id,
                'report_id' => $report->id,
                'direction' => 'inbound',
                'message_type' => $messageType,
                'body' => $reportData['input_type'] === 'voice'
                    ? 'Pesan suara diterima.'
                    : $reportData['description'],
                'transcript' => $reportData['input_type'] === 'voice'
                    ? $reportData['description']
                    : null,
                'process_status' => 'processed',
                'created_at' => $createdAt,
            ],
        );

        $locationMessage = null;

        if ($reportData['latitude'] !== null && $reportData['longitude'] !== null) {
            $locationMessage = Message::updateOrCreate(
                ['wa_message_id' => Str::slug($reportData['report_code']).'-location'],
                [
                    'conversation_id' => $conversation->id,
                    'report_id' => $report->id,
                    'direction' => 'inbound',
                    'message_type' => 'location',
                    'latitude' => $reportData['latitude'],
                    'longitude' => $reportData['longitude'],
                    'body' => "Lokasi GPS: {$reportData['latitude']}, {$reportData['longitude']}",
                    'process_status' => 'processed',
                    'created_at' => $createdAt->copy()->subMinute(),
                ],
            );
        }

        $details = [
            'incident_type' => [$reportData['incident_type'], 'known'],
            'location_description' => [$reportData['location'], 'known'],
            'description' => [$reportData['description'], 'known'],
            'victim_count' => [$reportData['victim_count'], $reportData['victim_count'] === null ? 'unknown' : 'known'],
            'victim_condition' => [$reportData['victim_condition'], $reportData['victim_condition'] === null ? 'unknown' : 'known'],
        ];

        foreach ($details as $fieldName => [$fieldValue, $informationStatus]) {
            ReportDetail::updateOrCreate(
                [
                    'report_id' => $report->id,
                    'field_name' => $fieldName,
                ],
                [
                    'field_value' => $fieldValue,
                    'information_status' => $informationStatus,
                    'source_message_id' => $fieldName === 'location_description'
                        ? ($locationMessage?->id ?? $inboundMessage->id)
                        : $inboundMessage->id,
                ],
            );
        }
    }
}
