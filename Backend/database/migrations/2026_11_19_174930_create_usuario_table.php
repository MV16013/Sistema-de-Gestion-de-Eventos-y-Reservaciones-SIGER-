<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuario', function (Blueprint $table) {
            $table->bigIncrements('id_usuario');

            $table->string('nombre', 100);
            $table->string('apellido', 100);
            $table->string('correo', 150)->unique();
            $table->string('password_hash', 255);

            $table->unsignedInteger('id_rol');

            $table->timestamp('fecha_registro')
                ->useCurrent();

            $table->boolean('activo')->default(true);

            $table->foreign('id_rol')
                ->references('id_rol')
                ->on('rol');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuario');
    }
};
