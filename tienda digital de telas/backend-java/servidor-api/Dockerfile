FROM eclipse-temurin:17-jdk AS builder
WORKDIR /app
COPY src ./src
COPY lib ./lib
RUN mkdir -p bin && \
    find src -name "*.java" > sources.txt && \
    javac -encoding UTF-8 -cp "lib/*" -d bin @sources.txt

FROM eclipse-temurin:17-jre
WORKDIR /app
# wget lo usa el healthcheck de docker-compose (/health/live); se instala solo si la imagen no lo trae
RUN command -v wget >/dev/null 2>&1 || (apt-get update && apt-get install -y --no-install-recommends wget && rm -rf /var/lib/apt/lists/*)
# Usuario sin privilegios para ejecutar la API (no root)
RUN groupadd --system app && useradd --system --gid app --home-dir /app app
COPY --from=builder --chown=app:app /app/bin ./bin
COPY --from=builder --chown=app:app /app/lib ./lib
RUN mkdir -p /app/uploads && chown app:app /app/uploads
USER app
EXPOSE 8081
CMD ["java", "-cp", "bin:lib/*", "App"]
