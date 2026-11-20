import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Notificaciones() {
    const [notificaciones, setNotificaciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [procesando, setProcesando] = useState(null);

    async function cargarNotificaciones() {
        try {
            setError('');

            const { data } = await api.get('/notificaciones');

            setNotificaciones(data.notificaciones ?? []);
        } catch (err) {
            setError(
                err.response?.data?.mensaje ??
                'No se pudieron cargar las notificaciones.'
            );
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargarNotificaciones();
    }, []);

    async function marcarLeida(id) {
        setProcesando(id);
        setError('');

        try {
            await api.patch(`/notificaciones/${id}/leer`);

            setNotificaciones(actuales =>
                actuales.map(notificacion =>
                    notificacion.id_notificacion === id
                        ? { ...notificacion, leida: true }
                        : notificacion
                )
            );
        } catch (err) {
            setError(
                err.response?.data?.mensaje ??
                'No se pudo marcar la notificación como leída.'
            );
        } finally {
            setProcesando(null);
        }
    }

    const pendientes = notificaciones.filter(n => !n.leida).length;

    return (
        <main className="siger-contenido">
            <div className="siger-encabezado">
                <h1>
                    <i className="bi bi-bell me-2"></i>
                    Mis notificaciones
                </h1>
                <p className="siger-sec">
                    Consulta los avisos relacionados con tu cuenta.
                </p>
            </div>

            <div className="my-4">
                <Link to="/" className="btn btn-outline-primary">
                    <i className="bi bi-arrow-left me-2"></i>
                    Volver a eventos
                </Link>
            </div>

            <section className="siger-resumen">
                <div className="siger-tarjeta siger-dato">
                    <strong>{notificaciones.length}</strong>
                    <span>Total de notificaciones</span>
                </div>

                <div className="siger-tarjeta siger-dato">
                    <strong>{pendientes}</strong>
                    <span>Sin leer</span>
                </div>
            </section>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {cargando ? (
                <p>Cargando notificaciones...</p>
            ) : notificaciones.length === 0 ? (
                <div className="siger-tarjeta p-4">
                    <p className="mb-0">
                        No tienes notificaciones por el momento.
                    </p>
                </div>
            ) : (
                <div className="row g-3">
                    {notificaciones.map(notificacion => (
                        <div
                            className="col-12 col-lg-6"
                            key={notificacion.id_notificacion}
                        >
                            <article className="siger-tarjeta p-4 h-100">
                                <div className="d-flex justify-content-between gap-3">
                                    <h2 className="h5 fw-bold">
                                        {notificacion.titulo}
                                    </h2>

                                    <span
                                        className={
                                            `badge ${
                                                notificacion.leida
                                                    ? 'bg-secondary'
                                                    : 'bg-primary'
                                            }`
                                        }
                                    >
                    {notificacion.leida ? 'Leída' : 'Nueva'}
                  </span>
                                </div>

                                <p className="siger-sec mt-2">
                                    {notificacion.mensaje}
                                </p>

                                <small className="text-secondary d-block mb-3">
                                    {new Date(
                                        notificacion.fecha_envio
                                    ).toLocaleString('es-SV')}
                                </small>

                                {!notificacion.leida && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary"
                                        disabled={
                                            procesando === notificacion.id_notificacion
                                        }
                                        onClick={() =>
                                            marcarLeida(notificacion.id_notificacion)
                                        }
                                    >
                                        {procesando === notificacion.id_notificacion
                                            ? 'Procesando...'
                                            : 'Marcar como leída'}
                                    </button>
                                )}
                            </article>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
