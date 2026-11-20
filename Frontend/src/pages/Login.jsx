import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api from '../services/api';


export default function Login() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  if (sessionStorage.getItem('token')) return <Navigate to="/" replace />;

  async function iniciarSesion(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const { data } = await api.post('/login', { correo, password });
      if (!data.token || !data.usuario) throw new Error('Respuesta incompleta del servidor');
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('usuario', JSON.stringify(data.usuario));
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.mensaje || err.response?.data?.message || err.message || 'No se pudo iniciar sesión');
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="siger-login">
      <section className="siger-login__marca">
        <div className="siger-marca"><span className="siger-logo">S</span><strong>SIGER</strong></div>
        <h1>Gestión de eventos, sin complicaciones.</h1>
        <p>Crea eventos, reserva cupos y controla la asistencia desde un solo lugar.</p>
        <ul>
          <li>Cupos disponibles en tiempo real</li>
          <li>Comprobante digital con código de confirmación</li>
          <li>Control de asistencia en vivo</li>
        </ul>
      </section>
      <section className="siger-login__formulario">
        <form className="siger-tarjeta siger-formulario" onSubmit={iniciarSesion}>
          <div><h2>Bienvenido de nuevo</h2><p className="siger-sec">Ingresa a tu cuenta para continuar</p></div>
          <div>
            <span className="siger-etiqueta">Acceso para</span>
            <div className="siger-roles" aria-label="Roles disponibles">
              <span className="siger-rol" style={{ '--c': '#2563EB' }}>Participante</span>
              <span className="siger-rol" style={{ '--c': '#7C3AED' }}>Organizador</span>
              <span className="siger-rol" style={{ '--c': '#DC2626' }}>Administrador</span>
            </div>
            <small className="siger-ayuda">El rol se verifica automáticamente al iniciar sesión.</small>
          </div>
          <div className="siger-pestanas"><span className="activa">Iniciar sesión</span><Link to="/registro">Registrarse</Link></div>
          {error && <div className="alert alert-danger mb-0" role="alert">{error}</div>}
          <div><label htmlFor="correo">Correo electrónico</label><input className="siger-campo" id="correo" type="email" placeholder="tucorreo@ejemplo.com" autoComplete="email" value={correo} onChange={e => setCorreo(e.target.value)} required /></div>
          <div><label htmlFor="clave">Contraseña</label><input className="siger-campo" id="clave" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          <button className="siger-btn" type="submit" disabled={cargando}>{cargando ? 'Ingresando...' : 'Iniciar sesión'}</button>
        </form>
      </section>
    </main>
  );
}
