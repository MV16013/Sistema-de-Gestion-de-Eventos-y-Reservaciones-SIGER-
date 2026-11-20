import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
export default function Header() {
    const navigate = useNavigate();
    const [noLeidas, setNoLeidas] = useState(0);

    let usuario = null;

    try {
        usuario = JSON.parse(sessionStorage.getItem('usuario') || 'null');
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
            } catch {
                if (activo) setNoLeidas(0);
            }
        }

        cargarNotificaciones();

        return () => {
            activo = false;
        };
    }, []);

    async function salir() {
        try {
            await api.post('/logout');
        } catch {
            // Limpiar sesión aunque falle la petición
        }

        sessionStorage.removeItem('token');
        sessionStorage.removeItem('usuario');

        navigate('/login', { replace: true });
    }

    if (!usuario) return null;

    return (
        <header className="siger-barra">
            <Link to="/" className="siger-logo text-decoration-none">
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
