<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected string $apiKey;
    protected string $model;
    protected string $baseUrl;

    public function __construct()
    {
        $this->apiKey = (string) env('LLM_API_KEY', '');
        $this->model = (string) env('LLM_MODEL', 'gemini-3.8-flash');
        $this->baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    }

    /**
     * Transkripsikan file audio / voice note ke teks menggunakan Gemini Multimodal.
     */
    public function transcribeAudio(string $audioBinary, string $mimeType = 'audio/ogg'): ?string
    {
        if (empty($this->apiKey)) {
            Log::warning('LLM_API_KEY belum disetel di .env');
            return null;
        }

        $url = "{$this->baseUrl}/models/{$this->model}:generateContent?key={$this->apiKey}";

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        [
                            'text' => 'Tolong transkripsikan rekaman suara pelapor kejadian/darurat berikut ini secara akurat ke dalam teks bahasa Indonesia verbatim. Hanya tuliskan transkripnya tanpa kata pengantar atau penjelasan tambahan.'
                        ],
                        [
                            'inline_data' => [
                                'mime_type' => $mimeType,
                                'data' => base64_encode($audioBinary),
                            ]
                        ]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.2,
            ]
        ];

        try {
            $response = Http::withoutVerifying()->timeout(45)->post($url, $payload);

            if ($response->successful()) {
                $transcript = $response->json('candidates.0.content.parts.0.text');
                return trim((string) $transcript);
            }

            Log::error('Gagal transcribe audio dengan Gemini: ' . $response->body());
        } catch (\Throwable $e) {
            Log::error('Exception transcribe Gemini: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Ekstraksi informasi laporan darurat dari teks ke format JSON terstruktur.
     */
    public function extractIncident(string $text, ?array $context = null): array
    {
        if (empty($this->apiKey)) {
            Log::warning('LLM_API_KEY belum disetel di .env');
            return $this->fallbackExtraction($text);
        }

        $now = now()->timezone('Asia/Jakarta')->format('Y-m-d H:i:s');
        $prompt = <<<EOT
Anda adalah asisten AI ekstraksi laporan kedaruratan sistem SIGAP.
Tugas Anda adalah membaca pesan dari warga dan mengekstrak informasi fakta kejadian ke dalam format JSON.

Konteks Waktu Saat Ini: {$now} WIB.

Aturan Penting:
1. Hanya gunakan fakta yang dinyatakan oleh pelapor. Jangan mengarang jumlah korban atau penyebab.
2. Jika suatu informasi tidak disebutkan sama sekali, beri nilai null.
3. Konversikan waktu relatif (misal: "tadi malam jam 8", "15 menit lalu") ke format "YYYY-MM-DD HH:mm:ss" berdasarkan waktu saat ini.
4. Nilai completeness_status adalah "complete" jika field incident_type, location_description, dan description telah terisi. Jika salah satu belum ada, bernilai "incomplete".

Format JSON yang HARUS dikembalikan:
{
  "incident_type": "string atau null (contoh: kecelakaan lalu lintas, kebakaran, banjir, medis darurat)",
  "incident_time": "YYYY-MM-DD HH:mm:ss atau null",
  "location_description": "string patokan tempat atau alamat kejadian atau null",
  "description": "string deskripsi singkat kejadian atau null",
  "victim_count": integer atau null,
  "victim_condition": "string kondisi korban atau null",
  "summary": "string ringkasan 1-2 kalimat dari laporan ini",
  "completeness_status": "complete atau incomplete"
}

Pesan dari warga:
"{$text}"
EOT;

        $url = "{$this->baseUrl}/models/{$this->model}:generateContent?key={$this->apiKey}";

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'responseMimeType' => 'application/json',
                'temperature' => 0.1,
            ]
        ];

        try {
            $response = Http::withoutVerifying()->timeout(30)->post($url, $payload);

            if ($response->successful()) {
                $rawJson = $response->json('candidates.0.content.parts.0.text');
                $decoded = json_decode($rawJson, true);

                if (is_array($decoded)) {
                    return $decoded;
                }
            }

            Log::error('Gemini extraction error: ' . $response->body());
        } catch (\Throwable $e) {
            Log::error('Exception Gemini extraction: ' . $e->getMessage());
        }

        return $this->fallbackExtraction($text);
    }

    /**
     * Fallback dasar jika API AI tidak tersedia / limit habis.
     */
    protected function fallbackExtraction(string $text): array
    {
        return [
            'incident_type' => 'Laporan Warga',
            'incident_time' => now()->format('Y-m-d H:i:s'),
            'location_description' => null,
            'description' => $text,
            'victim_count' => null,
            'victim_condition' => null,
            'summary' => mb_substr($text, 0, 150),
            'completeness_status' => 'incomplete',
        ];
    }
}
