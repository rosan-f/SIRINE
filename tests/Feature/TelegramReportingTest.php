<?php

use App\Models\Report;
use App\Models\Reporter;
use App\Models\User;
use App\Services\AI\GeminiService;
use App\Services\IncidentReportService;
use App\Services\Telegram\TelegramService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

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

test('gemini service extracts transcript text from audio response parts', function () {
    Http::preventStrayRequests();
    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [[
                'content' => [
                    'parts' => [
                        ['text' => 'Terjadi kebakaran di'],
                        ['text' => 'rumah warga dekat pasar.'],
                    ],
                ],
            ]],
        ]),
    ]);

    $transcript = (new GeminiService)->transcribeAudio('voice-binary', 'audio/ogg');

    expect($transcript)->toBe("Terjadi kebakaran di\nrumah warga dekat pasar.");
    Http::assertSent(fn ($request): bool => $request->isJson()
        && data_get($request->data(), 'contents.0.parts.1.inline_data.mime_type') === 'audio/ogg'
        && data_get($request->data(), 'contents.0.parts.1.inline_data.data') === base64_encode('voice-binary'));
});

test('gemini service recognizes emergency reports and rejects unrelated requests', function () {
    $service = new GeminiService;

    expect($service->isPotentialEmergencyReport('Ada kebakaran di rumah warga'))
        ->toBeTrue()
        ->and($service->isPotentialEmergencyReport('Buatkan resep makanan rendang'))
        ->toBeFalse();
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
            'text' => "[FORMAT LAPORAN SIRINE]\n"
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

test('voice note transcript is saved as the incoming message text', function () {
    $telegramMock = Mockery::mock(TelegramService::class);
    $telegramMock->shouldReceive('getFile')->once()->with('voice-file-id')->andReturn(['file_path' => 'voice/file.oga']);
    $telegramMock->shouldReceive('downloadFile')->once()->with('voice/file.oga')->andReturn('voice-binary');
    $telegramMock->shouldReceive('sendMessage')->once()->andReturn(['ok' => true]);

    $geminiMock = Mockery::mock(GeminiService::class);
    $geminiMock->shouldReceive('transcribeAudio')->once()->with('voice-binary', 'audio/ogg')->andReturn('Terjadi kebakaran di rumah saya');
    $geminiMock->shouldReceive('isPotentialEmergencyReport')->once()->with('Terjadi kebakaran di rumah saya')->andReturnTrue();

    $service = new IncidentReportService($telegramMock, $geminiMock);
    $service->handleIncomingTelegramUpdate([
        'message' => [
            'message_id' => 71,
            'from' => ['first_name' => 'Rina'],
            'chat' => ['id' => 12345],
            'voice' => ['file_id' => 'voice-file-id'],
        ],
    ]);

    $this->assertDatabaseHas('messages', [
        'wa_message_id' => 'tg_71_12345',
        'message_type' => 'audio',
        'body' => 'Terjadi kebakaran di rumah saya',
        'transcript' => 'Terjadi kebakaran di rumah saya',
        'process_status' => 'pending',
    ]);
});

test('unrelated telegram text is rejected without saving an inbound message', function () {
    $telegramMock = Mockery::mock(TelegramService::class);
    $telegramMock->shouldReceive('sendMessage')->once()->andReturn(['ok' => true]);

    $geminiMock = Mockery::mock(GeminiService::class);
    $geminiMock->shouldReceive('isPotentialEmergencyReport')->once()->with('Buatkan resep makanan rendang')->andReturnFalse();

    $service = new IncidentReportService($telegramMock, $geminiMock);
    $service->handleIncomingTelegramUpdate([
        'message' => [
            'message_id' => 72,
            'from' => ['first_name' => 'Rina'],
            'chat' => ['id' => 12345],
            'text' => 'Buatkan resep makanan rendang',
        ],
    ]);

    $this->assertDatabaseCount('messages', 0);
    $this->assertDatabaseCount('reports', 0);
    $this->assertDatabaseCount('reporters', 0);
});

test('voice note without a transcript is not processed as a report', function () {
    $telegramMock = Mockery::mock(TelegramService::class);
    $telegramMock->shouldReceive('getFile')->once()->with('voice-file-id')->andReturn(['file_path' => 'voice/file.oga']);
    $telegramMock->shouldReceive('downloadFile')->once()->with('voice/file.oga')->andReturn('voice-binary');
    $telegramMock->shouldReceive('sendMessage')->once()->andReturn(['ok' => true]);

    $geminiMock = Mockery::mock(GeminiService::class);
    $geminiMock->shouldReceive('transcribeAudio')->once()->with('voice-binary', 'audio/ogg')->andReturnNull();
    $geminiMock->shouldNotReceive('isPotentialEmergencyReport');

    $service = new IncidentReportService($telegramMock, $geminiMock);
    $service->handleIncomingTelegramUpdate([
        'message' => [
            'message_id' => 73,
            'from' => ['first_name' => 'Rina'],
            'chat' => ['id' => 12345],
            'voice' => ['file_id' => 'voice-file-id'],
        ],
    ]);

    $this->assertDatabaseCount('messages', 0);
    $this->assertDatabaseCount('reports', 0);
});

test('authenticated user can view report index with real database reports and route link', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('reports.index'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('reports/index')->has('reports'));
});

test('authenticated user can view report show detail page with maps and route info', function () {
    $user = User::factory()->create();
    $reporter = Reporter::create([
        'name' => 'Ahmad',
        'whatsapp_number' => '123456789',
    ]);

    $report = Report::create([
        'report_code' => 'SIRINE-TEST-001',
        'reporter_id' => $reporter->id,
        'incident_type' => 'Kebakaran',
        'location_description' => 'Jl. Merdeka No. 1',
        'latitude' => -5.1802,
        'longitude' => 97.1408,
        'location_source' => 'gps',
        'description' => 'Kebakaran ruko dua lantai',
        'report_status' => 'baru_diterima',
    ]);

    $response = $this->actingAs($user)->get(route('reports.show', $report));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->component('reports/show')
            ->has('report')
            ->where('report.code', 'SIRINE-TEST-001')
            ->where('report.latitude', -5.1802)
            ->where('report.longitude', 97.1408)
        );
});

