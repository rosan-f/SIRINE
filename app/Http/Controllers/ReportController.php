<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Show the report list page.
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
     * Show the detailed report page.
     */
    public function show(Report $report): Response
    {
        $report->load([
            'reporter',
            'details',
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
        ];

        return Inertia::render('reports/show', [
            'report' => $formattedReport,
        ]);
    }
}
