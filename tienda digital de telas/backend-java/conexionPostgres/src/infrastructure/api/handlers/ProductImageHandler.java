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

    public class ProductImageHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
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
