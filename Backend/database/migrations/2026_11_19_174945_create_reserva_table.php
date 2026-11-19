<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reserva', function (Blueprint $table) {
            $table->bigIncrements('id_reserva');

            $table->unsignedBigInteger('id_usuario');
            $table->unsignedBigInteger('id_evento');

            $table->timestamp('fecha_reserva')
                ->useCurrent();

            $table->string('estado', 20)
                ->default('CONFIRMADA');

            $table->string('codigo_confirmacion', 50)
                ->unique();

            $table->foreign('id_usuario')
                ->references('id_usuario')
                ->on('usuario');

            $table->foreign('id_evento')
                ->references('id_evento')
                ->on('evento');

            $table->index('id_usuario');
            $table->index('id_evento');
        });

        DB::statement("
            ALTER TABLE reserva
            ADD CONSTRAINT chk_reserva_estado
            CHECK (estado IN (
                'PENDIENTE',
                'CONFIRMADA',
                'CANCELADA'
            ))
        ");
    }

    public function down(): void
    {
        Schema::dropIfExists('reserva');
    }
};
