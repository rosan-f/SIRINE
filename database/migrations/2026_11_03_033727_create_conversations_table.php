<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('reporter_id')
                ->constrained('reporters');

            $table->foreignId('report_id')
                ->nullable()
                ->constrained('reports')
                ->nullOnDelete();

            $table->string('conversation_status', 20)
                ->default('active');

            $table->string('current_question', 100)->nullable();

            $table->unsignedTinyInteger('followup_count')
                ->default(0);

            $table->timestamp('last_message_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
