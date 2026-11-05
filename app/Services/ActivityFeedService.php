<?php

namespace App\Services;

use App\Models\Report;
use App\Models\ReportHistory;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ActivityFeedService
{
    /**
     * @return array<int, array{
     *     id: string,
     *     type: string,
     *     title: string,
     *     description: string,
     *     context: string,
     *     actor: string,
     *     change: string|null,
     *     verification_change: string|null,
     *     report_id: int|null,
     *     report_code: string|null,
     *     href: string|null,
     *     occurred_at: string,
     *     time: string
     * }>
     */
    public function latest(int $limit = 100): array
    {
        $reportActivities = Report::query()
            ->select(['id', 'report_code', 'reporter_id', 'input_type', 'incident_type', 'location_description', 'created_at'])
            ->with('reporter:id,name')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (Report $report): array => $this->reportReceived($report));

        $historyActivities = ReportHistory::query()
            ->with([
                'report:id,report_code,incident_type,location_description',
                'admin:id,name',
            ])
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (ReportHistory $history): ?array => $this->reportUpdated($history))
            ->filter();

        return $reportActivities
            ->concat($historyActivities)
            ->concat($this->pollerActivities($limit))
            ->concat($this->transcriptionFailureActivities($limit))
            ->sortByDesc('occurred_at')
            ->take($limit)
            ->values()
            ->all();
    }

    /**
     * @return array{
     *     id: string,
     *     type: string,
     *     title: string,
     *     description: string,
     *     context: string,
     *     actor: string,
     *     change: null,
     *     verification_change: null,
     *     report_id: int,
     *     report_code: string,
     *     href: string,
     *     occurred_at: string,
     *     time: string
     * }
     */
    private function reportReceived(Report $report): array
    {
        $occurredAt = $report->created_at ?? now();
        $inputSource = $report->input_type === 'voice' ? 'Voice note Telegram' : 'Pesan teks Telegram';

        return [
            'id' => 'report-'.$report->id,
            'type' => 'report_received',
            'title' => 'Laporan baru diterima',
            'description' => $inputSource,
            'context' => collect([$report->incident_type, $report->location_description])
                ->filter()
                ->implode(' · '),
            'actor' => $report->reporter?->name ?? 'Warga Telegram',
            'change' => null,
            'verification_change' => null,
            'report_id' => $report->id,
            'report_code' => $report->report_code,
            'href' => route('reports.show', $report),
            'occurred_at' => $occurredAt->toIso8601String(),
            'time' => $occurredAt->diffForHumans(),
        ];
    }

    /**
     * @return array{
     *     id: string,
     *     type: string,
     *     title: string,
     *     description: string,
     *     context: string,
     *     actor: string,
     *     change: string,
     *     verification_change: string|null,
     *     report_id: int,
     *     report_code: string,
     *     href: string,
     *     occurred_at: string,
     *     time: string
     * }|null
     */
    private function reportUpdated(ReportHistory $history): ?array
    {
        $report = $history->report;

        if (! $report || ! $history->created_at) {
            return null;
        }

        $notes = $history->notes ?? '';
        $normalizedNotes = Str::lower($notes);
        $verificationChanged = $history->previous_verification_status !== $history->new_verification_status
            && $history->new_verification_status !== null;
        $isInvalid = $history->new_verification_status === 'tidak_valid'
            || Str::contains($normalizedNotes, 'tidak valid');
        $isVerification = ! $isInvalid && ($verificationChanged || Str::contains($normalizedNotes, 'diverifikasi'));
        $type = $isInvalid ? 'invalid' : ($isVerification ? 'verification' : 'handling');
        $title = match (true) {
            $isInvalid => 'Laporan ditandai tidak valid',
            $isVerification && $history->new_verification_status === 'terverifikasi' => 'Laporan diverifikasi',
            $isVerification => 'Status verifikasi diperbarui',
            $history->new_status === 'menuju_lokasi' => 'Petugas menuju lokasi',
            $history->new_status === 'dalam_penanganan' => 'Penanganan dimulai',
            $history->new_status === 'selesai' => 'Penanganan selesai',
            default => 'Status laporan diperbarui',
        };
        $occurredAt = $history->created_at;

        return [
            'id' => 'history-'.$history->id,
            'type' => $type,
            'title' => $title,
            'description' => $notes !== '' ? $notes : 'Status laporan telah diperbarui.',
            'context' => collect([$report->incident_type, $report->location_description])
                ->filter()
                ->implode(' · '),
            'actor' => $history->admin?->name ?? 'Petugas',
            'change' => collect([
                $this->statusLabel($history->previous_status),
                $this->statusLabel($history->new_status),
            ])->filter()->implode(' → '),
            'verification_change' => $verificationChanged
                ? collect([
                    $this->verificationLabel($history->previous_verification_status),
                    $this->verificationLabel($history->new_verification_status),
                ])->filter()->implode(' → ')
                : null,
            'report_id' => $report->id,
            'report_code' => $report->report_code,
            'href' => route('reports.show', $report),
            'occurred_at' => $occurredAt->toIso8601String(),
            'time' => $occurredAt->diffForHumans(),
        ];
    }

    private function statusLabel(?string $status): ?string
    {
        return match ($status) {
            'baru_diterima' => 'Baru diterima',
            'menuju_lokasi' => 'Petugas menuju lokasi',
            'dalam_penanganan' => 'Dalam penanganan',
            'selesai' => 'Selesai',
            default => $status ? Str::headline($status) : null,
        };
    }

    private function verificationLabel(?string $status): ?string
    {
        return match ($status) {
            'belum_terkonfirmasi' => 'Belum diverifikasi',
            'terverifikasi' => 'Terverifikasi',
            'tidak_valid' => 'Tidak valid',
            default => $status ? Str::headline($status) : null,
        };
    }

    /**
     * @return Collection<int, array{
     *     id: string,
     *     type: string,
     *     title: string,
     *     description: string,
     *     context: string,
     *     actor: string,
     *     change: null,
     *     verification_change: null,
     *     report_id: null,
     *     report_code: null,
     *     href: null,
     *     occurred_at: string,
     *     time: string
     * }>
     */
    private function pollerActivities(int $limit): Collection
    {
        $logPath = storage_path('logs/telegram_poll.log');

        if (! is_file($logPath) || ! is_readable($logPath)) {
            return collect();
        }

        $lines = file($logPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        if (! $lines) {
            return collect();
        }

        return collect(array_slice($lines, -($limit * 3)))
            ->map(function (string $line): ?array {
                if (! preg_match('/^\[(?<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] \[ACTION\] (?<message>.+)$/', $line, $matches)) {
                    return null;
                }

                $occurredAt = Carbon::createFromFormat(
                    'Y-m-d H:i:s',
                    $matches['timestamp'],
                    config('app.timezone'),
                );

                if (! $occurredAt) {
                    return null;
                }

                $message = Str::lower($matches['message']);
                $isStart = Str::contains($message, 'memulai daemon polling');
                $isStop = Str::contains($message, 'daemon polling dihentikan');

                if (! $isStart && ! $isStop) {
                    return null;
                }

                preg_match('/\boleh\s+([^.!]+)[.!]?$/i', $matches['message'], $actorMatches);
                $actor = isset($actorMatches[1]) ? trim($actorMatches[1]) : 'Sistem';

                return [
                    'id' => 'poller-'.sha1($line),
                    'type' => 'bot',
                    'title' => $isStart ? 'Bot Telegram dimulai' : 'Bot Telegram dihentikan',
                    'description' => $isStart
                        ? 'Poller mulai menerima pesan Telegram.'
                        : 'Poller berhenti menerima pesan Telegram.',
                    'context' => 'Koneksi Telegram',
                    'actor' => $actor,
                    'change' => null,
                    'verification_change' => null,
                    'report_id' => null,
                    'report_code' => null,
                    'href' => null,
                    'occurred_at' => $occurredAt->toIso8601String(),
                    'time' => $occurredAt->diffForHumans(),
                ];
            })
            ->filter()
            ->values();
    }

    /**
     * @return Collection<int, array{
     *     id: string,
     *     type: string,
     *     title: string,
     *     description: string,
     *     context: string,
     *     actor: string,
     *     change: null,
     *     verification_change: null,
     *     report_id: null,
     *     report_code: null,
     *     href: null,
     *     occurred_at: string,
     *     time: string
     * }>
     */
    private function transcriptionFailureActivities(int $limit): Collection
    {
        $logPath = storage_path('logs/laravel.log');

        if (! is_file($logPath) || ! is_readable($logPath)) {
            return collect();
        }

        $lines = file($logPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        if (! $lines) {
            return collect();
        }

        return collect(array_slice($lines, -max($limit * 3, 100)))
            ->filter(fn (string $line): bool => str_contains($line, 'Voice note Telegram gagal ditranskripsikan.')
                && ! str_contains($line, 'testing.WARNING:'))
            ->map(function (string $line): ?array {
                if (! preg_match('/^\[(?<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/', $line, $matches)) {
                    return null;
                }

                $occurredAt = Carbon::createFromFormat(
                    'Y-m-d H:i:s',
                    $matches['timestamp'],
                    config('app.timezone'),
                );

                if (! $occurredAt) {
                    return null;
                }

                return [
                    'id' => 'voice-failure-'.sha1($line),
                    'type' => 'processing_issue',
                    'title' => 'Voice note gagal ditranskripsikan',
                    'description' => 'Voice note belum berhasil diubah menjadi teks. Minta pelapor mengirim ulang atau menulis laporan.',
                    'context' => 'Perlu tindak lanjut petugas',
                    'actor' => 'Bot Telegram',
                    'change' => null,
                    'verification_change' => null,
                    'report_id' => null,
                    'report_code' => null,
                    'href' => null,
                    'occurred_at' => $occurredAt->toIso8601String(),
                    'time' => $occurredAt->diffForHumans(),
                ];
            })
            ->filter()
            ->values();
    }
}
