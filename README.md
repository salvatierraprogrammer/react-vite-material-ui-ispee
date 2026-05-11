# Apuntes ISPEE

Plataforma colaborativa de apuntes académicos para el Instituto Superior Politécnico de Educación Empresarial (ISPEE). Los estudiantes pueden compartir, descargar, valorar y comentar materiales de estudio, participar en un foro, chatear en tiempo real, reportar contenido inapropiado y gestionar su perfil.

## Stack

| Capa       | Tecnología                                             |
| ---------- | ------------------------------------------------------ |
| Frontend   | React 19, Vite 8, Material UI 9, Emotion              |
| Estado     | Redux Toolkit, React-Redux 9                           |
| Routing    | React Router DOM 7                                     |
| Backend    | Firebase (Auth, Firestore, Storage)                    |
| Imágenes   | react-easy-crop (recorte circular de avatar)           |

## Funcionalidades

- **Autenticación** — Email/contraseña y Google Sign-In. Registro con nombre + apellido. Verificación de email y recuperación de contraseña.
- **Materiales** — Subida de PDF/DOCX/PPTX (max 20 MB), vista previa, descarga con contador, valoración (estrellas con promedio), comentarios en cada material. Filtros por año, materia, tipo y orden.
- **Favoritos** — Marcado de materiales como favoritos, persistido en Firestore (array en el documento del usuario).
- **Foro** — Posts con like/unlike, comentarios en cada post, edición y borrado propio.
- **Chat** — Mensajería en tiempo real texto-solo. Búsqueda de usuarios, indicador de online, conversaciones ordenadas por última actividad.
- **Notificaciones** — Notificaciones push-style para nuevos mensajes, nuevos materiales y sanciones del admin (advertencias, suspensiones, bloqueos). Marcado individual/masivo como leído, borrado.
- **Reportes** — Botón "Reportar" en materiales, posts del foro, comentarios y mensajes del chat. Modal con selección de motivo (inapropiado, spam, ofensivo, plagio, duplicado, otro). Los reportes se almacenan en Firestore y son gestionables por administradores.
- **Perfil** — Edición de nombre, apellido, descripción, carrera y año cursante. Foto de perfil con recorte circular. El rol público siempre muestra "Estudiante" independientemente del rol real.
- **Centro de Ayuda** — Página `/ayuda` con preguntas frecuentes en formato accordion.
- **Modo invitado** — Navegación sin autenticación. Las acciones protegidas (subir, comentar, valorar, chatear, etc.) muestran un modal elegante invitando a login/register.
- **Seguridad** — Reglas de Firestore y Storage con principio de mínimo privilegio: solo el owner puede editar/borrar, lecturas públicas en colecciones de contenido, contadores modificables por cualquier usuario autenticado. Roles: admin, moderador, profesor, estudiante.
- **Responsive** — Diseño adaptable a móviles, tablets y desktop con grid dinámico.
- **Dark Mode** — Toggle claro/oscuro persistido en el estado global.

## Rutas

| Ruta              | Página            | Protegida |
| ----------------- | ----------------- | --------- |
| `/`               | Home (materiales) | No        |
| `/materias`       | Materias          | No        |
| `/material/:id`   | Detalle material  | No        |
| `/foro`           | Foro              | No        |
| `/ayuda`          | Centro de Ayuda   | No        |
| `/login`          | Login             | No        |
| `/register`       | Registro          | No        |
| `/reset-password` | Reset password    | No        |
| `/intro`          | Intro animado     | No        |
| `/favoritos`      | Favoritos         | Sí        |
| `/mis-aportes`    | Mis Aportes       | Sí        |
| `/mensajes`       | Mensajes (chat)   | Sí        |
| `/perfil`         | Perfil            | Sí        |
| `/configuracion`  | Configuración     | Sí        |
| `/admin/*`        | Panel admin       | Admin     |

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Firebase debe tener habilitados:
- **Authentication** con Email/Password y Google
- **Firestore Database** (aplicar reglas de `firestore.rules`)
- **Storage** (aplicar reglas de `storage.rules`)
- **Índices compuestos**: colección `users` en campos `name`, `lastName`, `email` para búsqueda por prefijo

## Scripts

```bash
npm run dev      # Entorno de desarrollo (Vite HMR)
npm run build    # Build de producción
npm run preview  # Vista previa del build
npm run lint     # ESLint
```
