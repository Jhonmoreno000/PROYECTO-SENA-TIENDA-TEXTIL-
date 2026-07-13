package infrastructure.api;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.File;
import java.net.InetSocketAddress;

import application.services.AuthService;
import domain.repositories.UserRepository;
import infrastructure.api.handlers.AuthHandler;
import infrastructure.persistence.jdbc.JdbcUserRepositoryImpl;
import infrastructure.api.handlers.*;

/**
 * Servidor HTTP principal de la API REST para la tienda textil.
 * Configura y arranca el servidor embebido de Java (com.sun.net.httpserver),
 * registra todas las rutas (endpoints) y realiza la inyección de dependencias
 * manual para los controladores que ya han sido migrados a Clean Architecture.
 * Los controladores legacy aún operativos se instancian directamente.
 */
public class ApiServer {

    /**
     * Inicia el servidor en el puerto especificado.
     * Crea el directorio de subidas, configura las dependencias,
     * registra todos los contextos (endpoints) y comienza a escuchar.
     *
     * @param port Número de puerto TCP donde escuchará el servidor.
     * @throws IOException Si ocurre un error al crear el servidor.
     */
    public static void startServer(int port) throws IOException {
        // Crea una instancia del servidor HTTP en la dirección local y el puerto indicado
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        // Asegura que el directorio para archivos subidos exista; si no, lo crea
        File dir = new File("uploads");
        if (!dir.exists()) {
            dir.mkdir();
        }

        // --- Configuración de Inyección de Dependencias (Manual DI) ---
        // 1. Instancia el repositorio concreto (capa de infraestructura)
        UserRepository userRepository = new JdbcUserRepositoryImpl();

        // 2. Instancia el servicio de aplicación inyectándole el repositorio
        AuthService authService = new AuthService(userRepository);

        // 3. Instancia el controlador HTTP inyectándole el servicio de aplicación
        AuthHandler authHandler = new AuthHandler(authService);
        
        // --- Endpoints migrados a Clean Architecture ---
        // Maneja las solicitudes POST a /api/login y /api/register
        server.createContext("/api/login", authHandler);
        server.createContext("/api/register", authHandler);

        // --- Endpoints legacy (aún no migrados completamente pero funcionales) ---
        // CRUD de productos y moderación
        server.createContext("/api/products", new ProductsHandler());
        // Gestión de usuarios
        server.createContext("/api/users", new UsersHandler());
        // Gestión de pedidos
        server.createContext("/api/orders", new OrdersHandler());
        // Facturación electrónica (generación y descarga de PDF)
        server.createContext("/api/invoices", new InvoiceHandler());
        // Gestión de cupones de descuento
        server.createContext("/api/coupons", new CouponsHandler());
        // Configuración global del sistema
        server.createContext("/api/config", new ConfigHandler());
        // Tickets de soporte y reportes de errores
        server.createContext("/api/support", new SupportHandler());
        // Carrito de compras
        server.createContext("/api/cart", new CartHandler());
        // Inventario, lotes, mermas y umbrales
        server.createContext("/api/inventory", new InventoryHandler());
        // Métricas de ventas, regiones, ERP
        server.createContext("/api/metrics", new InventoryHandler());
        // Actividad reciente del sistema
        server.createContext("/api/activity", new InventoryHandler());
        // Banner promocional
        server.createContext("/api/banner", new InventoryHandler());
        // Sirve archivos estáticos subidos (imágenes, documentos)
        server.createContext("/uploads", new StaticFileHandler());

        // Usa el executor por defecto (null = hilo por solicitud)
        server.setExecutor(null);
        // Inicia el servidor (comienza a aceptar conexiones)
        server.start();
        System.out.println("Servidor API (Clean Architecture Híbrido Actualizado) corriendo en puerto: " + port);
    }
}
