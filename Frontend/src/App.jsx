
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

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/mis-reservas" element={<MisReservas />} />
                <Route path="/notificaciones" element={<Notificaciones />} />

                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}
