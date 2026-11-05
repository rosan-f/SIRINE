<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportHistory extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'report_id',
        'admin_id',
        'previous_status',
        'new_status',
        'previous_verification_status',
        'new_verification_status',
        'notes',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    // Relasi ke laporan
    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    // Relasi ke admin
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
