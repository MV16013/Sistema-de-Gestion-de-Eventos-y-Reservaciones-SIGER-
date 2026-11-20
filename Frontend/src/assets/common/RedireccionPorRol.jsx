import { Navigate } from 'react-router-dom';
export default function RedireccionPorRol() {
    const token = sessionStorage.getItem('token');

    let usuario = null;

    try {
        usuario = JSON.parse(
            sessionStorage.getItem('usuario') || 'null'
        );
    } catch {
        return <Navigate to="/login" replace />;
    }

    if (!token || !usuario) {
        return <Navigate to="/login" replace />;
    }

    switch (usuario.rol) {
        case 'PARTICIPANTE':
            return <Navigate to="/eventos" replace />;

        case 'ORGANIZADOR':
            return <Navigate to="/organizador" replace />;

        case 'ADMINISTRADOR':
            return <Navigate to="/admin" replace />;

        default:
            return <Navigate to="/login" replace />;
    }
}