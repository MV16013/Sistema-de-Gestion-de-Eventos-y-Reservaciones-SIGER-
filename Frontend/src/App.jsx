import {
    BrowserRouter,
    Navigate,
    Route,
    Routes
} from 'react-router-dom';

import Login from './pages/Login';
import Registro from './pages/Registro';
import Home from './pages/Home';
import MisReservas from './pages/MisReservas';
import Notificaciones from './pages/Notificaciones';

import PortalLayout from './assets/layout/PortalLayout';
import DashboardOrganizador from './pages/organizador/DashboardOrganizador';

function obtenerSesion() {
    const token = sessionStorage.getItem('token');

    let usuario = null;

    try {
        usuario = JSON.parse(
            sessionStorage.getItem('usuario') || 'null'
        );
    } catch {
        return null;
    }

    if (!token || !usuario) return null;

    return usuario;
}

function destinoPorRol(rol) {
    switch (rol) {
        case 'PARTICIPANTE':
            return '/eventos';

        case 'ORGANIZADOR':
            return '/organizador';

        case 'ADMINISTRADOR':
            return '/admin';

        default:
            return '/login';
    }
}

function RedireccionPorRol() {
    const usuario = obtenerSesion();

    if (!usuario) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Navigate
            to={destinoPorRol(usuario.rol)}
            replace
        />
    );
}

function RutaProtegida({ roles, children }) {
    const usuario = obtenerSesion();

    if (!usuario) {
        return <Navigate to="/login" replace />;
    }

    if (!roles.includes(usuario.rol)) {
        return (
            <Navigate
                to={destinoPorRol(usuario.rol)}
                replace
            />
        );
    }

    return children;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Páginas públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />

                {/* Redirección según rol */}
                <Route
                    path="/"
                    element={<RedireccionPorRol />}
                />

                {/* Portal de participantes */}
                <Route
                    element={
                        <RutaProtegida roles={['PARTICIPANTE']}>
                            <PortalLayout />
                        </RutaProtegida>
                    }
                >
                    <Route path="/eventos" element={<Home />} />
                    <Route
                        path="/mis-reservas"
                        element={<MisReservas />}
                    />
                </Route>

                {/* Portal de organizadores */}
                <Route
                    element={
                        <RutaProtegida roles={['ORGANIZADOR']}>
                            <PortalLayout />
                        </RutaProtegida>
                    }
                >
                    <Route
                        path="/organizador"
                        element={<DashboardOrganizador />}
                    />
                </Route>

                {/* Notificaciones para usuarios autenticados */}
                <Route
                    element={
                        <RutaProtegida
                            roles={[
                                'PARTICIPANTE',
                                'ORGANIZADOR',
                                'ADMINISTRADOR'
                            ]}
                        >
                            <PortalLayout />
                        </RutaProtegida>
                    }
                >
                    <Route
                        path="/notificaciones"
                        element={<Notificaciones />}
                    />
                </Route>

                {/* Ruta desconocida */}
                <Route
                    path="*"
                    element={<RedireccionPorRol />}
                />

            </Routes>
        </BrowserRouter>
    );
}