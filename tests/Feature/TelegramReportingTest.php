<?php

use App\Models\Report;
use App\Models\User;
use App\Services\AI\GeminiService;
use App\Services\IncidentReportService;
use App\Services\Telegram\TelegramService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('gemini service parses report template without calling external api', function () {
    $service = new GeminiService;

    $templateText = "Jenis Kejadian: Kebakaran rumah warga\n"
        ."Patokan/Alamat: Jl. Cut Nyak Dien dekat Masjid Baiturrahman\n"
        ."Keterangan: Api sudah menjalar ke atap rumah tetangga\n"
        .'Kondisi Korban: 2 orang luka bakar ringan';

    $result = $service->extractReport($templateText);

    expect($result['incident_type'])->toBe('Kebakaran rumah warga')
        ->and($result['location_description'])->toBe('Jl. Cut Nyak Dien dekat Masjid Baiturrahman')
        ->and($result['description'])->toBe('Api sudah menjalar ke atap rumah tetangga')
        ->and($result['victim_count'])->toBe(2)
        ->and($result['victim_condition'])->toBe('2 orang luka bakar ringan');
});

test('incident report service processes 2-step flow: location then template', function () {
    $telegramMock = Mockery::mock(TelegramService::class);
    $telegramMock->shouldReceive('sendMessage')->twice()->andReturn(['ok' => true]);

    $geminiService = new GeminiService;
    $service = new IncidentReportService($telegramMock, $geminiService);

    $chatId = 987654321;

    // Langkah 1: Pelapor mengirim Share Location GPS
    $locationUpdate = [
        'update_id' => 1001,
        'message' => [
            'message_id' => 1,
            'from' => [
                'first_name' => 'Rausyan',
                'username' => 'rausyan_dev',
            ],
            'chat' => [
                'id' => $chatId,
            ],
            'location' => [
                'latitude' => 4.47123,
                'longitude' => 97.96541,
            ],
        ],
    ];

    $reportStep1 = $service->handleIncomingTelegramUpdate($locationUpdate);
    expect($reportStep1)->toBeNull(); // Belum buat report karena menunggu isi template

    // Langkah 2: Pelapor mengirimkan template yang sudah diisi
    $templateUpdate = [
        'update_id' => 1002,
        'message' => [
            'message_id' => 2,
            'from' => [
                'first_name' => 'Rausyan',
                'username' => 'rausyan_dev',
            ],
            'chat' => [
                'id' => $chatId,
            ],
            'text' => "[FORMAT LAPORAN SIGAP]\n"
                ."Jenis Kejadian: Kebakaran toko kelontong\n"
                ."Patokan/Alamat: Simpang 4 dekat pasar\n"
                ."Keterangan: Asap tebal keluar dari ruko bagian depan\n"
                .'Kondisi Korban: Nihil / Tidak ada korban',
        ],
    ];

    $reportStep2 = $service->handleIncomingTelegramUpdate($templateUpdate);

    expect($reportStep2)->toBeInstanceOf(Report::class)
        ->and($reportStep2->incident_type)->toBe('Kebakaran toko kelontong')
        ->and((float) $reportStep2->latitude)->toBe(4.47123)
        ->and((float) $reportStep2->longitude)->toBe(97.96541)
        ->and($reportStep2->location_source)->toBe('gps')
        ->and($reportStep2->report_status)->toBe('baru_diterima');

    // Pastikan data tersimpan di database
    $this->assertDatabaseHas('reports', [
        'id' => $reportStep2->id,
        'incident_type' => 'Kebakaran toko kelontong',
        'latitude' => 4.47123,
        'longitude' => 97.96541,
    ]);
});

test('authenticated user can view report index with real database reports and route link', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('reports.index'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('reports/index')->has('reports'));
});
