# Sistema de Gestión de Trámites Municipales - Municipalidad de La Victoria 🏛️🤖

Este proyecto es una plataforma web moderna para la **Municipalidad de La Victoria** orientada a digitalizar, agilizar e indexar automáticamente los trámites y solicitudes presentados por los ciudadanos. El sistema integra **Inteligencia Artificial (IA)** para clasificar automáticamente las solicitudes en tiempo real mediante un modelo de lenguaje alojado en **Google Colab**.

---

## 🏗️ Arquitectura General del Sistema

El ecosistema está compuesto por tres componentes principales que trabajan de forma coordinada:

```
  ┌─────────────────────────────────────────────────────────────┐
  │                        FRONTEND                             │
  │  (React + Vite + Tailwind CSS / Vanilla CSS + Contexts)     │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                        HTTP Peticiones (JSON)
                        Bearer Token (JWT)
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                         BACKEND                             │
  │             (Node.js + Express.js + REST API)               │
  └──────────────┬──────────────────────────────┬───────────────┘
                 │                              │
          Consultas SQL                 Clasificación (POST)
                 │                              │
                 ▼                              ▼
  ┌─────────────────────────────┐┌──────────────────────────────┐
  │      BASE DE DATOS          ││     INTELIGENCIA ARTIFICIAL  │
  │     (MySQL / MariaDB)       ││    (Google Colab + ngrok)    │
  └─────────────────────────────┘└──────────────────────────────┘
```

### 1. Frontend (React + Vite)
*   **Tecnologías**: React.js, Vite (para una compilación ultrarrápida), Vanilla CSS / Tailwind.
*   **Gestión del Estado**: Utiliza el patrón de **Contextos** (`AuthContext`, `TramitesContext`, `NotificationContext`, `ThemeContext`) y **Hooks Personalizados** (como `useFormValidation`) para compartir información global de manera limpia.
*   **Comunicación con el Backend**: Centralizada en `apiClient.js` mediante la librería **Axios**.
    *   **Interceptor de Peticiones**: Agrega de forma transparente el token JWT (`Bearer Token`) recuperado de `localStorage` a cada cabecera de petición HTTP.
    *   **Interceptor de Respuestas**: Detecta errores del servidor, y en caso de recibir un `401 Unauthorized` (Token expirado o inválido), limpia de forma automática el almacenamiento local y redirige al usuario al Login mediante un evento global (`auth:unauthorized`).

### 2. Backend (Node.js + Express.js)
*   **Tecnologías**: Express para el enrutamiento HTTP, `mysql2` para pools de conexiones asíncronas y promesas, `jsonwebtoken` para seguridad, y `bcryptjs` para la criptografía de contraseñas.
*   **Manejo Global de Errores**:
    *   Rutas inexistentes (404) manejadas de forma amigable.
    *   Manejador de errores crítico (500) que evita la caída del proceso y retorna respuestas estructuradas al frontend sin revelar información sensible en entornos de producción.

### 3. Base de Datos (MySQL)
*   **Estructura**: Administrada en XAMPP. Consta de dos tablas principales:
    *   `usuarios`: Almacena información de ciudadanos, personal municipal (`staff`) y administradores.
    *   `tramites`: Almacena el asunto, la descripción detallada, prioridad, el porcentaje de certeza asignado por la IA, el estado de atención y el personal encargado del seguimiento.
*   **Vistas e Índices**: Implementa la vista `tramites_completos` para unificar la información del solicitante y el encargado asignado mediante cruces relacionales (`LEFT JOIN`), además de índices de velocidad (`idx_dni`, `idx_estado`, `idx_prioridad`).

### 4. Servicio de Inteligencia Artificial (Google Colab)
*   Un modelo de Machine Learning / Procesamiento de Lenguaje Natural (PLN) se hospeda de forma remota en Google Colab.
*   Se expone de forma segura a internet mediante un túnel **ngrok** que genera una dirección dinámica accesible para el servidor Node.js.

