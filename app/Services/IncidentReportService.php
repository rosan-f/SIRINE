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
                    ->update([
                        'conversation_status' => 'completed',
                        'current_question' => null,
                        'report_draft' => null,
                    ]);

                $welcome = "Selamat datang di Layanan Pelaporan Darurat SIRINE.\n\n"
                    ."Saya akan memandu Anda sampai laporan siap dikirim.\n\n"
                    ."Langkah 1 dari 3:\n"
                    ."Kirimkan lokasi kejadian Anda saat ini melalui fitur Kirim Lokasi (Share Location) di Telegram.\n\n"
                    ."Langkah 2 dari 3:\n"
                    ."Ceritakan kejadian melalui teks atau voice note.\n\n"
                    ."Langkah 3 dari 3:\n"
                    .'Periksa pratinjau laporan, lalu konfirmasi atau koreksi sebelum dikirim ke petugas.';

                $this->telegramService->sendMessage($chatId, $welcome, null, 'HTML', $this->locationKeyboard());

                return null;
            }

            $controlAction = mb_strtolower(trim($textToProcess));
            if (in_array($controlAction, ['batalkan', '✖️ batalkan', '/cancel'], true)) {
                $this->cancelActiveConversation($chatId);

                return null;
            }

            if (in_array($controlAction, ['konfirmasi laporan', '✅ konfirmasi laporan', 'koreksi', '✏️ koreksi'], true)) {
                $reporter = Reporter::where('whatsapp_number', $chatId)->first();
                $conversation = $reporter
                    ? Conversation::where('reporter_id', $reporter->id)
                        ->where('conversation_status', 'active')
                        ->latest('last_message_at')
                        ->first()
                    : null;

                $expireMinutes = (int) env('CONVERSATION_EXPIRE_MINUTES', 60);
                $conversationExpired = $conversation?->last_message_at
                    && $conversation->last_message_at->diffInMinutes(now()) > $expireMinutes;

                if (! $conversation || $conversationExpired || $conversation->current_question !== 'awaiting_confirmation') {
                    $this->telegramService->sendMessage(
                        $chatId,
                        'Belum ada pratinjau laporan yang menunggu konfirmasi. Ketik /start untuk memulai laporan baru.'
                    );

                    return null;
                }
            }
        } elseif (isset($message['voice']) || isset($message['audio'])) {
            $messageType = 'audio';
            $inputType = 'voice';
            $audioInfo = $message['voice'] ?? $message['audio'];
            $fileId = $audioInfo['file_id'] ?? null;

            $this->telegramService->sendMessage(
                $chatId,
                'Voice note diterima. Saya sedang mengubahnya menjadi teks…',
                (int) $messageId
            );

            $telegramFile = $fileId ? $this->telegramService->getFile($fileId) : null;
            if ($telegramFile && isset($telegramFile['file_path'])) {
                $binary = $this->telegramService->downloadFile($telegramFile['file_path']);
                if ($binary !== null && $binary !== '') {
                    $ext = pathinfo($telegramFile['file_path'], PATHINFO_EXTENSION) ?: 'oga';
                    $fileName = 'audio_'.time().'_'.Str::random(8).'.'.$ext;

                    $transcript = $this->geminiService->transcribeAudio($binary, 'audio/ogg');
                    $transcript = is_string($transcript) ? trim($transcript) : null;
                    $textToProcess = $transcript ?? '';

                    if ($textToProcess !== '') {
                        $savedAudioPath = "private/audio/{$fileName}";
                    }
                }
            }

            if ($textToProcess === '') {
                Log::warning('Voice note Telegram gagal ditranskripsikan.', [
                    'chat_id' => $chatId,
                    'message_id' => $messageId,
                    'file_id_present' => $fileId !== null,
                    'file_downloaded' => isset($binary) && $binary !== null && $binary !== '',
                ]);
                $this->telegramService->sendMessage(
                    $chatId,
                    'Maaf, rekaman suara belum berhasil kami ubah menjadi teks. Silakan kirim ulang voice note dengan suara yang jelas atau tulis laporan dalam bentuk teks.',
                    (int) $messageId
                );

                return null;
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

        $normalizedText = mb_strtolower(trim($textToProcess));
        $isConversationControl = in_array($normalizedText, [
            'konfirmasi laporan', '✅ konfirmasi laporan', 'koreksi', '✏️ koreksi',
        ], true);

        if (in_array($messageType, ['text', 'audio'], true)
            && ! $isConversationControl
            && ! $this->geminiService->isPotentialEmergencyReport($textToProcess)) {
            $this->telegramService->sendMessage(
                $chatId,
                'Pesan ini belum terlihat seperti laporan keadaan darurat. Bot SIRINE hanya menerima laporan seperti kebakaran, kecelakaan, banjir, pohon tumbang, atau keadaan medis darurat. Silakan kirim keterangan kejadian dan lokasi.',
                (int) $messageId
            );

            return null;
        }

        if ($messageType === 'audio' && $savedAudioPath !== null && isset($binary)) {
            Storage::disk('local')->put($savedAudioPath, $binary);
        }

        return DB::transaction(function () use (
            $chatId,
            $messageId,
            $senderName,
            $waMessageId,
            $messageType,
            $inputType,
            $textToProcess,
            $normalizedText,
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

            if ($conversation->current_question === 'awaiting_confirmation' && in_array($normalizedText, ['koreksi', '✏️ koreksi'], true)) {
                $conversation->update([
                    'current_question' => 'awaiting_template',
                    'report_draft' => null,
                    'last_message_at' => now(),
                ]);
                $inboundMsg->update(['process_status' => 'processed']);

                $correctionPrompt = "Silakan kirim ulang keterangan kejadian yang benar.\n\n"
                    ."Gunakan format ini atau kirim voice note:\n"
                    ."Jenis Kejadian: \n"
                    ."Patokan/Alamat: \n"
                    ."Keterangan: \n"
                    .'Kondisi Korban: ';
                $this->telegramService->sendMessage($chatId, $correctionPrompt, (int) $messageId, 'HTML', $this->cancelKeyboard());
                $this->recordBotMessage($conversation, $correctionPrompt);

                return null;
            }

            if ($conversation->current_question === 'awaiting_confirmation' && in_array($normalizedText, ['konfirmasi laporan', '✅ konfirmasi laporan'], true)) {
                $inboundMsg->update(['process_status' => 'processed']);
                $previousTextMsg = Message::where('conversation_id', $conversation->id)
                    ->whereIn('message_type', ['text', 'audio'])
                    ->where('direction', 'inbound')
                    ->where('id', '!=', $inboundMsg->id)
                    ->latest('id')
                    ->first();
                $locationMsg = Message::where('conversation_id', $conversation->id)
                    ->where('message_type', 'location')
                    ->whereNotNull('latitude')
                    ->whereNotNull('longitude')
                    ->latest('id')
                    ->first();

                $draft = $conversation->report_draft;
                if (is_array($draft)) {
                    return $this->finalizeReport(
                        $reporter,
                        $conversation,
                        (string) $draft['text_data'],
                        (string) $draft['input_type'],
                        (float) $draft['latitude'],
                        (float) $draft['longitude'],
                        $chatId,
                        $senderName,
                        $draft['analysis']
                    );
                }

                if ($previousTextMsg && $locationMsg) {
                    return $this->finalizeReport(
                        $reporter,
                        $conversation,
                        (string) $previousTextMsg->body,
                        $previousTextMsg->message_type === 'audio' ? 'voice' : 'text',
                        (float) $locationMsg->latitude,
                        (float) $locationMsg->longitude,
                        $chatId,
                        $senderName
                    );
                }
            }

            if ($messageType === 'location') {
                $inboundMsg->update(['process_status' => 'processed']);

                $previousTextMsg = Message::where('conversation_id', $conversation->id)
                    ->whereIn('message_type', ['text', 'audio'])
                    ->where('direction', 'inbound')
                    ->where('id', '!=', $inboundMsg->id)
                    ->latest('id')
                    ->first();

                if ($previousTextMsg && ! empty($previousTextMsg->body)) {
                    return $this->sendReportPreview(
                        $conversation,
                        $previousTextMsg->body,
                        $previousTextMsg->message_type === 'audio' ? 'voice' : 'text',
                        $latitude,
                        $longitude,
                        $chatId,
                        (int) $messageId
                    );
                }

                $conversation->update([
                    'current_question' => 'awaiting_template',
                    'last_message_at' => now(),
                ]);

                $templateMsg = "Lokasi kejadian berhasil diterima.\n"
                    ."Koordinat: {$latitude}, {$longitude}\n\n"
                    ."Langkah 2 dari 3: Ceritakan kejadian dengan format berikut, atau kirim voice note:\n\n"
                    ."[FORMAT LAPORAN SIRINE]\n"
                    ."Jenis Kejadian: \n"
                    ."Patokan/Alamat: \n"
                    ."Keterangan: \n"
                    ."Kondisi Korban: \n\n"
                    .'Catatan: Anda juga dapat mengirimkan rekaman suara (voice note) yang menjelaskan poin-poin di atas.';

                $this->telegramService->sendMessage($chatId, $templateMsg, (int) $messageId, 'HTML', $this->cancelKeyboard());

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
                    .'Lokasi belum diterima. Kirim lokasi kejadian melalui tombol Kirim Lokasi agar petugas dapat menemukan titik yang tepat.';

                $this->telegramService->sendMessage($chatId, $askLocMsg, (int) $messageId, 'HTML', $this->locationKeyboard());

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

            return $this->sendReportPreview(
                $conversation,
                $textToProcess,
                $inputType,
                (float) $locationMsg->latitude,
                (float) $locationMsg->longitude,
                $chatId,
                (int) $messageId
            );
        });
    }

    protected function sendReportPreview(
        Conversation $conversation,
        string $textData,
        string $inputType,
        float $latitude,
        float $longitude,
        string $chatId,
        int $messageId
    ): null {
        $analysis = $this->geminiService->extractReport($textData);
        $escape = fn (?string $value): string => htmlspecialchars($value ?? '-', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

        $preview = "<b>Langkah 3 dari 3: Periksa laporan Anda</b>\n\n"
            .'<b>Jenis kejadian:</b> '.$escape($analysis['incident_type'] ?? null)."\n"
            .'<b>Lokasi:</b> '.$escape($analysis['location_description'] ?? null)."\n"
            .'<b>Koordinat:</b> '.number_format($latitude, 6, '.', '').', '.number_format($longitude, 6, '.', '')."\n"
            .'<b>Keterangan:</b> '.$escape($analysis['description'] ?? $textData)."\n"
            .'<b>Kondisi korban:</b> '.$escape($analysis['victim_condition'] ?? null)."\n\n"
            .'Pilih Konfirmasi Laporan untuk mengirim ke petugas, atau Koreksi untuk mengubah keterangan.';

        $conversation->update([
            'current_question' => 'awaiting_confirmation',
            'report_draft' => [
                'text_data' => $textData,
                'input_type' => $inputType,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'analysis' => $analysis,
            ],
            'last_message_at' => now(),
        ]);

        $this->telegramService->sendMessage($chatId, $preview, $messageId, 'HTML', [
            'keyboard' => [
                [['text' => '✅ Konfirmasi Laporan']],
                [['text' => '✏️ Koreksi'], ['text' => '✖️ Batalkan']],
            ],
            'resize_keyboard' => true,
            'one_time_keyboard' => false,
        ]);
        $this->recordBotMessage($conversation, strip_tags($preview));

        return null;
    }

    protected function cancelActiveConversation(string $chatId): void
    {
        $reporter = Reporter::where('whatsapp_number', $chatId)->first();
        $conversation = $reporter
            ? Conversation::where('reporter_id', $reporter->id)
                ->where('conversation_status', 'active')
                ->latest('last_message_at')
                ->first()
            : null;

        if ($conversation) {
            $conversation->update([
                'conversation_status' => 'completed',
                'current_question' => null,
                'report_draft' => null,
                'last_message_at' => now(),
            ]);
            Message::where('conversation_id', $conversation->id)
                ->where('direction', 'inbound')
                ->where('process_status', 'pending')
                ->update(['process_status' => 'cancelled']);

            $this->telegramService->sendMessage(
                $chatId,
                'Laporan dibatalkan. Jika ingin melapor lagi, ketik /start.',
                null,
                'HTML',
                ['remove_keyboard' => true]
            );
            $this->recordBotMessage($conversation, 'Laporan dibatalkan. Jika ingin melapor lagi, ketik /start.');

            return;
        }

        $this->telegramService->sendMessage($chatId, 'Tidak ada laporan yang sedang berjalan. Ketik /start untuk memulai.');
    }

    protected function locationKeyboard(): array
    {
        return [
            'keyboard' => [
                [['text' => '📍 Kirim Lokasi', 'request_location' => true]],
                [['text' => '✖️ Batalkan']],
            ],
            'resize_keyboard' => true,
            'one_time_keyboard' => false,
            'input_field_placeholder' => 'Pilih Kirim Lokasi untuk melanjutkan',
        ];
    }

    protected function cancelKeyboard(): array
    {
        return [
            'keyboard' => [[['text' => '✖️ Batalkan']]],
            'resize_keyboard' => true,
            'one_time_keyboard' => false,
        ];
    }

    protected function recordBotMessage(Conversation $conversation, string $body): void
    {
        Message::create([
            'conversation_id' => $conversation->id,
            'report_id' => $conversation->report_id,
            'wa_message_id' => 'tg_out_'.time().'_'.Str::random(6),
            'direction' => 'outbound',
            'message_type' => 'text',
            'body' => $body,
            'process_status' => 'processed',
            'created_at' => now(),
        ]);
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
        string $senderName,
        ?array $analysis = null
    ): Report {
        $analysis ??= $this->geminiService->extractReport($textData);

        $reportCode = 'SIRINE-'.date('Ymd').'-'.strtoupper(Str::random(4));

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
            'report_draft' => null,
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

        $this->telegramService->sendMessage($chatId, $responseText, null, 'HTML', ['remove_keyboard' => true]);

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
