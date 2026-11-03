<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();

            $table->string('report_code', 30)->unique();

            $table->foreignId('reporter_id')
                ->constrained('reporters');

            $table->enum('input_type', ['text', 'voice'])
                ->default('text');

            $table->text('original_text')->nullable();
            $table->string('incident_type', 100)->nullable();
            $table->dateTime('incident_time')->nullable();
            $table->text('description')->nullable();
            $table->integer('victim_count')->nullable();
            $table->text('victim_condition')->nullable();

            $table->text('location_description')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('location_source', 30)->nullable();
            $table->string('location_confirmed', 30)
                ->default('unconfirmed');

            $table->text('summary')->nullable();

            $table->string('completeness_status', 20)
                ->default('incomplete');

            $table->string('verification_status', 30)
                ->default('belum_terkonfirmasi');

            $table->string('report_status', 30)
                ->default('baru_diterima');

            $table->timestamps();

            $table->index('report_status', 'idx_reports_status');
            $table->index('created_at', 'idx_reports_created');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
