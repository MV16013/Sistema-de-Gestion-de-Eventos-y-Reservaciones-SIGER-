<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\Rol;
use Illuminate\Validation\Rules\Password;

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

    public function registro(Request $request)
    {
        $datos = $request->validate([
            'nombre' => ['required', 'string', 'max:100'],
            'apellido' => ['required', 'string', 'max:100'],
            'correo' => [
                'required',
                'email',
                'max:150',
                'unique:usuario,correo',
            ],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)->letters()->numbers(),
            ],
            'id_rol' => ['prohibited'],
        ]);

        $rol = Rol::where('nombre', 'PARTICIPANTE')->firstOrFail();

        $usuario = Usuario::create([
            'nombre' => $datos['nombre'],
            'apellido' => $datos['apellido'],
            'correo' => $datos['correo'],
            'password_hash' => $datos['password'],
            'id_rol' => $rol->id_rol,
            'activo' => true,
        ]);

        return response()->json([
            'mensaje' => 'Participante registrado correctamente',
            'usuario' => [
                'id_usuario' => $usuario->id_usuario,
                'nombre' => $usuario->nombre,
                'apellido' => $usuario->apellido,
                'correo' => $usuario->correo,
                'rol' => 'PARTICIPANTE',
            ],
        ], 201);
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
