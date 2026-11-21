import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../services/api';
export default function DashboardOrganizador() {
    const [resumen, setResumen] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let activo = true;

        async function cargarResumen() {
            try {
                const { data } = await api.get('/organizador/resumen');

                if (activo) {
                    setResumen(data.resumen);
                }
            } catch (err) {
                if (activo) {
                    setError(
                        err.response?.data?.mensaje ||
                        'No se pudieron cargar las estadísticas.'
                    );
                }
            } finally {
                if (activo) {
                    setCargando(false);
                }
            }
        }

        cargarResumen();

        return () => {
            activo = false;
        };
    }, []);
    return (
        <main className="siger-contenido">
            <div className="siger-encabezado">
                <h1>Panel del Organizador</h1>
                <p className="siger-sec">
                    Administra tus eventos, reservas y asistencia.
                </p>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <section className="siger-resumen">
                <div className="siger-tarjeta siger-dato">
                    <strong>
                        <i className="bi bi-calendar-event" />
                    </strong>
                    <h2 className="h2 mb-0">
                        {cargando ? '...' : resumen?.mis_eventos ?? '—'}
                    </h2>
                    <span>Mis eventos</span>
                </div>

                <div className="siger-tarjeta siger-dato">
                    <strong>
                        <i className="bi bi-people" />
                    </strong>
                    <h2 className="h2 mb-0">
                        {cargando ? '...' : resumen?.participantes_inscritos ?? '—'}
                    </h2>
                    <span>Participantes inscritos</span>
                </div>

                <div className="siger-tarjeta siger-dato">
                    <strong>
                        <i className="bi bi-check2-circle" />
                    </strong>
                    <h2 className="h2 mb-0">
                        {cargando ? '...' : resumen?.asistencias ?? '—'}
                    </h2>
                    <span>Asistencias</span>
                </div>
            </section>

            <div className="d-flex flex-wrap gap-3 mt-4">
                <Link
                    to="/organizador/eventos"
                    className="btn btn-primary d-inline-flex align-items-center gap-2"
                >
                    <i className="bi bi-calendar-event" />
                    Mis eventos
                </Link>

                <Link
                    to="/organizador/crear-evento"
                    className="btn btn-success d-inline-flex align-items-center gap-2"
                >
                    <i className="bi bi-plus-circle" />
                    Crear evento
                </Link>
            </div>
        </main>
    );
}
