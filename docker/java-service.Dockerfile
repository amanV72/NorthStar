FROM eclipse-temurin:21-jdk-alpine AS build

ARG SERVICE_DIR
WORKDIR /workspace

COPY ${SERVICE_DIR}/gradle ./gradle
COPY ${SERVICE_DIR}/gradlew ${SERVICE_DIR}/build.gradle ${SERVICE_DIR}/settings.gradle ./
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

COPY ${SERVICE_DIR}/src ./src
RUN ./gradlew clean bootJar -x test --no-daemon \
    && find build/libs -maxdepth 1 -type f -name '*.jar' ! -name '*-plain.jar' -exec cp {} /app.jar \; \
    && test -f /app.jar

FROM eclipse-temurin:21-jre-alpine

RUN apk add --no-cache curl \
    && addgroup -S spring \
    && adduser -S spring -G spring \
    && mkdir -p /app/logs /app/uploads \
    && chown -R spring:spring /app

WORKDIR /app
COPY --from=build /app.jar ./app.jar

USER spring
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
