<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EventoController;

// Rutas públicas
Route::post('/login', [AuthController::class, 'login']);

Route::get('/eventos', [EventoController::class, 'index']);

Route::get('/eventos/{id}', [EventoController::class, 'show'])
    ->whereNumber('id');

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/eventos', [EventoController::class, 'store']);
    Route::patch('/eventos/{evento}', [EventoController::class, 'update']);
    Route::patch('/eventos/{evento}/cancelar', [EventoController::class, 'cancelar'])
        ->middleware('auth:sanctum');
});
