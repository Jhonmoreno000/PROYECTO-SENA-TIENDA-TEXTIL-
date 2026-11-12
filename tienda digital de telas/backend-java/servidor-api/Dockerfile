FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
COPY src ./src
COPY lib ./lib
RUN mkdir -p bin && \
    find src -name "*.java" > sources.txt && \
    javac --release 21 -encoding UTF-8 -cp "lib/*:lib" -d bin @sources.txt

FROM eclipse-temurin:21-jre
WORKDIR /app

LABEL org.opencontainers.image.title="D&D Textil Backend API" \
      org.opencontainers.image.description="Servidor REST HTTP corporativo en Java 21 para D&D Textil" \
      org.opencontainers.image.version="2.0.0" \
      org.opencontainers.image.vendor="D&D Textil - SENA ADSO" \
      org.opencontainers.image.licenses="MIT"

# wget lo usa el healthcheck de docker-compose (/health/live); se instala solo si la imagen no lo trae
RUN command -v wget >/dev/null 2>&1 || (apt-get update && apt-get install -y --no-install-recommends wget && rm -rf /var/lib/apt/lists/*)
# Usuario sin privilegios para ejecutar la API (no root)
RUN groupadd --system app && useradd --system --gid app --home-dir /app app
COPY --from=builder --chown=app:app /app/bin ./bin
COPY --from=builder --chown=app:app /app/lib ./lib
RUN mkdir -p /app/uploads && chown app:app /app/uploads
USER app
EXPOSE 8081 8082

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8081/health/live || exit 1

CMD ["java", "-cp", "bin:lib/*", "App"]
