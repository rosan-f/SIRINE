<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reporter extends Model
{
    protected $fillable = [
        'whatsapp_number',
        'name',
    ];

    // Relasi ke laporan
    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    // Relasi ke percakapan
    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }
}