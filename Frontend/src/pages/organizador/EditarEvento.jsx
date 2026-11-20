import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const formularioInicial = {
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    ubicacion: '',
    capacidad_maxima: '',
};

// Convierte el formato recibido al esperado por datetime-local.
// Se asume que SIGER almacena las fechas en hora local.
function fechaParaInput(valor) {
    if (!valor) return '';

    return String(valor)
        .replace(' ', 'T')
        .slice(0, 16);
}

export default function EditarEvento() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formulario, setFormulario] = useState(formularioInicial);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [eventoDisponible, setEventoDisponible] = useState(false);

    useEffect(() => {
        let activo = true;

        async function cargarEvento() {
            try {
                const { data } = await api.get(
                    `/organizador/eventos/${id}/editar`
                );

                if (!activo) return;

                const evento = data.evento;

                setFormulario({
                    nombre: evento.nombre || '',
                    descripcion: evento.descripcion || '',
                    fecha_inicio: fechaParaInput(evento.fecha_inicio),
                    fecha_fin: fechaParaInput(evento.fecha_fin),
                    ubicacion: evento.ubicacion || '',
                    capacidad_maxima: evento.capacidad_maxima ?? '',
                });

                setEventoDisponible(true);

            } catch (err) {
                if (activo) {
                    setError(
                        err.response?.data?.mensaje ||
                        err.response?.data?.message ||
                        'No se pudo cargar el evento.'
                    );
                }
            } finally {
                if (activo) setCargando(false);
            }
        }

        cargarEvento();

        return () => {
            activo = false;
        };
    }, [id]);

    function cambiarCampo(e) {
        const { name, value } = e.target;

        setFormulario(anterior => ({
            ...anterior,
            [name]: value,
        }));
    }

    async function guardarCambios(e) {
        e.preventDefault();
        setError('');

        if (new Date(formulario.fecha_fin) <= new Date(formulario.fecha_inicio)) {
            setError('La fecha de finalización debe ser posterior al inicio.');
            return;
        }

        setGuardando(true);

        try {
            const datos = {
                ...formulario,
                capacidad_maxima: Number(formulario.capacidad_maxima),
            };

            await api.patch(`/eventos/${id}`, datos);

            navigate('/organizador/eventos', {
                replace: true,
                state: {
                    mensaje: 'Evento actualizado correctamente.',
                },
            });

        } catch (err) {
            const errores = err.response?.data?.errors;

            const detalle = errores
                ? Object.values(errores).flat().join(' ')
                : null;

            setError(
                detalle ||
                err.response?.data?.mensaje ||
                err.response?.data?.message ||
                'No se pudo actualizar el evento.'
            );

        } finally {
            setGuardando(false);
        }
    }

    return (
        <main className="siger-contenido">
            <div className="siger-encabezado mb-4">
                <h1>Editar evento</h1>
                <p className="siger-sec">
                    Modifica la información del evento seleccionado.
                </p>
            </div>

            <Link
                to="/organizador/eventos"
                className="btn btn-outline-primary mb-4"
            >
                <i className="bi bi-arrow-left me-2" />
                Volver a mis eventos
            </Link>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {cargando ? (
                <p>Cargando información del evento...</p>
            ) : !eventoDisponible ? (
                <p className="siger-sec">
                    No es posible editar este evento.
                </p>
            ) : (
                <form
                    className="siger-tarjeta p-4"
                    onSubmit={guardarCambios}
                    style={{ maxWidth: '800px' }}
                >
                    <div className="mb-3">
                        <label htmlFor="nombre" className="form-label">
                            Nombre del evento
                        </label>
                        <input
                            id="nombre"
                            name="nombre"
                            className="form-control"
                            maxLength={150}
                            value={formulario.nombre}
                            onChange={cambiarCampo}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="descripcion" className="form-label">
                            Descripción
                        </label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            className="form-control"
                            rows={4}
                            value={formulario.descripcion}
                            onChange={cambiarCampo}
                        />
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="fecha_inicio" className="form-label">
                                Fecha de inicio
                            </label>
                            <input
                                id="fecha_inicio"
                                type="datetime-local"
                                name="fecha_inicio"
                                className="form-control"
                                value={formulario.fecha_inicio}
                                onChange={cambiarCampo}
                                required
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="fecha_fin" className="form-label">
                                Fecha de finalización
                            </label>
                            <input
                                id="fecha_fin"
                                type="datetime-local"
                                name="fecha_fin"
                                className="form-control"
                                value={formulario.fecha_fin}
                                onChange={cambiarCampo}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="ubicacion" className="form-label">
                            Ubicación
                        </label>
                        <input
                            id="ubicacion"
                            name="ubicacion"
                            className="form-control"
                            maxLength={200}
                            value={formulario.ubicacion}
                            onChange={cambiarCampo}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="capacidad_maxima" className="form-label">
                            Capacidad máxima
                        </label>
                        <input
                            id="capacidad_maxima"
                            type="number"
                            name="capacidad_maxima"
                            className="form-control"
                            min="1"
                            step="1"
                            value={formulario.capacidad_maxima}
                            onChange={cambiarCampo}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={guardando}
                    >
                        <i className="bi bi-floppy me-2" />
                        {guardando ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </form>
            )}
        </main>
    );
}
