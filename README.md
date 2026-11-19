# SIGER GRUPO #4

Sistema de Gestión de Eventos y Reservaciones (SIGER).

## Descripción
Proyecto académico orientado al desarrollo de un
sistema de gestión de Eventos y Reservaciones.

## Tecnologías
- Frontend: React - Bootstrap
- Backend: Por definir
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