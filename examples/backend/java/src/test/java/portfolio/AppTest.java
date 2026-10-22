package portfolio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.sql.DriverManager;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import portfolio.Ports.InMemoryProjects;
import portfolio.Ports.ProjectRow;
import portfolio.Ports.StatusCounts;
import portfolio.Ports.StatusQueries;
import portfolio.TokenService.AuthException;
import portfolio.TokenService.User;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AppTest {
    static final String A = "a".repeat(32);
    static final String R = "r".repeat(32);
    static final Map<Integer, User> USERS = Map.of(1, new User(1, "admin", "Admin"), 2, new User(2, "viewer", "Viewer"));

    static class FakeQueries implements StatusQueries {
        StatusCounts counts;
        boolean fail;

        @Override
        public StatusCounts status() {
            if (fail) throw new IllegalStateException("Login failed for user ledger_reader");
            return counts;
        }
    }

    static class Broken extends InMemoryProjects {
        boolean on;

        @Override
        public java.util.Optional<ProjectRow> find(String key) {
            if (on) throw new IllegalStateException("SQL Server 10.0.0.5 login failed for sa");
            return super.find(key);
        }
    }

    // #region test
    // The "test" profile skips the real configuration; these beans take its place.
    @TestConfiguration
    static class Fakes {
        @Bean FakeQueries queries() { return new FakeQueries(); }
        @Bean Broken projects() { return new Broken(); }
        @Bean TokenService tokens() { return new TokenService(A, R, USERS::get); }
    }

    @Autowired MockMvc mvc;
    @Autowired FakeQueries queries;
    @Autowired Broken projects;
    @Autowired TokenService tokens;

    @BeforeEach
    void reset() {
        queries.counts = new StatusCounts(36, 0, 11);
        queries.fail = false;
        projects.on = false;
    }

    @Test
    void statusReportsCounts() throws Exception {
        mvc.perform(get("/status")).andExpect(jsonPath("$.summary").value("36 sent, 0 interviewing, 11 follow-up(s) due"));
    }

    @Test
    void nullSumsCountAsZero() throws Exception {
        queries.counts = new StatusCounts(null, null, null);
        mvc.perform(get("/status")).andExpect(jsonPath("$.summary").value("0 sent, 0 interviewing, 0 follow-up(s) due"));
    }

    @Test
    void unhealthyWithoutLeakingTheDatabaseError() throws Exception {
        queries.fail = true;
        mvc.perform(get("/status"))
                .andExpect(jsonPath("$.healthy").value(false))
                .andExpect(jsonPath("$.error").value("Database unreachable."));
    }
    // #endregion

    private String bearer(int id) {
        return "Bearer " + tokens.issue(USERS.get(id)).accessToken();
    }

    @Test
    void unknownProjectIs404() throws Exception {
        mvc.perform(get("/projects/nope")).andExpect(status().isNotFound()).andExpect(jsonPath("$.error").value("Unknown project: nope"));
    }

    @Test
    void createReturns201WithLocation() throws Exception {
        mvc.perform(post("/projects").header("Authorization", bearer(1)).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"key\":\"lab-flow\",\"displayName\":\"LabFlow\",\"adapterBaseUrl\":\"http://localhost:4005\"}"))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/projects/lab-flow"));
    }

    @Test
    void invalidBodyIs400WithFieldErrors() throws Exception {
        mvc.perform(post("/projects").header("Authorization", bearer(1)).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"key\":\"Bad Key!\",\"displayName\":\"\",\"adapterBaseUrl\":\"not a url\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.key").exists())
                .andExpect(jsonPath("$.errors.displayName").exists())
                .andExpect(jsonPath("$.errors.adapterBaseUrl").exists());
    }

    @Test
    void unknownFieldIsRejected() throws Exception {
        mvc.perform(post("/projects").header("Authorization", bearer(1)).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"key\":\"x\",\"displayName\":\"X\",\"adapterBaseUrl\":\"http://x\",\"isAdmin\":true}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.isAdmin").exists());
    }

    @Test
    void rolesAreChecked() throws Exception {
        var body = "{\"key\":\"x\",\"displayName\":\"X\",\"adapterBaseUrl\":\"http://x\"}";
        mvc.perform(post("/projects").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isUnauthorized());
        mvc.perform(post("/projects").header("Authorization", bearer(2)).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    void unexpectedErrorIs500WithoutDetails() throws Exception {
        projects.on = true;
        var body = mvc.perform(get("/projects/x")).andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value("Something went wrong."))
                .andReturn().getResponse().getContentAsString();
        assertThat(body).doesNotContain("10.0.0.5");
    }

    @Test
    void refreshTokenIsNotAnAccessTokenAndLogoutRevokesIt() {
        var pair = tokens.issue(USERS.get(1));
        assertThatThrownBy(() -> tokens.verifyAccess(pair.refreshToken())).isInstanceOf(AuthException.class);
        assertThat(tokens.refresh(pair.refreshToken()).accessToken()).isNotEmpty();
        USERS.get(1).tokenVersion++;
        try {
            assertThatThrownBy(() -> tokens.refresh(pair.refreshToken())).hasMessageContaining("revoked");
        } finally {
            USERS.get(1).tokenVersion--;
        }
    }

    @Test
    void secretsMustBeLongAndDifferent() {
        assertThatThrownBy(() -> new TokenService("short", R, id -> null)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new TokenService(A, A, id -> null)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> Config.load(Map.of("JWT_SECRET", A))).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void parametersKeepAnInjectionAttemptAsPlainText() throws Exception {
        try (var conn = DriverManager.getConnection("jdbc:sqlite::memory:")) {
            var repo = new SqliteProjects(conn);
            var evil = "x'; DROP TABLE projects; --";
            repo.add(new ProjectRow(evil, "Evil", "http://x"));
            assertThat(repo.find(evil)).map(ProjectRow::displayName).contains("Evil");
            assertThat(repo.find("x")).isEmpty();
        }
    }
}
