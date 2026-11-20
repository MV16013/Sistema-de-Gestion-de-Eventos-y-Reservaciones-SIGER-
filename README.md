## SIGER GRUPO #4

Sistema de Gestión de Eventos y Reservaciones (SIGER).

## Descripción
Proyecto académico orientado al desarrollo de un
sistema de gestión de Eventos y Reservaciones.

## Frontend — SIGER

## Descripción
El Frontend del **Sistema de Gestión de Eventos y Reservaciones (SIGER)** es una aplicación web desarrollada con React, cuyo propósito es proporcionar una interfaz interactiva, moderna y adaptable a diferentes dispositivos para la administración de eventos, reservaciones y usuarios.
La aplicación consume los servicios REST proporcionados por el Backend desarrollado con Laravel, permitiendo consultar y visualizar la información almacenada en PostgreSQL.
El Frontend y el Backend se desarrollan como aplicaciones independientes, comunicándose mediante solicitudes HTTP y respuestas en formato JSON.

## Tecnologías utilizadas
| Tecnología | Función |
|---|---|
| **React** | Biblioteca JavaScript para desarrollar interfaces de usuario mediante componentes reutilizables. |
| **JavaScript (JSX)** | Lenguaje utilizado para implementar la lógica y los componentes visuales. |
| **Vite** | Herramienta de desarrollo y compilación que proporciona un servidor local con recarga rápida. |
| **Bootstrap** | Framework CSS utilizado para crear interfaces responsive y componentes visuales. |
| **Bootstrap Icons** | Biblioteca de iconos utilizada para mejorar la presentación de la interfaz. |
| **Axios** | Cliente HTTP utilizado para consumir los endpoints de la API REST de Laravel. |
| **React Router DOM** | Biblioteca destinada a gestionar la navegación entre las diferentes páginas de la aplicación. |
| **ESLint** | Herramienta de análisis estático para identificar problemas y mantener buenas prácticas en el código JavaScript y React. |
| **npm** | Gestor de paquetes utilizado para instalar y administrar las dependencias del proyecto. |

## Arquitectura del Frontend
SIGER utiliza una arquitectura de aplicaciones desacopladas:
- **Frontend:** React + Vite + Bootstrap.
- **Backend:** Laravel, mediante una API REST.
- **Base de datos:** PostgreSQL, ejecutado mediante Docker.
- **Comunicación:** HTTP y JSON, utilizando Axios.
El Frontend no accede directamente a PostgreSQL. Todas las operaciones sobre los datos se realizan a través de los endpoints proporcionados por Laravel.

## Estructura del proyecto
```text
Frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   └── layout/
│   ├── context/
│   ├── pages/
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── eslint.config.js
├── index.html
├── package.json
└── vite.config.js
```
La estructura está organizada para separar los componentes visuales, las páginas, los servicios HTTP y la gestión del estado compartido. Algunas carpetas se utilizarán durante las siguientes etapas de implementación.

## Instalación y ejecución
### Requisitos
- Node.js compatible con la versión de Vite instalada.
- npm.
- Backend Laravel configurado y en ejecución.
- PostgreSQL disponible para el Backend.

### Instalar dependencias
Desde la carpeta `Frontend/`:

```bash
npm install
```

### Configurar las variables de entorno
Crear el archivo `.env` en la raíz de `Frontend/`:
```env
VITE_API_URL=http://127.0.0.1:8000/api
```
La variable `VITE_API_URL` establece la dirección base de la API REST de Laravel.
Las variables que comienzan con `VITE_` son accesibles desde el navegador, por lo que no deben utilizarse para almacenar contraseñas ni información confidencial.

### Iniciar el servidor de desarrollo
```bash
npm run dev
```
Por defecto, Vite utiliza la dirección:
```text
http://localhost:5173
```

### Generar una versión de producción
```bash
npm run build
```

### Ejecutar el análisis de código
```bash
npm run lint
```

## Comunicación con el Backend
La comunicación con Laravel se encuentra centralizada mediante Axios en el archivo `src/services/api.js`.
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
  },
});

