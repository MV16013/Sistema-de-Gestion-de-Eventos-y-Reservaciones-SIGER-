import { Link } from 'react-router-dom';
export default function DashboardAdmin() {
    return (
        <main className="siger-contenido">
            <div className="siger-encabezado mb-4">
                <h1>Panel de administración</h1>
                <p className="siger-sec">
                    Supervisa los usuarios, eventos y operaciones
                    generales de SIGER.
                </p>
            </div>

            <div className="row g-4">
                <div className="col-md-6 col-xl-4">
                    <div className="siger-tarjeta p-4 h-100">
                        <i className="bi bi-people fs-2 text-primary" />

                        <h2 className="h5 mt-3">
                            Gestión de usuarios
                        </h2>

                        <p className="siger-sec">
                            Consulta los usuarios registrados,
                            sus roles y estados.
                        </p>

                        <Link
                            to="/admin/usuarios"
                            className="btn btn-outline-primary"
                        >
                            Ver usuarios
                        </Link>
                    </div>
                </div>

                <div className="col-md-6 col-xl-4">
                    <div className="siger-tarjeta p-4 h-100">
                        <i className="bi bi-calendar-event fs-2 text-primary" />

                        <h2 className="h5 mt-3">
                            Supervisión de eventos
                        </h2>

                        <p className="siger-sec">
                            Consulta los eventos creados
                            por los organizadores.
                        </p>

                        <Link
                            to="/admin/eventos"
                            className="btn btn-outline-primary"
                        >
                            Ver eventos
                        </Link>
                    </div>
                </div>

                <div className="col-md-6 col-xl-4">
                    <div className="siger-tarjeta p-4 h-100">
                        <i className="bi bi-bar-chart fs-2 text-primary" />

                        <h2 className="h5 mt-3">
                            Reportes
                        </h2>

                        <p className="siger-sec">
                            Consulta estadísticas de eventos,
                            reservas y asistencias.
                        </p>

                        <Link
                            to="/admin/reportes"
                            className="btn btn-outline-primary"
                        >
                            Ver reportes
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
