# Zofri - Prototipo de red de tiendas

Instrucciones rápidas:

- Copia `.env.example` a `.env` y pon `MONGO_URI` con tu conexión a MongoDB.
- Instala dependencias: `npm install`
- Inicia el servidor: `npm run dev` (requiere `nodemon`) o `npm start`.

El backend sirve archivos estáticos en `public/` y expone API REST en `/api`.

Para añadir vendedores manualmente edita `seed/vendors.js` (hay un array `vendorsToAdd`).
