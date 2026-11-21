<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command?->warn('UsuarioSeeder omitido: entorno de producción.');

            return;
        }

        $password = env('SIGER_SEED_PASSWORD', 'Siger12345');

        $usuarios = [
            ['Admin', 'SIGER', 'admin@siger.test', 'ADMINISTRADOR'],
            ['Olivia', 'Organizadora', 'organizador@siger.test', 'ORGANIZADOR'],
            ['Pablo', 'Participante', 'participante@siger.test', 'PARTICIPANTE'],
        ];

        foreach ($usuarios as [$nombre, $apellido, $correo, $rolNombre]) {
            $rol = Rol::where('nombre', $rolNombre)->firstOrFail();

            Usuario::firstOrCreate(
                ['correo' => $correo],
                [
                    'nombre' => $nombre,
                    'apellido' => $apellido,
                    'password_hash' => $password,
                    'id_rol' => $rol->id_rol,
                    'activo' => true,
                ]
            );
        }
    }
}