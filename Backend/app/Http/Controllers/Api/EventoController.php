<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

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

    public function cancelar(\Illuminate\Http\Request $request, \App\Models\Evento $evento)
    {
        // Verificar permisos del usuario autenticado
        \Illuminate\Support\Facades\Gate::authorize('cancel', $evento);

        // Cambiar el estado sin eliminar el registro
        $evento->estado = 'CANCELADO';
        $evento->save();

        return response()->json([
            'mensaje' => 'Evento cancelado correctamente',
            'evento' => $evento
        ], 200);
    }

}
