# Volcado legado (no se ejecuta)

`TIENDA DIGITAL TEXTIL.sql` es un pg_dump antiguo con las tablas en ingles (`users`, `products`, `orders`...).
El backend actual usa solo el esquema en espanol de `01_esquema_espanol.sql` y `02_datos_iniciales.sql`.

Se guarda en esta subcarpeta para que Docker no lo ejecute: `docker-compose.yml` monta `BASE DE DATOS/`
en `docker-entrypoint-initdb.d`, y PostgreSQL solo ejecuta los `.sql` del primer nivel, no los de subcarpetas.
