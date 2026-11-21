<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
}
