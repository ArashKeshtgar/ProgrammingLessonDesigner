# #region dockerfile
# Stage 1: Maven with a full JDK builds the jar.
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
# pom.xml first: the dependency download stays cached until the pom changes.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q -DskipTests package

# Stage 2: a JRE is enough to run it.
FROM eclipse-temurin:21-jre
RUN useradd --uid 10001 app && mkdir /data && chown app /data
WORKDIR /app
COPY --from=build /app/target/portfolio-1.0.0.jar app.jar
ENV DB_PATH=/data/portfolio.db SERVER_PORT=8080
USER app
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8080/status || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
# #endregion
