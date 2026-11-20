<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EventoController;
use App\Http\Controllers\Api\ReservaController;
use App\Http\Controllers\Api\AsistenciaController;
use App\Http\Controllers\Api\NotificacionController;
// Rutas públicas
Route::post('/login', [AuthController::class, 'login']);

Route::get('/eventos', [EventoController::class, 'index']);

Route::get('/eventos/{id}', [EventoController::class, 'show'])->whereNumber('id');

Route::post('/registro', [AuthController::class, 'registro']);

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/eventos', [EventoController::class, 'store']);
    Route::patch('/eventos/{evento}', [EventoController::class, 'update']);
    Route::patch('/eventos/{evento}/cancelar', [EventoController::class, 'cancelar'])->middleware('auth:sanctum');

    Route::post('/reservas', [ReservaController::class, 'store'])->middleware('auth:sanctum');
    Route::get('/mis-reservas', [ReservaController::class, 'index']);
    Route::patch('/reservas/{reserva}/cancelar',[ReservaController::class, 'cancelar']);

    Route::post('/asistencias', [AsistenciaController::class, 'registrar']);

    // Notificaciones del usuario autenticado
    Route::get('/notificaciones', [NotificacionController::class, 'index']);
    Route::get('/notificaciones/no-leidas', [NotificacionController::class, 'noLeidas']);
    Route::patch('/notificaciones/{id}/leer', [NotificacionController::class, 'marcarLeida']);
});
