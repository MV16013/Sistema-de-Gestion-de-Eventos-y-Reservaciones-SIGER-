<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use Illuminate\Http\Request;

class NotificacionController extends Controller
{
    // Consultar notificaciones del usuario autenticado.
    public function index(Request $request)
    {
        $notificaciones = Notificacion::where(
            'id_usuario',
            $request->user()->id_usuario
        )
            ->orderByDesc('fecha_envio')
            ->orderByDesc('id_notificacion')
            ->get();

        return response()->json([
            'mensaje' => 'Notificaciones consultadas correctamente',
            'notificaciones' => $notificaciones,
        ]);
    }

    // Contar notificaciones pendientes.
    public function noLeidas(Request $request)
    {
        $total = Notificacion::where(
            'id_usuario',
            $request->user()->id_usuario
        )
            ->where('leida', false)
            ->count();

        return response()->json([
            'no_leidas' => $total,
        ]);
    }

    // Marcar una notificación como leída.
    public function marcarLeida(Request $request, int $id)
    {
        $notificacion = Notificacion::where(
            'id_usuario',
            $request->user()->id_usuario
        )
            ->where('id_notificacion', $id)
            ->firstOrFail();

        $notificacion->update([
            'leida' => true,
        ]);

        return response()->json([
            'mensaje' => 'Notificación marcada como leída',
            'notificacion' => $notificacion,
        ]);
    }
}