export default api;
```
Esta configuración permite realizar solicitudes HTTP a los diferentes endpoints sin repetir la dirección base del servidor.

### Primera integración funcional
Se implementó una consulta a:

```http
GET /api/eventos
```
La información recibida desde Laravel se procesa mediante React y se presenta dinámicamente utilizando tarjetas de Bootstrap.
Durante las pruebas se comprobó que el Frontend puede recuperar y mostrar correctamente los eventos registrados en PostgreSQL.

## Estado actual del desarrollo
**Funcionalidades implementadas y verificadas:**
- Creación del proyecto con React y Vite.
- Configuración inicial de Bootstrap y Bootstrap Icons.
- Instalación de Axios y React Router DOM.
- Configuración de variables de entorno.
- Conexión con la API REST de Laravel.
- Consulta de eventos mediante Axios.
- Visualización dinámica de eventos.
- Presentación responsive inicial mediante Bootstrap.
**Funcionalidades pendientes:**
- Pantallas de inicio de sesión y registro.
- Gestión de autenticación mediante Laravel Sanctum.
- Navegación entre páginas con React Router.
- Protección de rutas según los roles de usuario.
- Gestión de eventos para organizadores y administradores.
- Creación y cancelación de reservaciones desde la interfaz.
- Consulta de reservaciones del participante.
- Registro de asistencias.
- Consulta y lectura de notificaciones.
- Pruebas de integración y ajustes finales de la interfaz.

## Objetivo de la siguiente etapa
Implementar la autenticación de usuarios desde React, conectando los formularios de inicio de sesión y registro con los endpoints existentes de Laravel.
Posteriormente se desarrollarán las interfaces correspondientes a los roles **ADMINISTRADOR**, **ORGANIZADOR** y **PARTICIPANTE**, integrando progresivamente los módulos del sistema.

# SIGER — Backend

## Tecnologías utilizadas

El Backend del **Sistema de Gestión de Eventos y Reservaciones (SIGER)** está desarrollado mediante una arquitectura de API REST, utilizando Laravel y PostgreSQL para administrar usuarios, eventos, reservaciones y asistencias.

### Stack tecnológico
| Tecnología | Uso en el proyecto |
|---|---|
| **PHP 8.5.4** | Lenguaje de programación utilizado para desarrollar el Backend. |
| **Laravel 13** | Framework principal para implementar la API REST, controladores, modelos, validaciones y reglas de negocio. |
| **PostgreSQL** | Sistema gestor de bases de datos relacional para almacenar la información del sistema. |
| **Docker** | Contenerización del entorno de base de datos para facilitar su ejecución y configuración. |
| **Laravel Eloquent ORM** | Gestión de modelos, relaciones y consultas a PostgreSQL. |
| **Laravel Sanctum** | Autenticación mediante tokens Bearer para proteger los endpoints de la API. |
| **Laravel Policies** | Implementación de autorización y control de permisos según los roles de usuario. |
| **Composer** | Administración de dependencias y paquetes PHP. |
| **WSL2 / Ubuntu** | Entorno Linux utilizado para desarrollar y ejecutar el Backend desde Windows. |
| **Git y GitHub** | Control de versiones y colaboración en el desarrollo del proyecto. |
| **cURL y jq** | Pruebas de endpoints HTTP y procesamiento de respuestas JSON desde la terminal. |

## Arquitectura
El Backend sigue una arquitectura **REST API**, utilizando respuestas JSON para comunicarse con el Frontend.
Se organiza mediante los siguientes componentes:
- **Routes:** definición de los endpoints HTTP.
- **Controllers:** procesamiento de solicitudes y respuestas.
- **Models:** representación de las entidades y relaciones de la base de datos.
- **Policies:** autorización de operaciones según los roles.
- **Middleware:** protección de rutas mediante autenticación.
- **Validations:** comprobación de los datos recibidos.
- **Database Transactions:** ejecución segura de operaciones críticas, como la creación de reservaciones.

## Funcionalidades implementadas
Actualmente, el Backend incluye:
- Autenticación y cierre de sesión mediante tokens.
- Registro de participantes.
- Control de acceso por roles: ADMINISTRADOR, ORGANIZADOR y PARTICIPANTE.
- Consulta, creación, actualización y cancelación de eventos.
- Creación, consulta y cancelación de reservaciones.
- Prevención de reservaciones duplicadas.
- Validación de disponibilidad y capacidad de eventos.
- Registro de asistencias mediante códigos de confirmación.
- Prevención del registro duplicado de asistencias.
- Respuestas HTTP para solicitudes exitosas, errores de validación y accesos no autorizados.

## Base de datos
SIGER utiliza **PostgreSQL** con un esquema relacional compuesto por seis tablas principales:
1. `rol`
2. `usuario`
3. `evento`
4. `reserva`
5. `asistencia`
6. `notificacion`
El acceso a los datos se realiza mediante Eloquent ORM, respetando las claves primarias, claves foráneas y restricciones definidas en el esquema.

## Estado del desarrollo
El Backend cuenta con los módulos principales de autenticación, gestión de eventos, reservaciones y control de asistencias implementados y probados mediante solicitudes HTTP.
Se encuentra en fase de integración y revisión final, con el objetivo de conectarlo al Frontend desarrollado en React.
- Base de datos: PostgreSQL
- Control de versiones: Git y GitHub

## Módulos
- Gestión de usuarios
- Gestión de clientes
- Registro de operaciones contables
- Generación de reportes

## Contexto
Proyecto universitario de Desarrollo de Software.