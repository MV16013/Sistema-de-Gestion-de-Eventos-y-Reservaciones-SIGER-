<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Evento;
use App\Models\Reserva;
use App\Models\Asistencia;

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

    public function reportes(Request $request): JsonResponse
    {
        if ($request->user()->rol?->nombre !== 'ADMINISTRADOR') {
            return response()->json([
                'mensaje' => 'No tienes permisos para consultar reportes.'
            ], 403);
        }

        $resumen = [
            'usuarios' => Usuario::count(),
            'eventos' => Evento::count(),
            'eventos_programados' => Evento::where(
                'estado', 'PROGRAMADO'
            )->count(),
            'eventos_cancelados' => Evento::where(
                'estado', 'CANCELADO'
            )->count(),
            'reservas' => Reserva::count(),
            'reservas_confirmadas' => Reserva::where(
                'estado', 'CONFIRMADA'
            )->count(),
            'reservas_canceladas' => Reserva::where(
                'estado', 'CANCELADA'
            )->count(),
            'asistencias' => Asistencia::count(),
        ];

        $eventos = Evento::query()
            ->withCount([
                'reservas',
                'reservas as confirmadas' => fn ($query) =>
                $query->where('estado', 'CONFIRMADA'),
                'reservas as canceladas' => fn ($query) =>
                $query->where('estado', 'CANCELADA'),
                'reservas as asistencias' => fn ($query) =>
                $query->whereHas('asistencia'),
            ])
            ->orderByDesc('id_evento')
            ->get([
                'id_evento',
                'nombre',
                'estado',
                'capacidad_maxima',
            ]);

        return response()->json([
            'resumen' => $resumen,
            'eventos' => $eventos,
        ]);
    }


}
