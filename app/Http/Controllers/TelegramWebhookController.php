<?php

namespace App\Http\Controllers;

use App\Services\IncidentReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TelegramWebhookController extends Controller
{
    public function __construct(
        protected IncidentReportService $incidentReportService
    ) {}

    /**
     * Endpoint untuk menerima Webhook dari Telegram Bot.
     */
    public function handle(Request $request): JsonResponse
    {
        // Validasi secret token webhook jika dikonfigurasi di .env
        $configuredSecret = config('services.telegram.webhook_secret', env('TELEGRAM_WEBHOOK_SECRET'));
        if (! empty($configuredSecret)) {
            $incomingSecret = $request->header('X-Telegram-Bot-Api-Secret-Token');
            if ($incomingSecret !== $configuredSecret) {
                Log::warning('Telegram webhook secret token tidak valid');
                return response()->json(['error' => 'Unauthorized'], 401);
            }
        }

        $payload = $request->all();

        try {
            $this->incidentReportService->handleIncomingTelegramUpdate($payload);
        } catch (\Throwable $e) {
            Log::error('Error processing telegram webhook: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
        }

        // Telegram mengharuskan respons 200 OK sesegera mungkin
        return response()->json(['ok' => true]);
    }
}
