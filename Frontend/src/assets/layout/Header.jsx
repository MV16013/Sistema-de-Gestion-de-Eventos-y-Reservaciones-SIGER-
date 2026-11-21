import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();

    const [noLeidas, setNoLeidas] = useState(0);

    let usuario = null;

    try {
        usuario = JSON.parse(
            sessionStorage.getItem('usuario') || 'null'
        );
    } catch {
        // Sesión inválida
    }

    const rol = usuario?.rol;

    const iniciales = usuario
        ? `${usuario.nombre?.[0] || ''}${usuario.apellido?.[0] || ''}`.toUpperCase()
        : '';

    useEffect(() => {
        let activo = true;

        async function cargarNotificaciones() {
            try {
                const { data } = await api.get('/notificaciones/no-leidas');

                if (activo) {
                    setNoLeidas(data.no_leidas ?? 0);
                }
            } catch (error) {
                console.error('Error al cargar notificaciones:', error);
            }
        }

        // Consultar al iniciar
        cargarNotificaciones();

        // Consultar cada 5 segundos
        const intervalo = setInterval(cargarNotificaciones, 5000);

        // Actualizar al regresar a la pestaña
        function actualizarAlVolver() {
            if (document.visibilityState === 'visible') {
                cargarNotificaciones();
            }
        }

        // Actualización inmediata cuando otra parte de React lo solicite
        function actualizarPorEvento() {
            cargarNotificaciones();
        }

        document.addEventListener('visibilitychange', actualizarAlVolver);
        window.addEventListener('siger:notificaciones', actualizarPorEvento);

        return () => {
            activo = false;
            clearInterval(intervalo);
            document.removeEventListener('visibilitychange', actualizarAlVolver);
            window.removeEventListener('siger:notificaciones', actualizarPorEvento);
        };
    }, []);

    async function salir() {
        try {
            await api.post('/logout');
        } catch {
            // Limpiar sesión aunque falle la petición.
        }

        sessionStorage.removeItem('token');
        sessionStorage.removeItem('usuario');

        navigate('/login', { replace: true });
    }

    if (!usuario) return null;

    return (
        <header className="siger-barra">
            <Link
                to="/"
                className="siger-logo text-decoration-none"
            >
                S
            </Link>

            <strong>SIGER</strong>

            <span className="siger-etiqueta-rol">
                {rol === 'PARTICIPANTE'
                    ? 'Portal de participantes'
                    : rol === 'ORGANIZADOR'
                        ? 'Portal de organizadores'
                        : 'Portal de administración'}
            </span>

            <div className="siger-barra__espacio" />

            <Link
                to="/notificaciones"
                className="siger-notificacion"
                title="Ver notificaciones"
                aria-label={`Ver notificaciones. ${noLeidas} sin leer`}
            >
                <i className="bi bi-bell" />
                <b className="ms-1">{noLeidas}</b>
            </Link>

            <span
                className="siger-avatar"
                title={`${usuario.nombre} ${usuario.apellido}`}
            >
                {iniciales}
            </span>

            <button
                className="siger-salir"
                type="button"
                onClick={salir}
            >
                Salir
            </button>
        </header>
    );
}
