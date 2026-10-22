package portfolio;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

// #region validation
// Unknown fields are rejected globally: spring.jackson.deserialization.fail-on-unknown-properties=true
public record CreateProject(
        @NotBlank @Pattern(regexp = "^[a-z0-9-]{1,40}$") String key,
        @NotBlank @Size(max = 100) String displayName,
        @NotBlank @URL(regexp = "^https?:.*") String adapterBaseUrl) {}
// #endregion
