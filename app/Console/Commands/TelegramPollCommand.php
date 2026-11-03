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
        $this->info('[INFO] Memulai Telegram Bot Polling (SIGAP)...');
        $this->comment('Menghapus webhook aktif (jika ada) untuk mengaktifkan mode getUpdates...');
        $telegramService->deleteWebhook();

        $this->info('[READY] Bot siap mendengarkan pesan dari Telegram.');
        $this->line('Kirim pesan teks atau voice note ke bot Telegram Anda sekarang (Tekan CTRL+C untuk berhenti).');
        $this->newLine();

        $offset = null;
        $timeout = (int) $this->option('timeout');

        while (true) {
            $updates = $telegramService->getUpdates($offset, 10, $timeout);

            foreach ($updates as $update) {
                $updateId = $update['update_id'];
                $offset = $updateId + 1;

                $msg = $update['message'] ?? $update['channel_post'] ?? null;
                if (! $msg) {
                    continue;
                }

                $sender = $msg['from']['first_name'] ?? 'User';
                $text = $msg['text'] ?? ($msg['voice'] ? '[Voice Note]' : '[Media]');

                $this->line("<fg=yellow>[PESAN MASUK]</> Dari: <options=bold>{$sender}</> | Konten: {$text}");

                $startTime = microtime(true);
                $report = $incidentReportService->handleIncomingTelegramUpdate($update);
                $duration = round(microtime(true) - $startTime, 2);

                if ($report) {
                    $this->info("[SUKSES] Laporan berhasil dibuat dan disimpan ke database! [Kode: {$report->report_code}] dalam {$duration}s");
                    $this->line("   - Jenis: {$report->incident_type}");
                    $this->line("   - Lokasi: {$report->location_description}");
                    $this->line("   - Koordinat: {$report->latitude}, {$report->longitude}");
                    $this->line("   - Ringkasan: {$report->summary}");
                } else {
                    $this->comment('[PROSES] Pesan diproses. Menunggu langkah pelapor berikutnya...');
                }

                $this->newLine();
            }

            if ($this->option('once')) {
                $this->info('Selesai memproses antrean pesan (mode --once).');
                break;
            }

            // Istirahat sejenak agar CPU santai
            usleep(500000); // 0.5 detik
        }

        return Command::SUCCESS;
    }
}
