<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notificacion', function (Blueprint $table) {
            $table->bigIncrements('id_notificacion');

            $table->unsignedBigInteger('id_usuario');

            $table->string('titulo', 150);
            $table->text('mensaje');

            $table->timestamp('fecha_envio')
                ->useCurrent();

            $table->boolean('leida')
                ->default(false);

            $table->foreign('id_usuario')
                ->references('id_usuario')
                ->on('usuario');

            $table->index('id_usuario');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notificacion');
    }
};
