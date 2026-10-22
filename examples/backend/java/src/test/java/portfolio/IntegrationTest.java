package portfolio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.client.MongoClients;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.IntStream;
import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import portfolio.StatusFanout.AdapterStatus;
import portfolio.StatusFanout.Project;

class IntegrationTest {
    // A real local HTTP server (JDK built-in): the code under test calls it over the network.
    static HttpServer serve(com.sun.net.httpserver.HttpHandler handler) throws Exception {
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/", handler);
        server.start();
        return server;
    }

    static String url(HttpServer s) {
        return "http://127.0.0.1:" + s.getAddress().getPort();
    }

    @Test
    void fanoutKeepsOrderAndNeverThrows() throws Exception {
        var server = serve(ex -> {
            var ok = ex.getRequestURI().getPath().equals("/up/status");
            var body = ok ? "{\"healthy\":true}".getBytes() : new byte[0];
            ex.sendResponseHeaders(ok ? 200 : 500, ok ? body.length : -1);
            ex.getResponseBody().write(body);
            ex.close();
        });
        try {
            var result = new StatusFanout().listWithStatus(List.of(
                    new Project("up", url(server) + "/up"),
                    new Project("broken", url(server) + "/broken"),
                    new Project("down", "http://127.0.0.1:1")));
            assertThat(result).extracting(r -> r.project().key()).containsExactly("up", "broken", "down");
            assertThat(result).extracting(StatusFanout.ProjectWithStatus::status).containsExactly(
                    new AdapterStatus(true, null),
                    new AdapterStatus(false, "Adapter returned HTTP 500"),
                    new AdapterStatus(false, "Adapter unreachable."));
        } finally {
            server.stop(0);
        }
    }

    @Test
    void workerSwallowsAFailingPass() {
        var worker = new OutboxWorker(() -> { throw new IllegalStateException("database down"); });
        worker.run(); // logs, does not throw: the next scheduled pass still happens
    }

    static final String SECRET = "whsec_test";

    static MockMvc webhook(List<JsonNode> handled) {
        return MockMvcBuilders.standaloneSetup(
                new Webhook.Controller(new Webhook.Settings(List.of("other", SECRET), handled::add, new HashSet<>(), () -> 1_000_000L))).build();
    }

