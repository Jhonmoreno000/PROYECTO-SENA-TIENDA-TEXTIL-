FROM eclipse-temurin:17-jdk AS builder
WORKDIR /app
COPY src ./src
COPY lib ./lib
RUN mkdir -p bin && \
    javac -encoding UTF-8 -cp "lib/*" -d bin \
        src/App.java \
        src/MockDataSeeder.java \
        src/application/services/*.java \
        src/domain/models/*.java \
        src/domain/repositories/*.java \
        src/domain/exceptions/*.java \
        src/infrastructure/config/*.java \
        src/infrastructure/api/*.java \
        src/infrastructure/api/handlers/*.java \
        src/infrastructure/persistence/jdbc/*.java

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /app/bin ./bin
COPY --from=builder /app/lib ./lib
RUN mkdir -p uploads
EXPOSE 8081
CMD ["java", "-cp", "bin:lib/*", "App"]
