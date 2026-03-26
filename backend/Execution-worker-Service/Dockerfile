# ---------- Build Stage ----------
FROM maven:3.9-eclipse-temurin-21 AS builder
RUN apt-get update && apt-get install -y docker.io

WORKDIR /app
COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests


# ---------- Runtime Stage ----------
# ---------- Runtime Stage ----------
FROM docker:26-cli

WORKDIR /app

# Install Java runtime only
RUN apk add --no-cache openjdk21

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]