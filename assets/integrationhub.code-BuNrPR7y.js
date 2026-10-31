const e="integrationhub",a="IntegrationHub",t={"README.md":89,"docs/architecture.md":645,"docs/contracts.md":246,"compose.yml":35,"src/main/resources/application.yml":162,"src/main/resources/application-dev.yml":11,"src/test/java/ca/arashkeshtgar/integrationhub/PostgresTestBase.java":28,"src/test/java/ca/arashkeshtgar/integrationhub/RelayTestBase.java":173,"src/test/java/ca/arashkeshtgar/integrationhub/RelayTest.java":391,".github/workflows/ci.yml":43,"src/main/java/ca/arashkeshtgar/integrationhub/relay/RelayController.java":538,"src/main/java/ca/arashkeshtgar/integrationhub/SecurityConfig.java":68,"src/main/java/ca/arashkeshtgar/integrationhub/relay/TokenValidator.java":121,"src/main/resources/db/migration/V1__message_log.sql":34,"src/main/resources/db/migration/V2__message_response_status.sql":4,"src/main/java/ca/arashkeshtgar/integrationhub/relay/MessageLog.java":148,"src/main/java/ca/arashkeshtgar/integrationhub/admin/MessagesController.java":374,"src/main/java/ca/arashkeshtgar/integrationhub/events/EventFactory.java":333,"docs/events.md":99,"src/main/java/ca/arashkeshtgar/integrationhub/events/Pseudonymizer.java":34,"src/main/java/ca/arashkeshtgar/integrationhub/events/OrderLinks.java":84,"src/main/resources/db/migration/V3__event_outbox.sql":31,"src/main/java/ca/arashkeshtgar/integrationhub/events/EventPublisher.java":164,"src/main/java/ca/arashkeshtgar/integrationhub/events/RabbitConfig.java":35,"src/main/java/ca/arashkeshtgar/integrationhub/hl7/Mllp.java":67,"src/main/java/ca/arashkeshtgar/integrationhub/hl7/MllpServer.java":104,"src/main/java/ca/arashkeshtgar/integrationhub/hl7/MllpSockets.java":135,"src/main/java/ca/arashkeshtgar/integrationhub/hl7/OruToFhir.java":496,"src/main/java/ca/arashkeshtgar/integrationhub/hl7/Hl7Message.java":274,"src/main/java/ca/arashkeshtgar/integrationhub/hl7/Hl7Inbound.java":425,"src/main/java/ca/arashkeshtgar/integrationhub/hl7/ClinicHubClient.java":139,"src/main/java/ca/arashkeshtgar/integrationhub/hl7/PayloadCipher.java":55,"src/main/resources/db/migration/V4__hl7_queues.sql":41,"src/test/java/ca/arashkeshtgar/integrationhub/Hl7InboundTest.java":351,"src/main/java/ca/arashkeshtgar/integrationhub/hl7/Hl7Orders.java":114,"src/main/java/ca/arashkeshtgar/integrationhub/hl7/FhirToOrm.java":257,"src/main/java/ca/arashkeshtgar/integrationhub/admin/AdminAccessFilter.java":161,"src/main/java/ca/arashkeshtgar/integrationhub/admin/RouteHealth.java":129,"src/main/java/ca/arashkeshtgar/integrationhub/admin/AlertMonitor.java":244,"src/main/resources/db/migration/V5__admin.sql":33,"src/main/java/ca/arashkeshtgar/integrationhub/admin/DeadLetters.java":150,"web/src/App.tsx":86,"web/src/config.ts":9,"web/src/pages/DeadLetters.tsx":115,"web/nginx.conf.template":19},n={"overview/flow":{file:"docs/architecture.md",start:13,end:21,code:`flowchart LR
    CH[ClinicHub] -->|orders, cancels| HUB
    LF[LabFlow] -->|results| HUB
    CR[ClinicReport] -->|results| HUB
    CH & LF & CR & PF[PharmaFlow] -->|financial documents| HUB
    HUB[IntegrationHub] --> CH & LF & CR & FIN[FinancePowerApp]
    HUB -->|de-identified events| MQ[(RabbitMQ)] --> AN[Analytics]
    EXT[External lab / OLIS sim] <-->|HL7 v2 over MLLP| HUB
    HUB --- DB[(PostgreSQL: message log)]`},"overview/decisions":{file:"docs/architecture.md",start:26,end:39,code:`1. **A relay first, not a new owner.** ClinicHub owns patients and orders; LabFlow and ClinicReport own results;
   FinancePowerApp owns the books. The hub owns only its message log and its routes.
2. **Synchronous routes stay synchronous.** ClinicHub stores the ids from the transaction-response, and a \`409\` on a
   cancel is an answer. The hub returns the upstream's status and body unchanged, \`502\` if the upstream refused the
   connection, \`504\` on timeout. It does not retry: the senders' outboxes already do.
3. **The sender's token goes through.** The hub validates it (ClinicHub's JWKS, issuer, expiry, an audience and scope
   allowed on that route) and forwards the same \`Authorization\` header, so each receiver's own checks — "a result only
   from the app the order went to" — keep working. The hub never signs on behalf of another application.
4. **No health information in the log by default.** The log records metadata: route, sender (client id), clinic,
   resource types and counts, Bundle id, identifiers of ServiceRequests/DiagnosticReports, status, latency, size, a
   SHA-256 of the body. Storing bodies is a setting (\`hub.payloads.store\`), off by default; when on, bodies are
   encrypted (AES-GCM, key from configuration), kept for \`hub.payloads.retentionDays\` (default 30), and every view of
   a body is written to an access log (PHIPA).
5. **Asynchronous only where the outside world is asynchronous:** HL7 v2 (MLLP, ACKs) and the event feed to Analytics.`},"run/readme":{file:"README.md",start:19,end:21,code:`docker compose up -d --wait      # PostgreSQL 16 on :5433, RabbitMQ on :5672 (UI :15672)
mvn spring-boot:run              # API on :5700
curl localhost:5700/actuator/health`},"run/compose":{file:"compose.yml",start:3,end:11,code:`services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: integrationhub
      POSTGRES_USER: integrationhub
      POSTGRES_PASSWORD: integrationhub
    ports:
      - "5433:5432"`},"run/routes":{file:"src/main/resources/application.yml",start:122,end:132,code:`# Results from LabFlow and ClinicReport to ClinicHub: /route/clinichub/fhir
clinichub:
  upstream: \${HUB_ROUTE_CLINICHUB_UPSTREAM:http://localhost:5300}
  timeout: 30s
  connect-timeout: 5s
  required-scopes: [results]
# Orders and cancels from ClinicHub: /route/labflow/fhir
labflow:
  upstream: \${HUB_ROUTE_LABFLOW_UPSTREAM:http://localhost:5180}
  allowed-audiences: [labflow]
  required-scopes: [orders]`},"tests/pg":{file:"src/test/java/ca/arashkeshtgar/integrationhub/PostgresTestBase.java",start:16,end:26,code:`static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

static {
  POSTGRES.start();
}

@DynamicPropertySource
static void database(DynamicPropertyRegistry registry) {
  registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
  registry.add("spring.datasource.username", POSTGRES::getUsername);
  registry.add("spring.datasource.password", POSTGRES::getPassword);`},"tests/markers":{file:"src/test/java/ca/arashkeshtgar/integrationhub/RelayTest.java",start:364,end:384,code:`void logsNoBodyAndNoPersonalValuesAnywhere(CapturedOutput output) throws Exception {
  CLINICHUB.stubFor(post("/fhir").willReturn(aResponse().withStatus(200).withBody("{}")));
  String badDate =
      "{\\"resourceType\\":\\"Patient\\",\\"birthDate\\":\\"MARKER-BAD-DATE\\",\\"name\\":[{\\"family\\":\\"Zzyzx\\"}]}";

  postBundle("clinichub", validToken(), BUNDLE);
  postBundle("clinichub", validToken(), badDate.getBytes(StandardCharsets.UTF_8));
  postBundle("clinichub", "x.y.z", BUNDLE);

  String everything =
      String.join(
              "\\n", jdbc.queryForList("select row_to_json(m)::text from message m", String.class))
          + String.join(
              "\\n",
              jdbc.queryForList(
                  "select row_to_json(i)::text from message_identifier i", String.class));
  for (String marker : new String[] {"Zzyzx", "Testpatient", "MARKER-"}) {
    assertThat(everything).doesNotContain(marker);
    assertThat(output.getAll()).doesNotContain(marker);
  }
  assertThat(messages()).hasSize(3);`},"tests/ci":{file:".github/workflows/ci.yml",start:7,end:18,code:`jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "21"
          cache: maven
      - name: Build and test (Testcontainers needs Docker, available on the runner)
        run: mvn -B verify`},"relay/checks":{file:"src/main/java/ca/arashkeshtgar/integrationhub/relay/RelayController.java",start:103,end:119,code:`HubProperties.Route route = match.matches() ? properties.routes().get(routeName) : null;
if (route == null || !route.allowsPath(path) || hasDotSegments(path)) {
  refuse(response, call, started, 404, "not-found", "No such route.", "unknown-route-or-path");
  return;
}
call.format(route.bodyFormat());
String method = request.getMethod();
if (!route.allowedMethods().contains(method)) {
  response.setHeader("Allow", String.join(", ", route.allowedMethods()));
  refuse(
      response,
      call,
      started,
      405,
      "not-supported",
      "Method not allowed.",
      "method-not-allowed");`},"relay/token":{file:"src/main/java/ca/arashkeshtgar/integrationhub/relay/RelayController.java",start:123,end:158,code:`String authorization = request.getHeader("Authorization");
if (authorization == null && hasApiKey(route, request)) {
  // The upstream checks the key; the hub cannot.
  call.sender("api-key");
} else {
  try {
    call.sender(tokens.validate(authorization, route).clientId());
  } catch (TokenValidator.Rejected e) {
    response.setHeader("WWW-Authenticate", "Bearer");
    refuse(
        response,
        call,
        started,
        401,
        "login",
        "The access token was not accepted.",
        e.getMessage());
    return;
  } catch (TokenValidator.Unavailable e) {
    refuse(
        response,
        call,
        started,
        503,
        "transient",
        "Tokens cannot be verified right now.",
        e.getMessage());
    return;
  }
}

byte[] body =
    request
        .getInputStream()
        .readNBytes((int) Math.min(properties.maxBodyBytes(), Integer.MAX_VALUE - 1) + 1);
if (body.length > properties.maxBodyBytes()) {`},"relay/refuse":{file:"src/main/java/ca/arashkeshtgar/integrationhub/relay/RelayController.java",start:403,end:423,code:`private void refuse(
    HttpServletResponse response,
    CallContext call,
    long started,
    int status,
    String code,
    String text,
    String reason)
    throws IOException {
  response.setStatus(status);
  response.setContentType("application/fhir+json");
  response
      .getOutputStream()
      .write(
          ("{\\"resourceType\\":\\"OperationOutcome\\",\\"issue\\":[{\\"severity\\":\\"error\\",\\"code\\":\\""
                  + code
                  + "\\",\\"diagnostics\\":\\""
                  + text
                  + "\\"}]}")
              .getBytes(StandardCharsets.UTF_8));
  finish(call, started, null, status, status + " " + reason);`},"tokens/decoder":{file:"src/main/java/ca/arashkeshtgar/integrationhub/relay/TokenValidator.java",start:47,end:57,code:`decoder =
    NimbusJwtDecoder.withJwkSetUri(properties.auth().effectiveJwksUri())
        .jwsAlgorithm(SignatureAlgorithm.RS256)
        // OpenIddict marks access tokens "at+jwt" (RFC 9068); the default accepts only "JWT".
        .jwtProcessorCustomizer(
            processor ->
                processor.setJWSTypeVerifier(
                    new DefaultJOSEObjectTypeVerifier<SecurityContext>(
                        JOSEObjectType.JWT, new JOSEObjectType("at+jwt"), null)))
        .build();
decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(properties.auth().issuer()));`},"tokens/validate":{file:"src/main/java/ca/arashkeshtgar/integrationhub/relay/TokenValidator.java",start:60,end:71,code:`public Sender validate(String authorization, HubProperties.Route route)
    throws Rejected, Unavailable {
  Jwt jwt = decode(authorization);
  if (!route.requiredScopes().isEmpty() && !scopes(jwt).containsAll(route.requiredScopes())) {
    throw new Rejected("wrong-scope");
  }
  if (!route.allowedAudiences().isEmpty()
      && route.allowedAudiences().stream()
          .noneMatch(a -> jwt.getAudience() != null && jwt.getAudience().contains(a))) {
    throw new Rejected("wrong-audience");
  }
  return new Sender(clientId(jwt));`},"tokens/scopes":{file:"src/main/java/ca/arashkeshtgar/integrationhub/relay/TokenValidator.java",start:89,end:101,code:`static Set<String> scopes(Jwt jwt) {
  Object claim = jwt.getClaims().get("scope");
  Set<String> result = new HashSet<>();
  if (claim instanceof String s) {
    for (String part : s.trim().split("\\\\s+")) {
      if (!part.isEmpty()) {
        result.add(part);
      }
    }
  } else if (claim instanceof Collection<?> c) {
    c.forEach(o -> result.add(String.valueOf(o)));
  }
  return result;`},"forward/headers":{file:"src/main/java/ca/arashkeshtgar/integrationhub/relay/RelayController.java",start:198,end:217,code:`List<String> headers = new ArrayList<>(FORWARDED_HEADERS);
headers.addAll(route.forwardHeaders());
for (String name : headers) {
  List<String> values = Collections.list(request.getHeaders(name));
  if (!values.isEmpty()) {
    upstream.header(name, String.join(", ", values));
  }
}
if (request.getHeader("X-Request-Id") == null) {
  upstream.header("X-Request-Id", id.toString());
}
String forwardedFor = request.getHeader("X-Forwarded-For");
upstream.header(
    "X-Forwarded-For",
    forwardedFor == null
        ? request.getRemoteAddr()
        : forwardedFor + ", " + request.getRemoteAddr());
upstream.header("X-Forwarded-Proto", request.getScheme());
upstream.header(
    "X-Forwarded-Host", request.getHeader("Host") == null ? "" : request.getHeader("Host"));`},"forward/errors":{file:"src/main/java/ca/arashkeshtgar/integrationhub/relay/RelayController.java",start:224,end:242,code:`} catch (HttpTimeoutException e) {
  refuse(
      response,
      call,
      started,
      504,
      "timeout",
      "The upstream did not answer in time.",
      "upstream-timeout");
  return;
} catch (IOException e) {
  refuse(
      response,
      call,
      started,
      502,
      "transient",
      "The upstream could not be reached.",
      "upstream-unreachable");`},"forward/yml":{file:"src/main/resources/application.yml",start:4,end:6,code:`# The cancel is PUT .../ServiceRequest?identifier=system|42. Tomcat refuses a raw | (and these)
# in a query by default; the relay percent-encodes them when it forwards.
relaxed-query-chars: '|,{,},[,],^,<,>,",\`,\\'`},"forward/query":{file:"src/main/java/ca/arashkeshtgar/integrationhub/relay/RelayController.java",start:373,end:389,code:`public static String query(String raw) {
  StringBuilder out = new StringBuilder(raw.length() + 8);
  raw.codePoints()
      .forEach(
          cp -> {
            if ((cp >= 'a' && cp <= 'z')
                || (cp >= 'A' && cp <= 'Z')
                || (cp >= '0' && cp <= '9')
                || (cp < 128 && QUERY_SAFE.indexOf(cp) >= 0)) {
              out.appendCodePoint(cp);
            } else {
              for (byte b : new String(Character.toChars(cp)).getBytes(StandardCharsets.UTF_8)) {
                out.append('%').append(String.format("%02X", b & 0xff));
              }
            }
          });
  return out.toString();`},"message-log/schema":{file:"src/main/resources/db/migration/V1__message_log.sql",start:2,end:24,code:`CREATE TABLE message (
    id               uuid         PRIMARY KEY,
    received_at      timestamptz  NOT NULL DEFAULT now(),
    route            varchar(60)  NOT NULL,
    direction        varchar(10)  NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    sender_client_id varchar(100),
    clinic_slug      varchar(60),
    method           varchar(10)  NOT NULL,
    path             text         NOT NULL,
    content_type     varchar(200),
    request_size     bigint,
    request_sha256   char(64),
    bundle_id        varchar(100),
    resource_summary jsonb,
    upstream_status  integer,
    latency_ms       integer,
    error            text
);

CREATE INDEX ix_message_received_at ON message (received_at DESC);
CREATE INDEX ix_message_route_status ON message (route, upstream_status);
CREATE INDEX ix_message_clinic ON message (clinic_slug, received_at DESC);
CREATE INDEX ix_message_bundle ON message (bundle_id);`},"message-log/entry":{file:"src/main/java/ca/arashkeshtgar/integrationhub/relay/MessageLog.java",start:28,end:45,code:`/** Metadata only. There is deliberately no field for a body. */
public record Entry(
    UUID id,
    Instant receivedAt,
    String route,
    String senderClientId,
    String clinicSlug,
    String method,
    String path,
    String contentType,
    Long requestSize,
    String requestSha256,
    String bundleId,
    BodySummary summary,
    Integer upstreamStatus,
    int responseStatus,
    long latencyMs,
    String error) {}`},"message-log/write":{file:"src/main/java/ca/arashkeshtgar/integrationhub/relay/MessageLog.java",start:82,end:97,code:`public void write(Entry entry, EventFactory.Result events, Runnable alsoInTransaction) {
  try {
    transaction.executeWithoutResult(
        status -> {
          try {
            insert(entry, events);
            if (alsoInTransaction != null) {
              alsoInTransaction.run();
            }
          } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
          }
        });
  } catch (RuntimeException e) {
    log.error(
        "message log write failed for route {}: {}", entry.route(), e.getClass().getSimpleName());`},"search/v1ident":{file:"src/main/resources/db/migration/V1__message_log.sql",start:26,end:34,code:`-- Identifiers found in a message (ServiceRequest, externalId), for searching.
CREATE TABLE message_identifier (
    message_id uuid         NOT NULL REFERENCES message (id) ON DELETE CASCADE,
    system     varchar(200) NOT NULL,
    value      varchar(200) NOT NULL,
    PRIMARY KEY (message_id, system, value)
);

CREATE INDEX ix_message_identifier_lookup ON message_identifier (system, value);`},"search/identifier":{file:"src/main/java/ca/arashkeshtgar/integrationhub/admin/MessagesController.java",start:104,end:115,code:`if (identifier != null && !identifier.isBlank()) {
  int bar = identifier.lastIndexOf('|');
  sql.append(" and exists (select 1 from message_identifier i where i.message_id = m.id");
  if (bar > 0) {
    sql.append(" and i.system = ? and i.value = ?");
    params.add(identifier.substring(0, bar));
    params.add(identifier.substring(bar + 1));
  } else {
    sql.append(" and i.value = ?");
    params.add(identifier);
  }
  sql.append(")");`},"event-factory/types":{file:"src/main/java/ca/arashkeshtgar/integrationhub/events/EventFactory.java",start:15,end:31,code:`* Turns one relayed call into zero or more events. Events are about answers: a call the upstream
* did not answer (unreachable, timeout) makes none, so the sender's retry makes them once.
*
* <ul>
*   <li>{@code order.placed}: an order Bundle the upstream answered, whatever the answer.
*   <li>{@code order.accepted}: the same, answered 2xx.
*   <li>{@code order.cancelled} / {@code order.cancel-refused}: a cancel answered 2xx / 409.
*   <li>{@code result.final} / {@code result.amended}: a DiagnosticReport in that status, answered
*       2xx. Other statuses make no event.
*   <li>{@code finance.document}: each financial document of a call answered 2xx.
* </ul>
*
* Prescriptions and patient merges make no event (a drug says too much about a patient). A merge
* answered 2xx moves the pseudonym remembered with the merged patient's orders to the survivor's,
* so later results of those orders carry the survivor's pseudonym.
*
* <p>Event ids are derived from the content, so the same call sent twice is one event.`},"event-factory/revoked":{file:"src/main/java/ca/arashkeshtgar/integrationhub/events/EventFactory.java",start:157,end:162,code:`// ClinicHub sends a cancel as a transaction Bundle whose entry is the ServiceRequest again,
// status revoked (a conditional PUT inside the Bundle): a cancel, not a new order.
if ("revoked".equals(order.status())) {
  cancel(call, order.identifier(), order.status(), events);
  continue;
}`},"event-factory/cancel":{file:"src/main/java/ca/arashkeshtgar/integrationhub/events/EventFactory.java",start:210,end:214,code:`int status = call.upstreamStatus();
String type =
    status >= 200 && status < 300
        ? "order.cancelled"
        : status == 409 ? "order.cancel-refused" : null;`},"event-factory/id":{file:"src/main/java/ca/arashkeshtgar/integrationhub/events/EventFactory.java",start:317,end:320,code:`String key = type + "|" + clinic + "|" + orderId + "|" + discriminator;
return new ClinicalEvent(
    ClinicalEvent.SCHEMA_VERSION,
    UUID.nameUUIDFromBytes(key.getBytes(StandardCharsets.UTF_8)),`},"pseudonym/hmac":{file:"src/main/java/ca/arashkeshtgar/integrationhub/events/Pseudonymizer.java",start:21,end:29,code:`public String of(String clinicSlug, String mrn) {
  if (key.length == 0) {
    throw new IllegalStateException("no pseudonym secret configured");
  }
  try {
    Mac mac = Mac.getInstance("HmacSHA256");
    mac.init(new SecretKeySpec(key, "HmacSHA256"));
    byte[] digest = mac.doFinal((clinicSlug + "|" + mrn).getBytes(StandardCharsets.UTF_8));
    return HexFormat.of().formatHex(digest);`},"pseudonym/link":{file:"src/main/resources/db/migration/V3__event_outbox.sql",start:19,end:30,code:`-- What a later call needs to know about an order: results and cancels do not carry the patient, so the
-- pseudonym, test and priority are remembered from the order. De-identified: no MRN, no name.
CREATE TABLE order_link (
    clinic_slug       varchar(60)  NOT NULL,
    order_id          varchar(200) NOT NULL,
    patient_pseudonym char(64),
    application       varchar(60),
    test_code_system  varchar(200),
    test_code         varchar(100),
    priority          varchar(20),
    created_at        timestamptz  NOT NULL DEFAULT now(),
    PRIMARY KEY (clinic_slug, order_id)`},"pseudonym/upsert":{file:"src/main/java/ca/arashkeshtgar/integrationhub/events/OrderLinks.java",start:69,end:74,code:`on conflict (clinic_slug, order_id) do update set
  patient_pseudonym = coalesce(excluded.patient_pseudonym, order_link.patient_pseudonym),
  application = coalesce(excluded.application, order_link.application),
  test_code_system = coalesce(excluded.test_code_system, order_link.test_code_system),
  test_code = coalesce(excluded.test_code, order_link.test_code),
  priority = coalesce(excluded.priority, order_link.priority)`},"outbox/table":{file:"src/main/resources/db/migration/V3__event_outbox.sql",start:4,end:13,code:`CREATE TABLE event_outbox (
    id              uuid         PRIMARY KEY,
    message_id      uuid,
    created_at      timestamptz  NOT NULL DEFAULT now(),
    event_type      varchar(60)  NOT NULL,
    payload         jsonb        NOT NULL,
    attempts        integer      NOT NULL DEFAULT 0,
    next_attempt_at timestamptz  NOT NULL DEFAULT now(),
    published_at    timestamptz,
    last_error      varchar(200)`},"outbox/publish":{file:"src/main/java/ca/arashkeshtgar/integrationhub/events/EventPublisher.java",start:92,end:94,code:`select id, event_type, payload::text, attempts from event_outbox
 where published_at is null and next_attempt_at <= now()
 order by created_at limit ? for update skip locked`},"outbox/confirm":{file:"src/main/java/ca/arashkeshtgar/integrationhub/events/EventPublisher.java",start:107,end:112,code:`rabbit.invoke(
    ops -> {
      for (Row row : rows) {
        ops.send(properties.exchange(), row.type(), message(row));
      }
      ops.waitForConfirmsOrDie(CONFIRM_TIMEOUT_MS);`},"outbox/backoff":{file:"src/main/java/ca/arashkeshtgar/integrationhub/events/EventPublisher.java",start:135,end:138,code:`Duration backoff(int attempts) {
  long seconds = 1L << Math.min(attempts + 1, 20);
  return Duration.ofSeconds(Math.min(seconds, Math.max(1, properties.maxBackoff().toSeconds())));
}`},"outbox/rabbit":{file:"src/main/java/ca/arashkeshtgar/integrationhub/events/RabbitConfig.java",start:22,end:33,code:`TopicExchange clinicalEventsExchange(EventsProperties properties) {
  return new TopicExchange(properties.exchange(), true, false);
}

@Bean
Queue clinicalEventsQueue(EventsProperties properties) {
  return QueueBuilder.durable(properties.queue()).build();
}

@Bean
Binding clinicalEventsBinding(Queue clinicalEventsQueue, TopicExchange clinicalEventsExchange) {
  return BindingBuilder.bind(clinicalEventsQueue).to(clinicalEventsExchange).with("#");`},"mllp/frame":{file:"src/main/java/ca/arashkeshtgar/integrationhub/hl7/Mllp.java",start:28,end:54,code:`public static byte[] read(InputStream in, int maxBytes) throws IOException {
  int b;
  do {
    b = in.read();
    if (b < 0) {
      return null;
    }
  } while (b != VT);
  ByteArrayOutputStream out = new ByteArrayOutputStream(1024);
  while (true) {
    b = in.read();
    if (b < 0) {
      throw new FrameException("connection closed inside a message");
    }
    if (b == FS) {
      if (in.read() != CR) {
        throw new FrameException("frame does not end with <FS><CR>");
      }
      return out.toByteArray();
    }
    if (b == VT) {
      throw new FrameException("start byte inside a message");
    }
    if (out.size() >= maxBytes) {
      throw new FrameException("message too large");
    }
    out.write(b);`},"mllp/serve":{file:"src/main/java/ca/arashkeshtgar/integrationhub/hl7/MllpServer.java",start:82,end:92,code:`private void serve(Socket socket) {
  try (socket) {
    socket.setSoTimeout((int) settings.readTimeout().toMillis());
    InputStream in = socket.getInputStream();
    OutputStream out = socket.getOutputStream();
    while (true) {
      byte[] frame = Mllp.read(in, settings.maxMessageBytes());
      if (frame == null) {
        return;
      }
      Mllp.write(out, inbound.handle(frame));`},"oru/table":{file:"docs/architecture.md",start:308,end:322,code:"| HL7 v2 | FHIR R4 |\n|---|---|\n| MSH-3.MSH-4, MSH-10 | sender id (`EXTLAB.LAB1`) and message id, used for de-duplication; Bundle id and resource ids are derived from them, so a resend gives the same ids |\n| ORC-2 / OBR-2 placer order number `101^harbourview` (or the whole `urn:clinichub:harbourview:service-request` as the first component) | `DiagnosticReport.basedOn.identifier` = `urn:clinichub:harbourview:service-request\\|101` |\n| ORC-3 / OBR-3 filler order number | `DiagnosticReport.identifier` (`urn:integrationhub:hl7:{sender}:filler-order`) |\n| OBR-4 | `DiagnosticReport.code` (LN → LOINC, SCT → SNOMED, an unknown system name → `urn:integrationhub:hl7:{sender}:{name}`) |\n| OBR-7 / OBR-22 | `effectiveDateTime` / `issued` |\n| OBR-25 (table 0123) | `status`: F final, C amended, X cancelled; P, R, A, O, I, S, Y are accepted and **not forwarded** (ClinicHub takes final, amended, cancelled) |\n| OBX-2 NM / SN / ST, TX, FT / CE, CWE, CNE | `valueQuantity` (with `<`, `>`, `<=`, `>=` as comparator, unit from OBX-6 as UCUM) / `valueString` / `valueCodeableConcept` |\n| OBX-3 | `Observation.code`; the Observations are `DiagnosticReport.result` |\n| OBX-7 | `referenceRange` (text, and low/high when it is `a-b`, `<a` or `>a`) |\n| OBX-8 (table 0078, repeating) | `interpretation` (v3 ObservationInterpretation); a flag not in the table is kept as text |\n| OBX-11 (table 0085) | `Observation.status`; OBX-14, else OBR-7 → `effectiveDateTime` |\n| NTE after an OBX / after the OBR | `Observation.note` / `DiagnosticReport.conclusion` |\n| PID, PV1, NK1, … | **not read**. No patient is named in what goes to ClinicHub; it knows the patient from the order |"},"oru/placer":{file:"src/main/java/ca/arashkeshtgar/integrationhub/hl7/OruToFhir.java",start:215,end:232,code:`Reference placerOrder(Segment source, Segment obr) throws Hl7Exception {
  String id = ei(source, 2);
  String namespace = source.component(2, 2);
  if (id.isEmpty() && source != obr) {
    id = ei(obr, 2);
    namespace = obr.component(2, 2);
  }
  if (id.isEmpty()) {
    throw new Hl7Exception("no placer order number");
  }
  Matcher urn = URN_ORDER.matcher(id);
  if (urn.matches() && ORDER_ID.matcher(urn.group(2)).matches()) {
    return identifierReference(urn.group(1), urn.group(2));
  }
  if (SLUG.matcher(namespace).matches() && ORDER_ID.matcher(id).matches()) {
    return identifierReference("urn:clinichub:" + namespace + ":service-request", id);
  }
  throw new Hl7Exception("placer order number is not a ClinicHub order");`},"oru/never":{file:"src/main/java/ca/arashkeshtgar/integrationhub/hl7/OruToFhir.java",start:39,end:41,code:`*   <li>PID and every other segment: <b>never read</b>. No patient is named in what is forwarded;
*       ClinicHub knows the patient from the order.
* </ul>`},"store-forward/insert":{file:"src/main/java/ca/arashkeshtgar/integrationhub/hl7/Hl7Inbound.java",start:143,end:149,code:`insert into hl7_inbound (id, received_at, sender, control_id, status, report_count, next_attempt_at, payload)
values (?, ?, ?, ?, 'PENDING', ?, now() + make_interval(secs => ?), ?)
on conflict (sender, control_id) do update
   set status = 'PENDING', attempts = 0, received_at = excluded.received_at,
       next_attempt_at = excluded.next_attempt_at, payload = excluded.payload,
       report_count = excluded.report_count, last_error = null, last_status = null, id = excluded.id
 where hl7_inbound.status in ('FAILED', 'REJECTED')`},"store-forward/outcomes":{file:"src/main/java/ca/arashkeshtgar/integrationhub/hl7/ClinicHubClient.java",start:67,end:77,code:`if (status >= 200 && status < 300) {
  return new Delivery(Outcome.DELIVERED, status, null);
}
if (status == 401) {
  token = null; // expired or revoked early: fetch a new one next time
  return new Delivery(Outcome.RETRY, status, "unauthorized");
}
if (status == 408 || status == 425 || status == 429 || status >= 500) {
  return new Delivery(Outcome.RETRY, status, "clinichub-unavailable");
}
return new Delivery(Outcome.REJECTED, status, "clinichub-refused");`},"store-forward/cipher":{file:"src/main/java/ca/arashkeshtgar/integrationhub/hl7/PayloadCipher.java",start:31,end:39,code:`public byte[] encrypt(byte[] plain, String rowId) {
  try {
    byte[] iv = new byte[IV_BYTES];
    random.nextBytes(iv);
    Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
    cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, iv));
    cipher.updateAAD(rowId.getBytes(StandardCharsets.UTF_8));
    byte[] sealed = cipher.doFinal(plain);
    return ByteBuffer.allocate(iv.length + sealed.length).put(iv).put(sealed).array();`},"store-forward/test":{file:"src/test/java/ca/arashkeshtgar/integrationhub/Hl7InboundTest.java",start:167,end:171,code:`assertThat(new String(payload, StandardCharsets.ISO_8859_1))
    .as("encrypted at rest")
    .doesNotContain("DiagnosticReport")
    .doesNotContain("Glucose")
    .doesNotContain("harbourview");`},"orders-out/yml":{file:"src/main/resources/application.yml",start:147,end:151,code:`externallab:
  hl7-order: true
  allowed-audiences: [externallab]
  required-scopes: [orders]
  allowed-methods: [POST, PUT]`},"orders-out/send":{file:"src/main/java/ca/arashkeshtgar/integrationhub/relay/RelayController.java",start:271,end:275,code:`* A route for an external laboratory: the order Bundle is sent as an ORM^O01 and the lab's ACK is
* the answer. 200 when the lab took it; 409 for a cancellation and 422 for an order the lab
* refused (ClinicHub treats 409 as an answer and 422 as a failure to retry); 502 when the lab did
* not answer; 503 when no lab is set up; 400 when the body cannot be an order.
*/`},"orders-out/ack":{file:"src/main/java/ca/arashkeshtgar/integrationhub/hl7/Hl7Orders.java",start:90,end:102,code:`Mllp.write(socket.getOutputStream(), message);
byte[] ack = Mllp.read(socket.getInputStream(), properties.mllp().maxMessageBytes());
if (ack == null) {
  return "no-ack";
}
Hl7Message parsed = Hl7Message.parse(new String(ack, StandardCharsets.UTF_8));
String code = parsed.first("MSA").map(m -> m.field(1)).orElse("");
if (Hl7Ack.ACCEPT.equals(code) || "CA".equals(code)) {
  return null;
}
return List.of("AE", "AR", "CE", "CR").contains(code)
    ? "ack-" + code.toLowerCase()
    : "bad-ack";`},"admin-access/chain":{file:"src/main/java/ca/arashkeshtgar/integrationhub/SecurityConfig.java",start:40,end:53,code:`.authorizeHttpRequests(
    auth ->
        auth.requestMatchers(EndpointRequest.to(HealthEndpoint.class, InfoEndpoint.class))
            .permitAll()
            .requestMatchers("/route/**", "/error")
            .permitAll()
            .requestMatchers(
                "/api/messages",
                "/api/messages/**",
                "/api/admin/**",
                "/actuator/prometheus")
            .hasAuthority(AdminAccessFilter.AUTHORITY)
            .anyRequest()
            .authenticated())`},"admin-access/has":{file:"src/main/java/ca/arashkeshtgar/integrationhub/admin/AdminAccessFilter.java",start:101,end:107,code:`static boolean has(Set<String> granted, String wanted) {
  if (granted.contains(wanted)) {
    return true;
  }
  int colon = wanted.indexOf(':');
  return colon > 0 && granted.contains(wanted.substring(colon + 1));
}`},"admin-access/replaying":{file:"src/main/java/ca/arashkeshtgar/integrationhub/admin/AdminAccessFilter.java",start:83,end:91,code:`boolean replaying = request.getRequestURI().startsWith("/api/admin") && isWrite(request);
if (!audienceOk || !canView || (replaying && !canReplay)) {
  deny(
      response,
      403,
      replaying
          ? "No permission to change the hub (replay, code map)."
          : "No permission to read the message log.");
  return;`},"admin-access/local":{file:"src/main/java/ca/arashkeshtgar/integrationhub/admin/AdminAccessFilter.java",start:149,end:156,code:`private static boolean isLocal(HttpServletRequest request) {
  if (request.getHeader("X-Forwarded-For") != null
      || request.getHeader("Forwarded") != null
      || request.getHeader("X-Real-IP") != null) {
    return false;
  }
  try {
    return InetAddress.getByName(request.getRemoteAddr()).isLoopbackAddress();`},"health/status":{file:"src/main/java/ca/arashkeshtgar/integrationhub/admin/RouteHealth.java",start:113,end:114,code:`String status =
    down.contains(name) ? "down" : fail15 > 0 ? "degraded" : calls15 > 0 ? "ok" : "idle";`},"health/failing":{file:"src/main/java/ca/arashkeshtgar/integrationhub/admin/RouteHealth.java",start:56,end:73,code:`public List<String> failing() {
  List<String> down = new ArrayList<>();
  jdbc.query(
      """
      select route,
             count(*) filter (where response_status >= 500),
             count(*) filter (where upstream_status is not null and upstream_status < 500)
        from message
       where received_at > now() - make_interval(secs => ?)
       group by route
      """,
      rs -> {
        if (rs.getLong(2) >= alerts.routeDownMinFailures() && rs.getLong(3) == 0) {
          down.add(rs.getString(1));
        }
      },
      (double) alerts.routeDownAfter().toSeconds());
  return down;`},"health/unique":{file:"src/main/resources/db/migration/V5__admin.sql",start:32,end:32,code:"CREATE UNIQUE INDEX uq_alert_open ON alert (kind, subject) WHERE resolved_at IS NULL;"},"health/notify":{file:"src/main/java/ca/arashkeshtgar/integrationhub/admin/AlertMonitor.java",start:178,end:181,code:`// Opened and resolved between two rounds: nothing was told, nothing to tell.
jdbc.update(
    "update alert set notified_at = now(), resolved_notified_at = now()"
        + " where resolved_at is not null and notified_at is null");`},"dead-letters/keep":{file:"src/main/java/ca/arashkeshtgar/integrationhub/hl7/Hl7Inbound.java",start:210,end:218,code:`case REJECTED -> {
  jdbc.update(
      "update hl7_inbound set status = 'REJECTED', payload = case when ? then payload end,"
          + " failed_at = now(), attempts = attempts + 1, last_status = ?, last_error = ? where id = ?",
      keepForReplay(),
      delivery.status(),
      delivery.note(),
      id);
  outcome = Outcome.REJECTED;`},"dead-letters/yml":{file:"src/main/resources/application.yml",start:62,end:64,code:`# A message the hub gave up on, or ClinicHub refused, keeps its (encrypted) payload this many days so it can be
# replayed from the admin web; then the payload is dropped. 0 = drop it at once (no replay).
replay-window-days: \${HUB_HL7_REPLAY_WINDOW_DAYS:7}`},"dead-letters/replay":{file:"src/main/java/ca/arashkeshtgar/integrationhub/admin/DeadLetters.java",start:96,end:105,code:`String statuses = "inbound".equals(queue) ? "('FAILED', 'REJECTED')" : "('FAILED')";
int changed =
    jdbc.update(
        "update "
            + table
            + " set status = 'PENDING', attempts = 0, next_attempt_at = now(), failed_at = null,"
            + " last_error = null, replay_count = replay_count + 1, last_replayed_at = now(),"
            + " last_replayed_by = ? where id = ? and status in "
            + statuses
            + " and payload is not null",`},"web/signed":{file:"web/src/App.tsx",start:19,end:21,code:`function Signed() {
  const auth = useAuth();
  const me = useResource<Me>(auth, '/api/admin/me');`},"web/confirm":{file:"web/src/pages/DeadLetters.tsx",start:82,end:88,code:`{!l.replayable && <span className="muted small">No longer kept</span>}
{l.replayable && !me.canReplay && <span className="muted small">No permission to replay</span>}
{l.replayable &&
  me.canReplay &&
  (confirming === l.id ? (
    <span className="confirm">
      Replay this message?{' '}`},"web/nginx":{file:"web/nginx.conf.template",start:9,end:13,code:`# Only the admin API and the message log are proxied; the relay (/route) and the metrics are not reachable from here.
location /api/ {
  proxy_pass \${HUB_API_URL};
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`}},r=[],s=[],i=[{path:"messages",component:"Messages",guards:[]},{path:"messages/:id",component:"MessageDetail",guards:[]},{path:"dead-letters",component:"DeadLetters",guards:[]},{path:"alerts",component:"Alerts",guards:[]},{path:"code-map",component:"CodeMap",guards:[]},{path:"*",redirect:"/",guards:[]}],o={project:e,repo:a,files:t,examples:n,endpoints:r,tables:s,routes:i};export{o as default,r as endpoints,n as examples,t as files,e as project,a as repo,i as routes,s as tables};
