package portfolio;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class StatusFanout {
    public record Project(String key, String adapterBaseUrl) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AdapterStatus(boolean healthy, String error) {}

    public record ProjectWithStatus(Project project, AdapterStatus status) {}

    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
    private final ObjectMapper mapper = new ObjectMapper();
    private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor(); // Java 21

    // #region fanout
    public List<ProjectWithStatus> listWithStatus(List<Project> registry) {
        // Start every call first, then join: the list keeps the input order.
        var futures = registry.stream()
                .map(p -> CompletableFuture.supplyAsync(() -> new ProjectWithStatus(p, fetchStatus(p)), executor))
                .toList();
        return futures.stream().map(CompletableFuture::join).toList();
    }

    // Never throws for an adapter problem: a down adapter becomes healthy = false.
    AdapterStatus fetchStatus(Project p) {
        try {
            var req = HttpRequest.newBuilder(URI.create(p.adapterBaseUrl() + "/status"))
                    .timeout(Duration.ofSeconds(3)).GET().build();
            var res = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() != 200)
                return new AdapterStatus(false, "Adapter returned HTTP " + res.statusCode());
            return mapper.readValue(res.body(), AdapterStatus.class);
        } catch (IOException e) { // includes a refused connection, a timeout and bad JSON
            return new AdapterStatus(false, "Adapter unreachable.");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt(); // keep the interrupt flag
            return new AdapterStatus(false, "Interrupted.");
        }
    }
    // #endregion
}
