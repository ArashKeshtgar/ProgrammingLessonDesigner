package portfolio;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import portfolio.Ports.ProjectRepository;
import portfolio.Ports.ProjectRow;
import portfolio.Ports.StatusQueries;

// #region routes
@RestController
public class PortfolioController {
    private final StatusQueries queries;
    private final ProjectRepository projects;

    // Constructor injection: Spring passes the beans in; a test can register fakes instead.
    public PortfolioController(StatusQueries queries, ProjectRepository projects) {
        this.queries = queries;
        this.projects = projects;
    }

    @GetMapping("/status")
    public Map<String, Object> status() {
        try {
            var s = queries.status();
            int sent = s.sent() == null ? 0 : s.sent();
            int interviewing = s.interviewing() == null ? 0 : s.interviewing();
            int followupsDue = s.followupsDue() == null ? 0 : s.followupsDue();
            return Map.of("healthy", true,
                    "summary", sent + " sent, " + interviewing + " interviewing, " + followupsDue + " follow-up(s) due",
                    "metrics", Map.of("sent", sent, "interviewing", interviewing, "followupsDue", followupsDue));
        } catch (Exception e) {
            // Unhealthy is an answer, not an error: the dashboard shows it.
            return Map.of("healthy", false, "error", "Database unreachable.");
        }
    }

    @GetMapping("/projects/{key}")
    public ProjectRow get(@PathVariable String key) {
        return projects.find(key)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown project: " + key));
    }

    @PostMapping("/projects")
    @RequireRole("Admin")
    public ResponseEntity<ProjectRow> create(@Valid @RequestBody CreateProject body) {
        if (projects.find(body.key()).isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Project " + body.key() + " already exists.");
        var row = new ProjectRow(body.key(), body.displayName(), body.adapterBaseUrl());
        projects.add(row);
        return ResponseEntity.created(URI.create("/projects/" + row.key())).body(row);
    }
}
// #endregion
