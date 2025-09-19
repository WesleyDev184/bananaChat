# Usar uma imagem base mais segura com OpenJDK 17
FROM eclipse-temurin:17-jdk-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar o arquivo pom.xml e o wrapper do Maven
COPY pom.xml .
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn

# Dar permissão de execução ao wrapper do Maven
RUN chmod +x ./mvnw

# Baixar dependências (otimização para cache de layers)
RUN ./mvnw dependency:go-offline -B

# Copiar código fonte
COPY src ./src

# Compilar a aplicação
RUN ./mvnw clean package -DskipTests

# Expor a porta 8080
EXPOSE 8080

# Comando para executar a aplicação
CMD ["java", "-jar", "target/backend-0.0.1-SNAPSHOT.jar"]