<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'correo' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $usuario = Usuario::where(
            'correo',
            $datos['correo']
        )->first();

        if (
            !$usuario ||
            !$usuario->activo ||
            !Hash::check(
                $datos['password'],
                $usuario->password_hash
            )
        ) {
            throw ValidationException::withMessages([
                'correo' => ['Credenciales incorrectas.'],
            ]);
        }

        $token = $usuario->createToken(
            'siger-api',
            ['*'],
            now()->addHours(8)
        )->plainTextToken;

        return response()->json([
            'mensaje' => 'Inicio de sesión exitoso',
            'usuario' => [
                'id_usuario' => $usuario->id_usuario,
                'nombre' => $usuario->nombre,
                'apellido' => $usuario->apellido,
                'correo' => $usuario->correo,
                'rol' => $usuario->rol->nombre,
            ],
            'token' => $token,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $usuario = $request->user();

        return response()->json([
            'id_usuario' => $usuario->id_usuario,
            'nombre' => $usuario->nombre,
            'apellido' => $usuario->apellido,
            'correo' => $usuario->correo,
            'rol' => $usuario->rol->nombre,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'mensaje' => 'Sesión cerrada correctamente',
        ]);
    }
}
