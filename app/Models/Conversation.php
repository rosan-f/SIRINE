<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    protected $fillable = [
        'reporter_id',
        'report_id',
        'conversation_status',
        'current_question',
        'followup_count',
        'last_message_at',
    ];

    protected function casts(): array
    {
        return [
            'followup_count' => 'integer',
            'last_message_at' => 'datetime',
        ];
    }

    // Relasi ke pelapor
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(Reporter::class);
    }

    // Relasi ke laporan
    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    // Relasi ke pesan
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }
}
