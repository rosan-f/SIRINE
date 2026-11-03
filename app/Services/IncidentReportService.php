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
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class IncidentReportService
{
    public function __construct(
        protected TelegramService $telegramService,
        protected GeminiService $geminiService
    ) {}

    /**
     * Process an incoming Telegram update through the 2-step emergency reporting pipeline.
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

        if (Message::where('wa_message_id', $waMessageId)->exists()) {
            return null;
        }

        $firstName = $message['from']['first_name'] ?? '';
        $lastName = $message['from']['last_name'] ?? '';
        $senderName = trim("{$firstName} {$lastName}") ?: ($message['from']['username'] ?? 'Warga');

        $messageType = 'text';
        $inputType = 'text';
        $textToProcess = '';
        $savedAudioPath = null;
        $transcript = null;
        $latitude = null;
        $longitude = null;

        if (isset($message['text'])) {
            $textToProcess = $message['text'];

            if (str_starts_with(trim($textToProcess), '/start')) {
                $reporter = Reporter::firstOrCreate(
                    ['whatsapp_number' => $chatId],
                    ['name' => $senderName]
                );

                Conversation::where('reporter_id', $reporter->id)
                    ->where('conversation_status', 'active')
                    ->update(['conversation_status' => 'completed']);

                $welcome = "Selamat datang di Layanan Pelaporan Darurat SIGAP.\n\n"
                    ."Silakan ikuti 2 langkah berikut untuk mengirimkan laporan:\n\n"
                    ."Langkah 1:\n"
                    ."Kirimkan lokasi kejadian Anda saat ini melalui fitur Kirim Lokasi (Share Location) di Telegram.\n\n"
                    ."Langkah 2:\n"
                    .'Setelah lokasi diterima, sistem akan memberikan template format laporan untuk Anda lengkapi.';

                $this->telegramService->sendMessage($chatId, $welcome);

                return null;
            }
        } elseif (isset($message['voice']) || isset($message['audio'])) {
            $messageType = 'audio';
            $inputType = 'voice';
            $audioInfo = $message['voice'] ?? $message['audio'];
            $fileId = $audioInfo['file_id'];

            $telegramFile = $this->telegramService->getFile($fileId);
            if ($telegramFile && isset($telegramFile['file_path'])) {
                $binary = $this->telegramService->downloadFile($telegramFile['file_path']);
                if ($binary) {
                    $ext = pathinfo($telegramFile['file_path'], PATHINFO_EXTENSION) ?: 'oga';
                    $fileName = 'audio_'.time().'_'.Str::random(8).'.'.$ext;
                    $savedAudioPath = "private/audio/{$fileName}";
                    Storage::disk('local')->put($savedAudioPath, $binary);

                    $transcript = $this->geminiService->transcribeAudio($binary, 'audio/ogg');
                    $textToProcess = $transcript ?: 'Rekaman suara laporan kejadian darurat';
                }
            }
        } elseif (isset($message['location'])) {
            $messageType = 'location';
            $latitude = (float) $message['location']['latitude'];
            $longitude = (float) $message['location']['longitude'];
            $textToProcess = "Lokasi GPS: {$latitude}, {$longitude}";
        } else {
            $textToProcess = $message['caption'] ?? '[Lampiran media]';
            $messageType = 'other';
        }

        if (empty(trim($textToProcess))) {
            return null;
        }

        return DB::transaction(function () use (
            $chatId,
            $messageId,
            $senderName,
            $waMessageId,
            $messageType,
            $inputType,
            $textToProcess,
            $savedAudioPath,
            $transcript,
            $latitude,
            $longitude
        ) {
            $reporter = Reporter::firstOrCreate(
                ['whatsapp_number' => $chatId],
                ['name' => $senderName]
            );

            if (empty($reporter->name) && ! empty($senderName)) {
                $reporter->update(['name' => $senderName]);
            }

            $expireMinutes = (int) env('CONVERSATION_EXPIRE_MINUTES', 60);
            $conversation = Conversation::where('reporter_id', $reporter->id)
                ->where('conversation_status', 'active')
                ->latest('last_message_at')
                ->first();

            if (! $conversation || ($conversation->last_message_at && $conversation->last_message_at->diffInMinutes(now()) > $expireMinutes)) {
                if ($conversation) {
                    $conversation->update(['conversation_status' => 'expired']);
                }

                $conversation = Conversation::create([
                    'reporter_id' => $reporter->id,
                    'conversation_status' => 'active',
                    'current_question' => 'awaiting_location',
                    'followup_count' => 0,
                    'last_message_at' => now(),
                ]);
            }

            $inboundMsg = Message::create([
                'conversation_id' => $conversation->id,
                'report_id' => null,
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

            if ($messageType === 'location') {
                $inboundMsg->update(['process_status' => 'processed']);

                $previousTextMsg = Message::where('conversation_id', $conversation->id)
                    ->whereIn('message_type', ['text', 'audio'])
                    ->where('direction', 'inbound')
                    ->where('id', '!=', $inboundMsg->id)
                    ->latest('id')
                    ->first();

                if ($previousTextMsg && ! empty($previousTextMsg->body)) {
                    return $this->finalizeReport(
                        $reporter,
                        $conversation,
                        $previousTextMsg->body,
                        $previousTextMsg->message_type === 'audio' ? 'voice' : 'text',
                        $latitude,
                        $longitude,
                        $chatId,
                        $senderName
                    );
                }

                $conversation->update([
                    'current_question' => 'awaiting_template',
                    'last_message_at' => now(),
                ]);

                $templateMsg = "Lokasi kejadian berhasil diterima.\n"
                    ."Koordinat: {$latitude}, {$longitude}\n\n"
                    ."Langkah 2: Silakan salin dan lengkapi format laporan di bawah ini, lalu kirim kembali:\n\n"
                    ."[FORMAT LAPORAN SIGAP]\n"
                    ."Jenis Kejadian: \n"
                    ."Patokan/Alamat: \n"
                    ."Keterangan: \n"
                    ."Kondisi Korban: \n\n"
                    .'Catatan: Anda juga dapat mengirimkan rekaman suara (voice note) yang menjelaskan poin-poin di atas.';

                $this->telegramService->sendMessage($chatId, $templateMsg, (int) $messageId);

                Message::create([
                    'conversation_id' => $conversation->id,
                    'report_id' => null,
                    'wa_message_id' => 'tg_out_'.time().'_'.Str::random(6),
                    'direction' => 'outbound',
                    'message_type' => 'text',
                    'body' => $templateMsg,
                    'process_status' => 'processed',
                    'created_at' => now(),
                ]);

                return null;
            }

            $locationMsg = Message::where('conversation_id', $conversation->id)
                ->where('message_type', 'location')
                ->whereNotNull('latitude')
                ->whereNotNull('longitude')
                ->latest('id')
                ->first();

            if (! $locationMsg) {
                $conversation->update([
                    'current_question' => 'awaiting_location',
                    'last_message_at' => now(),
                ]);

                $shortExcerpt = Str::limit($textToProcess, 80);
                $askLocMsg = "Keterangan kejadian Anda telah kami catat: \"{$shortExcerpt}\"\n\n"
                    .'Langkah 1: Silakan kirimkan Lokasi Kejadian saat ini via fitur Kirim Lokasi (Share Location) Telegram agar petugas dapat memperoleh koordinat dan rute navigasi yang presisi.';

                $this->telegramService->sendMessage($chatId, $askLocMsg, (int) $messageId);

                Message::create([
                    'conversation_id' => $conversation->id,
                    'report_id' => null,
                    'wa_message_id' => 'tg_out_'.time().'_'.Str::random(6),
                    'direction' => 'outbound',
                    'message_type' => 'text',
                    'body' => $askLocMsg,
                    'process_status' => 'processed',
                    'created_at' => now(),
                ]);

                return null;
            }

            return $this->finalizeReport(
                $reporter,
                $conversation,
                $textToProcess,
                $inputType,
                (float) $locationMsg->latitude,
                (float) $locationMsg->longitude,
                $chatId,
                $senderName
            );
        });
    }

    /**
     * Persist the validated emergency report and notify the reporter via Telegram.
     */
    protected function finalizeReport(
        Reporter $reporter,
        Conversation $conversation,
        string $textData,
        string $inputType,
        float $latitude,
        float $longitude,
        string $chatId,
        string $senderName
    ): Report {
        $analysis = $this->geminiService->extractReport($textData);

        $reportCode = 'SIGAP-'.date('Ymd').'-'.strtoupper(Str::random(4));

        $report = Report::create([
            'report_code' => $reportCode,
            'reporter_id' => $reporter->id,
            'input_type' => $inputType,
            'original_text' => $textData,
            'incident_type' => $analysis['incident_type'] ?? 'Laporan Kejadian Darurat',
            'incident_time' => now(),
            'description' => $analysis['description'] ?? $textData,
            'victim_count' => $analysis['victim_count'] ?? null,
            'victim_condition' => $analysis['victim_condition'] ?? 'Nihil / Tidak ada korban',
            'location_description' => $analysis['location_description'] ?? 'Sesuai titik GPS pelapor',
            'latitude' => $latitude,
            'longitude' => $longitude,
            'location_source' => 'gps',
            'location_confirmed' => 'unconfirmed',
            'summary' => $analysis['summary'] ?? Str::limit($textData, 150),
            'completeness_status' => 'complete',
            'verification_status' => 'belum_terkonfirmasi',
            'report_status' => 'baru_diterima',
        ]);

        Message::where('conversation_id', $conversation->id)->update([
            'report_id' => $report->id,
            'process_status' => 'processed',
        ]);

        $conversation->update([
            'report_id' => $report->id,
            'conversation_status' => 'completed',
            'current_question' => null,
            'last_message_at' => now(),
        ]);

        $fieldsToRecord = [
            'incident_type' => $report->incident_type,
            'incident_time' => $report->incident_time,
            'location_description' => $report->location_description,
            'description' => $report->description,
            'victim_count' => $report->victim_count !== null ? (string) $report->victim_count : null,
            'victim_condition' => $report->victim_condition,
            'latitude' => (string) $latitude,
            'longitude' => (string) $longitude,
        ];

        foreach ($fieldsToRecord as $fieldName => $fieldValue) {
            if ($fieldValue !== null) {
                ReportDetail::create([
                    'report_id' => $report->id,
                    'field_name' => $fieldName,
                    'field_value' => (string) $fieldValue,
                    'information_status' => 'known',
                    'source_message_id' => null,
                ]);
            }
        }

        $mapsRouteUrl = "https://www.google.com/maps/dir/?api=1&destination={$latitude},{$longitude}";
        $victimText = $report->victim_condition ?: ($report->victim_count ? "{$report->victim_count} orang" : 'Nihil / Tidak ada korban');

        $responseText = "Laporan Resmi Berhasil Dicatat\n\n"
            ."Nomor Laporan: #{$report->report_code}\n"
            .'Jenis Kejadian: '.htmlspecialchars($report->incident_type)."\n"
            .'Lokasi: '.htmlspecialchars($report->location_description)."\n"
            ."Koordinat: {$latitude}, {$longitude}\n"
            .'Korban: '.htmlspecialchars($victimText)."\n"
            .'Keterangan: '.htmlspecialchars($report->description)."\n"
            ."Rute Google Maps: {$mapsRouteUrl}\n\n"
            .'Laporan ini telah masuk ke dashboard petugas untuk segera diverifikasi dan ditindaklanjuti. Terima kasih atas laporan Anda.';

        $this->telegramService->sendMessage($chatId, $responseText);

        Message::create([
            'conversation_id' => $conversation->id,
            'report_id' => $report->id,
            'wa_message_id' => 'tg_out_'.time().'_'.Str::random(6),
            'direction' => 'outbound',
            'message_type' => 'text',
            'body' => $responseText,
            'process_status' => 'processed',
            'created_at' => now(),
        ]);

        return $report;
    }
}
