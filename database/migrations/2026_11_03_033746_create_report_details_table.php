
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('report_details', function (Blueprint $table) {
            $table->id();

            $table->foreignId('report_id')
                ->constrained('reports')
                ->cascadeOnDelete();

            $table->string('field_name', 50);
            $table->text('field_value')->nullable();

            $table->string('information_status', 20)
                ->default('unknown');

            $table->foreignId('source_message_id')
                ->nullable()
                ->constrained('messages')
                ->nullOnDelete();

            $table->timestamps();

            $table->unique(
                ['report_id', 'field_name'],
                'uq_report_field'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_details');
    }
};
