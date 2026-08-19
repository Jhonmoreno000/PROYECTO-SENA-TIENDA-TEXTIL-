# Guía de Despliegue y Configuración

Esta sección detalla cómo configurar las variables de entorno, desplegar la plataforma utilizando contenedores de Docker o realizar una instalación manual directa en el servidor.

---

## 1. Despliegue con Docker (Recomendado)

El proyecto cuenta con configuración lista para **Docker** y **Docker Compose**, lo que permite empaquetar y levantar la base de datos, el backend y el frontend con un solo comando.

### 1.1 Requisitos Previos
*   [Docker Engine](https://docs.docker.com/engine/install/) v24 o superior.
*   [Docker Compose](https://docs.docker.com/compose/install/) v2 o superior (incorporado en Docker Desktop).

### 1.2 Servicios Contenedores

La infraestructura de servicios se define en `docker-compose.yml`:

| Nombre | Imagen Base | Puerto Expuesto | Descripción |
| :--- | :--- | :--- | :--- |
| **`db`** | `postgres:14` | `5432` | Motor de base de datos relacional PostgreSQL. |
| **`backend`** | `eclipse-temurin:17-jre` | `8081` | Servidor API REST compilado en Vanilla Java 17. |
| **`frontend`** | `nginx:alpine` | `3001` | Servidor web Nginx que sirve el bundle estático de React. |

### 1.3 Pasos para Desplegar

1.  **Clonar el Repositorio**:
    ```bash
    git clone https://github.com/Jhonmoreno000/PROYECTO-SENA-TIENDA-TEXTIL-
    cd PROYECTO-SENA-TIENDA-TEXTIL-
    ```
2.  **Configurar Variables de Entorno**:
    Copiar el archivo de plantilla a la raíz del proyecto:
    ```bash
    cp .env.example .env
    ```
    Abrir `.env` con un editor de texto y definir una contraseña segura para `POSTGRES_PASSWORD` y `DB_PASSWORD`.
3.  **Iniciar Contenedores**:
    ```bash
    docker compose up -d
    ```
    Este comando descargará las imágenes oficiales, compilará el frontend en producción y levantará los servicios en orden de dependencia (**Base de Datos $\to$ Backend Java $\to$ Frontend React**).
4.  **Verificar Estado de Servicios**:
    ```bash
    docker compose ps
    ```
    Todos los contenedores deben aparecer con estado `Up` o `Healthy`.

---

## 2. Variables de Entorno (`.env`)

Las credenciales de acceso a la base de datos y puertos de red se configuran en el archivo `.env` en la raíz del proyecto:

| Variable | Valor por Defecto | Descripción |
| :--- | :--- | :--- |
| **`POSTGRES_DB`** | `tienda_digital_textiles_db` | Nombre de la base de datos a crear. |
| **`POSTGRES_USER`** | `postgres` | Usuario administrador de PostgreSQL. |
| **`POSTGRES_PASSWORD`** | *(Requerido)* | Contraseña del administrador de base de datos. |
| **`DB_URL`** | `jdbc:postgresql://db:5432/tienda_digital_textiles_db` | Cadena de conexión JDBC utilizada por Java. |
| **`DB_USER`** | `postgres` | Usuario de conexión JDBC. |
| **`DB_PASSWORD`** | *(Requerido)* | Contraseña de conexión JDBC (debe coincidir con `POSTGRES_PASSWORD`). |

---

## 3. Comandos Útiles de Docker

*   **Ver Logs en Vivo**:
    ```bash
    docker compose logs -f
    ```
*   **Detener los Servicios**:
    ```bash
    docker compose down
    ```
*   **Detener y Eliminar Datos (Reseteo Completo)**:
    ```bash
    docker compose down -v
    ```
*   **Recompilar sin Caché**:
    ```bash
    docker compose build --no-cache
    ```
*   **Acceder a la Base de Datos**:
    ```bash
    docker compose exec db psql -U postgres -d tienda_digital_textiles_db
    ```

---

## 4. Despliegue Manual (Sin Contenedores)

Para ejecutar el entorno de desarrollo directamente sobre el sistema operativo local:

### 4.1 Base de Datos (PostgreSQL)
1.  Instalar PostgreSQL 14 o superior.
2.  Crear una base de datos llamada `tienda_digital_textiles_db`.
3.  Importar el script de estructura inicial ubicado en `BASE DE DATOS/TIENDA DIGITAL TEXTIL.sql` utilizando la consola de PostgreSQL o herramientas visuales (como pgAdmin o DBeaver).

### 4.2 Servidor Backend (Java)
1.  Instalar Java Development Kit JDK 17 o superior.
2.  Configurar las variables de entorno `DB_USER` y `DB_PASSWORD` en el sistema operativo.
3.  Compilar y ejecutar la clase principal en `backend-java/conexionPostgres`:
    ```bash
    javac -d bin -cp "lib/*" src/**/*.java
    java -cp "bin;lib/*" domain.App
    ```

### 4.3 Servidor Frontend (React)
1.  Instalar Node.js v18 o superior.
2.  Navegar a la carpeta del frontend `tienda digital de telas/` e instalar las dependencias:
    ```bash
    npm install
    ```
3.  Ejecutar el servidor local en modo desarrollo:
    ```bash
    npm run dev
    ```
    La consola indicará el puerto local asignado (por defecto, `http://localhost:5173`).
