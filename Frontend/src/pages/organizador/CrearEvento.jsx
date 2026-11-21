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

function fechaLocalActual() {
    const ahora = new Date();
    const diferencia = ahora.getTimezoneOffset() * 60000;

    return new Date(ahora.getTime() - diferencia)
        .toISOString()
        .slice(0, 16);
}

export default function CrearEvento() {
    const navigate = useNavigate();

    const [formulario, setFormulario] = useState(formularioInicial);
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const fechaMinima = fechaLocalActual();

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

        const inicio = new Date(formulario.fecha_inicio);
        const fin = new Date(formulario.fecha_fin);

        if (
            Number.isNaN(inicio.getTime()) ||
            Number.isNaN(fin.getTime())
        ) {
            setError('Selecciona fechas válidas.');
            return;
        }

        if (inicio <= new Date()) {
            setError('La fecha de inicio debe ser futura.');
            return;
        }

        if (fin <= inicio) {
            setError(
                'La fecha de finalización debe ser posterior al inicio.'
            );
            return;
        }

        if (
            !Number.isInteger(Number(formulario.capacidad_maxima)) ||
            Number(formulario.capacidad_maxima) < 1
        ) {
            setError('La capacidad debe ser un número entero mayor que cero.');
            return;
        }

        setCargando(true);

        try {
            const datos = {
                ...formulario,
                nombre: formulario.nombre.trim(),
                descripcion: formulario.descripcion.trim(),
                ubicacion: formulario.ubicacion.trim(),
                capacidad_maxima: Number(formulario.capacidad_maxima),
            };

            await api.post('/eventos', datos);

            navigate('/organizador/eventos', {
                replace: true,
                state: {
                    mensaje: 'Evento creado correctamente.',
                },
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
                    Organiza y publica un nuevo evento en SIGER.
                </p>
            </div>

            <div className="d-flex flex-wrap gap-2 mb-4">
                <Link
                    to="/organizador"
                    className="btn btn-outline-primary"
                >
                    <i className="bi bi-arrow-left me-2" />
                    Volver al panel
                </Link>

                <Link
                    to="/organizador/eventos"
                    className="btn btn-outline-secondary"
                >
                    <i className="bi bi-calendar-event me-2" />
                    Mis eventos
                </Link>
            </div>

            <form onSubmit={guardarEvento}>
                {error && (
                    <div className="alert alert-danger" role="alert">
                        <i className="bi bi-exclamation-triangle me-2" />
                        {error}
                    </div>
                )}

                <div className="row g-4">
                    <div className="col-12 col-xl-8">
                        <section className="siger-tarjeta p-4 mb-4">
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <i className="bi bi-card-text fs-3 text-primary" />
                                <div>
                                    <h2 className="h5 mb-1">
                                        Información general
                                    </h2>
                                    <p className="siger-sec mb-0">
                                        Datos principales del evento.
                                    </p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label
                                    htmlFor="nombre"
                                    className="form-label fw-semibold"
                                >
                                    Nombre del evento
                                </label>
                                <input
                                    id="nombre"
                                    name="nombre"
                                    className="form-control"
                                    placeholder="Ej. Conferencia de tecnología 2027"
                                    maxLength={150}
                                    value={formulario.nombre}
                                    onChange={cambiarCampo}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label
                                    htmlFor="descripcion"
                                    className="form-label fw-semibold"
                                >
                                    Descripción
                                </label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    className="form-control"
                                    rows={4}
                                    placeholder="Describe el objetivo y las actividades del evento..."
                                    value={formulario.descripcion}
                                    onChange={cambiarCampo}
                                />
                                <div className="form-text">
                                    Esta información será visible para los participantes.
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="ubicacion"
                                    className="form-label fw-semibold"
                                >
                                    Ubicación
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="bi bi-geo-alt" />
                                    </span>
                                    <input
                                        id="ubicacion"
                                        name="ubicacion"
                                        className="form-control"
                                        placeholder="Ej. Sonsonate, El Salvador"
                                        maxLength={200}
                                        value={formulario.ubicacion}
                                        onChange={cambiarCampo}
                                        required
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="siger-tarjeta p-4 mb-4">
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <i className="bi bi-calendar-range fs-3 text-primary" />
                                <div>
                                    <h2 className="h5 mb-1">
                                        Programación
                                    </h2>
                                    <p className="siger-sec mb-0">
                                        Define cuándo se realizará el evento.
                                    </p>
                                </div>
                            </div>

                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <label
                                        htmlFor="fecha_inicio"
                                        className="form-label fw-semibold"
                                    >
                                        Fecha y hora de inicio
                                    </label>
                                    <input
                                        id="fecha_inicio"
                                        type="datetime-local"
                                        name="fecha_inicio"
                                        className="form-control"
                                        min={fechaMinima}
                                        value={formulario.fecha_inicio}
                                        onChange={cambiarCampo}
                                        required
                                    />
                                </div>

                                <div className="col-12 col-md-6">
                                    <label
                                        htmlFor="fecha_fin"
                                        className="form-label fw-semibold"
                                    >
                                        Fecha y hora de finalización
                                    </label>
                                    <input
                                        id="fecha_fin"
                                        type="datetime-local"
                                        name="fecha_fin"
                                        className="form-control"
                                        min={formulario.fecha_inicio || fechaMinima}
                                        value={formulario.fecha_fin}
                                        onChange={cambiarCampo}
                                        required
                                    />
                                </div>
                            </div>

                            <p className="form-text mt-3 mb-0">
                                <i className="bi bi-info-circle me-2" />
                                La finalización debe ser posterior al inicio.
                            </p>
                        </section>
                    </div>

                    <div className="col-12 col-xl-4">
                        <section className="siger-tarjeta p-4 mb-4">
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <i className="bi bi-people fs-3 text-primary" />
                                <div>
                                    <h2 className="h5 mb-1">
                                        Capacidad
                                    </h2>
                                    <p className="siger-sec mb-0">
                                        Control de participantes.
                                    </p>
                                </div>
                            </div>

                            <label
                                htmlFor="capacidad_maxima"
                                className="form-label fw-semibold"
                            >
                                Cupos disponibles
                            </label>

                            <input
                                id="capacidad_maxima"
                                type="number"
                                name="capacidad_maxima"
                                className="form-control"
                                placeholder="Ej. 100"
                                min="1"
                                step="1"
                                value={formulario.capacidad_maxima}
                                onChange={cambiarCampo}
                                required
                            />

                            <p className="form-text mt-2">
                                Número máximo de reservas activas permitidas.
                            </p>
                        </section>

                        <section className="siger-tarjeta p-4">
                            <h2 className="h5 mb-3">
                                Estado inicial
                            </h2>

                            <span className="badge bg-success mb-3">
                                <i className="bi bi-check-circle me-1" />
                                PROGRAMADO
                            </span>

                            <p className="siger-sec">
                                Al guardar, el evento quedará disponible
                                para que los participantes realicen reservas.
                            </p>

                            <hr />

                            <div className="d-grid gap-2">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={cargando}
                                >
                                    <i className="bi bi-calendar-plus me-2" />
                                    {cargando
                                        ? 'Publicando evento...'
                                        : 'Crear evento'}
                                </button>

                                <Link
                                    to="/organizador/eventos"
                                    className="btn btn-outline-secondary"
                                >
                                    Cancelar
                                </Link>
                            </div>
                        </section>
                    </div>
                </div>
            </form>
        </main>
    );
}
