import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../services/api';

function formatearFecha(valor) {
  if (!valor) return 'Fecha por confirmar';

  try {
    return new Intl.DateTimeFormat('es-SV', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC'
    }).format(new Date(valor));
  } catch {
    return 'Fecha por confirmar';
  }
}

function obtenerLista(datos, clave) {
  if (Array.isArray(datos)) return datos;

  const contenido = datos?.[clave] ?? datos?.data ?? [];

  if (Array.isArray(contenido)) return contenido;
  if (Array.isArray(contenido?.data)) return contenido.data;

  return [];
}

export default function Home() {
  const [eventos, setEventos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);
  const [reservando, setReservando] = useState(null);

  const token = sessionStorage.getItem('token');

  let usuario = null;

  try {
    usuario = JSON.parse(
        sessionStorage.getItem('usuario') || 'null'
    );
  } catch {
    // Sesión inválida
  }

  const rol = usuario?.rol;

  useEffect(() => {
    if (!token || !usuario) return;

    let activo = true;

    async function cargar() {
      try {
        const peticiones = [
          api.get('/eventos'),
          api.get('/mis-reservas'),
          api.get('/notificaciones/no-leidas')
        ];

        const resultados = await Promise.allSettled(peticiones);

        if (!activo) return;

        if (resultados[0].status === 'fulfilled') {
          setEventos(
              obtenerLista(resultados[0].value.data, 'eventos')
          );
        } else {
          setError('No se pudieron cargar los eventos.');
        }

        if (resultados[1].status === 'fulfilled') {
          setReservas(
              obtenerLista(resultados[1].value.data, 'reservas')
          );
        }

        if (resultados[2].status === 'fulfilled') {
          setNoLeidas(
              Number(resultados[2].value.data.no_leidas || 0)
          );
        }
      } catch {
        if (activo) {
          setError('No fue posible consultar la API.');
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, [token, rol]);

  const eventosActivos = useMemo(
      () => eventos.filter(
          evento => evento.estado === 'PROGRAMADO'
      ),
      [eventos]
  );

  const disponibles = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return eventosActivos.filter(evento =>
        `${evento.nombre || ''} ${evento.ubicacion || ''}`
            .toLowerCase()
            .includes(termino)
    );
  }, [eventosActivos, busqueda]);

  const misIds = new Set(
      reservas
          .filter(reserva =>
              ['PENDIENTE', 'CONFIRMADA'].includes(reserva.estado)
          )
          .map(reserva => Number(reserva.id_evento))
  );

  const confirmadas = reservas.filter(
      reserva => reserva.estado === 'CONFIRMADA'
  ).length;

  async function reservar(id) {
    setError('');
    setMensaje('');
    setReservando(id);

    try {
      const { data } = await api.post('/reservas', {
        id_evento: id
      });

      const respuesta = await api.get('/mis-reservas');

      setReservas(
          obtenerLista(respuesta.data, 'reservas')
      );

      setMensaje(
          data.mensaje || 'Reserva creada correctamente.'
      );
    } catch (err) {
      setError(
          err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'No se pudo realizar la reserva.'
      );
    } finally {
      setReservando(null);
    }
  }

  if (!token || !usuario) {
    return <Navigate to="/login" replace />;
  }

  return (
      <main className="siger-contenido siger-home">

        {/* Encabezado */}
        <div className="siger-encabezado mb-4">
          <h1>Eventos disponibles</h1>

          <p className="siger-sec">
            Explora los próximos eventos y reserva tu lugar.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-4">
          <Link
              to="/mis-reservas"
              className="btn btn-outline-primary"
          >
            <i className="bi bi-ticket-perforated me-2" />
            Mis reservas
          </Link>

          <Link
              to="/notificaciones"
              className="btn btn-outline-secondary"
          >
            <i className="bi bi-bell me-2" />
            Notificaciones
          </Link>
        </div>

        {/* Estadísticas */}
        <section
            className="row g-3 mb-4"
            aria-label="Resumen del participante"
        >
          {[
            {
              titulo: 'Eventos activos',
              valor: eventosActivos.length,
              icono: 'bi-calendar-event'
            },
            {
              titulo: 'Mis reservas',
              valor: reservas.length,
              icono: 'bi-ticket-perforated'
            },
            {
              titulo: 'Confirmadas',
              valor: confirmadas,
              icono: 'bi-check-circle'
            },
            {
              titulo: 'Notificaciones',
              valor: noLeidas,
              icono: 'bi-bell'
            }
          ].map(dato => (
              <div
                  className="col-12 col-sm-6 col-xl-3"
                  key={dato.titulo}
              >
                <div className="siger-home__estadistica">
                  <i className={`bi ${dato.icono}`} />

                  <strong>{dato.valor}</strong>

                  <span>{dato.titulo}</span>
                </div>
              </div>
          ))}
        </section>

        {/* Búsqueda */}
        <section className="siger-home__busqueda mb-4">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">

            <div>
              <h2 className="h5 mb-1">
                Explorar eventos
              </h2>

              <p className="siger-sec mb-0">
                Encuentra actividades de tu interés.
              </p>
            </div>

            <div className="siger-home__buscador">
              <i className="bi bi-search" />

              <input
                  type="search"
                  className="form-control"
                  placeholder="Buscar por nombre o lugar..."
                  aria-label="Buscar eventos"
                  value={busqueda}
                  onChange={e =>
                      setBusqueda(e.target.value)
                  }
              />
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 mt-3">
                    <span className="siger-home__filtro">
                        <i className="bi bi-grid me-2" />
                        Todos
                    </span>

            <span className="siger-sec small">
                        {disponibles.length} eventos encontrados
                    </span>
          </div>
        </section>

        {/* Mensajes */}
        {error && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-circle me-2" />
              {error}
            </div>
        )}

        {mensaje && (
            <div className="alert alert-success" role="status">
              <i className="bi bi-check-circle me-2" />
              {mensaje}
            </div>
        )}

        {/* Catálogo */}
        {cargando ? (
            <div className="siger-home__vacio">
              <div
                  className="spinner-border text-primary mb-3"
                  role="status"
              >
                        <span className="visually-hidden">
                            Cargando...
                        </span>
              </div>

              <p className="siger-sec mb-0">
                Cargando eventos disponibles...
              </p>
            </div>
        ) : disponibles.length === 0 ? (
            <div className="siger-home__vacio">
              <i className="bi bi-calendar-x" />

              <h2 className="h5 mt-3">
                No encontramos eventos
              </h2>

              <p className="siger-sec mb-0">
                {busqueda
                    ? 'Prueba con otro nombre o ubicación.'
                    : 'Todavía no hay eventos programados.'}
              </p>
            </div>
        ) : (
            <section className="row g-4">
              {disponibles.map(evento => {
                const reservado = misIds.has(
                    Number(evento.id_evento)
                );

                const procesando =
                    reservando === evento.id_evento;

                return (
                    <div
                        className="col-12 col-md-6 col-xl-4"
                        key={evento.id_evento}
                    >
                      <article className="siger-home__evento">

                        <div className="siger-home__evento-top">
                          <div className="siger-home__evento-icono">
                            <i className="bi bi-calendar-event" />
                          </div>

                          <span className="badge bg-success">
                                            PROGRAMADO
                                        </span>
                        </div>

                        <div className="siger-home__evento-cuerpo">
                          <h2>{evento.nombre}</h2>

                          <p className="siger-home__descripcion">
                            {evento.descripcion ||
                                'Sin descripción adicional.'}
                          </p>

                          <div className="siger-home__detalles">

                            <div>
                              <i className="bi bi-calendar3" />

                              <span>
                                                    {formatearFecha(
                                                        evento.fecha_inicio
                                                    )}
                                                </span>
                            </div>

                            <div>
                              <i className="bi bi-geo-alt" />

                              <span>
                                                    {evento.ubicacion}
                                                </span>
                            </div>

                            <div>
                              <i className="bi bi-people" />

                              <span>
                                                    Capacidad máxima:{' '}
                                {evento.capacidad_maxima}
                                                </span>
                            </div>
                          </div>

                          <div className="siger-home__evento-acciones">
                            <button
                                type="button"
                                className={
                                  reservado
                                      ? 'btn siger-home__reservado'
                                      : 'btn btn-primary'
                                }
                                disabled={
                                    reservado ||
                                    reservando !== null
                                }
                                onClick={() =>
                                    reservar(evento.id_evento)
                                }
                            >
                              <i
                                  className={`bi ${
                                      reservado
                                          ? 'bi-check-circle'
                                          : 'bi-ticket-perforated'
                                  } me-2`}
                              />

                              {reservado
                                  ? 'Ya tienes reserva'
                                  : procesando
                                      ? 'Reservando...'
                                      : 'Reservar cupo'}
                            </button>
                          </div>
                        </div>
                      </article>
                    </div>
                );
              })}
            </section>
        )}
      </main>
  );
}
