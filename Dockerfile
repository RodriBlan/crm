FROM eclipse-temurin:17-jdk AS build

WORKDIR /app

COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

COPY src src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# Render espera por defecto el puerto 10000. La aplicacion local conserva
# el puerto 4002 cuando se ejecuta fuera de Docker.
ENV PORT=10000 \
    SPRING_LAZY_INITIALIZATION=true \
    JPA_REPOSITORIES_BOOTSTRAP_MODE=lazy \
    JPA_DDL=none \
    HIBERNATE_BOOT_METADATA_ACCESS=false

EXPOSE 10000

CMD ["java", "-XX:TieredStopAtLevel=1", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