test('operator can confirm report and send dispatch notification to telegram', function () {
    $telegramMock = Mockery::mock(TelegramService::class);
    $telegramMock->shouldReceive('sendMessage')
        ->once()
        ->with('123456789', Mockery::on(function ($msg) {
            return str_contains($msg, 'Terverifikasi - Petugas Menuju Lokasi')
                && str_contains($msg, 'dalam perjalanan menuju lokasi');
        }))
        ->andReturn(['ok' => true]);

    $this->app->instance(TelegramService::class, $telegramMock);

    $user = User::factory()->create();
    $reporter = Reporter::create([
        'name' => 'Ahmad',
        'whatsapp_number' => '123456789',
    ]);

    $report = Report::create([
        'report_code' => 'SIRINE-TEST-DISPATCH',
        'reporter_id' => $reporter->id,
        'incident_type' => 'Kebakaran',
        'location_description' => 'Jl. Merdeka No. 1',
        'latitude' => -5.1802,
        'longitude' => 97.1408,
        'location_source' => 'gps',
        'description' => 'Kebakaran ruko',
        'report_status' => 'baru_diterima',
        'verification_status' => 'belum_terkonfirmasi',
    ]);

    $response = $this->actingAs($user)->patch(route('reports.update-status', $report), [
        'action' => 'dispatch',
        'custom_notes' => 'Armada 01 meluncur.',
    ]);

    $response->assertRedirect();

    $report->refresh();
    expect($report->verification_status)->toBe('terverifikasi')
        ->and($report->report_status)->toBe('menuju_lokasi');

    $this->assertDatabaseHas('report_histories', [
        'report_id' => $report->id,
        'new_status' => 'menuju_lokasi',
    ]);

    $this->assertDatabaseHas('messages', [
        'report_id' => $report->id,
        'direction' => 'outbound',
    ]);
});
