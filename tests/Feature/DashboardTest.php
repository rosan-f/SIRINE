<?php

use App\Models\Report;
use App\Models\Reporter;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard')
            ->has('stats')
            ->has('activities')
            ->has('statusSummary')
            ->has('poller')
        );
});

test('dashboard counts invalid reports separately from completed reports', function () {
    $user = User::factory()->create();
    $reporter = Reporter::create([
        'name' => 'Warga',
        'whatsapp_number' => '123456789',
    ]);

    foreach ([
        ['baru_diterima', 'belum_terkonfirmasi'],
        ['menuju_lokasi', 'terverifikasi'],
        ['selesai', 'terverifikasi'],
        ['selesai', 'tidak_valid'],
    ] as $index => [$reportStatus, $verificationStatus]) {
        Report::create([
            'report_code' => 'SIRINE-STATS-'.($index + 1),
            'reporter_id' => $reporter->id,
            'incident_type' => 'Kebakaran',
            'report_status' => $reportStatus,
            'verification_status' => $verificationStatus,
        ]);
    }

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard')
            ->where('stats.total', 4)
            ->where('stats.belum_diverifikasi', 1)
            ->where('stats.sedang_ditangani', 1)
            ->where('stats.selesai_ditangani', 1)
            ->where('stats.tidak_valid', 1)
            ->where('statusSummary.3.label', 'Selesai ditangani')
            ->where('statusSummary.3.value', 1)
            ->where('statusSummary.4.label', 'Laporan tidak valid')
            ->where('statusSummary.4.value', 1));
});

test('authenticated users can fetch poller logs endpoint', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('poller.logs'));
    $response->assertOk()
        ->assertJsonStructure(['is_running', 'pid', 'logs']);
});
