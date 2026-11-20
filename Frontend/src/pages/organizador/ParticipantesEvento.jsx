import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../services/api';

export default function ParticipantesEvento() {
    const { id } = useParams();

    const [evento, setEvento] = useState(null);
    const [resumen, setResumen] = useState(null);
    const [participantes, setParticipantes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [codigo, setCodigo] = useState('');
    const [registrando, setRegistrando] = useState(false);
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        let activo = true;

        async function cargarParticipantes() {
            try {
                const { data } = await api.get(
                    `/organizador/eventos/${id}/participantes`
                );

                if (!activo) return;

                setEvento(data.evento);
                setResumen(data.resumen);
                setParticipantes(data.participantes || []);

            } catch (err) {
                if (activo) {
                    setError(
                        err.response?.data?.mensaje ||
                        err.response?.data?.message ||
                        'No se pudieron cargar los participantes.'
                    );
                }
            } finally {
                if (activo) setCargando(false);
            }
        }

        cargarParticipantes();

        return () => {
            activo = false;
        };
    }, [id]);

    async function registrarAsistencia(e) {
        e.preventDefault();

        const codigoLimpio = codigo.trim().toUpperCase();

        if (!codigoLimpio) {
            setError('Introduce un código de confirmación.');
            return;
        }

        setError('');
        setMensaje('');
        setRegistrando(true);

        try {
            // Registrar la asistencia en Laravel.
            await api.post('/asistencias', {
                codigo_confirmacion: codigoLimpio,
                id_evento: Number(id),
            });

            // Volver a consultar PostgreSQL mediante la API.
            const { data } = await api.get(
                `/organizador/eventos/${id}/participantes`
            );

            setEvento(data.evento);
            setResumen(data.resumen);
            setParticipantes(data.participantes || []);

            setCodigo('');
            setMensaje('Asistencia registrada correctamente.');

        } catch (err) {
            const errores = err.response?.data?.errors;

            const detalle = errores
                ? Object.values(errores).flat().join(' ')
                : null;

            setError(
                detalle ||
                err.response?.data?.mensaje ||
                err.response?.data?.message ||
                'No se pudo registrar la asistencia.'
            );
        } finally {
            setRegistrando(false);
        }
    }

    return (
        <main className="siger-contenido">
            <div className="siger-encabezado mb-4">
                <h1>Participantes del evento</h1>
                <p className="siger-sec">
                    {evento?.nombre || 'Consulta de participantes'}
                </p>
            </div>

            <Link
                to="/organizador/eventos"
                className="btn btn-outline-primary mb-4"
            >
                <i className="bi bi-arrow-left me-2" />
                Volver a mis eventos
            </Link>

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
                <p>Cargando participantes...</p>
            ) : evento && (
                <>
                    <div className="row g-3 mb-4">
                        {[
                            ['Reservas', resumen?.total_reservas],
                            ['Confirmadas', resumen?.confirmadas],
                            ['Canceladas', resumen?.canceladas],
                            ['Asistencias', resumen?.asistencias],
                        ].map(([titulo, cantidad]) => (
                            <div className="col-md-3" key={titulo}>
                                <div className="siger-tarjeta p-3">
                                    <p className="siger-sec mb-1">
                                        {titulo}
                                    </p>
                                    <h2 className="h3 mb-0">
                                        {cantidad ?? 0}
                                    </h2>
                                </div>
                            </div>
                        ))}
                    </div>


                    {evento.estado === 'PROGRAMADO' && (
                        <div className="siger-tarjeta p-4 mb-4">
                            <h2 className="h5 mb-2">
                                <i className="bi bi-person-check me-2" />
                                Registrar asistencia
                            </h2>

                            <p className="siger-sec">
                                Introduce el código de confirmación del participante.
                            </p>

                            <form onSubmit={registrarAsistencia}>
                                <div className="row g-3 align-items-end">
                                    <div className="col-md-8">
                                        <label
                                            htmlFor="codigo_confirmacion"
                                            className="form-label"
                                        >
                                            Código de confirmación
                                        </label>

                                        <input
                                            id="codigo_confirmacion"
                                            type="text"
                                            className="form-control"
                                            placeholder="SIGER-XXXXXXXXXXXX"
                                            value={codigo}
                                            onChange={e => setCodigo(e.target.value)}
                                            autoComplete="off"
                                            required
                                        />
                                    </div>

                                    <div className="col-md-4">
                                        <button
                                            type="submit"
                                            className="btn btn-primary w-100"
                                            disabled={registrando}
                                        >
                                            <i className="bi bi-check-circle me-2" />
                                            {registrando
                                                ? 'Registrando...'
                                                : 'Registrar asistencia'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="siger-tarjeta p-4">
                        <h2 className="h5 mb-3">
                            Listado de participantes
                        </h2>

                        {participantes.length === 0 ? (
                            <p className="siger-sec mb-0">
                                Este evento todavía no tiene reservas.
                            </p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead>
                                    <tr>
                                        <th>Participante</th>
                                        <th>Correo</th>
                                        <th>Código</th>
                                        <th>Reserva</th>
                                        <th>Asistencia</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {participantes.map(item => (
                                        <tr key={item.id_reserva}>
                                            <td>
                                                {item.participante.nombre}{' '}
                                                {item.participante.apellido}
                                            </td>

                                            <td>
                                                {item.participante.correo}
                                            </td>

                                            <td>
                                                <code>
                                                    {item.codigo_confirmacion}
                                                </code>
                                            </td>

                                            <td>
                                                    <span className={
                                                              item.estado === 'CONFIRMADA'
                                                                  ? 'badge bg-success'
                                                                  : item.estado === 'CANCELADA'
                                                                      ? 'badge bg-danger'
                                                                      : 'badge bg-warning text-dark'
                                                          }>
                                                        {item.estado}
                                                    </span>
                                            </td>

                                            <td>
                                                {item.asistencia_registrada ? (
                                                    <span className="badge bg-success">
                                                            Registrada
                                                        </span>
                                                ) : (
                                                    <span className="badge bg-secondary">
                                                            Pendiente
                                                        </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </main>
    );
}
