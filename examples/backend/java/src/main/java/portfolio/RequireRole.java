package portfolio;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.Arrays;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.HandlerInterceptor;

// #region roles
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface RequireRole {
    String[] value();

    // Like Nest's RolesGuard: reads the annotation on the handler and checks the token's role.
    @Component
    class Interceptor implements HandlerInterceptor {
        private final TokenService tokens;

        public Interceptor(TokenService tokens) {
            this.tokens = tokens;
        }

        @Override
        public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
            if (!(handler instanceof HandlerMethod method)) return true;
            var required = method.getMethodAnnotation(RequireRole.class);
            if (required == null) return true;
            var header = req.getHeader("Authorization");
            if (header == null || !header.startsWith("Bearer "))
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in first.");
            try {
                var role = tokens.verifyAccess(header.substring("Bearer ".length())).get("role", String.class);
                if (!Arrays.asList(required.value()).contains(role))
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed for your role.");
                return true;
            } catch (TokenService.AuthException e) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, e.getMessage());
            }
        }
    }
}
// #endregion
