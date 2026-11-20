
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const formularioInicial = {
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    ubicacion: '',
    capacidad_maxima: '',
};

export default function CrearEvento() {
    const navigate = useNavigate();

    const [formulario, setFormulario] = useState(formularioInicial);
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    function cambiarCampo(e) {
        const { name, value } = e.target;

        setFormulario(anterior => ({
            ...anterior,
            [name]: value,
        }));
    }

    async function guardarEvento(e) {
        e.preventDefault();
        setError('');

        if (new Date(formulario.fecha_fin) <= new Date(formulario.fecha_inicio)) {
            setError('La fecha de finalización debe ser posterior al inicio.');
            return;
        }

        setCargando(true);

        try {
            const datos = {
                ...formulario,
                capacidad_maxima: Number(formulario.capacidad_maxima),
            };

            await api.post('/eventos', datos);

            navigate('/organizador/eventos', {
                replace: true,
                state: { mensaje: 'Evento creado correctamente.' },
            });

        } catch (err) {
            const errores = err.response?.data?.errors;
            const detalle = errores
                ? Object.values(errores).flat().join(' ')
                : null;

            setError(
                detalle ||
                err.response?.data?.mensaje ||
                err.response?.data?.message ||
                'No se pudo crear el evento.'
            );

        } finally {
            setCargando(false);
        }
    }

    return (
        <main className="siger-contenido">
            <div className="siger-encabezado mb-4">
                <h1>Crear evento</h1>
                <p className="siger-sec">
                    Completa la información para publicar un nuevo evento.
                </p>
            </div>

            <Link
                to="/organizador"
                className="btn btn-outline-primary mb-4"
            >
                <i className="bi bi-arrow-left me-2" />
                Volver al panel
            </Link>

            <form
                className="siger-tarjeta p-4"
                onSubmit={guardarEvento}
                style={{ maxWidth: '800px' }}
            >
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                <div className="mb-3">
                    <label htmlFor="nombre" className="form-label">
                        Nombre del evento
                    </label>
                    <input
                        id="nombre"
                        name="nombre"
                        className="form-control"
                        maxLength={150}
                        value={formulario.nombre}
                        onChange={cambiarCampo}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="descripcion" className="form-label">
                        Descripción
                    </label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        className="form-control"
                        rows={4}
                        value={formulario.descripcion}
                        onChange={cambiarCampo}
                    />
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="fecha_inicio" className="form-label">
                            Fecha de inicio
                        </label>
                        <input
                            id="fecha_inicio"
                            type="datetime-local"
                            name="fecha_inicio"
                            className="form-control"
                            value={formulario.fecha_inicio}
                            onChange={cambiarCampo}
                            required
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label htmlFor="fecha_fin" className="form-label">
                            Fecha de finalización
                        </label>
                        <input
                            id="fecha_fin"
                            type="datetime-local"
                            name="fecha_fin"
                            className="form-control"
                            value={formulario.fecha_fin}
                            onChange={cambiarCampo}
                            required
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label htmlFor="ubicacion" className="form-label">
                        Ubicación
                    </label>
                    <input
                        id="ubicacion"
                        name="ubicacion"
                        className="form-control"
                        maxLength={200}
                        value={formulario.ubicacion}
                        onChange={cambiarCampo}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="capacidad_maxima" className="form-label">
                        Capacidad máxima
                    </label>
                    <input
                        id="capacidad_maxima"
                        type="number"
                        name="capacidad_maxima"
                        className="form-control"
                        min="1"
                        step="1"
                        value={formulario.capacidad_maxima}
                        onChange={cambiarCampo}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={cargando}
                >
                    <i className="bi bi-calendar-plus me-2" />
                    {cargando ? 'Guardando...' : 'Crear evento'}
                </button>
            </form>
        </main>
    );
}
