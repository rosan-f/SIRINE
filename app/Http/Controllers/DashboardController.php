<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Services\ActivityFeedService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Render system monitoring dashboard with aggregated metrics.
     */
    public function index(ActivityFeedService $activityFeed): Response
    {
        $totalReports = Report::count();
        $sedangDitangani = Report::whereIn('report_status', ['menuju_lokasi', 'dalam_penanganan'])
            ->where(function ($query) {
                $query->whereNull('verification_status')
                    ->orWhere('verification_status', '!=', 'tidak_valid');
            })
            ->count();
        $selesai = Report::where('report_status', 'selesai')
            ->where(function ($query) {
                $query->whereNull('verification_status')
                    ->orWhere('verification_status', '!=', 'tidak_valid');
            })
            ->count();
        $belumDiverifikasi = Report::where('verification_status', 'belum_terkonfirmasi')->count();
        $tidakValid = Report::where('verification_status', 'tidak_valid')->count();

        $statuses = [
            'baru_diterima' => ['label' => 'Baru diterima', 'color' => 'bg-neutral-500'],
            'menuju_lokasi' => ['label' => 'Petugas Menuju Lokasi', 'color' => 'bg-blue-500'],
            'dalam_penanganan' => ['label' => 'Dalam Penanganan', 'color' => 'bg-amber-500'],
        ];

        $statusSummary = [];
        foreach ($statuses as $statusKey => $meta) {
            $count = Report::where('report_status', $statusKey)
                ->where(function ($query) {
                    $query->whereNull('verification_status')
                        ->orWhere('verification_status', '!=', 'tidak_valid');
                })
                ->count();
            $percent = $totalReports > 0 ? (int) round(($count / $totalReports) * 100) : 0;
            $statusSummary[] = [
                'label' => $meta['label'],
                'value' => $count,
                'percent' => $percent,
                'bar' => $meta['color'],
            ];
        }

        $statusSummary[] = [
            'label' => 'Selesai ditangani',
            'value' => $selesai,
            'percent' => $totalReports > 0 ? (int) round(($selesai / $totalReports) * 100) : 0,
            'bar' => 'bg-emerald-500',
        ];
        $statusSummary[] = [
            'label' => 'Laporan tidak valid',
            'value' => $tidakValid,
            'percent' => $totalReports > 0 ? (int) round(($tidakValid / $totalReports) * 100) : 0,
            'bar' => 'bg-rose-500',
        ];

        $pollerInfo = $this->checkPollerStatus();
        $logs = $this->getRecentLogs(35);

        return Inertia::render('dashboard', [
            'stats' => [
                'total' => $totalReports,
                'belum_diverifikasi' => $belumDiverifikasi,
                'sedang_ditangani' => $sedangDitangani,
                'selesai_ditangani' => $selesai,
                'tidak_valid' => $tidakValid,
            ],
            'statusSummary' => $statusSummary,
            'activities' => $activityFeed->latest(6),
            'poller' => [
                'is_running' => $pollerInfo['is_running'],
                'pid' => $pollerInfo['pid'],
                'logs' => $logs,
            ],
        ]);
    }

    /**
     * Start the Telegram polling background process.
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
        $actorName = auth()->user()?->name ?? 'Petugas';
        @file_put_contents($logPath, "[{$timestamp}] [ACTION] Memulai daemon polling dari dashboard oleh {$actorName}.\n", FILE_APPEND);

        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            $cmd = 'start /B php artisan telegram:poll';
            pclose(popen("cd /D \"{$basePath}\" && {$cmd}", 'r'));
        } else {
            exec("cd \"{$basePath}\" && php artisan telegram:poll > /dev/null 2>&1 &");
        }

        usleep(400000);

        return redirect()->back()->with('success', 'Bot Poller Telegram berhasil dijalankan.');
    }

    /**
     * Terminate the Telegram polling background process.
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
        $actorName = auth()->user()?->name ?? 'Petugas';
        @file_put_contents($logPath, "[{$timestamp}] [ACTION] Daemon polling dihentikan oleh {$actorName}.\n", FILE_APPEND);

        return redirect()->back()->with('success', 'Bot Poller Telegram telah dihentikan.');
    }

    /**
     * Retrieve the latest log entries for live dashboard polling.
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
     * Check process health using registered PID file.
     *
     * @return array{is_running: bool, pid: int|null}
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
     * Read trailing lines from the daemon log stream.
     *
     * @return array<int, string>
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
