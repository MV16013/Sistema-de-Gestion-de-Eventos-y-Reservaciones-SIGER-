import { useEffect, useState } from 'react';
import api from './services/api';

function App() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarEventos = async () => {
      try {
        const respuesta = await api.get('/eventos');

        const datos = respuesta.data;

        setEventos(
            Array.isArray(datos) ? datos : datos.eventos ?? []
        );
      } catch (err) {
        console.error(err);
        setError('No se pudo conectar con Laravel.');
      } finally {
        setCargando(false);
      }
    };

    cargarEventos();
  }, []);

  return (
      <div className="container py-5">
        <h1 className="text-primary fw-bold">
          SIGER
        </h1>

        <p className="text-muted">
          Sistema de Gestión de Eventos y Reservaciones
        </p>

        <hr />

        <h2 className="mb-4">Eventos disponibles</h2>

        {cargando && (
            <div className="alert alert-info">
              Cargando eventos...
            </div>
        )}

        {error && (
            <div className="alert alert-danger">
              {error}
            </div>
        )}

        <div className="row g-4">
          {eventos.map((evento) => (
              <div
                  className="col-md-6 col-lg-4"
                  key={evento.id_evento}
              >
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">
                      {evento.nombre}
                    </h5>

                    <p className="card-text">
                      {evento.descripcion}
                    </p>

                    <p>
                      <i className="bi bi-geo-alt me-2" />
                      {evento.ubicacion}
                    </p>

                    <span className="badge bg-success">
                  {evento.estado}
                </span>
                  </div>
                </div>
              </div>
          ))}
        </div>

        {!cargando && !error && eventos.length === 0 && (
            <div className="alert alert-secondary mt-3">
              No hay eventos disponibles.
            </div>
        )}
      </div>
  );
}

export default App;