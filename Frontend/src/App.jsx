import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';

import Login from './pages/Login';
import Registro from './pages/Registro';
import Home from './pages/Home';
import MisReservas from './pages/MisReservas';
import Notificaciones from './pages/Notificaciones';
import PortalLayout from './assets/layout/PortalLayout';
import DashboardOrganizador from './pages/organizador/DashboardOrganizador';
import CrearEvento from './pages/organizador/CrearEvento';
import MisEventos from './pages/organizador/MisEventos';
import EditarEvento from './pages/organizador/EditarEvento';
import ParticipantesEvento from './pages/organizador/ParticipantesEvento';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import Usuarios from './pages/admin/Usuarios';
import EventosAdmin from './pages/admin/Eventos';
import Reportes from './pages/admin/Reportes';
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
                    <Route
                        path="/organizador/crear-evento"
                        element={<CrearEvento />}
                    />
                    <Route
                        path="/organizador/eventos"
                        element={<MisEventos />}
                    />
                    <Route
                        path="/organizador/eventos/:id/editar"
                        element={<EditarEvento />}
                    />
                    <Route
                        path="/organizador/eventos/:id/participantes"
                        element={<ParticipantesEvento />}
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


                {/* Portal de administradores */}
                <Route
                    element={
                        <RutaProtegida roles={['ADMINISTRADOR']}>
                            <PortalLayout />
                        </RutaProtegida>
                    }
                >
                    <Route
                        path="/admin"
                        element={<DashboardAdmin />}
                    />
                    <Route
                        path="/admin/usuarios"
                        element={<Usuarios />}
                    />
                    <Route
                        path="/admin/eventos"
                        element={<EventosAdmin />}
                    />
                    <Route
                        path="/admin/reportes"
                        element={<Reportes />}
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