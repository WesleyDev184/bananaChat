# 🍌 BananaChat

### Backend

- **Spring Boot 3.5.5** - Framework principal
- **Java 17** - Linguagem de programação
- **Apache ActiveMQ** - Message broker para WebSocket
- **H2 Database** - Banco de dados em memória
- **Spring WebSocket** - Comunicação em tempo real
- **Maven** - Gerenciamento de dependências

### Frontend

- **React 19** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Framework CSS
- **Vite** - Build tool e dev server
- **TanStack Router** - Roteamento
- **STOMP.js** - Cliente WebSocket
- **Radix UI** - Componentes de interface

## Como Executar

### Pré-requisitos

- **Java 17 ou superior**
- **Maven 3.6+** (ou use o wrapper incluído)
- **Node.js 18+**
- **pnpm** (recomendado) ou npm
- **Docker** (opcional, para ActiveMQ)

### 1. Configurar o Message Broker (ActiveMQ)

#### Opção 1: Usando Docker (Recomendado)

```bash
cd backend
docker-compose up -d
```

Isso irá:

- Iniciar o ActiveMQ na porta 61616
- Interface web disponível em: http://localhost:8161 (admin/admin)

#### Opção 2: ActiveMQ Local

Se preferir instalar o ActiveMQ localmente, certifique-se de que está rodando na porta 61616.

### 2. Executar o Backend

```bash
cd backend

# Usando o Maven Wrapper (recomendado)
./mvnw spring-boot:run

# Ou usando Maven instalado
mvn spring-boot:run
```

O backend estará disponível em: **http://localhost:8080**

#### Endpoints importantes:

- **H2 Console**: http://localhost:8080/h2-console
  - URL: `jdbc:h2:mem:chatdb`
  - User: `sa`
  - Password: `password`

### 3. Executar o Frontend

```bash
cd chatUi

# Instalar dependências
pnpm install
# ou npm install

# Executar em modo desenvolvimento
pnpm dev
# ou npm run dev
```

O frontend estará disponível em: **http://localhost:3000**

## 🔗 URLs Importantes

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **H2 Console**: http://localhost:8080/h2-console
- **ActiveMQ Web Console**: http://localhost:8161
