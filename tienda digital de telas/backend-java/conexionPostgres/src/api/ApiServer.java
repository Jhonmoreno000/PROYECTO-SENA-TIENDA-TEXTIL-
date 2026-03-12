package api;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import dao.ProductDAO;
import models.Product;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.net.InetSocketAddress;
import java.util.List;

public class ApiServer {

    public static void startServer(int port) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        // Create uploads directory if it doesn't exist
        File dir = new File("uploads");
        if (!dir.exists()) {
            dir.mkdir();
        }

        // Context for Products
        server.createContext("/api/products", new ProductsHandler());

        // Context for uploading product images PUT /api/products/{id}/image
        server.createContext("/api/products/", new ProductImageHandler());

        // Context for Users and Orders
        server.createContext("/api/users", new UsersHandler());
        server.createContext("/api/orders", new OrdersHandler());

        // Context for Auth (Login / Register)
        server.createContext("/api/login", new AuthHandler());
        server.createContext("/api/register", new AuthHandler());

        // Context for Administrative features
        server.createContext("/api/coupons", new CouponsHandler());
        server.createContext("/api/config", new ConfigHandler());
        server.createContext("/api/support", new SupportHandler());

        // Context for Static Images/Files
        server.createContext("/uploads", new StaticFileHandler());

        server.setExecutor(null); // default executor
        server.start();
        System.out.println("🚀 Servidor API escuchando en el puerto " + port);
    }

    // Handler to serve the products from DB as JSON
    static class ProductsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {

            // Allow requests from React (CORS)
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "http://localhost:3001");
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, PUT, POST, OPTIONS");
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type,Authorization");

            // Handle preflight OPTIONS request
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if ("GET".equals(exchange.getRequestMethod())) {
                try {
                    String path = exchange.getRequestURI().getPath();
                    ProductDAO dao = new ProductDAO();
                    List<Product> products;

                    String queryParams = exchange.getRequestURI().getQuery();
                    if (path.equals("/api/products/pending")) {
                        products = dao.getPendingProducts();
                    } else if (queryParams != null && queryParams.contains("sellerId=")) {
                        int sellerId = Integer.parseInt(queryParams.split("sellerId=")[1].split("&")[0]);
                        products = dao.getProductsBySeller(sellerId);
                    } else {
                        products = dao.getAllProducts();
                    }

                    Gson gson = new Gson();
                    String jsonResponse = gson.toJson(products);

                    byte[] responseBytes = jsonResponse.getBytes("UTF-8");
                    exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
                    exchange.sendResponseHeaders(200, responseBytes.length);

                    OutputStream os = exchange.getResponseBody();
                    os.write(responseBytes);
                    os.close();
                } catch (Exception e) {
                    e.printStackTrace();
                    String error = "{\"error\": \"Error al consultar la base de datos\"}";
                    exchange.sendResponseHeaders(500, error.getBytes().length);
                    OutputStream os = exchange.getResponseBody();
                    os.write(error.getBytes());
                    os.close();
                }
            } else if ("PUT".equals(exchange.getRequestMethod())) {
                try {
                    String path = exchange.getRequestURI().getPath();
                    if (path.contains("/moderate")) {
                        // /api/products/{id}/moderate
                        String[] parts = path.split("/");
                        int productId = Integer.parseInt(parts[3]);
                        
                        InputStream is = exchange.getRequestBody();
                        String body = new String(is.readAllBytes(), "UTF-8");
                        JsonObject json = JsonParser.parseString(body).getAsJsonObject();
                        
                        String status = json.get("status").getAsString();
                        String reason = json.has("reason") ? json.get("reason").getAsString() : null;

                        ProductDAO dao = new ProductDAO();
                        boolean success = dao.updateModerationStatus(productId, status, reason);

                        String resp = success ? "{\"success\":true}" : "{\"error\":\"Failed\"}";
                        exchange.getResponseHeaders().add("Content-Type", "application/json");
                        exchange.sendResponseHeaders(success ? 200 : 500, resp.getBytes().length);
                        OutputStream os = exchange.getResponseBody();
                        os.write(resp.getBytes());
                        os.close();
                    } else if (path.matches("^/api/products/\\d+$")) {
                        // PUT /api/products/{id} -> Update
                        String[] parts = path.split("/");
                        int productId = Integer.parseInt(parts[3]);
                        
                        InputStream is = exchange.getRequestBody();
                        String body = new String(is.readAllBytes(), "UTF-8");
                        Gson gson = new Gson();
                        Product updates = gson.fromJson(body, Product.class);
                        
                        ProductDAO dao = new ProductDAO();
                        boolean success = dao.updateProduct(productId, updates);
                        
                        String resp = success ? "{\"success\":true}" : "{\"error\":\"Update failed\"}";
                        exchange.getResponseHeaders().add("Content-Type", "application/json");
                        exchange.sendResponseHeaders(success ? 200 : 500, resp.getBytes().length);
                        OutputStream os = exchange.getResponseBody();
                        os.write(resp.getBytes());
                        os.close();
                    } else {
                        exchange.sendResponseHeaders(404, -1);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    String error = "{\"error\": \"Error al procesar\"}";
                    exchange.sendResponseHeaders(500, error.getBytes().length);
                    OutputStream os = exchange.getResponseBody();
                    os.write(error.getBytes());
                    os.close();
                }
            } else if ("POST".equals(exchange.getRequestMethod())) {
                try {
                    InputStream is = exchange.getRequestBody();
                    String body = new String(is.readAllBytes(), "UTF-8");
                    Gson gson = new Gson();
                    Product newProduct = gson.fromJson(body, Product.class);
                    
                    ProductDAO dao = new ProductDAO();
                    boolean success = dao.addProduct(newProduct);
                    
                    String resp = success ? "{\"success\":true}" : "{\"error\":\"Insert failed\"}";
                    exchange.getResponseHeaders().add("Content-Type", "application/json");
                    exchange.sendResponseHeaders(success ? 201 : 500, resp.getBytes().length);
                    OutputStream os = exchange.getResponseBody();
                    os.write(resp.getBytes());
                    os.close();
                } catch (Exception e) {
                    e.printStackTrace();
                    exchange.sendResponseHeaders(500, -1);
                }
            } else if ("DELETE".equals(exchange.getRequestMethod())) {
                try {
                    String path = exchange.getRequestURI().getPath();
                    if (path.matches("^/api/products/\\d+$")) {
                        String[] parts = path.split("/");
                        int productId = Integer.parseInt(parts[3]);
                        
                        ProductDAO dao = new ProductDAO();
                        boolean success = dao.deleteProduct(productId);
                        
                        String resp = success ? "{\"success\":true}" : "{\"error\":\"Delete failed\"}";
                        exchange.getResponseHeaders().add("Content-Type", "application/json");
                        exchange.sendResponseHeaders(success ? 200 : 500, resp.getBytes().length);
                        OutputStream os = exchange.getResponseBody();
                        os.write(resp.getBytes());
                        os.close();
                    } else {
                        exchange.sendResponseHeaders(404, -1);
                    }
                } catch (Exception e) {
                    exchange.sendResponseHeaders(500, -1);
                }
            } else {
                exchange.sendResponseHeaders(405, -1); // 405 Method Not Allowed
            }
        }
    }

    // Handler to serve static images uploaded locally
    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "http://localhost:3001");

            String uriPath = exchange.getRequestURI().getPath();
            // uriPath should be /uploads/filename.ext
            String filePath = uriPath.substring(1); // removes leading slash
            File file = new File(filePath);

            if (!file.exists() || file.isDirectory()) {
                String response = "404 (Not Found)\n";
                exchange.sendResponseHeaders(404, response.length());
                OutputStream os = exchange.getResponseBody();
                os.write(response.getBytes());
                os.close();
                return;
            }

            // Detect MIME type
            String mimeType = Files.probeContentType(file.toPath());
            if (mimeType == null) {
                mimeType = "application/octet-stream";
            }

            exchange.getResponseHeaders().set("Content-Type", mimeType);
            exchange.sendResponseHeaders(200, file.length());

            OutputStream os = exchange.getResponseBody();
            FileInputStream fs = new FileInputStream(file);
            final byte[] buffer = new byte[0x10000];
            int count = 0;
            while ((count = fs.read(buffer)) >= 0) {
                os.write(buffer, 0, count);
            }
            fs.close();
            os.close();
        }
    }

    // Handler for PUT /api/products/{id}/image - receives Base64, saves file,
    // updates DB
    static class ProductImageHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "http://localhost:3001");
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, PUT, POST, OPTIONS");
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type,Authorization");

            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if ("PUT".equals(exchange.getRequestMethod())) {
                try {
                    // Path: /api/products/{id}/image
                    String path = exchange.getRequestURI().getPath();
                    String[] parts = path.split("/");
                    // parts: ["", "api", "products", "{id}", "image"]
                    int productId = Integer.parseInt(parts[3]);

                    // Read JSON body
                    InputStream is = exchange.getRequestBody();
                    String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                    JsonObject json = JsonParser.parseString(body).getAsJsonObject();
                    String base64Image = json.get("image").getAsString();

                    ProductDAO dao = new ProductDAO();
                    String savedUrl = dao.saveProductImage(productId, base64Image);

                    String response;
                    int statusCode;
                    if (savedUrl != null) {
                        response = "{\"url\": \"" + savedUrl + "\"}";
                        statusCode = 200;
                    } else {
                        response = "{\"error\": \"Error saving image\"}";
                        statusCode = 500;
                    }

                    byte[] responseBytes = response.getBytes(StandardCharsets.UTF_8);
                    exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
                    exchange.sendResponseHeaders(statusCode, responseBytes.length);
                    OutputStream os = exchange.getResponseBody();
                    os.write(responseBytes);
                    os.close();
                } catch (Exception e) {
                    e.printStackTrace();
                    String error = "{\"error\": \"" + e.getMessage() + "\"}";
                    exchange.sendResponseHeaders(500, error.getBytes().length);
                    OutputStream os = exchange.getResponseBody();
                    os.write(error.getBytes());
                    os.close();
                }
            } else {
                exchange.sendResponseHeaders(405, -1);
            }
        }
    }
}
