<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evento;
use App\Models\Reserva;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReservaController extends Controller
{
    public function store(Request $request)
    {
        $usuario = $request->user();

        // Solo los participantes pueden reservar.
        if ($usuario->rol?->nombre !== 'PARTICIPANTE') {
            return response()->json([
                'mensaje' => 'Solo los participantes pueden reservar eventos.'
            ], 403);
        }

        $datos = $request->validate([
            'id_evento' => ['required', 'integer', 'exists:evento,id_evento'],
        ]);

        return DB::transaction(function () use ($usuario, $datos) {

            // Bloqueamos el evento para evitar sobreventas.
            $evento = Evento::where(
                'id_evento',
                $datos['id_evento']
            )->lockForUpdate()->firstOrFail();

            if ($evento->estado !== 'PROGRAMADO') {
                return response()->json([
                    'mensaje' => 'El evento no está disponible.'
                ], 422);
            }

            // Verificar si ya existe una reserva activa.
            $duplicada = Reserva::where('id_usuario', $usuario->id_usuario)
                ->where('id_evento', $evento->id_evento)
                ->whereIn('estado', ['PENDIENTE', 'CONFIRMADA'])
                ->exists();

            if ($duplicada) {
                return response()->json([
                    'mensaje' => 'Ya tienes una reserva para este evento.'
                ], 409);
            }

            // Contar las reservas que ocupan cupos.
            $ocupados = Reserva::where('id_evento', $evento->id_evento)
                ->whereIn('estado', ['PENDIENTE', 'CONFIRMADA'])
                ->count();

            if ($ocupados >= $evento->capacidad_maxima) {
                return response()->json([
                    'mensaje' => 'No quedan cupos disponibles.'
                ], 409);
            }

            $reserva = Reserva::create([
                'id_usuario' => $usuario->id_usuario,
                'id_evento' => $evento->id_evento,
                'estado' => 'CONFIRMADA',
                'codigo_confirmacion' => 'SIGER-' . Str::upper(
                        Str::random(12)
                    ),
            ]);

            return response()->json([
                'mensaje' => 'Reserva creada correctamente',
                'reserva' => $reserva,
            ], 201);
        }, 3);
    }

    public function index(Request $request)
    {
        $usuario = $request->user();

        $reservas = Reserva::where(
            'id_usuario',
            $usuario->id_usuario
        )
            ->with('evento')
            ->orderByDesc('fecha_reserva')
            ->get();

        return response()->json([
            'mensaje' => 'Reservas consultadas correctamente',
            'reservas' => $reservas,
        ]);
    }

    public function cancelar(Request $request, Reserva $reserva)
    {
        $usuario = $request->user();

        if ($usuario->rol?->nombre !== 'PARTICIPANTE') {
            return response()->json([
                'mensaje' => 'Solo los participantes pueden cancelar reservas.'
            ], 403);
        }

        if ($reserva->id_usuario !== $usuario->id_usuario) {
            return response()->json([
                'mensaje' => 'No tienes permiso para cancelar esta reserva.'
            ], 403);
        }

        return DB::transaction(function () use ($reserva) {

            $reserva = Reserva::where(
                'id_reserva',
                $reserva->id_reserva
            )->lockForUpdate()->firstOrFail();

            if ($reserva->estado === 'CANCELADA') {
                return response()->json([
                    'mensaje' => 'Esta reserva ya está cancelada.'
                ], 409);
            }

            $reserva->estado = 'CANCELADA';
            $reserva->save();

            return response()->json([
                'mensaje' => 'Reserva cancelada correctamente',
                'reserva' => $reserva,
            ]);
        }, 3);
    }
}