    static String header(String json, long t) {
        return "t=" + t + ",v1=" + Webhook.sign(SECRET, t, json.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void webhookAcceptsAValidEventOnce() throws Exception {
        var handled = new ArrayList<JsonNode>();
        var mvc = webhook(handled);
        var json = "{\"id\":\"evt_1\"}";
        for (int i = 0; i < 2; i++)
            mvc.perform(post("/webhooks/payments").contentType(MediaType.APPLICATION_JSON).content(json)
                    .header("Stripe-Signature", header(json, 1_000_000))).andExpect(status().isOk());
        mvc.perform(post("/webhooks/payments").contentType(MediaType.APPLICATION_JSON).content(json)
                .header("Stripe-Signature", header(json, 1_000_000))).andExpect(jsonPath("$.duplicate").value(true));
        assertThat(handled).hasSize(1);
    }

    @Test
    void webhookRejectsTamperedAndOldEvents() throws Exception {
        var mvc = webhook(new ArrayList<>());
        var json = "{\"id\":\"evt_2\",\"amount\":100}";
        mvc.perform(post("/webhooks/payments").contentType(MediaType.APPLICATION_JSON).content(json.replace("100", "999"))
                .header("Stripe-Signature", header(json, 1_000_000))).andExpect(status().isBadRequest());
        var old = "{\"id\":\"evt_3\"}";
        mvc.perform(post("/webhooks/payments").contentType(MediaType.APPLICATION_JSON).content(old)
                .header("Stripe-Signature", header(old, 1_000_000 - 301))).andExpect(status().isBadRequest());
    }

    static Connection outboxDb() throws SQLException {
        var conn = DriverManager.getConnection("jdbc:sqlite::memory:");
        try (var st = conn.createStatement()) {
            for (var sql : Outbox.SCHEMA.split(";")) if (!sql.isBlank()) st.execute(sql);
        }
        return conn;
    }

    static List<Object> row(Connection conn) throws SQLException {
        try (var rs = conn.createStatement().executeQuery("SELECT attempts, next_attempt FROM outbox")) {
            rs.next();
            return List.of(rs.getInt(1), rs.getDouble(2));
        }
    }

    @Test
    void outboxRetriesWithBackoffThenDelivers() throws Exception {
        try (var conn = outboxDb()) {
            Outbox.placeOrder(conn, "o1", "Jane");
            var sent = new ArrayList<String>();
            var down = new boolean[] {true};
            Outbox.Sender send = p -> {
                if (down[0]) throw new java.io.IOException("lab system down");
                sent.add(p);
            };
            assertThat(Outbox.dispatch(conn, send, 0)).isZero();
            assertThat(row(conn)).containsExactly(1, 10.0);
            assertThat(Outbox.dispatch(conn, send, 5)).isZero();
            assertThat(Outbox.dispatch(conn, send, 10)).isZero();
            assertThat(row(conn)).containsExactly(2, 30.0);
            down[0] = false;
            assertThat(Outbox.dispatch(conn, send, 30)).isOne();
            assertThat(sent).containsExactly("{\"order\":\"o1\"}");
        }
    }

    @Test
    void orderAndMessageCommitTogether() throws Exception {
        try (var conn = outboxDb()) {
            Outbox.placeOrder(conn, "o1", "Jane");
            assertThatThrownBy(() -> Outbox.placeOrder(conn, "o1", "Jane again")).isInstanceOf(SQLException.class);
            try (var rs = conn.createStatement().executeQuery("SELECT COUNT(*) FROM outbox")) {
                rs.next();
                assertThat(rs.getInt(1)).isOne();
            }
        }
    }

    @Test
    void backoffIsCapped() {
        assertThat(IntStream.of(1, 2, 3).mapToDouble(Outbox::backoffSeconds).toArray()).containsExactly(10, 20, 40);
        assertThat(Outbox.backoffSeconds(12)).isEqualTo(1800);
    }

    static String reply(String stopReason, String content) {
        return "{\"id\":\"msg_1\",\"type\":\"message\",\"role\":\"assistant\",\"model\":\"claude-opus-5-5\",\"content\":" + content
                + ",\"stop_reason\":\"" + stopReason + "\",\"stop_sequence\":null,\"usage\":{\"input_tokens\":1,\"output_tokens\":1}}";
    }

    @Test
    void assistantRunsToolsThenAnswers() throws Exception {
        var replies = new LinkedList<>(List.of(
                reply("tool_use", "[{\"type\":\"tool_use\",\"id\":\"t1\",\"name\":\"get_project_status\",\"input\":{\"key\":\"ledgerdash\"}},"
                        + "{\"type\":\"tool_use\",\"id\":\"t2\",\"name\":\"get_project_status\",\"input\":{\"key\":\"missing\"}}]"),
                reply("end_turn", "[{\"type\":\"text\",\"text\":\"LedgerDash is healthy.\"}]")));
        var requests = new ArrayList<JsonNode>();
        var mapper = new ObjectMapper();
        var server = serve(ex -> {
            requests.add(mapper.readTree(ex.getRequestBody()));
            var body = replies.removeFirst().getBytes(StandardCharsets.UTF_8);
            ex.getResponseHeaders().add("Content-Type", "application/json");
            ex.sendResponseHeaders(200, body.length);
            ex.getResponseBody().write(body);
            ex.close();
        });
        try {
            var client = AnthropicOkHttpClient.builder().apiKey("test").baseUrl(url(server)).build();
            var answer = Assistant.ask(client, Assistant.portfolioTool(Map.of("ledgerdash", "{\"healthy\":true}")), "Is ledger ok?");
            assertThat(answer).isEqualTo("LedgerDash is healthy.");
            var messages = requests.get(1).get("messages");
            var results = messages.get(messages.size() - 1).get("content"); // both results in ONE user message
            assertThat(results).hasSize(2);
            assertThat(results.get(1).get("is_error").asBoolean()).isTrue();
        } finally {
            server.stop(0);
        }
    }

    @Test
    void onlyOneConcurrentFinalizeWins() {
        var mongoUrl = System.getenv("MONGO_URL");
        assumeTrue(mongoUrl != null && !mongoUrl.isBlank(), "needs MONGO_URL");
        try (var client = MongoClients.create(mongoUrl)) {
            var orders = client.getDatabase("lessons").getCollection("orders_java");
            orders.deleteMany(new Document());
            orders.insertOne(new Document("_id", "o1").append("status", "pending"));
            var results = IntStream.range(0, 10)
                    .mapToObj(i -> CompletableFuture.supplyAsync(() -> Orders.finalizeOrder(orders, "o1")))
                    .toList().stream().map(CompletableFuture::join).toList();
            assertThat(results).filteredOn("won"::equals).hasSize(1);
            assertThat(results).filteredOn("processing"::equals).hasSize(9);
        }
    }
}
