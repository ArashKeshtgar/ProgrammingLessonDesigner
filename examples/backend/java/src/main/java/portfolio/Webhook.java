package portfolio;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;
import java.util.function.LongSupplier;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

public final class Webhook {
    private static final long TOLERANCE_SECONDS = 300;
    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static class SignatureException extends Exception {
        public SignatureException(String message) {
            super(message);
        }
    }

    private Webhook() {}

    // #region verify
    public static String sign(String secret, long timestamp, byte[] body) {
        // Stripe-style: HMAC-SHA256 over "<timestamp>.<raw body>".
        try {
            var mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            mac.update((timestamp + ".").getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(mac.doFinal(body));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }

    public static JsonNode verify(byte[] body, String header, List<String> secrets, long now) throws SignatureException {
        Map<String, String> parts = new HashMap<>();
        for (var p : header.split(",")) {
            var kv = p.split("=", 2);
            if (kv.length == 2) parts.put(kv[0], kv[1]);
        }
        long timestamp;
        try {
            timestamp = Long.parseLong(parts.getOrDefault("t", ""));
        } catch (NumberFormatException e) {
            throw new SignatureException("No timestamp in the signature header.");
        }
        if (Math.abs(now - timestamp) > TOLERANCE_SECONDS)
            throw new SignatureException("Timestamp outside the tolerance (replayed?).");
        var given = parts.getOrDefault("v1", "").getBytes(StandardCharsets.UTF_8);
        for (var secret : secrets) { // two endpoints, two secrets: accept either
            // MessageDigest.isEqual takes the same time whatever matches, so timing leaks nothing.
            if (MessageDigest.isEqual(sign(secret, timestamp, body).getBytes(StandardCharsets.UTF_8), given)) {
                try {
                    return MAPPER.readTree(body);
                } catch (IOException e) {
                    throw new SignatureException("Body is not JSON.");
                }
            }
        }
        throw new SignatureException("No matching signature.");
    }
    // #endregion

    // #region route
    public record Settings(List<String> secrets, Consumer<JsonNode> handle, Set<String> seen, LongSupplier clock) {}

    @RestController
    @Profile("!test") // tests build it themselves with their own Settings
    public static class Controller {
        private final Settings settings;

        public Controller(Settings settings) {
            this.settings = settings;
        }

        // byte[] body: the raw bytes, because binding to a typed object first would change what was signed.
        @PostMapping("/webhooks/payments")
        public ResponseEntity<Map<String, Object>> receive(@RequestBody byte[] body,
                @RequestHeader(value = "Stripe-Signature", defaultValue = "") String signature) {
            JsonNode event;
            try {
                event = verify(body, signature, settings.secrets(), settings.clock().getAsLong());
            } catch (SignatureException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Signature verification failed: " + e.getMessage()));
            }
            // Providers retry: the same event can arrive twice. Handle it once.
            var id = event.get("id").asText();
            if (settings.seen().contains(id)) return ResponseEntity.ok(Map.of("received", true, "duplicate", true));
            settings.handle().accept(event);
            settings.seen().add(id);
            return ResponseEntity.ok(Map.of("received", true));
        }
    }
    // #endregion
}
