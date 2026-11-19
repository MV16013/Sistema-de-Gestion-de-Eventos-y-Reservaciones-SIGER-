<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notificacion extends Model
{
    protected $table = 'notificacion';

    protected $primaryKey = 'id_notificacion';

    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'titulo',
        'mensaje',
        'leida',
    ];

    protected $casts = [
        'fecha_envio' => 'datetime',
        'leida' => 'boolean',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(
            Usuario::class,
            'id_usuario',
            'id_usuario'
        );
    }
}
