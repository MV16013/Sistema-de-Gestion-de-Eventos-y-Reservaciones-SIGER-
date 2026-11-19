<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Evento extends Model
{
    protected $table = 'evento';

    protected $primaryKey = 'id_evento';

    public $timestamps = false;

    protected $fillable = [
        'id_organizador',
        'nombre',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'ubicacion',
        'capacidad_maxima',
        'estado',
    ];

    protected $casts = [
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
        'capacidad_maxima' => 'integer',
    ];

    public function organizador(): BelongsTo
    {
        return $this->belongsTo(
            Usuario::class,
            'id_organizador',
            'id_usuario'
        );
    }

    public function reservas(): HasMany
    {
        return $this->hasMany(
            Reserva::class,
            'id_evento',
            'id_evento'
        );
    }
}
