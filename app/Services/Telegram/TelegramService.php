<?php

namespace App\Services\Telegram;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    protected string $botToken;
    protected string $baseUrl;

    public function __construct()
    {
        $this->botToken = (string) config('services.telegram.bot_token', env('TELEGRAM_BOT_TOKEN', ''));
        $this->baseUrl = "https://api.telegram.org/bot{$this->botToken}";
    }

    /**
     * Kirim pesan teks ke chat Telegram.
     */
    public function sendMessage(string|int $chatId, string $text, ?int $replyToMessageId = null, ?string $parseMode = 'HTML'): ?array
    {
        if (empty($this->botToken)) {
            Log::warning('Telegram bot token belum disetel di .env');
            return null;
        }

        $params = [
            'chat_id' => $chatId,
            'text' => $text,
        ];

        if ($parseMode) {
            $params['parse_mode'] = $parseMode;
        }

        if ($replyToMessageId) {
            $params['reply_parameters'] = [
                'message_id' => $replyToMessageId,
            ];
        }

        try {
            $response = Http::withoutVerifying()->timeout(10)->post("{$this->baseUrl}/sendMessage", $params);

            // Jika gagal karena parse mode/formatting, kirim ulang sebagai plain text
            if (! $response->successful() && isset($params['parse_mode'])) {
                Log::warning('Telegram formatting error, retrying without parse_mode: ' . $response->body());
                unset($params['parse_mode']);
                $response = Http::withoutVerifying()->timeout(10)->post("{$this->baseUrl}/sendMessage", $params);
            }

            return $response->json();
        } catch (\Throwable $e) {
            Log::error('Gagal mengirim pesan Telegram: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Dapatkan info file untuk download (voice note/audio).
     */
    public function getFile(string $fileId): ?array
    {
        try {
            $response = Http::withoutVerifying()->timeout(10)->get("{$this->baseUrl}/getFile", [
                'file_id' => $fileId,
            ]);

            if ($response->successful() && $response->json('ok')) {
                return $response->json('result');
            }
        } catch (\Throwable $e) {
            Log::error('Gagal mengambil file Telegram: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Unduh file biner dari server Telegram.
     */
    public function downloadFile(string $filePath): ?string
    {
        $fileUrl = "https://api.telegram.org/file/bot{$this->botToken}/{$filePath}";

        try {
            $response = Http::withoutVerifying()->timeout(30)->get($fileUrl);
            if ($response->successful()) {
                return $response->body();
            }
        } catch (\Throwable $e) {
            Log::error('Gagal mengunduh file Telegram: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Ambil update pesan menggunakan Long Polling (berguna untuk testing lokal).
     */
    public function getUpdates(?int $offset = null, int $limit = 10, int $timeout = 0): array
    {
        $params = [
            'limit' => $limit,
            'timeout' => $timeout,
        ];

        if ($offset !== null) {
            $params['offset'] = $offset;
        }

        try {
            $response = Http::withoutVerifying()->timeout($timeout + 10)->get("{$this->baseUrl}/getUpdates", $params);
            if ($response->successful() && $response->json('ok')) {
                return $response->json('result', []);
            }
        } catch (\Throwable $e) {
            Log::error('Gagal getUpdates Telegram: ' . $e->getMessage());
        }

        return [];
    }

    /**
     * Pasang Webhook Telegram.
     */
    public function setWebhook(string $url, ?string $secretToken = null): array
    {
        $params = ['url' => $url];
        if (!empty($secretToken)) {
            $params['secret_token'] = $secretToken;
        }

        try {
            $response = Http::withoutVerifying()->timeout(10)->post("{$this->baseUrl}/setWebhook", $params);
            return $response->json() ?? [];
        } catch (\Throwable $e) {
            return ['ok' => false, 'description' => $e->getMessage()];
        }
    }

    /**
     * Hapus Webhook Telegram (kembali ke mode getUpdates/polling).
     */
    public function deleteWebhook(): array
    {
        try {
            $response = Http::withoutVerifying()->timeout(10)->post("{$this->baseUrl}/deleteWebhook");
            return $response->json() ?? [];
        } catch (\Throwable $e) {
            return ['ok' => false, 'description' => $e->getMessage()];
        }
    }
}
