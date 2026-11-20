import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function MisReservas() {
    const [reservas, setReservas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [cancelando, setCancelando] = useState(null);
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    async function cargarReservas() {
        try {
            const { data } = await api.get('/mis-reservas');

            setReservas(
                Array.isArray(data) ? data :
                    data.reservas ?? []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ??
                'No se pudieron consultar las reservas.'
            );
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargarReservas();
    }, []);

    async function cancelarReserva(id) {
        const confirmar = window.confirm(
            '¿Seguro que deseas cancelar esta reserva?'
        );

        if (!confirmar) return;

        setError('');
        setMensaje('');
        setCancelando(id);

        try {
            const { data } = await api.patch(
                `/reservas/${id}/cancelar`
            );

            setMensaje(
                data.mensaje ?? 'Reserva cancelada correctamente.'
            );

            await cargarReservas();
        } catch (err) {
            setError(
                err.response?.data?.mensaje ??
                err.response?.data?.message ??
                'No se pudo cancelar la reserva.'
            );
        } finally {
            setCancelando(null);
        }
    }

    return (
        <main className="siger-contenido">
            <div className="siger-encabezado">
                <h1>Mis reservas</h1>
                <p className="siger-sec">
                    Consulta tus reservas y códigos de confirmación.
                </p>
            </div>

            <div className="my-4">
                <Link to="/" className="btn btn-outline-primary">
                    <i className="bi bi-arrow-left me-2" />
                    Volver a eventos
                </Link>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {mensaje && (
                <div className="alert alert-success" role="status">
                    {mensaje}
                </div>
            )}

            {cargando ? (
                <p>Cargando reservas...</p>
            ) : reservas.length === 0 ? (
                <div className="siger-tarjeta p-4">
                    <h2 className="h5">Todavía no tienes reservas</h2>
                    <p className="siger-sec">
                        Explora los eventos disponibles y reserva tu cupo.
                    </p>
                </div>
            ) : (
                <section className="row g-4">
                    {reservas.map((reserva) => (
                        <div
                            className="col-12 col-md-6 col-xl-4"
                            key={reserva.id_reserva}
                        >
                            <article className="siger-tarjeta p-4 h-100">
                <span className={
                          reserva.estado === 'CONFIRMADA'
                              ? 'badge bg-success'
                              : reserva.estado === 'CANCELADA'
                                  ? 'badge bg-danger'
                                  : 'badge bg-warning text-dark'
                      }>
                  {reserva.estado}
                </span>

                                <h2 className="h5 mt-3">
                                    {reserva.evento?.nombre ??
                                        `Evento #${reserva.id_evento}`}
                                </h2>

                                <p className="siger-sec">
                                    {reserva.evento?.ubicacion ??
                                        'Ubicación no disponible'}
                                </p>

                                <hr />

                                <p className="mb-2">
                                    <strong>Código de confirmación</strong>
                                </p>

                                <code className="d-block mb-3">
                                    {reserva.codigo_confirmacion}
                                </code>

                                <p className="siger-sec">
                                    Reserva #{reserva.id_reserva}
                                </p>

                                {reserva.estado !== 'CANCELADA' &&
                                    reserva.estado !== 'FINALIZADA' && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger mt-3 w-100"
                                            disabled={
                                                cancelando === reserva.id_reserva
                                            }
                                            onClick={() =>
                                                cancelarReserva(reserva.id_reserva)
                                            }
                                        >
                                            {cancelando === reserva.id_reserva
                                                ? 'Cancelando...'
                                                : 'Cancelar reserva'}
                                        </button>
                                    )}
                            </article>
                        </div>
                    ))}
                </section>
            )}
        </main>
    );
}
