<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'usuario';

    protected $primaryKey = 'id_usuario';

    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'apellido',
        'correo',
        'password_hash',
        'id_rol',
        'activo',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'fecha_registro' => 'datetime',
        'password_hash' => 'hashed',
    ];

    public function getAuthPasswordName()
    {
        return 'password_hash';
    }

    public function rol(): BelongsTo
    {
        return $this->belongsTo(
            Rol::class,
            'id_rol',
            'id_rol'
        );
    }

    public function eventos(): HasMany
    {
        return $this->hasMany(
            Evento::class,
            'id_organizador',
            'id_usuario'
        );
    }

    public function reservas(): HasMany
    {
        return $this->hasMany(
            Reserva::class,
            'id_usuario',
            'id_usuario'
        );
    }

    public function notificaciones(): HasMany
    {
        return $this->hasMany(
            Notificacion::class,
            'id_usuario',
            'id_usuario'
        );
    }
}
