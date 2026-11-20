import { BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Home from './pages/Home';
import MisReservas from './pages/MisReservas';
import Notificaciones from './pages/Notificaciones';
import PortalLayout from './assets/layout/PortalLayout';
export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Páginas públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />

                {/* Páginas con Header y sesión requerida */}
                <Route element={<PortalLayout />}>
                    <Route path="/" element={<Home />} />

                    <Route
                        path="/mis-reservas"
                        element={<MisReservas />}
                    />

                    <Route
                        path="/notificaciones"
                        element={<Notificaciones />}
                    />
                </Route>

                {/* Ruta desconocida */}
                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}
