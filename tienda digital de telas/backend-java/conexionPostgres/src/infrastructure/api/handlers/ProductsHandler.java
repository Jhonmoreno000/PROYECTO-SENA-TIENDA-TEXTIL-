package infrastructure.api.handlers;

import infrastructure.persistence.jdbc.*;
import domain.models.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.google.gson.Gson;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.io.File;
import java.io.FileOutputStream;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.nio.file.Files;
import java.io.FileInputStream;

    public class ProductsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {

            // Allow requests from React (CORS)
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
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
                    } else if (path.matches("^/api/products/\\d+/image$")) {
                        // PUT /api/products/{id}/image -> Update Image
                        String[] parts = path.split("/");
                        int productId = Integer.parseInt(parts[3]);
                        
                        InputStream is = exchange.getRequestBody();
                        String body = new String(is.readAllBytes(), "UTF-8");
                        JsonObject json = JsonParser.parseString(body).getAsJsonObject();
                        String base64Image = json.get("image").getAsString();
                        
                        ProductDAO dao = new ProductDAO();
                        String savedUrl = dao.saveProductImage(productId, base64Image);
                        
                        String resp;
                        int statusCode;
                        if (savedUrl != null) {
                            resp = "{\"url\": \"" + savedUrl + "\"}";
                            statusCode = 200;
                        } else {
                            resp = "{\"error\": \"Error saving image\"}";
                            statusCode = 500;
                        }
                        
                        exchange.getResponseHeaders().add("Content-Type", "application/json");
                        exchange.sendResponseHeaders(statusCode, resp.getBytes().length);
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
