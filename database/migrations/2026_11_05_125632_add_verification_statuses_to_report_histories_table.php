<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('report_histories', function (Blueprint $table): void {
            $table->string('previous_verification_status', 30)->nullable();
            $table->string('new_verification_status', 30)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('report_histories', function (Blueprint $table): void {
            $table->dropColumn(['previous_verification_status', 'new_verification_status']);
        });
    }
};
