<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Report;
use App\Models\ReportHistory;
use App\Services\Telegram\TelegramService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Display a listing of emergency incident reports.
     */
    public function index(): Response
    {
        $reports = Report::with('reporter')
            ->latest()
            ->get()
            ->map(function ($report) {
                $lat = $report->latitude !== null ? (float) $report->latitude : null;
                $lng = $report->longitude !== null ? (float) $report->longitude : null;

                $googleMapsUrl = ($lat !== null && $lng !== null)
                    ? "https://www.google.com/maps/dir/?api=1&destination={$lat},{$lng}"
                    : null;

                return [
                    'id' => $report->id,
                    'code' => $report->report_code,
                    'type' => $report->incident_type ?? 'Laporan Kejadian',
                    'reporter' => $report->reporter?->name ?? 'Warga (Telegram)',
                    'reporter_phone' => $report->reporter?->whatsapp_number ?? '-',
                    'location' => $report->location_description ?? '-',
                    'latitude' => $lat,
                    'longitude' => $lng,
                    'google_maps_url' => $googleMapsUrl,
                    'date' => $report->created_at ? $report->created_at->format('d M Y, H.i') : '-',
                    'status' => $report->report_status ?? 'baru_diterima',
                    'verification' => $report->verification_status ?? 'belum_terkonfirmasi',
                    'completeness' => $report->completeness_status === 'complete' ? 'complete' : 'incomplete',
                    'summary' => $report->summary,
                    'victim_count' => $report->victim_count,
                    'victim_condition' => $report->victim_condition ?: 'Nihil / Tidak ada korban',
                    'description' => $report->description ?? '-',
                    'original_text' => $report->original_text,
                    'input_type' => $report->input_type,
                ];
            });

        return Inertia::render('reports/index', [
            'reports' => $reports,
        ]);
    }

    /**
     * Display the specified report detail view with location coordinates and audit trail.
     */
    public function show(Report $report): Response
    {
        $report->load([
            'reporter',
            'details',
            'histories' => fn ($query) => $query->with('admin')->orderBy('created_at', 'desc'),
            'messages' => fn ($query) => $query->orderBy('created_at', 'asc'),
        ]);

        $lat = $report->latitude !== null ? (float) $report->latitude : null;
        $lng = $report->longitude !== null ? (float) $report->longitude : null;

        $googleMapsUrl = ($lat !== null && $lng !== null)
            ? "https://www.google.com/maps/dir/?api=1&destination={$lat},{$lng}"
            : null;

        $formattedReport = [
            'id' => $report->id,
            'code' => $report->report_code,
            'type' => $report->incident_type ?? 'Laporan Kejadian',
            'reporter' => [
                'name' => $report->reporter?->name ?? 'Warga (Telegram)',
                'phone' => $report->reporter?->whatsapp_number ?? '-',
            ],
            'location' => $report->location_description ?? '-',
            'latitude' => $lat,
            'longitude' => $lng,
            'location_source' => $report->location_source ?? 'text',
            'google_maps_url' => $googleMapsUrl,
            'date' => $report->created_at ? $report->created_at->format('d M Y, H.i') : '-',
            'incident_time' => $report->incident_time ? $report->incident_time->format('d M Y, H.i') : ($report->created_at ? $report->created_at->format('d M Y, H.i') : '-'),
            'status' => $report->report_status ?? 'baru_diterima',
            'verification' => $report->verification_status ?? 'belum_terkonfirmasi',
            'completeness' => $report->completeness_status === 'complete' ? 'complete' : 'incomplete',
            'summary' => $report->summary,
            'victim_count' => $report->victim_count,
            'victim_condition' => $report->victim_condition ?: 'Nihil / Tidak ada korban',
            'description' => $report->description ?? '-',
            'original_text' => $report->original_text,
            'input_type' => $report->input_type,
            'details' => $report->details->map(fn ($detail) => [
                'id' => $detail->id,
                'field_name' => $detail->field_name,
                'field_value' => $detail->field_value,
                'information_status' => $detail->information_status,
            ]),
            'messages' => $report->messages->map(fn ($msg) => [
                'id' => $msg->id,
                'direction' => $msg->direction,
                'message_type' => $msg->message_type,
                'body' => $msg->body,
                'time' => $msg->created_at ? $msg->created_at->format('H.i') : '-',
            ]),
            'histories' => $report->histories->map(fn ($history) => [
                'id' => $history->id,
                'admin_name' => $history->admin?->name ?? 'Sistem / Petugas',
                'previous_status' => $history->previous_status,
                'new_status' => $history->new_status,
                'notes' => $history->notes,
                'created_at' => $history->created_at ? $history->created_at->format('d M Y, H.i') : '-',
            ]),
        ];

        return Inertia::render('reports/show', [
            'report' => $formattedReport,
        ]);
    }

    /**
     * Update report status and dispatch automated Telegram notification to the reporter.
     */
    public function updateStatus(Request $request, Report $report, TelegramService $telegramService): RedirectResponse
    {
        $validated = $request->validate([
            'action' => 'required|string|in:dispatch,complete,invalid,custom',
            'custom_notes' => 'nullable|string|max:500',
            'report_status' => 'nullable|string|max:30',
            'verification_status' => 'nullable|string|max:30',
        ]);

        $reporter = $report->reporter;
        $reporterName = $reporter?->name ?? 'Pelapor';
        $chatId = $reporter?->whatsapp_number;
        $oldStatus = $report->report_status;

        $newVerification = $report->verification_status;
        $newReportStatus = $report->report_status;
        $note = '';
        $telegramTitle = '';
        $telegramBody = '';

        switch ($validated['action']) {
            case 'dispatch':
                $newVerification = 'terverifikasi';
                $newReportStatus = 'menuju_lokasi';
                $note = 'Laporan diverifikasi. Petugas dan armada bantuan dikirim menuju lokasi kejadian.';
                $telegramTitle = 'Status: Terverifikasi - Petugas Menuju Lokasi';
                $telegramBody = "Halo {$reporterName}, laporan kejadian darurat Anda telah diverifikasi oleh tim piket SIGAP.\n\nPetugas dan armada bantuan saat ini sedang dalam perjalanan menuju lokasi kejadian. Mohon tetap berada di posisi aman dan pastikan akses jalan menuju lokasi terbuka.";
                break;

            case 'complete':
                $newVerification = $report->verification_status === 'belum_terkonfirmasi' ? 'terverifikasi' : $report->verification_status;
                $newReportStatus = 'selesai';
                $note = 'Penanganan kejadian darurat telah selesai dilaksanakan oleh tim di lapangan.';
                $telegramTitle = 'Status: Selesai Ditangani';
                $telegramBody = "Halo {$reporterName}, penanganan laporan kejadian darurat di lokasi telah selesai dilaksanakan oleh tim lapangan SIGAP.\n\nTerima kasih atas kepedulian dan kerja sama Anda.";
                break;

            case 'invalid':
                $newVerification = 'tidak_valid';
                $newReportStatus = 'selesai';
                $note = 'Laporan dinyatakan tidak valid atau tidak terkonfirmasi adanya kejadian di lokasi.';
                $telegramTitle = 'Status: Tidak Terverifikasi';
                $telegramBody = "Halo {$reporterName}, laporan kejadian Anda belum dapat ditindaklanjuti karena data kejadian tidak terkonfirmasi atau tidak ditemukan kejadian darurat di lokasi yang dilaporkan.";
                break;

            case 'custom':
            default:
                $newVerification = $validated['verification_status'] ?? $report->verification_status;
                $newReportStatus = $validated['report_status'] ?? $report->report_status;
                $note = $validated['custom_notes'] ?: 'Status laporan diperbarui.';
                $telegramTitle = 'Status: '.ucfirst(str_replace('_', ' ', $newReportStatus));
                $telegramBody = "Halo {$reporterName}, status penanganan laporan kejadian Anda telah diperbarui menjadi: ".ucfirst(str_replace('_', ' ', $newReportStatus)).'.';
                break;
        }

        if (! empty($validated['custom_notes']) && $validated['action'] !== 'custom') {
            $note .= ' Catatan: '.$validated['custom_notes'];
            $telegramBody .= "\n\nCatatan Tambahan Petugas: ".$validated['custom_notes'];
        }

        $report->update([
            'verification_status' => $newVerification,
            'report_status' => $newReportStatus,
        ]);

        ReportHistory::create([
            'report_id' => $report->id,
            'admin_id' => auth()->id(),
            'previous_status' => $oldStatus,
            'new_status' => $newReportStatus,
            'notes' => $note,
            'created_at' => now(),
        ]);

        if ($chatId) {
            $fullTelegramMessage = "Pemberitahuan Penanganan Laporan SIGAP\n\n"
                ."Nomor Laporan: #{$report->report_code}\n"
                ."{$telegramTitle}\n\n"
                .$telegramBody;

            $telegramService->sendMessage($chatId, $fullTelegramMessage);

            $conversation = Conversation::where('report_id', $report->id)->latest('id')->first()
                ?? Conversation::where('reporter_id', $reporter?->id)->latest('id')->first();

            if (! $conversation && $reporter) {
                $conversation = Conversation::create([
                    'reporter_id' => $reporter->id,
                    'report_id' => $report->id,
                    'conversation_status' => 'completed',
                    'last_message_at' => now(),
                ]);
            }

            if ($conversation) {
                Message::create([
                    'conversation_id' => $conversation->id,
                    'report_id' => $report->id,
                    'wa_message_id' => 'tg_out_adm_'.time().'_'.Str::random(6),
                    'direction' => 'outbound',
                    'message_type' => 'text',
                    'body' => $fullTelegramMessage,
                    'process_status' => 'processed',
                    'created_at' => now(),
                ]);
            }
        }

        return redirect()->back()->with('success', 'Status laporan berhasil diperbarui dan pesan konfirmasi telah dikirimkan ke Telegram pelapor.');
    }
}
