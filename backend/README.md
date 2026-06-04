# Municipalidad de La Victoria - API de Trámites Municipales 🏛️

Este es el backend desarrollado en **Node.js** con **Express** para el sistema de trámites de la **Municipalidad de La Victoria**. Integra autenticación segura basada en tokens JWT, un pool de conexiones optimizado para **MySQL (XAMPP)**, y realiza una clasificación inteligente en tiempo real mediante un modelo de Machine Learning en **Google Colab (Flask + ngrok)**.

---

## 🚀 Requisitos Previos

Asegúrate de contar con las siguientes herramientas en tu entorno:
1. **Node.js** (Versión 16 o superior recomendada).
2. **XAMPP** o servidor MySQL local levantado en el puerto `3306`.
3. **Google Colab** corriendo con tu script Flask y expuesto mediante la URL pública de **ngrok**.

---

## 🛠️ Instalación y Configuración

Sigue estos sencillos pasos para levantar el backend en tu entorno local:

1. **Navegar al directorio del backend:**
   ```bash
   cd backend
   ```

2. **Instalar dependencias:**
   Instala todos los paquetes de producción y desarrollo (`nodemon`):
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno:**
   Crea un archivo llamado `.env` en la raíz de la carpeta `backend/` (ya se encuentra configurado para ti) y ajusta los valores necesarios:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=
   DB_NAME=municipalidad_la_victoria
   DB_PORT=3306
   JWT_SECRET=super_secreto_clave_municipalidad_la_victoria_2026_valida
   JWT_EXPIRES_IN=8h
   COLAB_URL=https://xxxx.ngrok.io/clasificar
   ```
   > 💡 **Nota:** Cada vez que reinicies Google Colab y ngrok te dé una nueva dirección pública, recuerda actualizar el valor de `COLAB_URL` en tu archivo `.env` y reiniciar el servidor de Node.js.

---

## 💻 Ejecución del Servidor

Puedes ejecutar el backend usando dos modos:

* **Modo Desarrollo (Nodemon - Recarga Automática):**
  Ideal para desarrollo. Detecta cambios en el código y reinicia el servidor automáticamente.
  ```bash
  npm run dev
  ```

* **Modo Producción:**
  Levanta el servidor directamente usando la máquina de Node.
  ```bash
  npm start
  ```

Al iniciar, verás en la consola la confirmación exitosa de conexión a la base de datos:
`✅ Conexión exitosa a la base de datos MySQL en XAMPP.`

---

## 📖 Documentación de la API (REST Endpoints)

Todas las respuestas de la API utilizan un formato JSON estándar y predecible:
`{ "success": boolean, "message": string, "data": object|array }`

---

### 1. Autenticación (`/api/auth`)

#### 📝 Registrar Ciudadano
* **Endpoint:** `POST /api/auth/register`
* **Acceso:** Público
* **Payload (JSON):**
  ```json
  {
    "dni": "87654322",
    "nombres": "Carlos",
    "apellidos": "Mendoza",
    "email": "carlos.mendoza@gmail.com",
    "password": "ciudadano123",
    "telefono": "988776655",
    "direccion": "Jr. Sebastian Barranca 456"
  }
  ```
* **Respuesta Exitosa (201 Created):**
  ```json
  {
    "success": true,
    "message": "Usuario registrado exitosamente.",
    "data": {
      "id": 6,
      "dni": "87654322",
      "nombres": "Carlos",
      "apellidos": "Mendoza",
      "email": "carlos.mendoza@gmail.com",
      "rol": "ciudadano"
    }
  }
  ```

#### 🔑 Iniciar Sesión (Login Híbrido)
* **Endpoint:** `POST /api/auth/login`
* **Acceso:** Público
* **Lógica Especial:** Valida contraseñas encriptadas con `bcrypt` (nuevos registros) y también soporta comparación directa en texto plano (para cuentas de prueba como `admin123`, `staff123` e `ciudadano123`).
* **Payload (JSON):**
  ```json
  {
    "email": "ana.quispe@lavictoria.gob.pe",
    "password": "staff123"
  }
  ```
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "success": true,
    "message": "Inicio de sesión exitoso.",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "usuario": {
        "id": 2,
        "dni": "12345678",
        "nombres": "Ana",
        "apellidos": "Quispe",
        "email": "ana.quispe@lavictoria.gob.pe",
        "rol": "staff"
      }
    }
  }
  ```

