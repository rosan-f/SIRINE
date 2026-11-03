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
}
