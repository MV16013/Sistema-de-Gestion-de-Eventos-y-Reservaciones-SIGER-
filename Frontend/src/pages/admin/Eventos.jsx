import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function Eventos() {
    const [eventos, setEventos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let activo = true;

        async function cargarEventos() {
            try {
                const { data } = await api.get('/admin/eventos');

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

    function mostrarFecha(fecha) {
        if (!fecha) return 'Sin fecha';

        // Mostrar la hora registrada sin desplazarla
        // por la zona horaria del navegador.
        return fecha.slice(0, 16).replace('T', ' ');
    }

    return (
        <main className="siger-contenido">
            <div className="siger-encabezado mb-4">
                <h1>Supervisión de eventos</h1>
                <p className="siger-sec">
                    Consulta todos los eventos registrados en SIGER.
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
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {cargando ? (
                <p>Cargando eventos...</p>
            ) : (
                <section className="siger-tarjeta p-4">
                    <h2 className="h5 mb-4">
                        Eventos registrados: {eventos.length}
                    </h2>

                    {eventos.length === 0 ? (
                        <p className="siger-sec">
                            No hay eventos registrados.
                        </p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Evento</th>
                                    <th>Organizador</th>
                                    <th>Inicio</th>
                                    <th>Capacidad</th>
                                    <th>Reservas</th>
                                    <th>Estado</th>
                                </tr>
                                </thead>

                                <tbody>
                                {eventos.map(evento => (
                                    <tr key={evento.id_evento}>
                                        <td>{evento.id_evento}</td>

                                        <td>
                                            <strong>{evento.nombre}</strong>
                                            <div className="siger-sec small">
                                                {evento.ubicacion}
                                            </div>
                                        </td>

                                        <td>
                                            {evento.organizador
                                                ? `${evento.organizador.nombre} ${evento.organizador.apellido}`
                                                : 'No disponible'}
                                        </td>

                                        <td>
                                            {mostrarFecha(evento.fecha_inicio)}
                                        </td>

                                        <td>{evento.capacidad_maxima}</td>

                                        <td>
                                            {evento.reservas_confirmadas}
                                            <span className="siger-sec">
                                                    {' / '}{evento.reservas_count}
                                                </span>
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
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}
        </main>
    );
}
