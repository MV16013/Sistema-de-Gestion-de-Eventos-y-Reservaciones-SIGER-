import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';


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

    return (
        <main className="siger-contenido">
            <div className="siger-encabezado">
                <h1>Mis eventos</h1>
                <p className="siger-sec">
                    Administra los eventos que has creado.
                </p>
            </div>

            <div className="d-flex flex-wrap gap-3 mb-4">
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
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {mensaje && (
                <div className="alert alert-success" role="status">
                    {mensaje}
                </div>
            )}

            {cargando ? (
                <p>Cargando eventos...</p>
            ) : eventos.length === 0 && !error ? (
                <div className="siger-tarjeta p-4">
                    <h2 className="h5">
                        Todavía no has creado eventos.
                    </h2>
                    <p className="siger-sec mb-0">
                        Crea tu primer evento para comenzar.
                    </p>
                </div>
            ) : (
                <section className="siger-catalogo">
                    {eventos.map(evento => (
                        <article
                            className="siger-tarjeta siger-evento"
                            key={evento.id_evento}
                        >
                            <div className="siger-evento__banda">
                                <span className="siger-evento__categoria">
                                    {evento.estado}
                                </span>
                            </div>

                            <div className="siger-evento__cuerpo">
                                <h2>{evento.nombre}</h2>

                                <p>
                                    <i className="bi bi-geo-alt me-2" />
                                    {evento.ubicacion}
                                </p>

                                <p>
                                    {evento.descripcion ||
                                        'Sin descripción'}
                                </p>

                                <p>
                                    <strong>Inicio:</strong>{' '}
                                    {evento.fecha_inicio}
                                </p>

                                <p>
                                    <strong>Finalización:</strong>{' '}
                                    {evento.fecha_fin}
                                </p>

                                <p>
                                    <strong>Capacidad:</strong>{' '}
                                    {evento.capacidad_maxima}
                                </p>

                                <div className="d-flex flex-wrap gap-2 mt-3">
                                    {evento.estado === 'PROGRAMADO' && (
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

                                    {evento.estado === 'PROGRAMADO' && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            disabled={cancelandoId !== null}
                                            onClick={() => cancelarEvento(evento)}
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
                    ))}
                </section>
            )}
        </main>
    );
}
