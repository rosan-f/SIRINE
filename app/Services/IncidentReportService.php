<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Report;
use App\Models\ReportDetail;
use App\Models\Reporter;
use App\Services\AI\GeminiService;
use App\Services\Telegram\TelegramService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class IncidentReportService
{
    public function __construct(
        protected TelegramService $telegramService,
        protected GeminiService $geminiService
    ) {}

    /**
     * Menangani satu update pesan masuk dari Telegram (teks / voice / lokasi).
     */
    public function handleIncomingTelegramUpdate(array $update): ?Report
    {
        $message = $update['message'] ?? $update['channel_post'] ?? null;
        if (! $message || ! isset($message['chat']['id'])) {
            return null;
        }

        $chatId = (string) $message['chat']['id'];
        $messageId = (string) $message['message_id'];
        $waMessageId = "tg_{$messageId}_{$chatId}";

        // Cegah duplikasi pesan (anti-duplikat / TC-08)
        if (Message::where('wa_message_id', $waMessageId)->exists()) {
            Log::info("Pesan Telegram duplikat diabaikan: {$waMessageId}");
            return null;
        }

        // Ekstrak pengirim
        $firstName = $message['from']['first_name'] ?? '';
        $lastName = $message['from']['last_name'] ?? '';
        $senderName = trim("{$firstName} {$lastName}") ?: ($message['from']['username'] ?? 'Warga');

        // Deteksi tipe pesan
        $messageType = 'text';
        $inputType = 'text';
        $textToProcess = '';
        $originalText = '';
        $savedAudioPath = null;
        $transcript = null;
        $latitude = null;
        $longitude = null;

        if (isset($message['text'])) {
            $textToProcess = $message['text'];
            $originalText = $message['text'];

            // Jika user kirim /start, beri salam sambutan
            if (str_starts_with(trim($textToProcess), '/start')) {
                $welcome = "Halo <b>{$senderName}</b>! Selamat datang di layanan pelaporan darurat <b>SIGAP</b>.\n\n"
                    . "Silakan ceritakan kejadian darurat atau bencana yang Anda temui langsung melalui pesan teks atau voice note.\n\n"
                    . "Contoh:\n<i>\"Terjadi kecelakaan motor vs mobil di Jl. Sudirman dekat lampu merah, ada 1 orang luka-luka.\"</i>";
                $this->telegramService->sendMessage($chatId, $welcome);
                return null;
            }
        } elseif (isset($message['voice']) || isset($message['audio'])) {
            $messageType = 'audio';
            $inputType = 'voice';
            $audioInfo = $message['voice'] ?? $message['audio'];
            $fileId = $audioInfo['file_id'];

            // Unduh file audio dari Telegram
            $telegramFile = $this->telegramService->getFile($fileId);
            if ($telegramFile && isset($telegramFile['file_path'])) {
                $binary = $this->telegramService->downloadFile($telegramFile['file_path']);
                if ($binary) {
                    $ext = pathinfo($telegramFile['file_path'], PATHINFO_EXTENSION) ?: 'ogg';
                    $fileName = 'audio_' . time() . '_' . Str::random(8) . '.' . $ext;
                    $savedAudioPath = "private/audio/{$fileName}";
                    Storage::disk('local')->put($savedAudioPath, $binary);

                    // Transkripsikan dengan Gemini AI (STT)
                    $transcript = $this->geminiService->transcribeAudio($binary, 'audio/ogg');
                    $textToProcess = $transcript ?: 'Pesan suara (tidak dapat ditranskripsikan)';
                    $originalText = $transcript;
                }
            }
        } elseif (isset($message['location'])) {
            $messageType = 'location';
            $latitude = $message['location']['latitude'];
            $longitude = $message['location']['longitude'];
            $textToProcess = "Lokasi pelapor (GPS): Lat {$latitude}, Lng {$longitude}";
            $originalText = $textToProcess;
        } else {
            $textToProcess = $message['caption'] ?? '[Lampiran media]';
            $originalText = $textToProcess;
            $messageType = 'other';
        }

        if (empty(trim($textToProcess))) {
            return null;
        }

        return DB::transaction(function () use (
            $chatId,
            $senderName,
            $waMessageId,
            $messageType,
            $inputType,
            $textToProcess,
            $originalText,
            $savedAudioPath,
            $transcript,
            $latitude,
            $longitude
        ) {
            // 1. Simpan atau perbarui data Reporter
            $reporter = Reporter::firstOrCreate(
                ['whatsapp_number' => $chatId],
                ['name' => $senderName]
            );

            if (empty($reporter->name) && ! empty($senderName)) {
                $reporter->update(['name' => $senderName]);
            }

            // 2. Cari atau buat percakapan aktif
            $conversation = Conversation::firstOrCreate(
                [
                    'reporter_id' => $reporter->id,
                    'conversation_status' => 'active',
                ],
                [
                    'last_message_at' => now(),
                ]
            );

            // 3. Simpan pesan masuk ke tabel messages
            $inboundMsg = Message::create([
                'conversation_id' => $conversation->id,
                'report_id' => $conversation->report_id,
                'wa_message_id' => $waMessageId,
                'direction' => 'inbound',
                'message_type' => $messageType,
                'body' => $textToProcess,
                'audio_path' => $savedAudioPath,
                'transcript' => $transcript,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'process_status' => 'pending',
                'created_at' => now(),
            ]);

            // 4. Ekstraksi Informasi Laporan Menggunakan Gemini AI
            $extracted = $this->geminiService->extractIncident($textToProcess);

            // 5. Buat atau update Laporan
            $report = null;
            if ($conversation->report_id) {
                $report = Report::find($conversation->report_id);
            }

            if (! $report) {
                $reportCode = 'SIGAP-' . date('Ymd') . '-' . strtoupper(Str::random(4));
                $report = Report::create([
                    'report_code' => $reportCode,
                    'reporter_id' => $reporter->id,
                    'input_type' => $inputType,
                    'original_text' => $originalText,
                    'incident_type' => $extracted['incident_type'] ?? 'Laporan Kejadian',
                    'incident_time' => $extracted['incident_time'] ?? now(),
                    'description' => $extracted['description'] ?? $textToProcess,
                    'victim_count' => $extracted['victim_count'] ?? null,
                    'victim_condition' => $extracted['victim_condition'] ?? null,
                    'location_description' => $extracted['location_description'] ?? 'Lokasi belum spesifik',
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'location_source' => $latitude ? 'gps' : 'text',
                    'location_confirmed' => 'unconfirmed',
                    'summary' => $extracted['summary'] ?? Str::limit($textToProcess, 150),
                    'completeness_status' => $extracted['completeness_status'] ?? 'incomplete',
                    'verification_status' => 'belum_terkonfirmasi',
                    'report_status' => 'baru_diterima',
                ]);
            } else {
                // Update laporan yang sudah ada dengan info tambahan baru
                $report->update([
                    'incident_type' => $extracted['incident_type'] ?? $report->incident_type,
                    'description' => ($report->description ? $report->description . "\n" : '') . ($extracted['description'] ?? $textToProcess),
                    'location_description' => $extracted['location_description'] ?? $report->location_description,
                    'victim_count' => $extracted['victim_count'] ?? $report->victim_count,
                    'victim_condition' => $extracted['victim_condition'] ?? $report->victim_condition,
                    'summary' => $extracted['summary'] ?? $report->summary,
                    'completeness_status' => $extracted['completeness_status'] ?? $report->completeness_status,
                ]);
            }

            // Hubungkan pesan & percakapan ke laporan
            $inboundMsg->update([
                'report_id' => $report->id,
                'process_status' => 'processed',
            ]);

            $conversation->update([
                'report_id' => $report->id,
                'last_message_at' => now(),
            ]);

            // 6. Simpan detail entitas ke report_details
            $fieldsToRecord = [
                'incident_type' => $extracted['incident_type'] ?? null,
                'incident_time' => $extracted['incident_time'] ?? null,
                'location_description' => $extracted['location_description'] ?? null,
                'description' => $extracted['description'] ?? null,
                'victim_count' => isset($extracted['victim_count']) ? (string) $extracted['victim_count'] : null,
                'victim_condition' => $extracted['victim_condition'] ?? null,
            ];

            foreach ($fieldsToRecord as $fieldName => $fieldValue) {
                if ($fieldValue !== null) {
                    ReportDetail::updateOrCreate(
                        [
                            'report_id' => $report->id,
                            'field_name' => $fieldName,
                        ],
                        [
                            'field_value' => (string) $fieldValue,
                            'information_status' => 'known',
                            'source_message_id' => $inboundMsg->id,
                        ]
                    );
                }
            }

            // 7. Balas Pelapor via Telegram
            $responseText = "🚨 <b>Laporan Berhasil Diterima</b>\n\n"
                . "Halo <b>{$senderName}</b>, laporan kejadian darurat Anda telah dicatat oleh sistem <b>SIGAP</b>.\n\n"
                . "<b>Nomor Laporan</b>: <code>#{$report->report_code}</code>\n"
                . "<b>Jenis</b>: " . htmlspecialchars($report->incident_type ?? 'Kejadian Darurat') . "\n"
                . "<b>Lokasi</b>: " . htmlspecialchars($report->location_description ?? '-') . "\n"
                . "<b>Ringkasan AI</b>: " . htmlspecialchars($report->summary ?? '-') . "\n\n"
                . "Petugas admin telah menerima data ini di dashboard monitoring untuk verifikasi lebih lanjut. Terima kasih atas kepedulian Anda!";

            $reply = $this->telegramService->sendMessage($chatId, $responseText);

            // Simpan log pesan keluar
            Message::create([
                'conversation_id' => $conversation->id,
                'report_id' => $report->id,
                'wa_message_id' => 'tg_out_' . time() . '_' . Str::random(6),
                'direction' => 'outbound',
                'message_type' => 'text',
                'body' => $responseText,
                'process_status' => 'processed',
                'created_at' => now(),
            ]);

            return $report;
        });
    }
}