---

## 🔄 Flujo de Trabajo y Procesos (Paso a Paso)

A continuación, se detallan los flujos interactivos clave del sistema:

### A. Registro y Autenticación del Usuario
1.  **Petición**: El usuario (Ciudadano) ingresa sus datos (DNI, nombres, correo, contraseña) en el formulario de registro del Frontend.
2.  **Validación y Encriptado**: El backend realiza validaciones estrictas de formato (DNI de 8 dígitos, formato de correo) y utiliza **bcryptjs** para generar un hash de la contraseña antes de persistir los datos en la tabla `usuarios`.
3.  **Login Híbrido**: Cuando el usuario intenta iniciar sesión:
    *   El backend busca el usuario por email.
    *   Intenta comparar la contraseña recibida usando el hash de **bcrypt**.
    *   **Mecanismo de Contingencia**: Si la comparación falla (por ejemplo, para usuarios de prueba importados directamente desde `script.sql`), el backend realiza una comparación directa en texto plano para garantizar la compatibilidad durante desarrollo.
4.  **Generación de Token**: Si las credenciales coinciden, el servidor firma un token JWT que expira en 8 horas, codificando el `id`, `rol` y `dni` del usuario. Este token se entrega al frontend y se guarda en el navegador.

---

### B. Flujo de Creación de un Trámite con Clasificación de IA (Crítico)
Este es el flujo principal de integración tecnológica:

```
 Ciudadano          React App            Express API          Google Colab           MySQL BD
    │                   │                     │                     │                   │
    │ 1. Completa form. │                     │                     │                   │
    ├──────────────────>│                     │                     │                   │
    │    y envía        │ 2. POST /tramites   │                     │                   │
    │                   ├────────────────────>│                     │                   │
    │                   │    (asunto, descr)  │                     │                   │
    │                   │                     │ 3. Petición POST    │                   │
    │                   │                     ├────────────────────>│                   │
    │                   │                     │   (Timeout: 5s)     │                   │
    │                   │                     │                     │ 4. Procesa texto  │
    │                   │                     │                     │    con Modelo IA  │
    │                   │                     │ 5. Devuelve JSON    │                   │
    │                   │                     │    con Prioridad,   │                   │
    │                   │                     │    Confianza y Acc. │                   │
    │                   │                     │<────────────────────┤                   │
    │                   │                     │                     │                   │
    │                   │                     │ 6. Normaliza e      │                   │
    │                   │                     │    inserta en BD    │                   │
    │                   │                     ├────────────────────────────────────────>│
    │                   │                     │                     │                   │
    │                   │ 7. Respuesta 201    │                     │                   │
    │                   │<────────────────────┤                     │                   │
    │ 8. Renderiza      │                     │                     │                   │
    │    en pantalla    │                     │                     │                   │
    │<──────────────────┤                     │                     │                   │
```

1.  **Entrada de Datos**: El ciudadano (o el personal de mesa de partes en representación del ciudadano) ingresa el **Asunto** y la **Descripción** de la solicitud en el módulo de trámites.
2.  **Envío**: El Frontend envía una petición `POST` a `/api/tramites` junto al DNI del solicitante y los textos del trámite.
3.  **Procesamiento en Backend**:
    *   El backend extrae los datos e identifica el Rol del usuario logueado desde el JWT. Si es ciudadano, asegura que el trámite quede vinculado obligatoriamente a su DNI del token. Si es staff, le permite ingresar el DNI de cualquier ciudadano.
4.  **Llamada al servicio de IA (Google Colab)**:
    *   El backend invoca la clase `ClasificacionService.js` pasándole el asunto y descripción.
    *   Se realiza una llamada `POST` a la `COLAB_URL` configurada a través del túnel ngrok.
    *   **Gestión de Fallos e Inactividad**: Para evitar guardar trámites sin indexación automática en caso de que Google Colab esté inactivo o tarde demasiado, se establece un **timeout riguroso de 5 segundos**. Si no responde, la petición se cancela, se aborta la inserción en la base de datos, y se devuelve un estado `503 Service Unavailable` sugiriéndole al usuario reintentar más tarde.
