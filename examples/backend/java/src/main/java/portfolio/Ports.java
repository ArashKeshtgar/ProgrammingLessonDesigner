package portfolio;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

public final class Ports {
    private Ports() {}

    public record ProjectRow(String key, String displayName, String adapterBaseUrl) {}

    // SUM over no rows is NULL in SQL, so every count may arrive as null (Integer, not int).
    public record StatusCounts(Integer sent, Integer interviewing, Integer followupsDue) {}

    // #region ports
    public interface StatusQueries {
        StatusCounts status() throws Exception;
    }

    public interface ProjectRepository {
        Optional<ProjectRow> find(String key);
        void add(ProjectRow row);
    }
    // #endregion

    public static class InMemoryProjects implements ProjectRepository {
        private final Map<String, ProjectRow> rows = new ConcurrentHashMap<>();

        @Override
        public Optional<ProjectRow> find(String key) {
            return Optional.ofNullable(rows.get(key));
        }

        @Override
        public void add(ProjectRow row) {
            rows.put(row.key(), row);
        }
    }
}
