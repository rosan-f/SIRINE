<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();

            $table->foreignId('conversation_id')
                ->constrained('conversations');

            $table->foreignId('report_id')
                ->nullable()
                ->constrained('reports')
                ->nullOnDelete();

            $table->string('wa_message_id', 100)->unique();

            $table->enum('direction', ['inbound', 'outbound']);

            $table->enum('message_type', [
                'text',
                'audio',
                'location',
                'other'
            ])->default('text');

            $table->text('body')->nullable();
            $table->string('audio_path', 255)->nullable();
            $table->text('transcript')->nullable();

            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            $table->string('process_status', 20)
                ->default('pending');

            $table->timestamp('created_at')->nullable();

            $table->index(
                ['conversation_id', 'created_at'],
                'idx_msg_conv_time'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
