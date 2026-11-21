<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asistencia;
use App\Models\Notificacion;
use App\Models\Reserva;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AsistenciaController extends Controller
{
    public function registrar(Request $request)
    {
        $usuario = $request->user();

        if (!in_array($usuario->rol?->nombre, [
            'ADMINISTRADOR',
            'ORGANIZADOR',
        ], true)) {
            return response()->json([
                'mensaje' => 'No tienes permiso para registrar asistencias.'
            ], 403);
        }

        $datos = $request->validate([
            'codigo_confirmacion' => ['required', 'string'],
            'id_evento' => [
                'required',
                'integer',
                'exists:evento,id_evento',
            ],
        ]);

        return DB::transaction(function () use ($usuario, $datos) {

            $reserva = Reserva::where(
                'codigo_confirmacion',
                $datos['codigo_confirmacion']
            )->lockForUpdate()->first();

            if (!$reserva) {
                return response()->json([
                    'mensaje' => 'Código de confirmación inválido.'
                ], 404);
            }

            if ($reserva->estado !== 'CONFIRMADA') {
                return response()->json([
                    'mensaje' => 'La reserva no está confirmada.'
                ], 422);
            }

            $evento = $reserva->evento;

            if (!$evento || $evento->estado !== 'PROGRAMADO') {
                return response()->json([
                    'mensaje' => 'El evento no está disponible.'
                ], 422);
            }

            if ($reserva->id_evento !== (int) $datos['id_evento']) {
                return response()->json([
                    'mensaje' => 'El código no pertenece al evento seleccionado.'
                ], 422);
            }

            if (
                $usuario->rol?->nombre === 'ORGANIZADOR'
                && (int) $evento->id_organizador !== (int) $usuario->id_usuario
            ) {
                return response()->json([
                    'mensaje' => 'No puedes registrar asistencias de otro organizador.'
                ], 403);
            }

            if (Asistencia::where(
                'id_reserva',
                $reserva->id_reserva
            )->exists()) {
                return response()->json([
                    'mensaje' => 'Esta asistencia ya fue registrada.'
                ], 409);
            }

            // 1. Registrar la asistencia.
            $asistencia = Asistencia::create([
                'id_reserva' => $reserva->id_reserva,
            ]);

            // 2. Notificar al participante.
            Notificacion::create([
                'id_usuario' => $reserva->id_usuario,
                'titulo' => 'Asistencia registrada',
                'mensaje' => 'Tu asistencia al evento "' .
                    $evento->nombre .
                    '" fue registrada correctamente.',
                'leida' => false,
            ]);

            // 3. Notificar al usuario que registró la asistencia.
            if (
                (int) $usuario->id_usuario !==
                (int) $reserva->id_usuario
            ) {
                Notificacion::create([
                    'id_usuario' => $usuario->id_usuario,
                    'titulo' => 'Asistencia confirmada',
                    'mensaje' => 'Registraste correctamente la asistencia ' .
                        'de la reserva #' . $reserva->id_reserva .
                        ' para el evento "' . $evento->nombre . '".',
                    'leida' => false,
                ]);
            }

            return response()->json([
                'mensaje' => 'Asistencia registrada correctamente',
                'asistencia' => $asistencia,
            ], 201);

        }, 3);
    }
}
