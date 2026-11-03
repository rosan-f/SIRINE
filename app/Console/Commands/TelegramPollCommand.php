<?php

namespace App\Console\Commands;

use App\Services\IncidentReportService;
use App\Services\Telegram\TelegramService;
use Illuminate\Console\Command;

class TelegramPollCommand extends Command
{
    protected $signature = 'telegram:poll {--timeout=15 : Long polling timeout in seconds} {--once : Hanya proses antrean pesan saat ini lalu selesai}';

    protected $description = 'Jalankan daemon polling untuk menerima dan memproses pesan Telegram secara real-time di lokal';

    public function handle(TelegramService $telegramService, IncidentReportService $incidentReportService): int
    {
        // Simpan PID proses untuk monitoring dashboard
        $pidFile = storage_path('app/poller.pid');
        @file_put_contents($pidFile, (string) getmypid());

        $this->logMessage('[INFO] Memulai Telegram Bot Polling (SIGAP)...');
        $this->comment('Menghapus webhook aktif (jika ada) untuk mengaktifkan mode getUpdates...');
        $telegramService->deleteWebhook();

        $this->logMessage('[READY] Bot siap mendengarkan pesan dari Telegram.');
        $this->line('Kirim pesan teks atau voice note ke bot Telegram Anda sekarang (Tekan CTRL+C untuk berhenti).');
        $this->newLine();

        $offset = null;
        $timeout = (int) $this->option('timeout');

        try {
            while (true) {
                $updates = $telegramService->getUpdates($offset, 10, $timeout);

                foreach ($updates as $update) {
                    $updateId = $update['update_id'];
                    $offset = $updateId + 1;

                    $msg = $update['message'] ?? $update['channel_post'] ?? null;
                    if (! $msg) {
                        continue;
                    }

                    $sender = $msg['from']['first_name'] ?? ($msg['from']['username'] ?? 'User');

                    if (isset($msg['text'])) {
                        $text = $msg['text'];
                    } elseif (isset($msg['voice']) || isset($msg['audio'])) {
                        $text = '[Voice Note]';
                    } elseif (isset($msg['location'])) {
                        $lat = $msg['location']['latitude'] ?? '-';
                        $lng = $msg['location']['longitude'] ?? '-';
                        $text = "[Share Location: {$lat}, {$lng}]";
                    } else {
                        $text = '[Media/Lainnya]';
                    }

                    $this->logMessage("[PESAN MASUK] Dari: {$sender} | Konten: {$text}");

                    $startTime = microtime(true);
                    $report = $incidentReportService->handleIncomingTelegramUpdate($update);
                    $duration = round(microtime(true) - $startTime, 2);

                    if ($report) {
                        $this->logMessage("[SUKSES] Laporan dibuat: [Kode: {$report->report_code}] dalam {$duration}s | Jenis: {$report->incident_type} | Lokasi: {$report->location_description}");
                        $this->line("   - Koordinat: {$report->latitude}, {$report->longitude}");
                        $this->line("   - Ringkasan: {$report->summary}");
                    } else {
                        $this->logMessage('[PROSES] Pesan diproses. Menunggu langkah pelapor berikutnya...');
                    }

                    $this->newLine();
                }

                if ($this->option('once')) {
                    $this->logMessage('Selesai memproses antrean pesan (mode --once).');
                    break;
                }

                usleep(500000); // 0.5 detik
            }
        } finally {
            @unlink($pidFile);
            $this->logMessage('[STOP] Bot Polling SIGAP berhenti.');
        }

        return Command::SUCCESS;
    }

    protected function logMessage(string $message): void
    {
        $this->info($message);

        $logPath = storage_path('logs/telegram_poll.log');
        $clean = strip_tags($message);
        $timestamp = now()->format('Y-m-d H:i:s');
        @file_put_contents($logPath, "[{$timestamp}] {$clean}\n", FILE_APPEND);
    }
}
