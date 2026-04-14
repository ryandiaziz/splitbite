FROM sbtscala/scala-sbt:eclipse-temurin-17.0.10_7_1.9.9_3.3.3 AS builder
WORKDIR /app
COPY . .
RUN sbt clean stage

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/universal/stage ./
EXPOSE 9000
CMD ["bin/splitbite-server", "-Dplay.http.secret.key=$APPLICATION_SECRET"]
