<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evento', function (Blueprint $table) {
            $table->bigIncrements('id_evento');

            $table->unsignedBigInteger('id_organizador');

            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();

            $table->timestamp('fecha_inicio');
            $table->timestamp('fecha_fin');

            $table->string('ubicacion', 200);
            $table->integer('capacidad_maxima');

            $table->string('estado', 20)
                ->default('PROGRAMADO');

            $table->foreign('id_organizador')
                ->references('id_usuario')
                ->on('usuario');

            $table->index('id_organizador');
        });

        DB::statement("
            ALTER TABLE evento
            ADD CONSTRAINT chk_evento_fechas
            CHECK (fecha_fin > fecha_inicio)
        ");

        DB::statement("
            ALTER TABLE evento
            ADD CONSTRAINT chk_evento_capacidad
            CHECK (capacidad_maxima > 0)
        ");

        DB::statement("
            ALTER TABLE evento
            ADD CONSTRAINT chk_evento_estado
            CHECK (estado IN (
                'PROGRAMADO',
                'CANCELADO',
                'FINALIZADO'
            ))
        ");
    }

    public function down(): void
    {
        Schema::dropIfExists('evento');
    }
};
