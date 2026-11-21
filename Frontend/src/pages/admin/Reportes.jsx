import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function Reportes() {
    const [resumen, setResumen] = useState(null);
    const [eventos, setEventos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let activo = true;

        async function cargarReportes() {
            try {
                const { data } = await api.get('/admin/reportes');

                if (activo) {
                    setResumen(data.resumen);
                    setEventos(data.eventos || []);
                }
            } catch (err) {
                if (activo) {
                    setError(
                        err.response?.data?.mensaje ||
                        err.response?.data?.message ||
                        'No se pudieron cargar los reportes.'
                    );
                }
            } finally {
                if (activo) setCargando(false);
            }
        }

        cargarReportes();

        return () => {
            activo = false;
        };
    }, []);

    const estadisticas = resumen ? [
        {
            titulo: 'Usuarios registrados',
            valor: resumen.usuarios,
            icono: 'bi-people',
        },
        {
            titulo: 'Eventos registrados',
            valor: resumen.eventos,
            icono: 'bi-calendar-event',
        },
        {
            titulo: 'Eventos programados',
            valor: resumen.eventos_programados,
            icono: 'bi-calendar-check',
        },
        {
            titulo: 'Eventos cancelados',
            valor: resumen.eventos_cancelados,
            icono: 'bi-calendar-x',
        },
        {
            titulo: 'Reservas totales',
            valor: resumen.reservas,
            icono: 'bi-ticket-perforated',
        },
        {
            titulo: 'Reservas confirmadas',
            valor: resumen.reservas_confirmadas,
            icono: 'bi-check-circle',
        },
        {
            titulo: 'Reservas canceladas',
            valor: resumen.reservas_canceladas,
            icono: 'bi-x-circle',
        },
        {
            titulo: 'Asistencias registradas',
            valor: resumen.asistencias,
            icono: 'bi-person-check',
        },
    ] : [];

    return (
        <main className="siger-contenido">
            <div className="siger-encabezado mb-4">
                <h1>Reportes generales</h1>
                <p className="siger-sec">
                    Estadísticas de eventos, reservas y asistencias de SIGER.
                </p>
            </div>

            <Link
                to="/admin"
                className="btn btn-outline-primary mb-4"
            >
                <i className="bi bi-arrow-left me-2" />
                Volver al panel
            </Link>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {cargando && <p>Cargando reportes...</p>}

            {!cargando && resumen && (
                <>
                    <section className="row g-3 mb-4">
                        {estadisticas.map(item => (
                            <div
                                className="col-12 col-sm-6 col-lg-3"
                                key={item.titulo}
                            >
                                <div className="siger-tarjeta p-4 h-100">
                                    <i
                                        className={`bi ${item.icono} fs-3 text-primary`}
                                    />
                                    <p className="siger-sec mt-3 mb-1">
                                        {item.titulo}
                                    </p>
                                    <h2 className="mb-0">
                                        {item.valor}
                                    </h2>
                                </div>
                            </div>
                        ))}
                    </section>

                    <section className="siger-tarjeta p-4">
                        <h2 className="h4 mb-4">
                            Resumen por evento
                        </h2>

                        <div className="table-responsive">
                            <table className="table align-middle">
                                <thead>
                                <tr>
                                    <th>Evento</th>
                                    <th>Estado</th>
                                    <th>Capacidad</th>
                                    <th>Reservas</th>
                                    <th>Confirmadas</th>
                                    <th>Canceladas</th>
                                    <th>Asistencias</th>
                                </tr>
                                </thead>

                                <tbody>
                                {eventos.map(evento => (
                                    <tr key={evento.id_evento}>
                                        <td>
                                            <strong>
                                                {evento.nombre}
                                            </strong>
                                        </td>
                                        <td>
                                                <span
                                                    className={`badge ${
                                                        evento.estado === 'PROGRAMADO'
                                                            ? 'bg-success'
                                                            : 'bg-secondary'
                                                    }`}
                                                >
                                                    {evento.estado}
                                                </span>
                                        </td>
                                        <td>{evento.capacidad_maxima}</td>
                                        <td>{evento.reservas_count}</td>
                                        <td>{evento.confirmadas}</td>
                                        <td>{evento.canceladas}</td>
                                        <td>{evento.asistencias}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {eventos.length === 0 && (
                            <p className="siger-sec mb-0">
                                No hay eventos registrados.
                            </p>
                        )}
                    </section>
                </>
            )}
        </main>
    );
}
