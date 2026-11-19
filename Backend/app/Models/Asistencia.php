<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Asistencia extends Model
{
    protected $table = 'asistencia';

    protected $primaryKey = 'id_asistencia';

    public $timestamps = false;

    protected $fillable = [
        'id_reserva',
    ];

    protected $casts = [
        'fecha_registro' => 'datetime',
    ];

    public function reserva(): BelongsTo
    {
        return $this->belongsTo(
            Reserva::class,
            'id_reserva',
            'id_reserva'
        );
    }
}
