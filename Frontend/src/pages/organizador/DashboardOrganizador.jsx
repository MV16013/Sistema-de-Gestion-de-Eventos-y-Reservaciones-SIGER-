import { Link } from 'react-router-dom';

export default function DashboardOrganizador() {
    return (
        <main className="siger-contenido">
            <div className="siger-encabezado">
                <h1>Panel del Organizador</h1>
                <p className="siger-sec">
                    Administra tus eventos, reservas y asistencia.
                </p>
            </div>

            <section className="siger-resumen">
                <div className="siger-tarjeta siger-dato">
                    <strong>
                        <i className="bi bi-calendar-event" />
                    </strong>
                    <span>Mis eventos</span>
                </div>

                <div className="siger-tarjeta siger-dato">
                    <strong>
                        <i className="bi bi-people" />
                    </strong>
                    <span>Participantes inscritos</span>
                </div>

                <div className="siger-tarjeta siger-dato">
                    <strong>
                        <i className="bi bi-check2-circle" />
                    </strong>
                    <span>Asistencias</span>
                </div>
            </section>

            <div className="d-flex flex-wrap gap-3 mt-4">
                <Link
                    to="/organizador/eventos"
                    className="siger-btn text-decoration-none"
                >
                    <i className="bi bi-calendar-event me-2" />
                    Mis eventos
                </Link>

                <Link
                    to="/organizador/crear-evento"
                    className="btn btn-outline-primary"
                >
                    <i className="bi bi-plus-circle me-2" />
                    Crear evento
                </Link>
            </div>
        </main>
    );
}
