# Volcado legado (no se ejecuta)

`TIENDA DIGITAL TEXTIL.sql` es un pg_dump antiguo con las tablas en ingles (`users`, `products`, `orders`...).
El backend actual usa solo el esquema en espanol de `01_esquema_espanol.sql` y `02_datos_iniciales.sql`.

Docker no lo ejecuta: `docker-compose.yml` monta solo `01_esquema_espanol.sql` y `02_datos_iniciales.sql`
en `docker-entrypoint-initdb.d`. Se conserva como referencia historica del modelo anterior.
