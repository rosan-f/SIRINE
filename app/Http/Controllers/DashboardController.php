<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Tampilkan halaman dashboard pemantauan dengan data aktual dari database.
     */
    public function index(): Response
    {
        $totalReports = Report::count();
        $baruDiterima = Report::where('report_status', 'baru_diterima')->count();
        $sedangDitangani = Report::whereIn('report_status', ['menuju_lokasi', 'dalam_penanganan'])->count();
        $selesai = Report::where('report_status', 'selesai')->count();
        $terverifikasi = Report::where('verification_status', 'terverifikasi')->count();

        // Rekap status laporan
        $statuses = [
            'baru_diterima' => ['label' => 'Baru diterima', 'color' => 'bg-neutral-500'],
            'menuju_lokasi' => ['label' => 'Petugas Menuju Lokasi', 'color' => 'bg-blue-500'],
            'dalam_penanganan' => ['label' => 'Dalam Penanganan', 'color' => 'bg-amber-500'],
            'selesai' => ['label' => 'Selesai Ditangani', 'color' => 'bg-emerald-500'],
        ];

        $statusSummary = [];
        foreach ($statuses as $statusKey => $meta) {
            $count = Report::where('report_status', $statusKey)->count();
            $percent = $totalReports > 0 ? (int) round(($count / $totalReports) * 100) : 0;
            $statusSummary[] = [
                'label' => $meta['label'],
                'value' => $count,
                'percent' => $percent,
                'bar' => $meta['color'],
            ];
        }

        // Laporan terbaru langsung dari database
        $recentReports = Report::with('reporter')
            ->latest()
            ->take(6)
            ->get()
            ->map(function ($report) {
                return [
                    'id' => $report->id,
                    'code' => $report->report_code,
                    'type' => $report->incident_type ?? 'Laporan Kejadian',
                    'location' => $report->location_description ?? '-',
                    'status' => $report->report_status ?? 'baru_diterima',
                    'verification' => $report->verification_status ?? 'belum_terkonfirmasi',
                    'time' => $report->created_at ? $report->created_at->diffForHumans() : '-',
                ];
            });

        // Informasi status & log Telegram Poller
        $pollerInfo = $this->checkPollerStatus();
        $logs = $this->getRecentLogs(35);

        return Inertia::render('dashboard', [
            'stats' => [
                'total' => $totalReports,
                'baru_diterima' => $baruDiterima,
                'sedang_ditangani' => $sedangDitangani,
                'selesai' => $selesai,
                'terverifikasi' => $terverifikasi,
            ],
            'statusSummary' => $statusSummary,
            'recentReports' => $recentReports,
            'poller' => [
                'is_running' => $pollerInfo['is_running'],
                'pid' => $pollerInfo['pid'],
                'logs' => $logs,
            ],
        ]);
    }

    /**
     * Memulai background poller Telegram.
     */
    public function startPoller(): RedirectResponse
    {
        $status = $this->checkPollerStatus();
        if ($status['is_running']) {
            return redirect()->back()->with('warning', 'Bot Poller Telegram sudah berjalan.');
        }

        $basePath = base_path();
        $logPath = storage_path('logs/telegram_poll.log');
        $timestamp = now()->format('Y-m-d H:i:s');
        @file_put_contents($logPath, "[{$timestamp}] [ACTION] Memulai daemon polling dari dashboard...\n", FILE_APPEND);

        // Jalankan background process di Windows
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            $cmd = 'start /B php artisan telegram:poll';
            pclose(popen("cd /D \"{$basePath}\" && {$cmd}", 'r'));
        } else {
            exec("cd \"{$basePath}\" && php artisan telegram:poll > /dev/null 2>&1 &");
        }

        // Tunggu sejenak agar PID file tertulis
        usleep(400000);

        return redirect()->back()->with('success', 'Bot Poller Telegram berhasil dijalankan.');
    }

    /**
     * Menghentikan background poller Telegram.
     */
    public function stopPoller(): RedirectResponse
    {
        $status = $this->checkPollerStatus();
        $pidFile = storage_path('app/poller.pid');

        if ($status['pid']) {
            $pid = $status['pid'];
            if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                exec("taskkill /F /PID {$pid} 2>NUL");
            } else {
                exec("kill -9 {$pid} 2>/dev/null");
            }
        }

        @unlink($pidFile);

        $logPath = storage_path('logs/telegram_poll.log');
        $timestamp = now()->format('Y-m-d H:i:s');
        @file_put_contents($logPath, "[{$timestamp}] [ACTION] Daemon polling dihentikan oleh admin.\n", FILE_APPEND);

        return redirect()->back()->with('success', 'Bot Poller Telegram telah dihentikan.');
    }

    /**
     * Endpoint JSON untuk refresh log Telegram Poller secara live.
     */
    public function getLogs(): JsonResponse
    {
        $status = $this->checkPollerStatus();
        $logs = $this->getRecentLogs(35);

        return response()->json([
            'is_running' => $status['is_running'],
            'pid' => $status['pid'],
            'logs' => $logs,
        ]);
    }

    /**
     * Memeriksa apakah proses poller sedang berjalan.
     */
    protected function checkPollerStatus(): array
    {
        $pidFile = storage_path('app/poller.pid');
        if (! file_exists($pidFile)) {
            return ['is_running' => false, 'pid' => null];
        }

        $pid = (int) trim((string) file_get_contents($pidFile));
        if ($pid <= 0) {
            return ['is_running' => false, 'pid' => null];
        }

        $isRunning = false;
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            $output = [];
            exec("tasklist /FI \"PID eq {$pid}\" 2>NUL", $output);
            $isRunning = count($output) > 1 && str_contains(implode(' ', $output), (string) $pid);
        } else {
            $isRunning = file_exists("/proc/{$pid}");
        }

        if (! $isRunning) {
            @unlink($pidFile);

            return ['is_running' => false, 'pid' => null];
        }

        return ['is_running' => true, 'pid' => $pid];
    }

    /**
     * Mengambil N baris terakhir dari file log poller.
     */
    protected function getRecentLogs(int $lines = 35): array
    {
        $logPath = storage_path('logs/telegram_poll.log');
        if (! file_exists($logPath)) {
            return [
                '[INFO] File log belum dibuat. Tekan tombol Mulai Poller untuk menjalankan bot Telegram.',
            ];
        }

        $content = file($logPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if (empty($content)) {
            return [
                '[INFO] Menunggu log pertama dari bot Telegram...',
            ];
        }

        return array_slice($content, -$lines);
    }
}
