<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Report extends Model
{
    protected $fillable = [
        'report_code',
        'reporter_id',
        'input_type',
        'original_text',
        'incident_type',
        'incident_time',
        'description',
        'victim_count',
        'victim_condition',
        'location_description',
        'latitude',
        'longitude',
        'location_source',
        'location_confirmed',
        'summary',
        'completeness_status',
        'verification_status',
        'report_status',
    ];

    protected function casts(): array
    {
        return [
            'incident_time' => 'datetime',
            'victim_count' => 'integer',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    // Relasi ke pelapor
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(Reporter::class);
    }

    // Relasi ke percakapan
    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    // Relasi ke pesan
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    // Relasi ke detail laporan
    public function details(): HasMany
    {
        return $this->hasMany(ReportDetail::class);
    }

    // Relasi ke riwayat laporan
    public function histories(): HasMany
    {
        return $this->hasMany(ReportHistory::class);
    }
}
