# #region dockerfile
# Stage 1: the SDK image restores and publishes.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
# The project file first: restore stays cached until the packages change.
COPY Portfolio/Portfolio.csproj Portfolio/
RUN dotnet restore Portfolio/Portfolio.csproj
COPY Portfolio/ Portfolio/
RUN dotnet publish Portfolio/Portfolio.csproj -c Release -o /out --no-restore

# Stage 2: the much smaller ASP.NET runtime image, no SDK.
FROM mcr.microsoft.com/dotnet/aspnet:10.0
# The runtime image has no curl; the health check needs it.
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/* \
  && mkdir /data && chown $APP_UID /data
WORKDIR /app
COPY --from=build /out .
ENV ASPNETCORE_HTTP_PORTS=8080 DB_PATH=/data/portfolio.db
# APP_UID is the non-root "app" user the .NET images ship with.
USER $APP_UID
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD curl -fsS http://127.0.0.1:8080/status || exit 1
ENTRYPOINT ["dotnet", "Portfolio.dll"]
# #endregion
