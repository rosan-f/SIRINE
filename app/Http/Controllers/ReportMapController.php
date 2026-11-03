<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Inertia\Inertia;
use Inertia\Response;

class ReportMapController extends Controller
{
    /**
     * Show the report map page.
     */
    public function index(): Response
    {
        $reports = Report::with('reporter')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->latest()
            ->get()
            ->map(function ($report) {
                $lat = (float) $report->latitude;
                $lng = (float) $report->longitude;

                return [
                    'id' => $report->id,
                    'code' => $report->report_code,
                    'type' => $report->incident_type ?? 'Laporan Kejadian',
                    'reporter' => $report->reporter?->name ?? 'Warga (Telegram)',
                    'location' => $report->location_description ?? '-',
                    'latitude' => $lat,
                    'longitude' => $lng,
                    'google_maps_url' => "https://www.google.com/maps/dir/?api=1&destination={$lat},{$lng}",
                    'date' => $report->created_at ? $report->created_at->format('d M Y, H.i') : '-',
                    'status' => $report->report_status ?? 'baru_diterima',
                    'verification' => $report->verification_status ?? 'belum_terkonfirmasi',
                    'summary' => $report->summary,
                ];
            });

        return Inertia::render('reports/map', [
            'reports' => $reports,
        ]);
    }
}
