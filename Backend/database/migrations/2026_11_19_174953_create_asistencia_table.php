<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asistencia', function (Blueprint $table) {
            $table->bigIncrements('id_asistencia');

            $table->unsignedBigInteger('id_reserva')
                ->unique();

            $table->timestamp('fecha_registro')
                ->useCurrent();

            $table->foreign('id_reserva')
                ->references('id_reserva')
                ->on('reserva');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asistencia');
    }
};
