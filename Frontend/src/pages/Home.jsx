import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api from '../services/api';

const fecha = value => value ? new Intl.DateTimeFormat('es-SV', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(value)) : 'Fecha por confirmar';

export default function Home() {
  const navigate = useNavigate();
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
  try { usuario = JSON.parse(sessionStorage.getItem('usuario') || 'null'); } catch { /* sesión inválida */ }
  const rol = usuario?.rol;

  useEffect(() => {
    if (!token || !usuario) return;
    let activo = true;
    async function cargar() {
      try {
        const peticiones = [api.get('/eventos')];
        if (rol === 'PARTICIPANTE') peticiones.push(api.get('/mis-reservas'));
        peticiones.push(api.get('/notificaciones/no-leidas'));
        const resultados = await Promise.allSettled(peticiones);
        if (!activo) return;
        if (resultados[0].status === 'fulfilled') {
          const d = resultados[0].value.data;
          const lista = Array.isArray(d) ? d : (d.eventos?.data || d.eventos || d.data || []);
          setEventos(Array.isArray(lista) ? lista : []);
        } else setError('No se pudieron cargar los eventos.');
        if (rol === 'PARTICIPANTE' && resultados[1]?.status === 'fulfilled') {
          const d = resultados[1].value.data;
          setReservas(Array.isArray(d.reservas) ? d.reservas : (d.reservas?.data || []));
        }
        const notificaciones = resultados[resultados.length - 1];
        if (notificaciones.status === 'fulfilled') setNoLeidas(notificaciones.value.data.no_leidas || 0);
      } catch { if (activo) setError('No fue posible consultar la API.'); }
      finally { if (activo) setCargando(false); }
    }
    cargar();
    return () => { activo = false; };
  }, [token, rol]);

  const disponibles = useMemo(() => eventos.filter(e => e.estado === 'PROGRAMADO' && `${e.nombre} ${e.ubicacion}`.toLowerCase().includes(busqueda.toLowerCase())), [eventos, busqueda]);
  const misIds = new Set(reservas.filter(r => ['PENDIENTE', 'CONFIRMADA'].includes(r.estado)).map(r => r.id_evento));
  if (!token || !usuario) return <Navigate to="/login" replace />;

  async function salir() {
    try { await api.post('/logout'); } catch { /* limpiar sesión local incluso si falla la red */ }
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    navigate('/login', { replace: true });
  }

  async function reservar(id) {
    setError(''); setMensaje(''); setReservando(id);
    try {
      const { data } = await api.post('/reservas', { id_evento: id });
      setMensaje(data.mensaje || 'Reserva creada correctamente.');
      const respuesta = await api.get('/mis-reservas');
      setReservas(respuesta.data.reservas || []);
    } catch (err) {
      setError(err.response?.data?.mensaje || err.response?.data?.message || 'No se pudo reservar.');
    } finally { setReservando(null); }
  }

  const iniciales = `${usuario.nombre?.[0] || ''}${usuario.apellido?.[0] || ''}`.toUpperCase();
  return (
    <div className="siger-portal">
      <header className="siger-barra">
        <div className="siger-logo">S</div><strong>SIGER</strong>
        <span className="siger-etiqueta-rol">{rol === 'PARTICIPANTE' ? 'Portal de participantes' : rol === 'ORGANIZADOR' ? 'Portal de organizadores' : 'Portal de administración'}</span>
        <div className="siger-barra__espacio" />
        <span className="siger-notificacion" title="Notificaciones no leídas" aria-label={`${noLeidas} notificaciones no leídas`}>♧ <b>{noLeidas}</b></span>
        <span className="siger-avatar" title={`${usuario.nombre} ${usuario.apellido}`}>{iniciales}</span>
        <button className="siger-salir" type="button" onClick={salir}>Salir</button>
      </header>
      <main className="siger-contenido">
        <div className="siger-encabezado"><h1>Eventos disponibles</h1><p className="siger-sec">Encuentra un evento y reserva tu cupo</p></div>
        <Link to="/mis-reservas" className="btn btn-outline-primary">
          <i className="bi bi-ticket-perforated me-2" />
          Mis reservas
        </Link>
        <section className="siger-resumen" aria-label="Resumen">
          <div className="siger-tarjeta siger-dato"><strong>{eventos.filter(e => e.estado === 'PROGRAMADO').length}</strong><span>Eventos activos</span></div>
          <div className="siger-tarjeta siger-dato"><strong>{reservas.length}</strong><span>Mis reservas</span></div>
          <div className="siger-tarjeta siger-dato"><strong>{reservas.filter(r => r.estado === 'CONFIRMADA').length}</strong><span>Confirmadas</span></div>
          <div className="siger-tarjeta siger-dato"><strong>{noLeidas}</strong><span>Notificaciones</span></div>
        </section>
        <section className="siger-filtros"><input className="siger-campo siger-buscador" type="search" aria-label="Buscar eventos" placeholder="Buscar por nombre o lugar" value={busqueda} onChange={e => setBusqueda(e.target.value)} /><span className="siger-chip siger-chip--activo">Todos</span></section>
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {mensaje && <div className="alert alert-success" role="status">{mensaje}</div>}
        {cargando ? <p>Cargando eventos...</p> : disponibles.length === 0 ? <p className="siger-sec">No hay eventos disponibles con esos criterios.</p> : (
          <section className="siger-catalogo">
            {disponibles.map((evento, i) => <article className="siger-tarjeta siger-evento" key={evento.id_evento} style={{ '--c': ['#1E40AF', '#5B21B6', '#334155'][i % 3] }}>
              <div className="siger-evento__banda"><span className="siger-evento__categoria">Evento</span></div>
              <div className="siger-evento__cuerpo">
                <h2>{evento.nombre}</h2>
                <p>{fecha(evento.fecha_inicio)}<br />{evento.ubicacion}</p>
                <p className="siger-descripcion">{evento.descripcion || 'Sin descripción adicional.'}</p>
                <small>Capacidad máxima: {evento.capacidad_maxima}</small>
                {rol === 'PARTICIPANTE' ? <button className="siger-btn" disabled={reservando === evento.id_evento || misIds.has(evento.id_evento)} onClick={() => reservar(evento.id_evento)}>{misIds.has(evento.id_evento) ? 'Ya tienes reserva' : reservando === evento.id_evento ? 'Reservando...' : 'Reservar cupo'}</button> : <span className="siger-ayuda">Vista de consulta · Gestión de eventos próximamente</span>}
              </div>
            </article>)}
          </section>
        )}
      </main>
    </div>
  );
}
