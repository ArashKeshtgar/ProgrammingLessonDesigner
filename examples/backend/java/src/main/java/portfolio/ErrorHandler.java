package portfolio;

import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

// #region errors
@RestControllerAdvice
public class ErrorHandler {
    private static final Logger log = LoggerFactory.getLogger(ErrorHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, Object>> invalid(MethodArgumentNotValidException e) {
        var errors = new TreeMap<String, String>();
        e.getBindingResult().getFieldErrors().forEach(f -> errors.putIfAbsent(f.getField(), f.getDefaultMessage()));
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid request.", "errors", errors));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<Map<String, Object>> unreadable(HttpMessageNotReadableException e) {
        var field = e.getCause() instanceof UnrecognizedPropertyException u ? u.getPropertyName() : "body";
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid request.", "errors", Map.of(field, "Unknown or invalid field.")));
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<Map<String, Object>> status(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", e.getReason()));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, Object>> unexpected(Exception e) {
        // The details go to the log, never to the caller (they can name servers, users, SQL).
        var traceId = UUID.randomUUID().toString();
        log.error("Unhandled error {}", traceId, e);
        return ResponseEntity.internalServerError().body(Map.of("error", "Something went wrong.", "traceId", traceId));
    }
}
// #endregion
