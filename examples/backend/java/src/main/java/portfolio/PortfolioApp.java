package portfolio;

import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.HashSet;
import java.util.List;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import portfolio.Ports.ProjectRepository;
import portfolio.Ports.StatusCounts;
import portfolio.Ports.StatusQueries;

@SpringBootApplication
public class PortfolioApp {
    public static void main(String[] args) {
        SpringApplication.run(PortfolioApp.class, args);
    }

    @Configuration
    static class Web implements WebMvcConfigurer {
        private final RequireRole.Interceptor roles;

        Web(RequireRole.Interceptor roles) {
            this.roles = roles;
        }

        @Override
        public void addInterceptors(InterceptorRegistry registry) {
            registry.addInterceptor(roles);
        }
    }

    // #region factory
    // Composition root: the only place that knows which real implementations are used.
    // Tests run with the "test" profile and register fakes instead.
    @Configuration
    @Profile("!test")
    @EnableScheduling
    static class Real {
        private final Config.Settings settings = Config.load(System.getenv());

        @Bean
        ProjectRepository projects() throws SQLException {
            return new SqliteProjects(DriverManager.getConnection("jdbc:sqlite:" + settings.dbPath()));
        }

        @Bean
        StatusQueries queries() {
            return () -> new StatusCounts(0, 0, 0);
        }

        @Bean
        TokenService tokens() {
            return new TokenService(settings.jwtSecret(), settings.jwtRefreshSecret(), id -> null);
        }

        @Bean
        Webhook.Settings webhook() {
            return new Webhook.Settings(List.of(System.getenv().getOrDefault("WEBHOOK_SECRET", "")),
                    event -> {}, new HashSet<>(), () -> System.currentTimeMillis() / 1000);
        }
    }
    // #endregion
}