---

### 2. Gestión de Trámites (`/api/tramites`)

*Todos los endpoints de esta sección requieren adjuntar el token JWT en las cabeceras HTTP:*
`Authorization: Bearer <TU_TOKEN_JWT>`

#### ➕ Crear Nuevo Trámite
* **Endpoint:** `POST /api/tramites`
* **Acceso:** Autenticado (Cualquier rol)
* **Comportamiento Crítico de IA:**
  - El backend intercepta el trámite y envía el texto a clasificar a tu Google Colab.
  - **REGLA DE CONSERVACIÓN:** Si Google Colab está fuera de línea, la petición se detiene, **no se guarda absolutamente nada en MySQL**, y la API responde con un estado **503 Service Unavailable** y el mensaje de intentar más tarde.
* **Payload (JSON):**
  ```json
  {
    "asunto": "Colapso de alcantarillado en Jr. Renovación",
    "descripcion": "Se ha roto una tubería principal y el agua residual está inundando el Jr. Renovación cuadra 8, afectando viviendas."
  }
  ```
* **Respuesta Exitosa (210 Created):**
  ```json
  {
    "success": true,
    "message": "Trámite registrado e indexado por IA de forma exitosa.",
    "data": {
      "id": 4,
      "dni": "10485721",
      "asunto": "Colapso de alcantarillado en Jr. Renovación",
      "descripcion": "Se ha roto una tubería...",
      "prioridad": "Alta",
      "certeza": 96.8,
      "accion_sugerida": "Derivar a Defensa Civil y Saneamiento",
      "estado": "pendiente"
    }
  }
  ```

#### 📋 Listar Trámites con Filtros (RBAC)
* **Endpoint:** `GET /api/tramites`
* **Acceso:** Autenticado
* **Restricción de Rol:**
  - Si eres **ciudadano**, el backend filtra de forma automática y estricta mostrando **únicamente** tus propios trámites en base a tu DNI.
  - Si eres **staff** o **admin**, tienes visibilidad global de todos los trámites registrados en el municipio.
* **Query Params Opcionales:**
  - `estado`: pendiente | en_proceso | atendido | rechazado
  - `prioridad`: Alta | Media | Baja
  - `search`: Busca por DNI del solicitante o por texto en el Asunto.
* **Ejemplo de Petición (Staff listando de alta prioridad):**
  `GET /api/tramites?prioridad=Alta`
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "success": true,
    "message": "Se recuperaron 2 trámites exitosamente.",
    "data": [
      {
        "id": 1,
        "usuario_id": 4,
        "dni": "10485721",
        "asunto": "Colapso de alcantarillado en Av. Aviación",
        "descripcion": "Inundación por alcantarillado...",
        "prioridad": "Alta",
        "certeza": 95.40,
        "accion_sugerida": "Derivar a Defensa Civil y Saneamiento",
        "estado": "pendiente",
        "fecha_creacion": "2026-05-31T07:20:00.000Z",
        "solicitante": "Juan Pérez",
        "asignado_nombre": "Roberto Chávez"
      }
    ]
  }
  ```

#### ✏️ Actualizar Trámite (Cambio de Estado o Asignación)
* **Endpoint:** `PATCH /api/tramites/:id`
* **Acceso:** Exclusivo **Staff** / **Admin**
* **Payload (JSON):** Puedes enviar uno o ambos campos.
  ```json
  {
    "estado": "en_proceso",
    "asignado_a": 3
  }
  ```
* **Respuesta Exitosa (200 OK):**
  ```json
  {
    "success": true,
    "message": "Trámite actualizado correctamente.",
    "data": {
      "id": 1,
      "dni": "10485721",
      "asunto": "Colapso de alcantarillado en Av. Aviación",
      "descripcion": "...",
      "prioridad": "Alta",
      "certeza": 95.40,
      "accion_sugerida": "Derivar a Defensa Civil y Saneamiento",
      "estado": "en_proceso",
      "fecha_creacion": "2026-05-31T07:20:00.000Z",
      "solicitante": "Juan Pérez",
      "asignado_nombre": "Roberto Chávez"
    }
  }
  ```
