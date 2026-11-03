<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportDetail extends Model
{
    protected $fillable = [
        'report_id',
        'field_name',
        'field_value',
        'information_status',
        'source_message_id',
    ];

    // Relasi ke laporan
    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    // Relasi ke pesan sumber informasi
    public function sourceMessage(): BelongsTo
    {
        return $this->belongsTo(
            Message::class,
            'source_message_id'
        );
    }
}
