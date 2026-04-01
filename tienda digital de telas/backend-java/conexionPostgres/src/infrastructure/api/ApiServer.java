package infrastructure.api;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.File;
import java.net.InetSocketAddress;

import application.services.AuthService;
import domain.repositories.UserRepository;
import infrastructure.api.handlers.AuthHandler;
import infrastructure.persistence.jdbc.JdbcUserRepositoryImpl;
// Funcionalidades antiguas migradas
import infrastructure.api.handlers.*;

public class ApiServer {

    public static void startServer(int port) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        // Directorio de subidas
        File dir = new File("uploads");
        if (!dir.exists()) {
            dir.mkdir();
        }

        // --- Configuración de Inyección de Dependencias (Manual DI) ---
        // 1. Instanciamos Repositorios (Infraestructura)
        UserRepository userRepository = new JdbcUserRepositoryImpl();

        // 2. Instanciamos Servicios de Aplicación pasándoles dependencias
        AuthService authService = new AuthService(userRepository);

        // 3. Instanciamos Controladores apuntando a los servicios
        AuthHandler authHandler = new AuthHandler(authService);
        
        // --- Registro de Endpoints refactorizados ---
        server.createContext("/api/login", authHandler);
        server.createContext("/api/register", authHandler);

        // --- Registro de Endpoints antiguos (pendientes de paso a Clean Arch completo, pero operativos) ---
        server.createContext("/api/products", new ProductsHandler());
        // server.createContext("/api/products/", new ProductImageHandler());
        server.createContext("/api/users", new UsersHandler());
        server.createContext("/api/orders", new OrdersHandler());
        server.createContext("/api/coupons", new CouponsHandler());
        server.createContext("/api/config", new ConfigHandler());
        server.createContext("/api/support", new SupportHandler());
        server.createContext("/api/cart", new CartHandler());
        server.createContext("/api/inventory", new InventoryHandler());
        server.createContext("/api/metrics", new InventoryHandler());
        server.createContext("/api/activity", new InventoryHandler());
        server.createContext("/api/banner", new InventoryHandler());
        server.createContext("/uploads", new StaticFileHandler());

        server.setExecutor(null);
        server.start();
        System.out.println("Servidor API (Clean Architecture Híbrido Actualizado) corriendo en puerto: " + port);
    }
}
