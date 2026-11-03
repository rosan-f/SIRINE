<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'conversation_id',
        'report_id',
        'wa_message_id',
        'direction',
        'message_type',
        'body',
        'audio_path',
        'transcript',
        'latitude',
        'longitude',
        'process_status',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'created_at' => 'datetime',
        ];
    }

    // Relasi ke percakapan
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    // Relasi ke laporan
    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }
}
