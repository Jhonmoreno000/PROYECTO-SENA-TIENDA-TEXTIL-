package infraestructura.api;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.File;
import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

import aplicacion.servicios.ServicioAutenticacion;
import dominio.repositorios.RepositorioUsuario;
import infraestructura.persistencia.jdbc.JdbcRepositorioUsuarioImpl;
import infraestructura.api.manejadores.*;

/**
 * Servidor HTTP principal de la API REST para la tienda textil D&D Textil.
 * Configura y arranca el servidor embebido de Java (com.sun.net.httpserver),
 * registra todas las rutas (endpoints tanto en español como en inglés para compatibilidad)
 * y asigna un Pool de Hilos Concurrente (mínimo 32 hilos) para soportar alto tráfico
 * de usuarios sin congelamientos ni degradación de rendimiento.
 */
public class ServidorApi {

    /**
     * Inicia el servidor en el puerto especificado.
     * Crea el directorio de subidas si no existe, configura dependencias y registra los manejadores.
     *
     * @param puerto Número de puerto TCP donde escuchará el servidor.
     * @throws IOException Si ocurre un error de red o de I/O al crear el servidor.
     */
    public static void iniciarServidor(int puerto) throws IOException {
        HttpServer servidor = HttpServer.create(new InetSocketAddress(puerto), 0);

        // Asegura que el directorio para archivos subidos exista
        File directorioSubidas = new File("uploads");
        if (!directorioSubidas.exists()) {
            directorioSubidas.mkdir();
        }

        // --- Configuración de Inyección de Dependencias (Manual DI) ---
        RepositorioUsuario repositorioUsuario = new JdbcRepositorioUsuarioImpl();
        ServicioAutenticacion servicioAutenticacion = new ServicioAutenticacion(repositorioUsuario);
        ManejadorAutenticacion manejadorAutenticacion = new ManejadorAutenticacion(servicioAutenticacion);

        // --- Instancias de Manejadores ---
        ManejadorProductos manejadorProductos = new ManejadorProductos();
        ManejadorResenas manejadorResenas = new ManejadorResenas();
        ManejadorCarrusel manejadorCarrusel = new ManejadorCarrusel();
        ManejadorSeccionesInicio manejadorSeccionesInicio = new ManejadorSeccionesInicio();
        ManejadorUsuarios manejadorUsuarios = new ManejadorUsuarios();
        ManejadorPedidos manejadorPedidos = new ManejadorPedidos();
        ManejadorFactura manejadorFactura = new ManejadorFactura();
        ManejadorCupones manejadorCupones = new ManejadorCupones();
        ManejadorConfiguracion manejadorConfiguracion = new ManejadorConfiguracion();
        ManejadorSoporte manejadorSoporte = new ManejadorSoporte();
        ManejadorCarrito manejadorCarrito = new ManejadorCarrito();
        ManejadorInventario manejadorInventario = new ManejadorInventario();
        ManejadorArchivosEstaticos manejadorArchivosEstaticos = new ManejadorArchivosEstaticos();

        // --- Registro de Rutas (Bilingüe para compatibilidad gradual con frontend) ---
        // Autenticación
        servidor.createContext("/api/login", manejadorAutenticacion);
        servidor.createContext("/api/iniciar-sesion", manejadorAutenticacion);
        servidor.createContext("/api/register", manejadorAutenticacion);
        servidor.createContext("/api/registro", manejadorAutenticacion);

        // Productos
        servidor.createContext("/api/products", manejadorProductos);
        servidor.createContext("/api/productos", manejadorProductos);

        // Reseñas
        servidor.createContext("/api/reviews", manejadorResenas);
        servidor.createContext("/api/resenas", manejadorResenas);

        // Carrusel
        servidor.createContext("/api/carousel", manejadorCarrusel);
        servidor.createContext("/api/carrusel", manejadorCarrusel);

        // Secciones de Inicio
        servidor.createContext("/api/home-sections", manejadorSeccionesInicio);
        servidor.createContext("/api/secciones-inicio", manejadorSeccionesInicio);

        // Usuarios
        servidor.createContext("/api/users", manejadorUsuarios);
        servidor.createContext("/api/usuarios", manejadorUsuarios);

        // Pedidos
        servidor.createContext("/api/orders", manejadorPedidos);
        servidor.createContext("/api/pedidos", manejadorPedidos);

        // Facturación
        servidor.createContext("/api/invoices", manejadorFactura);
        servidor.createContext("/api/facturas", manejadorFactura);

        // Cupones
        servidor.createContext("/api/coupons", manejadorCupones);
        servidor.createContext("/api/cupones", manejadorCupones);

        // Configuración
        servidor.createContext("/api/config", manejadorConfiguracion);
        servidor.createContext("/api/configuracion", manejadorConfiguracion);

        // Soporte y Reportes
        servidor.createContext("/api/support", manejadorSoporte);
        servidor.createContext("/api/soporte", manejadorSoporte);

        // Carrito
        servidor.createContext("/api/cart", manejadorCarrito);
        servidor.createContext("/api/carrito", manejadorCarrito);

        // Inventario y Métricas ERP
        servidor.createContext("/api/inventory", manejadorInventario);
        servidor.createContext("/api/inventario", manejadorInventario);
        servidor.createContext("/api/metrics", manejadorInventario);
        servidor.createContext("/api/metricas", manejadorInventario);
        servidor.createContext("/api/activity", manejadorInventario);
        servidor.createContext("/api/actividad", manejadorInventario);
        servidor.createContext("/api/banner", manejadorInventario);

        // Archivos estáticos
        servidor.createContext("/uploads", manejadorArchivosEstaticos);

        // Pool de Hilos para alta concurrencia
        int numeroHilos = Math.max(32, Runtime.getRuntime().availableProcessors() * 8);
        servidor.setExecutor(Executors.newFixedThreadPool(numeroHilos));

        // Inicia la escucha de conexiones
        servidor.start();
        System.out.println("Servidor API (Alto Rendimiento Concurrente: " + numeroHilos + " hilos) corriendo en puerto: " + puerto);
    }

    /**
     * Alias de inicio en inglés para compatibilidad.
     */
    public static void startServer(int port) throws IOException {
        iniciarServidor(port);
    }
}
