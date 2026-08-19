<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=00b4d8&height=200&section=header&text=D%26D%20Textil&fontSize=70&animation=fadeIn" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=java&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" />
  <img src="https://img.shields.io/badge/Kotlin-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white" />
</p>

---

## PRESENTACION DEL PROYECTO

D&D Textil es un ecosistema tecnológico diseñado para optimizar los procesos de comercialización, distribución y gestión de inventario en la industria textil. La solución integra un frontend moderno bajo arquitectura reactiva, un backend corporativo ligero y un modelo de datos relacional para control de inventarios, métricas y gestión de pedidos en tiempo real.

---

## INDICE DE DOCUMENTACION

Toda la documentación técnica se encuentra centralizada y estructurada para su consulta rápida en el siguiente enlace:

> **[Portal General de Documentación (DOCUMENTACION.md)](file:///c:/Users/Anderson%20Moreno/Downloads/PROYECTO-SENA-TIENDA-TEXTIL-/DOCUMENTACION.md)**

---

## GUIA RAPIDA DE INSTALACION (DOCKER)

### Requisitos del Sistema
*   Docker Engine v24 o superior
*   Docker Compose v2 o superior

### Procedimiento de Despliegue

```bash
# 1. Clonar el repositorio del proyecto
git clone https://github.com/Jhonmoreno000/PROYECTO-SENA-TIENDA-TEXTIL-
cd PROYECTO-SENA-TIENDA-TEXTIL-

# 2. Configurar el archivo de variables de entorno
cp .env.example .env

# 3. Inicializar los servicios en modo segundo plano
docker compose up -d
```

### Puertos de Red Asignados

| Servicio | URL de Acceso |
| :--- | :--- |
| **Frontend de la Aplicación** | [http://localhost:3001](http://localhost:3001) |
| **Backend API (REST)** | [http://localhost:8081](http://localhost:8081) |

---

## CREDENCIALES DE ACCESO DE PRUEBA

El sistema cuenta con usuarios de prueba sembrados en la base de datos para validar las diferentes funcionalidades e interfaces según los niveles de acceso del software:

| Rol de Usuario | Correo Electrónico | Contraseña |
| :--- | :--- | :--- |
| **Cliente** | `cliente@ddtextil.com` | `cliente123` |
| **Vendedor** | `vendedor@ddtextil.com` | `vendedor123` |
| **Administrador** | `admin@ddtextil.com` | `admin123` |

---

Para detener y limpiar la ejecución de los contenedores locales, utilice el comando `docker compose down`. Si requiere resetear la persistencia de datos (base de datos), añada el flag `-v`: `docker compose down -v`.
