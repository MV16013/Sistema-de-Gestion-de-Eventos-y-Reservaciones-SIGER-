import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let activo = true;

        async function cargarUsuarios() {
            try {
                const { data } = await api.get('/admin/usuarios');

                if (activo) {
                    setUsuarios(data.usuarios || []);
                }
            } catch (err) {
                if (activo) {
                    setError(
                        err.response?.data?.mensaje ||
                        err.response?.data?.message ||
                        'No se pudieron cargar los usuarios.'
                    );
                }
            } finally {
                if (activo) {
                    setCargando(false);
                }
            }
        }

        cargarUsuarios();

        return () => {
            activo = false;
        };
    }, []);

    return (
        <main className="siger-contenido">
            <div className="siger-encabezado mb-4">
                <h1>Gestión de usuarios</h1>
                <p className="siger-sec">
                    Consulta los usuarios registrados en SIGER.
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

            {cargando ? (
                <p>Cargando usuarios...</p>
            ) : (
                <section className="siger-tarjeta p-4">
                    <h2 className="h5 mb-3">
                        Usuarios registrados: {usuarios.length}
                    </h2>

                    {usuarios.length === 0 ? (
                        <p className="siger-sec">
                            No hay usuarios registrados.
                        </p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Correo</th>
                                    <th>Rol</th>
                                    <th>Estado</th>
                                </tr>
                                </thead>

                                <tbody>
                                {usuarios.map(usuario => (
                                    <tr key={usuario.id_usuario}>
                                        <td>{usuario.id_usuario}</td>

                                        <td>
                                            {usuario.nombre}{' '}
                                            {usuario.apellido}
                                        </td>

                                        <td>{usuario.correo}</td>

                                        <td>
                                                <span className="badge bg-primary">
                                                    {usuario.rol?.nombre || 'Sin rol'}
                                                </span>
                                        </td>

                                        <td>
                                                <span
                                                    className={`badge ${
                                                        usuario.activo
                                                            ? 'bg-success'
                                                            : 'bg-secondary'
                                                    }`}
                                                >
                                                    {usuario.activo
                                                        ? 'Activo'
                                                        : 'Inactivo'}
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
