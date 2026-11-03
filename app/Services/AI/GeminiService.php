<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GeminiService
{
    protected string $apiKey;

    protected string $model;

    protected string $baseUrl;

    public function __construct()
    {
        $this->apiKey = (string) env('LLM_API_KEY', '');
        $this->model = (string) env('LLM_MODEL', 'gemini-3.5-flash');
        $this->baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    }

    /**
     * Execute Gemini API request with automatic retry and model fallback.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>|null
     */
    protected function callGemini(array $payload, int $timeout = 25): ?array
    {
        if (empty($this->apiKey)) {
            Log::warning('LLM_API_KEY is not configured in .env');

            return null;
        }

        $models = array_unique([$this->model, 'gemini-3.5-flash', 'gemini-3.8-flash']);

        foreach ($models as $modelName) {
            $url = "{$this->baseUrl}/models/{$modelName}:generateContent?key={$this->apiKey}";

            for ($attempt = 1; $attempt <= 2; $attempt++) {
                try {
                    $response = Http::withoutVerifying()->timeout($timeout)->post($url, $payload);

                    if ($response->successful()) {
                        return $response->json();
                    }

                    $status = $response->status();
                    if ($status === 503) {
                        usleep(500000);

                        continue;
                    }

                    break;
                } catch (\Throwable $e) {
                    Log::warning("Gemini API exception on {$modelName}: ".$e->getMessage());
                    usleep(500000);
                }
            }
        }

        return null;
    }

    /**
     * Transcribe speech audio binary into verbatim Indonesian text.
     */
    public function transcribeAudio(string $audioBinary, string $mimeType = 'audio/ogg'): ?string
    {
        $payload = [
            'contents' => [
                [
                    'parts' => [
                        [
                            'text' => 'Tolong transkripsikan rekaman suara berikut ini secara akurat ke dalam teks bahasa Indonesia verbatim. Hanya tuliskan transkripnya saja tanpa kata pengantar.',
                        ],
                        [
                            'inline_data' => [
                                'mime_type' => $mimeType,
                                'data' => base64_encode($audioBinary),
                            ],
                        ],
                    ],
                ],
            ],
            'generationConfig' => [
                'temperature' => 0.1,
            ],
        ];

        $result = $this->callGemini($payload, 30);
        if ($result && isset($result['candidates'][0]['content']['parts'][0]['text'])) {
            return trim((string) $result['candidates'][0]['content']['parts'][0]['text']);
        }

        return null;
    }

    /**
     * Extract structured report data from text or transcribed audio.
     *
     * @return array{
     *     incident_type: string,
     *     location_description: string,
     *     description: string,
     *     victim_count: int|null,
     *     victim_condition: string,
     *     summary: string
     * }
     */
    public function extractReport(string $text): array
    {
        $parsed = $this->parseTemplateFormat($text);
        if ($parsed !== null) {
            return $parsed;
        }

        $now = now()->timezone('Asia/Jakarta')->format('Y-m-d H:i:s');
        $prompt = <<<EOT
Anda adalah sistem ekstraksi laporan kedaruratan SIRINE.
Tugas Anda mengekstrak informasi kejadian dari pesan pelapor ke format JSON.
Waktu Sekarang: {$now} WIB.

Format JSON yang HARUS dikembalikan (strict JSON tanpa emoticon):
{
  "incident_type": "string jenis kejadian (misal: Kebakaran, Kecelakaan lalu lintas, Banjir, Pohon tumbang, Medis darurat)",
  "location_description": "string patokan tempat atau alamat kejadian",
  "description": "string kronologi kejadian",
  "victim_count": integer atau null,
  "victim_condition": "string kondisi korban atau null",
  "summary": "string ringkasan 1-2 kalimat dari laporan ini"
}

Pesan Pelapor:
"{$text}"
EOT;

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt],
                    ],
                ],
            ],
            'generationConfig' => [
                'responseMimeType' => 'application/json',
                'temperature' => 0.1,
            ],
        ];

        $result = $this->callGemini($payload, 20);
        if ($result && isset($result['candidates'][0]['content']['parts'][0]['text'])) {
            $rawJson = $result['candidates'][0]['content']['parts'][0]['text'];
            $decoded = json_decode($rawJson, true);
            if (is_array($decoded) && isset($decoded['incident_type'])) {
                return [
                    'incident_type' => $decoded['incident_type'] ?: 'Laporan Kejadian Darurat',
                    'location_description' => $decoded['location_description'] ?: 'Lokasi sesuai keterangan pelapor',
                    'description' => $decoded['description'] ?: $text,
                    'victim_count' => isset($decoded['victim_count']) && is_numeric($decoded['victim_count']) ? (int) $decoded['victim_count'] : null,
                    'victim_condition' => $decoded['victim_condition'] ?: 'Nihil / Tidak ada korban',
                    'summary' => $decoded['summary'] ?: Str::limit($text, 150),
                ];
            }
        }

        return $this->heuristicExtraction($text);
    }

    /**
     * Parse structured reporting template using regular expressions.
     *
     * @return array<string, mixed>|null
     */
    public function parseTemplateFormat(string $text): ?array
    {
        if (! preg_match('/(?:jenis|patokan|alamat|lokasi|deskripsi|keterangan|korban)\s*[:=]/i', $text)) {
            return null;
        }

        $incidentType = null;
        $location = null;
        $description = null;
        $victim = null;

        if (preg_match('/(?:jenis(?:\s*kejadian)?)\s*[:=]\s*([^\n\r]+)/i', $text, $m)) {
            $incidentType = trim($m[1]);
        }
        if (preg_match('/(?:patokan(?:\s*tempat)?|alamat|lokasi)\s*[:=]\s*([^\n\r]+)/i', $text, $m)) {
            $location = trim($m[1]);
        }
        if (preg_match('/(?:keterangan|deskripsi(?:\s*kejadian)?)\s*[:=]\s*([^\n\r]+)/i', $text, $m)) {
            $description = trim($m[1]);
        }
        if (preg_match('/(?:kondisi\s*korban|korban)\s*[:=]\s*([^\n\r]+)/i', $text, $m)) {
            $victim = trim($m[1]);
        }

        $isPlaceholder = function (?string $val): bool {
            if ($val === null) {
                return true;
            }
            $clean = strtolower(trim($val));

            return in_array($clean, ['', '-', 'none', 'nihil', 'tidak ada'], true);
        };

        if ($incidentType || $location || $description || $victim) {
            $victimCount = null;
            if ($victim && preg_match('/(\d+)\s*(?:orang)?/i', $victim, $vm)) {
                $victimCount = (int) $vm[1];
            }

            return [
                'incident_type' => (! $isPlaceholder($incidentType) && $incidentType) ? $incidentType : 'Laporan Kejadian Darurat',
                'location_description' => (! $isPlaceholder($location) && $location) ? $location : 'Sesuai titik koordinat GPS pelapor',
                'description' => (! $isPlaceholder($description) && $description) ? $description : $text,
                'victim_count' => $victimCount,
                'victim_condition' => (! $isPlaceholder($victim) && $victim) ? $victim : 'Nihil / Tidak ada korban',
                'summary' => 'Laporan '.($incidentType ?: 'kejadian').' di '.($location ?: 'lokasi pelapor').'. Keterangan: '.($description ?: $text),
            ];
        }

        return null;
    }

    /**
     * Fallback heuristic parser for offline or rate-limited scenarios.
     *
     * @return array{
     *     incident_type: string,
     *     location_description: string,
     *     description: string,
     *     victim_count: int|null,
     *     victim_condition: string,
     *     summary: string
     * }
     */
    protected function heuristicExtraction(string $text): array
    {
        $lower = strtolower($text);

        $incidentType = 'Laporan Kejadian Darurat';
        if (str_contains($lower, 'kebakaran') || str_contains($lower, 'terbakar') || str_contains($lower, 'api')) {
            $incidentType = 'Kebakaran';
        } elseif (str_contains($lower, 'kecelakaan') || str_contains($lower, 'tabrakan')) {
            $incidentType = 'Kecelakaan lalu lintas';
        } elseif (str_contains($lower, 'banjir')) {
            $incidentType = 'Banjir';
        } elseif (str_contains($lower, 'pohon tumbang')) {
            $incidentType = 'Pohon tumbang';
        }

        $victimCount = null;
        if (preg_match('/(\d+)\s*(?:orang\s*)?(?:korban|luka|meninggal|jiwa)/i', $text, $vm)) {
            $victimCount = (int) $vm[1];
        }

        $victimCondition = 'Tidak ada konfirmasi korban';
        if (str_contains($lower, 'meninggal') || str_contains($lower, 'tewas')) {
            $victimCondition = 'Ada korban meninggal dunia dan luka-luka';
        } elseif (str_contains($lower, 'luka')) {
            $victimCondition = 'Ada korban luka-luka';
        } elseif (str_contains($lower, 'tidak ada korban') || str_contains($lower, 'nihil')) {
            $victimCondition = 'Nihil / Tidak ada korban';
            $victimCount = 0;
        }

        return [
            'incident_type' => $incidentType,
            'location_description' => 'Lokasi sesuai keterangan pelapor',
            'description' => $text,
            'victim_count' => $victimCount,
            'victim_condition' => $victimCondition,
            'summary' => "Laporan {$incidentType}: {$text}",
        ];
    }
}
