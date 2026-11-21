<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Evento;

class AdminController extends Controller
{
    public function usuarios(Request $request): JsonResponse
    {
        // Solo el administrador puede consultar usuarios.
        if ($request->user()->rol?->nombre !== 'ADMINISTRADOR') {
            return response()->json([
                'mensaje' => 'No tienes permisos para consultar usuarios.'
            ], 403);
        }

        // Obtener usuarios junto con su rol.
        // No se devuelven contraseñas ni tokens.
        $usuarios = Usuario::query()
            ->with('rol:id_rol,nombre')
            ->orderBy('id_usuario')
            ->get([
                'id_usuario',
                'nombre',
                'apellido',
                'correo',
                'id_rol',
                'activo',
                'fecha_registro',
            ]);

        return response()->json([
            'mensaje' => 'Usuarios consultados correctamente.',
            'total' => $usuarios->count(),
            'usuarios' => $usuarios,
        ]);
    }


    public function eventos(Request $request): JsonResponse
    {
        if ($request->user()->rol?->nombre !== 'ADMINISTRADOR') {
            return response()->json([
                'mensaje' => 'No tienes permisos para consultar eventos.'
            ], 403);
        }

        $eventos = Evento::query()
            ->with([
                'organizador:id_usuario,nombre,apellido,correo'
            ])
            ->withCount([
                'reservas',
                'reservas as reservas_confirmadas' => function ($query) {
                    $query->where('estado', 'CONFIRMADA');
                },
            ])
            ->orderByDesc('id_evento')
            ->get();

        return response()->json([
            'mensaje' => 'Eventos consultados correctamente.',
            'total' => $eventos->count(),
            'eventos' => $eventos,
        ]);
    }

}
