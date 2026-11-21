
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

// Formatea las fechas sin alterar la hora almacenada.
function formatearFecha(fecha) {
    if (!fecha) return 'Sin fecha';

    const valor = String(fecha).replace(' ', 'T');
    const [fechaParte, horaParte] = valor.split('T');

    if (!fechaParte || !horaParte) return fecha;

    const [anio, mes, dia] = fechaParte.split('-');

    const meses = [
        'ene.', 'feb.', 'mar.', 'abr.',
        'may.', 'jun.', 'jul.', 'ago.',
        'sept.', 'oct.', 'nov.', 'dic.'
    ];

    const nombreMes = meses[Number(mes) - 1];

    if (!nombreMes) return fecha;

    return `${dia} ${nombreMes} ${anio} · ${horaParte.slice(0, 5)}`;
}

export default function MisEventos() {
    const [eventos, setEventos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [cancelandoId, setCancelandoId] = useState(null);
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        let activo = true;

        async function cargarEventos() {
            try {
                const { data } = await api.get('/organizador/eventos');

                if (activo) {
                    setEventos(data.eventos || []);
                }
            } catch (err) {
                if (activo) {
                    setError(
                        err.response?.data?.mensaje ||
                        err.response?.data?.message ||
                        'No se pudieron cargar los eventos.'
                    );
                }
            } finally {
                if (activo) setCargando(false);
            }
        }

        cargarEventos();

        return () => {
            activo = false;
        };
    }, []);

    async function cancelarEvento(evento) {
        const confirmado = window.confirm(
            `¿Estás seguro de cancelar "${evento.nombre}"?`
        );

        if (!confirmado) return;

        setError('');
        setMensaje('');
        setCancelandoId(evento.id_evento);

        try {
            await api.patch(
                `/eventos/${evento.id_evento}/cancelar`
            );

            setEventos(anteriores =>
                anteriores.map(actual =>
                    actual.id_evento === evento.id_evento
                        ? { ...actual, estado: 'CANCELADO' }
                        : actual
                )
            );

            setMensaje('Evento cancelado correctamente.');
        } catch (err) {
            setError(
                err.response?.data?.mensaje ||
                err.response?.data?.message ||
                'No se pudo cancelar el evento.'
            );
        } finally {
            setCancelandoId(null);
        }
    }

    const programados = eventos.filter(
        evento => evento.estado === 'PROGRAMADO'
    ).length;

    const cancelados = eventos.filter(
        evento => evento.estado === 'CANCELADO'
    ).length;

    return (
        <main className="siger-contenido">

            {/* Encabezado */}
            <div className="siger-encabezado mb-4">
                <h1>Mis eventos</h1>
                <p className="siger-sec">
                    Administra y supervisa los eventos que has creado.
                </p>
            </div>

            {/* Navegación */}
            <div className="d-flex flex-wrap gap-2 mb-4">
                <Link
                    to="/organizador"
                    className="btn btn-outline-primary"
                >
                    <i className="bi bi-arrow-left me-2" />
                    Volver al panel
                </Link>

                <Link
                    to="/organizador/crear-evento"
                    className="btn btn-primary"
                >
                    <i className="bi bi-plus-circle me-2" />
                    Crear evento
                </Link>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {mensaje && (
                <div className="alert alert-success" role="status">
                    <i className="bi bi-check-circle me-2" />
                    {mensaje}
                </div>
            )}

            {/* Resumen */}
            {!cargando && !error && (
                <div className="row g-3 mb-4">
                    <div className="col-12 col-md-4">
                        <div className="siger-resumen-eventos">
                            <i className="bi bi-calendar-event text-primary" />
                            <div>
                                <span>Total de eventos</span>
                                <strong>{eventos.length}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-4">
                        <div className="siger-resumen-eventos">
                            <i className="bi bi-calendar-check text-success" />
                            <div>
                                <span>Programados</span>
                                <strong>{programados}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-4">
                        <div className="siger-resumen-eventos">
                            <i className="bi bi-calendar-x text-secondary" />
                            <div>
                                <span>Cancelados</span>
                                <strong>{cancelados}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {cargando ? (
                <div className="text-center py-5">
                    <div
                        className="spinner-border text-primary"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Cargando...
                        </span>
                    </div>
                    <p className="siger-sec mt-3">
                        Cargando eventos...
                    </p>
                </div>
            ) : error && eventos.length === 0 ? null
                : eventos.length === 0 ? (
                    <div className="siger-tarjeta p-4 text-center">
                        <i className="bi bi-calendar-plus fs-1 text-primary" />

                        <h2 className="h5 mt-3">
                            Todavía no has creado eventos.
                        </h2>

                        <p className="siger-sec">
                            Crea tu primer evento para comenzar.
                        </p>

                        <Link
                            to="/organizador/crear-evento"
                            className="btn btn-primary"
                        >
                            Crear evento
                        </Link>
                    </div>
                ) : (
                    <section className="row g-4">

                        {eventos.map(evento => {
                            const programado =
                                evento.estado === 'PROGRAMADO';

                            return (
                                <div
                                    className="col-12 col-md-6 col-xl-4"
                                    key={evento.id_evento}
                                >
                                    <article className="siger-evento-card h-100">

                                        {/* Cabecera */}
                                        <div className="siger-evento-card__header">
                                            <div className="siger-evento-card__icono">
                                                <i
                                                    className={
                                                        programado
                                                            ? 'bi bi-calendar-check'
                                                            : 'bi bi-calendar-x'
                                                    }
                                                />
                                            </div>

                                            <span
                                                className={
                                                    programado
                                                        ? 'badge bg-success'
                                                        : 'badge bg-secondary'
                                                }
                                            >
                                            {evento.estado}
                                        </span>
                                        </div>

                                        {/* Contenido */}
                                        <div className="siger-evento-card__contenido">

                                            <h2 className="siger-evento-card__titulo">
                                                {evento.nombre}
                                            </h2>

                                            <p className="siger-evento-card__ubicacion">
                                                <i className="bi bi-geo-alt me-2" />
                                                {evento.ubicacion}
                                            </p>

                                            <p className="siger-evento-card__descripcion">
                                                {evento.descripcion ||
                                                    'Sin descripción disponible.'}
                                            </p>

                                            <div className="siger-evento-card__detalles">
                                                <div>
                                                    <i className="bi bi-calendar-event" />
                                                    <span>
                                                    <small>Inicio</small>
                                                    <strong>
                                                        {formatearFecha(evento.fecha_inicio)}
                                                    </strong>
                                                </span>
                                                </div>

                                                <div>
                                                    <i className="bi bi-calendar-check" />
                                                    <span>
                                                    <small>Finalización</small>
                                                    <strong>
                                                        {formatearFecha(evento.fecha_fin)}
                                                    </strong>
                                                </span>
                                                </div>

                                                <div>
                                                    <i className="bi bi-people" />
                                                    <span>
                                                    <small>Capacidad máxima</small>
                                                    <strong>
                                                        {evento.capacidad_maxima} cupos
                                                    </strong>
                                                </span>
                                                </div>
                                            </div>

                                            {/* Acciones */}
                                            <div className="siger-evento-card__acciones">

                                                {programado && (
                                                    <Link
                                                        to={`/organizador/eventos/${evento.id_evento}/editar`}
                                                        className="btn btn-outline-primary"
                                                    >
                                                        <i className="bi bi-pencil-square me-2" />
                                                        Editar
                                                    </Link>
                                                )}

                                                <Link
                                                    to={`/organizador/eventos/${evento.id_evento}/participantes`}
                                                    className="btn btn-outline-secondary"
                                                >
                                                    <i className="bi bi-people me-2" />
                                                    Participantes
                                                </Link>

                                                {programado && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger"
                                                        disabled={cancelandoId !== null}
                                                        onClick={() =>
                                                            cancelarEvento(evento)
                                                        }
                                                    >
                                                        <i className="bi bi-x-circle me-2" />
                                                        {cancelandoId === evento.id_evento
                                                            ? 'Cancelando...'
                                                            : 'Cancelar'}
                                                    </button>
                                                )}

                                            </div>
                                        </div>
                                    </article>
                                </div>
                            );
                        })}
                    </section>
                )}
        </main>
    );
}
