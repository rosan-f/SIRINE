<?php

use App\Models\Report;
use App\Models\Reporter;
use App\Models\ReportHistory;
use App\Models\User;

test('guests are redirected before viewing activity history', function () {
    $response = $this->get(route('activity.index'));

    $response->assertRedirect(route('login'));
});

test('authenticated users can view report creation and handling activity', function () {
    $user = User::factory()->create();
    $reporter = Reporter::create([
        'name' => 'Rina',
        'whatsapp_number' => '628123456789',
    ]);
    $report = Report::create([
        'report_code' => 'SIRINE-ACTIVITY-001',
        'reporter_id' => $reporter->id,
        'input_type' => 'voice',
        'incident_type' => 'Banjir',
        'location_description' => 'Kelurahan Sukamaju',
        'report_status' => 'baru_diterima',
        'created_at' => now()->subMinutes(10),
    ]);
    ReportHistory::create([
        'report_id' => $report->id,
        'admin_id' => $user->id,
        'previous_status' => 'baru_diterima',
        'new_status' => 'menuju_lokasi',
        'previous_verification_status' => 'belum_terkonfirmasi',
        'new_verification_status' => 'terverifikasi',
        'notes' => 'Laporan diverifikasi. Petugas menuju lokasi kejadian.',
        'created_at' => now(),
    ]);
    ReportHistory::create([
        'report_id' => $report->id,
        'admin_id' => $user->id,
        'previous_status' => 'menuju_lokasi',
        'new_status' => 'selesai',
        'previous_verification_status' => 'terverifikasi',
        'new_verification_status' => 'tidak_valid',
        'notes' => 'Laporan dinyatakan tidak valid karena kejadian tidak ditemukan.',
        'created_at' => now()->addSecond(),
    ]);

    $response = $this->actingAs($user)->get(route('activity.index'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('activity/index')
            ->has('activities')
            ->where('activities', fn ($events) => $events->contains(fn ($event) => $event['id'] === 'history-1'
                && $event['type'] === 'verification'
                && $event['actor'] === $user->name
                && $event['change'] === 'Baru diterima → Petugas menuju lokasi'
                && $event['verification_change'] === 'Belum diverifikasi → Terverifikasi')
                && $events->contains(fn ($event) => $event['id'] === 'history-2'
                    && $event['type'] === 'invalid'
                    && $event['verification_change'] === 'Terverifikasi → Tidak valid')
                && $events->contains(fn ($event) => $event['id'] === 'report-'.$report->id
                    && $event['type'] === 'report_received'
                    && $event['description'] === 'Voice note Telegram')
            ));
});
