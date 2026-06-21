package com.gameshop.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.net.http.HttpRequest.BodyPublishers;

@Service
public class EmailService {

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.from.email:hello@boltbone.com}")
    private String fromEmail;

    @Value("${brevo.from.name:Bolt & Bone}")
    private String fromName;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    private final HttpClient client = HttpClient.newHttpClient();

    public boolean sendEmail(String to, String subject, String html) {
        try {
            String escapedHtml = html.replace("\"", "\\\"").replace("\n", "").replace("\r", "");
            String json = "{\"sender\": {\"name\": \"" + fromName + "\", \"email\": \"" + fromEmail + "\"}, \"to\": [{\"email\": \"" + to + "\"}], \"subject\": \"" + subject + "\", \"htmlContent\": \"" + escapedHtml + "\"}";
            
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                .header("Content-Type", "application/json")
                .header("api-key", brevoApiKey)
                .POST(BodyPublishers.ofString(json))
                .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("Brevo response: " + response.statusCode() + " - " + response.body());
            return response.statusCode() == 201 || response.statusCode() == 200;
        } catch (Exception e) {
            System.out.println("Email error: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    private String loadTemplate(String filename) throws IOException {
        ClassPathResource resource = new ClassPathResource(filename);
        return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
    }

    private String replaceVariables(String html, Map<String, String> variables) {
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            html = html.replace("{" + entry.getKey() + "}", entry.getValue());
            html = html.replace("{"+entry.getKey()+"}", entry.getValue());
        }
        return html;
    }

    public boolean sendWelcomeEmail(String email, String username) {
        try {
            String html = loadTemplate("templates/email-welcome.html");
            html = replaceVariables(html, Map.of(
                "username", username,
                "shop_url", frontendUrl
            ));
            return sendEmail(email, "Benvenuto su Bolt & Bone!", html);
        } catch (Exception e) {
            System.out.println("Template error: " + e.getMessage());
            return fallbackWelcomeEmail(email, username);
        }
    }

    public boolean sendVerificationEmail(String email, String username, String verificationCode) {
        try {
            String html = loadTemplate("templates/email-verify.html");
            html = replaceVariables(html, Map.of(
                "username", username,
                "verification_code", verificationCode
            ));
            return sendEmail(email, "Verifica la tua email - Bolt & Bone", html);
        } catch (Exception e) {
            System.out.println("Template error: " + e.getMessage());
            return fallbackVerificationEmail(email, username, verificationCode);
        }
    }

    private boolean fallbackVerificationEmail(String email, String username, String verificationCode) {
        String html = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>Verifica Email</title></head><body style=\"background:#4E342E;padding:40px;font-family:Arial,sans-serif;\"><div style=\"background:#D7CCC8;max-width:600px;margin:0 auto;border-radius:16px;padding:30px;text-align:center;\"><h1 style=\"color:#FFB300;\">BOLT & BONE</h1><h2>Verifica Email</h2><p>Ciao <strong>" + username + "</strong>!</p><p>Inserisci questo codice:</p><div style=\"background:#FFB300;color:#3E2723;padding:20px;font-size:32px;font-weight:bold;display:inline-block;border-radius:8px;letter-spacing:4px;\">" + verificationCode + "</div></div></body></html>";
        return sendEmail(email, "Verifica la tua email - Bolt & Bone", html);
    }

    private boolean fallbackWelcomeEmail(String email, String username) {
        String html = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>Bolt & Bone</title></head><body style=\"background:#4E342E;padding:40px;font-family:Arial,sans-serif;\"><div style=\"background:#D7CCC8;max-width:600px;margin:0 auto;border-radius:16px;padding:30px;\"><h1 style=\"color:#FFB300;\">BOLT & BONE</h1><p>Ciao <strong>" + username + "</strong>!</p><p>Grazie per esserti registrato su Bolt & Bone!</p></div></body></html>";
        return sendEmail(email, "Benvenuto su Bolt & Bone!", html);
    }

    public boolean sendOrderConfirmationEmail(String email, String username, Map<String, Object> order) {
        try {
            String html = loadTemplate("templates/email-order.html");
            String total = String.format("%.2f", ((Number) order.get("totalCents")).doubleValue() / 100);
            java.time.LocalDate today = java.time.LocalDate.now();
            
            StringBuilder productsBuilder = new StringBuilder();
            if (order.containsKey("items")) {
                var items = (java.util.List<?>) order.get("items");
                for (Object item : items) {
                    if (item instanceof Map) {
                        var i = (Map<?, ?>) item;
                        String name = String.valueOf(i.get("productName"));
                        String qty = String.valueOf(i.get("quantity"));
                        productsBuilder.append("<p>").append(qty).append("x ").append(name).append("</p>");
                    }
                }
            }
            if (productsBuilder.length() == 0) {
                productsBuilder.append("<p>1x Prodotto acquistato</p>");
            }
            
            html = replaceVariables(html, Map.of(
                "username", username,
                "order_id", String.valueOf(order.get("id")),
                "order_date", today.toString(),
                "total_eur", total,
                "products_list", productsBuilder.toString(),
                "dashboard_url", frontendUrl
            ));
            return sendEmail(email, "Conferma ordine #" + order.get("id"), html);
        } catch (Exception e) {
            System.out.println("Template error: " + e.getMessage());
            return fallbackOrderConfirmationEmail(email, username, order);
        }
    }

    private boolean fallbackOrderConfirmationEmail(String email, String username, Map<String, Object> order) {
        String total = String.format("%.2f", ((Number) order.get("totalCents")).doubleValue() / 100);
        String html = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>Ordine Confermato</title></head><body style=\"background:#4E342E;padding:40px;font-family:Arial,sans-serif;\"><div style=\"background:#D7CCC8;max-width:600px;margin:0 auto;border-radius:16px;padding:30px;\"><h1 style=\"color:#3E2723;\">Ordine Confermato!</h1><p>Ciao <strong>" + username + "</strong>!</p><p>Ordine #" + order.get("id") + "</p><p>Totale: " + total + " EUR</p></div></body></html>";
        return sendEmail(email, "Conferma ordine #" + order.get("id"), html);
    }

    public boolean sendPasswordResetEmail(String email, String username, String resetCode) {
        try {
            String html = loadTemplate("templates/email-reset-password.html");
            html = replaceVariables(html, Map.of(
                "reset_code", resetCode
            ));
            return sendEmail(email, "Reset Password - Bolt & Bone", html);
        } catch (Exception e) {
            System.out.println("Template error: " + e.getMessage());
            return fallbackPasswordResetEmail(email, username, resetCode);
        }
    }

    private boolean fallbackPasswordResetEmail(String email, String username, String resetCode) {
        String html = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>Reset Password</title></head><body style=\"background:#4E342E;padding:40px;font-family:Arial,sans-serif;\"><div style=\"background:#D7CCC8;max-width:500px;margin:0 auto;border-radius:16px;padding:30px;text-align:center;\"><h1 style=\"color:#FFB300;\">BOLT & BONE</h1><h2>Reset Password</h2><p>Ciao <strong>" + username + "</strong>!</p><p> Usa questo codice:</p><div style=\"background:#FFB300;color:#3E2723;padding:20px;font-size:24px;font-weight:bold;display:inline-block;border-radius:8px;\">" + resetCode + "</div></div></body></html>";
        return sendEmail(email, "Reset Password - Bolt & Bone", html);
    }
}