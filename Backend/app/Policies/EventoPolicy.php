<?php

namespace App\Policies;

use App\Models\Evento;
use App\Models\Usuario;

class EventoPolicy
{
    public function viewAny(?Usuario $usuario): bool
    {
        return true;
    }

    public function view(?Usuario $usuario, Evento $evento): bool
    {
        return $evento->estado === 'PROGRAMADO';
    }

    public function create(Usuario $usuario): bool
    {
        return in_array($usuario->rol?->nombre, [
            'ADMINISTRADOR',
            'ORGANIZADOR',
        ], true);
    }

    public function update(Usuario $usuario, Evento $evento): bool
    {
        if ($evento->estado !== 'PROGRAMADO') {
            return false;
        }

        return $usuario->rol?->nombre === 'ADMINISTRADOR'
            || (
                $usuario->rol?->nombre === 'ORGANIZADOR'
                && $evento->id_organizador === $usuario->id_usuario
            );
    }

    public function cancel(Usuario $usuario, Evento $evento): bool
    {
        return $this->update($usuario, $evento);
    }

    public function delete(Usuario $usuario, Evento $evento): bool
    {
        return false;
    }
}

