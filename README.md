# Forenode AI — Frontend

Aplicación Angular 21 para operar el motor de inteligencia logística agrícola de Forenode AI Enterprise Core V4.0.

## Capacidades

- Acceso con correo/contraseña y OAuth de Google mediante Supabase.
- Bearer token añadido por interceptor y redirección segura ante una sesión expirada.
- Catálogo regional servido por FastAPI.
- Registro trazable de inventario y ejecución del matching.
- Resultados con intervalo de demanda, error validado, clima y procedencia del inventario.
- Temas claro/oscuro y diseño responsive.

## Desarrollo

```bash
npm ci
npm start
npm test -- --watch=false
npm run build
```

La URL de API se define en `src/environments/environment.ts`. Vercel usa `vercel.json` para conservar las rutas de Angular y aplicar cabeceras de seguridad.

