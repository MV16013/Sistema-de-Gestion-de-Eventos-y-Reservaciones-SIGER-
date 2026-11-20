import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Registro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', apellido: '', correo: '', password: '', password_confirmation: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const cambiar = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  async function registrar(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await api.post('/registro', form);
      navigate('/login', { replace: true });
    } catch (err) {
      const errores = err.response?.data?.errors;
      setError(errores ? Object.values(errores).flat().join(' ') : (err.response?.data?.mensaje || err.response?.data?.message || 'No se pudo completar el registro'));
    } finally { setCargando(false); }
  }
  return (
    <main className="siger-login">
      <section className="siger-login__marca">
        <div className="siger-marca"><span className="siger-logo">S</span><strong>SIGER</strong></div>
        <h1>Tu próximo evento comienza aquí.</h1>
        <p>Crea tu cuenta de participante y descubre los eventos disponibles.</p>
      </section>
      <section className="siger-login__formulario">
        <form className="siger-tarjeta siger-formulario" onSubmit={registrar}>
          <div><h2>Crear cuenta</h2><p className="siger-sec">Registro de participantes</p></div>
          <div className="siger-pestanas"><Link to="/login">Iniciar sesión</Link><span className="activa">Registrarse</span></div>
          {error && <div className="alert alert-danger mb-0" role="alert">{error}</div>}
          {[
            ['nombre', 'Nombre', 'text'], ['apellido', 'Apellido', 'text'],
            ['correo', 'Correo electrónico', 'email'], ['password', 'Contraseña', 'password'],
            ['password_confirmation', 'Confirmar contraseña', 'password'],
          ].map(([name, label, type]) => <div key={name}><label htmlFor={name}>{label}</label><input id={name} name={name} className="siger-campo" type={type} value={form[name]} onChange={cambiar} required /></div>)}
          <button className="siger-btn" disabled={cargando}>{cargando ? 'Registrando...' : 'Crear cuenta'}</button>
        </form>
      </section>
    </main>
  );
}
