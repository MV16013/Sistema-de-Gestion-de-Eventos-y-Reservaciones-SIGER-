<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Models\Reserva;
use App\Models\Asistencia;
use App\Models\Notificacion;
use App\Models\Usuario;
use Illuminate\Support\Facades\DB;

class EventoController extends Controller
{
    public function index(): JsonResponse
    {
        $eventos = Evento::query()
            ->where('estado', 'PROGRAMADO')
            ->orderBy('fecha_inicio')
            ->get([
                'id_evento',
                'nombre',
                'descripcion',
                'fecha_inicio',
                'fecha_fin',
                'ubicacion',
                'capacidad_maxima',
                'estado',
            ]);

        return response()->json($eventos);
    }

    public function misEventos(Request $request): JsonResponse
    {
        // Solo organizadores y administradores.
        abort_unless(
            in_array($request->user()->rol?->nombre, [
                'ORGANIZADOR',
                'ADMINISTRADOR',
            ], true),
            403,
            'No tienes permisos para consultar estos eventos.'
        );

        // Obtener únicamente los eventos del usuario autenticado.
        $eventos = Evento::query()
            ->where('id_organizador', $request->user()->id_usuario)
            ->orderByDesc('id_evento')
            ->get();

        return response()->json([
            'eventos' => $eventos,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $evento = Evento::query()
            ->where('estado', 'PROGRAMADO')
            ->findOrFail($id, [
                'id_evento',
                'nombre',
                'descripcion',
                'fecha_inicio',
                'fecha_fin',
                'ubicacion',
                'capacidad_maxima',
                'estado',
            ]);

        return response()->json($evento);
    }


    public function store(Request $request): JsonResponse
    {
        Gate::authorize('create', Evento::class);

        $datos = $request->validate([
            'nombre' => ['required', 'string', 'max:150'],
            'descripcion' => ['nullable', 'string'],
            'fecha_inicio' => ['required', 'date', 'after:now'],
            'fecha_fin' => ['required', 'date', 'after:fecha_inicio'],
            'ubicacion' => ['required', 'string', 'max:200'],
            'capacidad_maxima' => ['required', 'integer', 'min:1'],
        ]);

        $evento = new Evento();

        $evento->nombre = $datos['nombre'];
        $evento->descripcion = $datos['descripcion'] ?? null;
        $evento->fecha_inicio = $datos['fecha_inicio'];
        $evento->fecha_fin = $datos['fecha_fin'];
        $evento->ubicacion = $datos['ubicacion'];
        $evento->capacidad_maxima = $datos['capacidad_maxima'];
        $evento->estado = 'PROGRAMADO';

        // El organizador se obtiene del token,
        // nunca del JSON enviado por el cliente.
        $evento->id_organizador = $request->user()->id_usuario;

        $evento->save();

        return response()->json([
            'mensaje' => 'Evento creado correctamente',
            'evento' => $evento,
        ], 201);
    }

    public function editar(Request $request, Evento $evento): JsonResponse
    {
        // Verificar que el usuario pueda editar este evento.
        Gate::authorize('update', $evento);

        return response()->json([
            'evento' => $evento,
        ]);
    }
    public function update(Request $request, Evento $evento)
    {
        Gate::authorize('update', $evento);

        $datos = $request->validate([
            'nombre' => ['sometimes', 'required', 'string', 'max:150'],
            'descripcion' => ['sometimes', 'nullable', 'string'],
            'fecha_inicio' => ['sometimes', 'required', 'date'],
            'fecha_fin' => ['sometimes', 'required', 'date'],
            'ubicacion' => ['sometimes', 'required', 'string', 'max:200'],
            'capacidad_maxima' => [
                'sometimes',
                'required',
                'integer',
                'min:1'
            ],
        ]);

        $inicio = $datos['fecha_inicio'] ?? $evento->fecha_inicio;
        $fin = $datos['fecha_fin'] ?? $evento->fecha_fin;

        if (strtotime($fin) <= strtotime($inicio)) {
            return response()->json([
                'mensaje' => 'La fecha de finalización debe ser posterior al inicio.'
            ], 422);
        }

        $evento->update($datos);

        return response()->json([
            'mensaje' => 'Evento actualizado correctamente',
            'evento' => $evento->fresh()
        ]);
    }

    public function cancelar(Request $request, Evento $evento)
    {
        Gate::authorize('cancel', $evento);

        return DB::transaction(function () use ($request, $evento) {

            // Evitar cancelar dos veces el mismo evento.
            if ($evento->estado !== 'PROGRAMADO') {
                return response()->json([
                    'mensaje' => 'El evento ya no está disponible para cancelar.'
                ], 422);
            }

            // Cancelar el evento.
            $evento->estado = 'CANCELADO';
            $evento->save();

            // Buscar a todos los administradores.
            $administradores = Usuario::whereHas('rol', function ($query) {
                $query->where('nombre', 'ADMINISTRADOR');
            })->get();

            // Crear una notificación para cada administrador.
            foreach ($administradores as $administrador) {

                Notificacion::create([
                    'id_usuario' => $administrador->id_usuario,
                    'titulo' => 'Evento cancelado',
                    'mensaje' => 'El evento "' . $evento->nombre .
                        '" fue cancelado por ' .
                        $request->user()->nombre . '.',
                    'leida' => false,
                ]);
            }

            return response()->json([
                'mensaje' => 'Evento cancelado correctamente',
                'evento' => $evento,
            ]);
        }, 3);
    }

    public function participantes(Request $request, Evento $evento): JsonResponse
    {
        $usuario = $request->user();

        // Solo organizadores y administradores.
        if (!in_array($usuario->rol?->nombre, [
            'ORGANIZADOR',
            'ADMINISTRADOR',
        ], true)) {
            return response()->json([
                'mensaje' => 'No tienes permiso para consultar participantes.'
            ], 403);
        }

        // Un organizador solamente puede consultar sus eventos.
        if (
            $usuario->rol?->nombre === 'ORGANIZADOR'
            && $evento->id_organizador !== $usuario->id_usuario
        ) {
            return response()->json([
                'mensaje' => 'Este evento pertenece a otro organizador.'
            ], 403);
        }

        $reservas = $evento->reservas()
            ->with([
                'usuario:id_usuario,nombre,apellido,correo',
                'asistencia:id_asistencia,id_reserva,fecha_registro',
            ])
            ->orderByDesc('fecha_reserva')
            ->get()
            ->map(function ($reserva) {
                return [
                    'id_reserva' => $reserva->id_reserva,
                    'participante' => [
                        'nombre' => $reserva->usuario?->nombre,
                        'apellido' => $reserva->usuario?->apellido,
                        'correo' => $reserva->usuario?->correo,
                    ],
                    'codigo_confirmacion' => $reserva->codigo_confirmacion,
                    'estado' => $reserva->estado,
                    'fecha_reserva' => $reserva->fecha_reserva,
                    'asistencia_registrada' => $reserva->asistencia !== null,
                    'fecha_asistencia' => $reserva->asistencia?->fecha_registro,
                ];
            });

        return response()->json([
            'evento' => [
                'id_evento' => $evento->id_evento,
                'nombre' => $evento->nombre,
                'estado' => $evento->estado,
                'capacidad_maxima' => $evento->capacidad_maxima,
            ],
            'resumen' => [
                'total_reservas' => $reservas->count(),
                'confirmadas' => $reservas->where('estado', 'CONFIRMADA')->count(),
                'pendientes' => $reservas->where('estado', 'PENDIENTE')->count(),
                'canceladas' => $reservas->where('estado', 'CANCELADA')->count(),
                'asistencias' => $reservas->where('asistencia_registrada', true)->count(),
            ],
            'participantes' => $reservas->values(),
        ]);
    }


    public function resumenOrganizador(Request $request)
    {
        $usuario = $request->user();

        if ($usuario->rol?->nombre !== 'ORGANIZADOR') {
            return response()->json([
                'mensaje' => 'No tienes permiso para consultar este resumen.'
            ], 403);
        }

        $eventos = Evento::where(
            'id_organizador',
            $usuario->id_usuario
        );

        $totalEventos = (clone $eventos)->count();

        $participantes = Reserva::whereHas('evento', function ($query) use ($usuario) {
            $query->where('id_organizador', $usuario->id_usuario);
        })
            ->whereIn('estado', ['PENDIENTE', 'CONFIRMADA'])
            ->count();

        $asistencias = Asistencia::whereHas('reserva.evento', function ($query) use ($usuario) {
            $query->where('id_organizador', $usuario->id_usuario);
        })
            ->count();

        return response()->json([
            'resumen' => [
                'mis_eventos' => $totalEventos,
                'participantes_inscritos' => $participantes,
                'asistencias' => $asistencias,
            ]
        ]);
    }


}
