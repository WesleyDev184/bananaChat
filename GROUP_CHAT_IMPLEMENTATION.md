# Chat em Grupo - BananaChat

## Resumo da Implementação

Esta implementação adiciona funcionalidade completa de chat em grupo ao sistema existente, permitindo que usuários criem e participem de grupos de conversa.

## Funcionalidades Implementadas

### 🔐 **Sistema de Usuários**

- **Registro de usuários** com username, email, senha e nome de exibição
- **Controle de status online/offline**
- **Busca de usuários**
- **Gerenciamento de perfil**

### 👥 **Sistema de Grupos**

- **Criação de grupos** com nome, descrição e configurações
- **Tipos de grupo**:
  - **Público**: Qualquer usuário pode entrar
  - **Privado**: Apenas por convite
  - **Restrito**: Requer aprovação do administrador
- **Gerenciamento de membros** (entrar/sair de grupos)
- **Proprietário do grupo** com privilégios especiais
- **Limite configurável de membros**
- **Busca de grupos públicos**

### 💬 **Sistema de Mensagens de Grupo**

- **Mensagens em tempo real** via WebSocket
- **Histórico de mensagens** persistente
- **Tipos de mensagem**: chat, entrada, saída, sistema
- **Edição de mensagens** (pelo autor)
- **Busca dentro do grupo**
- **Controle de acesso** (apenas membros podem ver/enviar)

## Estrutura do Backend

### Entidades

```
📁 backend/src/main/java/com/bananachat/backend/entity/
├── User.java              # Usuários do sistema
├── Group.java             # Grupos de chat
└── GroupMessage.java      # Mensagens dos grupos
```

### Controladores REST

```
📁 backend/src/main/java/com/bananachat/backend/controller/
├── UserController.java         # API de usuários
├── GroupController.java        # API de grupos
├── GroupMessageController.java # API de mensagens de grupo
└── ChatController.java         # WebSocket (atualizado com grupos)
```

### Serviços

```
📁 backend/src/main/java/com/bananachat/backend/service/
├── UserService.java            # Lógica de usuários
├── GroupService.java           # Lógica de grupos
└── GroupMessageService.java    # Lógica de mensagens de grupo
```

## Estrutura do Frontend

### Componentes

```
📁 chatUi/src/components/chat/
├── ChatNavigation.tsx      # Navegação principal (tabs)
├── CreateGroupDialog.tsx   # Dialog para criar grupos
├── GroupList.tsx          # Lista de grupos disponíveis
└── types.ts              # Types atualizados
```

### Hooks

```
📁 chatUi/src/hooks/
├── useGroups.ts              # Gerenciamento de grupos
└── useExtendedChatState.ts   # Estado estendido com grupos
```

## API Endpoints

### Usuários

```http
POST   /api/users/register           # Criar usuário
GET    /api/users/username/{username} # Buscar por username
GET    /api/users/online             # Usuários online
GET    /api/users/search?query=...   # Buscar usuários
PUT    /api/users/{id}               # Atualizar usuário
DELETE /api/users/{id}               # Deletar usuário
```

### Grupos

```http
POST   /api/groups?owner=...         # Criar grupo
GET    /api/groups/public            # Grupos públicos
GET    /api/groups/user/{username}   # Grupos do usuário
GET    /api/groups/{id}?username=... # Detalhes do grupo
POST   /api/groups/{id}/members      # Entrar no grupo
DELETE /api/groups/{id}/members      # Sair do grupo
PUT    /api/groups/{id}              # Atualizar grupo
DELETE /api/groups/{id}              # Deletar grupo
```

### Mensagens de Grupo

```http
GET    /api/groups/{id}/messages           # Histórico do grupo
GET    /api/groups/{id}/messages/recent    # Mensagens recentes
GET    /api/groups/{id}/messages/search    # Buscar mensagens
PUT    /api/groups/{id}/messages/{msgId}   # Editar mensagem
DELETE /api/groups/{id}/messages/{msgId}   # Deletar mensagem
```

## WebSocket Endpoints

### Grupos

```
/app/group.sendMessage    # Enviar mensagem ao grupo
/app/group.joinGroup      # Entrar no grupo
/app/group.leaveGroup     # Sair do grupo

/topic/group.{groupId}    # Subscription para mensagens do grupo
```

## Como Usar

### 1. **Registro de Usuário**

```typescript
const response = await fetch("/api/users/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "johndoe",
    email: "john@example.com",
    password: "password123",
    displayName: "John Doe",
  }),
});
```

### 2. **Criar Grupo**

```typescript
const response = await fetch("/api/groups?owner=johndoe", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Equipe Dev",
    description: "Grupo da equipe de desenvolvimento",
    type: "PUBLIC",
    maxMembers: 50,
  }),
});
```

### 3. **Enviar Mensagem via WebSocket**

```typescript
stompClient.publish({
  destination: "/app/group.sendMessage",
  body: JSON.stringify({
    content: "Olá pessoal!",
    sender: "johndoe",
    groupId: 1,
    type: "CHAT",
  }),
});
```

### 4. **Subscription para Mensagens**

```typescript
stompClient.subscribe("/topic/group.1", (message) => {
  const groupMessage = JSON.parse(message.body);
  console.log("Nova mensagem:", groupMessage);
});
```

## Configuração do Banco de Dados

As tabelas serão criadas automaticamente pelo Hibernate:

- `users` - Usuários do sistema
- `groups` - Grupos de chat
- `group_messages` - Mensagens dos grupos
- `user_groups` - Relacionamento many-to-many

## Recursos de Segurança

### Backend

- ✅ Verificação de membro do grupo antes de enviar mensagens
- ✅ Validação de proprietário para operações administrativas
- ✅ Sanitização de inputs
- ✅ Tratamento de erros consistente

### Frontend

- ✅ Validação de formulários
- ✅ Tratamento de estados de loading/error
- ✅ Sanitização de dados de entrada
- ✅ Interface responsiva

## Próximos Passos Sugeridos

1. **Autenticação JWT** para maior segurança
2. **Upload de arquivos** em grupos
3. **Notifications push** para mensagens
4. **Moderação de grupos** com roles
5. **Integração com banco de dados** PostgreSQL/MySQL
6. **Testes unitários** e de integração
7. **Docker** para deploy
8. **Rate limiting** para prevenir spam

## Teste da Implementação

Para testar a implementação:

1. **Inicie o backend**: `cd backend && ./mvnw spring-boot:run`
2. **Inicie o frontend**: `cd chatUi && npm run dev`
3. **Crie alguns usuários** via API ou interface
4. **Crie grupos** e teste a funcionalidade
5. **Envie mensagens** e veja a atualização em tempo real

## Troubleshooting

### Problemas Comuns

- **Erro de CORS**: Verificar configuração no backend
- **WebSocket não conecta**: Verificar se ActiveMQ está rodando
- **Grupos não aparecem**: Verificar se usuário está logado
- **Mensagens não chegam**: Verificar subscription do WebSocket

### Logs Importantes

- Backend: Logs do Spring Boot mostram operações de grupo
- Frontend: Console do navegador mostra erros de WebSocket
- ActiveMQ: Admin console em http://localhost:8161

---

**Autor**: GitHub Copilot  
**Data**: Setembro 2025  
**Versão**: 1.0