5.  **Análisis por IA**: El modelo de lenguaje analiza semánticamente el texto del trámite y clasifica:
    *   **Prioridad** (Enum: `'Alta'`, `'Media'`, `'Baja'`).
    *   **Certeza** (Confianza del modelo decimal, por ejemplo `0.954` o `95.40%`).
    *   **Acción sugerida** (Ej: `"Derivar a Saneamiento y Obras Públicas"`).
6.  **Normalización**: El backend recibe la respuesta del modelo, normaliza la prioridad a formato con primera letra mayúscula, convierte la confianza a porcentaje limpio (`DECIMAL(5,2)`) y trunca la acción sugerida para no exceder los límites físicos de la columna en la BD.
7.  **Persistencia**: Se inserta el trámite con su respectiva clasificación en la tabla `tramites` de MySQL.
8.  **Respuesta**: El servidor retorna el objeto del trámite creado y clasificado con código HTTP `201 Created`. El Frontend actualiza los contextos globales de forma reactiva mostrándolo de inmediato al usuario con indicadores visuales de color según la prioridad sugerida por la IA.

---

### C. Visualización y Gestión de Trámites
*   **Visualización Segura (RBAC)**:
    *   Cuando un usuario solicita el listado de trámites (`GET /api/tramites`), el backend valida su rol.
    *   Si es **Ciudadano**, el backend altera dinámicamente la consulta SQL para inyectar obligatoriamente una condición `WHERE t.dni = ?` utilizando el DNI encriptado en su token JWT. Esto previene fugas de seguridad donde un ciudadano pudiera ver solicitudes ajenas.
    *   Si el usuario es **Staff** o **Admin**, el backend le otorga acceso al listado general de toda la municipalidad y habilita los filtros avanzados de estado, prioridad y motor de búsqueda de texto (DNI o asunto).
*   **Actualización y Flujo de Atención**:
    *   El personal municipal (`staff`) puede revisar el listado total, priorizar tareas en función del semáforo asignado por la IA, y autoasignarse o asignar el trámite a otro colega.
    *   El staff actualiza el estado del trámite (`pendiente` -> `en_proceso` -> `atendido` o `rechazado`).
    *   Cada cambio actualiza la fecha de modificación en la base de datos de manera automatizada gracias a la instrucción `ON UPDATE CURRENT_TIMESTAMP` del motor SQL.

---

## 🛠️ Guía de Ejecución y Configuración

### Configuración del Backend (`/backend`)
1. Instale las dependencias del backend:
   ```bash
   cd backend
   npm install
   ```
2. Configure el archivo `.env` en la raíz de la carpeta `/backend` con la estructura de su base de datos local y su token de ngrok:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=
   DB_NAME=municipalidad_la_victoria
   DB_PORT=3306
   JWT_SECRET=super_secreto_clave_municipalidad_la_victoria_2026_valida
   COLAB_URL=https://[TU-URL-DE-NGROK].ngrok-free.dev/clasificar
   ```
3. Inicie el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### Configuración del Frontend (`/frontend`)
1. Instale las dependencias del frontend:
   ```bash
   cd frontend
   npm install
   ```
2. Configure el archivo `.env` en la raíz de la carpeta `/frontend` para apuntar a su servidor API:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
3. Inicie el entorno de desarrollo:
   ```bash
   npm run dev
   ```

### Base de Datos (`MySQL / MariaDB`)
1. Inicie **Apache** y **MySQL** desde el Panel de Control de **XAMPP**.
2. Vaya a `http://localhost/phpmyadmin`.
3. Cree una base de datos llamada `municipalidad_la_victoria`.
4. Importe el archivo `script.sql` ubicado en la raíz del proyecto para crear las tablas, índices, vistas e insertar los usuarios y trámites semilla de prueba.
