<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Reserva extends Model
{
    protected $table = 'reserva';

    protected $primaryKey = 'id_reserva';

    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'id_evento',
        'estado',
        'codigo_confirmacion',
    ];

    protected $casts = [
        'fecha_reserva' => 'datetime',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(
            Usuario::class,
            'id_usuario',
            'id_usuario'
        );
    }

    public function evento(): BelongsTo
    {
        return $this->belongsTo(
            Evento::class,
            'id_evento',
            'id_evento'
        );
    }

    public function asistencia(): HasOne
    {
        return $this->hasOne(
            Asistencia::class,
            'id_reserva',
            'id_reserva'
        );
    }
}
