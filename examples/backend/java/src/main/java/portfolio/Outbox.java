package portfolio;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;

public final class Outbox {
    public static final int MAX_ATTEMPTS = 12;

    public static final String SCHEMA = """
            CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, patient TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS outbox (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                payload TEXT NOT NULL,
                attempts INTEGER NOT NULL DEFAULT 0,
                next_attempt REAL,
                sent REAL,
                last_error TEXT
            );
            """;

    @FunctionalInterface
    public interface Sender {
        void send(String payload) throws Exception;
    }

    private Outbox() {}

    // #region save
    public static void placeOrder(Connection conn, String orderId, String patient) throws SQLException {
        // The order and its message commit together: either both exist or neither does.
        conn.setAutoCommit(false);
        try (var order = conn.prepareStatement("INSERT INTO orders (id, patient) VALUES (?, ?)");
             var message = conn.prepareStatement("INSERT INTO outbox (payload) VALUES (?)")) {
            order.setString(1, orderId);
            order.setString(2, patient);
            order.executeUpdate();
            message.setString(1, "{\"order\":\"" + orderId + "\"}");
            message.executeUpdate();
            conn.commit();
        } catch (SQLException e) {
            conn.rollback();
            throw e;
        } finally {
            conn.setAutoCommit(true);
        }
    }
    // #endregion

    // #region dispatch
    public static double backoffSeconds(int attempts) {
        return Math.min(10 * Math.pow(2, attempts - 1), 30 * 60); // 10 s, 20 s, 40 s ... 30 min
    }

    record Due(long id, String payload, int attempts) {}

    public static int dispatch(Connection conn, Sender sender, double now) throws SQLException {
        var due = new ArrayList<Due>();
        try (var ps = conn.prepareStatement("""
                SELECT id, payload, attempts FROM outbox
                WHERE sent IS NULL AND attempts < ? AND (next_attempt IS NULL OR next_attempt <= ?)
                ORDER BY id LIMIT 20""")) {
            ps.setInt(1, MAX_ATTEMPTS);
            ps.setDouble(2, now);
            try (var rs = ps.executeQuery()) {
                while (rs.next()) due.add(new Due(rs.getLong(1), rs.getString(2), rs.getInt(3)));
            }
        }
        int delivered = 0;
        for (var m : due) {
            int attempts = m.attempts() + 1;
            try {
                sender.send(m.payload());
                try (var ps = conn.prepareStatement("UPDATE outbox SET attempts = ?, sent = ?, last_error = NULL WHERE id = ?")) {
                    ps.setInt(1, attempts);
                    ps.setDouble(2, now);
                    ps.setLong(3, m.id());
                    ps.executeUpdate();
                }
                delivered++;
            } catch (Exception e) { // the receiver is down: keep the message, try later
                try (var ps = conn.prepareStatement("UPDATE outbox SET attempts = ?, next_attempt = ?, last_error = ? WHERE id = ?")) {
                    ps.setInt(1, attempts);
                    ps.setDouble(2, now + backoffSeconds(attempts));
                    ps.setString(3, e.getMessage());
                    ps.setLong(4, m.id());
                    ps.executeUpdate();
                }
            }
        }
        return delivered;
    }
    // #endregion
}
