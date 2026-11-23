# Scripts de Respaldo y Rotacion de Base de Datos (DRP)

**Proyecto:** Plataforma Distribuida de Comercializacion y Control Logistico Textil (D&D Textil)  
**Modulo:** Plan de Recuperacion ante Desastres (Disaster Recovery Plan - DRP)  
**Objetivos:** RPO <= 15 minutos | RTO <= 2 horas (el RPO solo se cumple si el script se programa cada 15 minutos con el Programador de tareas de Windows o con `cron`; los scripts no se programan solos)  

---

## 1. Descripcion General

Este modulo contiene scripts automatizados para generar volcados logicos de la base de datos PostgreSQL, comprimirlos mediante algoritmo Gzip, verificar su integridad matematica mediante SHA-256 y aplicar politicas de retencion y purga automatica para evitar el desbordamiento de disco.

Datos de cada ejecucion:

- Los archivos quedan en `BASE DE DATOS/respaldos/` (`respaldo_ddtextil_AAAAMMDD_HHMMSS.sql.gz` y su `.sha256`). Esa carpeta esta en `.gitignore`.
- Si `pg_dump` no esta instalado, el script lo ejecuta dentro del contenedor `ddtextil-db`.
- Los scripts no piden la contrasena: definala antes en la variable `PGPASSWORD` o en el archivo `.pgpass` (`pgpass.conf` en Windows).
- La rotacion borra los respaldos con mas dias que `DiasRetencion` (7 por defecto).

---

## 2. Modos de Ejecucion

### 2.1. Entorno Windows (PowerShell)
```powershell
# Ejecucion directa con parametros por defecto (localhost:5432)
powershell -ExecutionPolicy Bypass -File "BASE DE DATOS/scripts/respaldo_base_datos.ps1"

# Ejecucion parametrizada con host y dias de retencion especificos
powershell -ExecutionPolicy Bypass -File "BASE DE DATOS/scripts/respaldo_base_datos.ps1" `
  -HostDb "localhost" `
  -PuertoDb 5432 `
  -NombreDb "tienda_digital_textiles_db" `
  -UsuarioDb "postgres" `
  -DiasRetencion 14
```

### 2.2. Entorno Linux / macOS / Contenedores (Bash)
```bash
chmod +x "BASE DE DATOS/scripts/respaldo_base_datos.sh"
./BASE\ DE\ DATOS/scripts/respaldo_base_datos.sh localhost 5432 tienda_digital_textiles_db postgres 7
```

---

## 3. Procedimiento de Restauracion (Recovery)

En caso de contingencia o corrupcion de datos:

1. **Verificar la integridad del archivo:**
   ```bash
   sha256sum -c respaldo_ddtextil_YYYYMMDD_HHMMSS.sql.gz.sha256
   ```
   En Windows: `Get-FileHash respaldo_ddtextil_YYYYMMDD_HHMMSS.sql.gz -Algorithm SHA256` y comparar con el contenido del `.sha256`.

2. **Descomprimir el respaldo:**
   ```bash
   gzip -d respaldo_ddtextil_YYYYMMDD_HHMMSS.sql.gz
   ```

3. **Restaurar sobre PostgreSQL:**
   ```bash
   # En PostgreSQL nativo
   psql -h localhost -p 5432 -U postgres -d tienda_digital_textiles_db < respaldo_ddtextil_YYYYMMDD_HHMMSS.sql

   # O a traves del contenedor Docker
   docker exec -i ddtextil-db psql -U postgres -d tienda_digital_textiles_db < respaldo_ddtextil_YYYYMMDD_HHMMSS.sql
   ```
