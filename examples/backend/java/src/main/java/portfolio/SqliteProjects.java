package portfolio;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Optional;
import portfolio.Ports.ProjectRepository;
import portfolio.Ports.ProjectRow;

// #region repository
public class SqliteProjects implements ProjectRepository {
    private final Connection conn;

    public SqliteProjects(Connection conn) throws SQLException {
        this.conn = conn;
        try (var st = conn.createStatement()) {
            st.execute("CREATE TABLE IF NOT EXISTS projects (key TEXT PRIMARY KEY, display_name TEXT NOT NULL, adapter_base_url TEXT NOT NULL)");
        }
    }

    @Override
    public Optional<ProjectRow> find(String key) {
        // ? placeholders: the driver sends the value separately, never as SQL text.
        try (var ps = conn.prepareStatement("SELECT key, display_name, adapter_base_url FROM projects WHERE key = ?")) {
            ps.setString(1, key);
            try (var rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(new ProjectRow(rs.getString(1), rs.getString(2), rs.getString(3))) : Optional.empty();
            }
        } catch (SQLException e) {
            throw new IllegalStateException(e); // checked -> unchecked, so the interface stays clean
        }
    }

    @Override
    public void add(ProjectRow row) {
        try (var ps = conn.prepareStatement("INSERT INTO projects (key, display_name, adapter_base_url) VALUES (?, ?, ?)")) {
            ps.setString(1, row.key());
            ps.setString(2, row.displayName());
            ps.setString(3, row.adapterBaseUrl());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new IllegalStateException(e);
        }
    }
}
// #endregion
