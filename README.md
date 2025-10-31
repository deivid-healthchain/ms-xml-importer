# Backend - Importador TISS

Este é o serviço de backend para a aplicação de importação de arquivos TISS. Ele é responsável por receber arquivos no padrão TISS (XML ou ZIP), processá-los e persistir os dados de guias e procedimentos em um banco de dados.

## ✨ Funcionalidades

- **Upload de Arquivos**: Aceita o envio de arquivos `.xml` ou `.zip`.
- **Processamento de ZIP**: Extrai e processa múltiplos arquivos `.xml` contidos em um arquivo `.zip`.
- **Parsing de XML TISS**: Analisa o conteúdo de arquivos XML no padrão TISS para extrair dados de guias de resumo de internação e seus respectivos procedimentos.
- **Persistência Idempotente**: Insere os dados no banco de dados, garantindo que guias já existentes (baseado no `numeroGuiaPrestador`) não sejam duplicadas.
- **Limpeza Automática**: Remove os arquivos temporários após o processamento.

## 🛠️ Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript.
- **Express.js**: Framework para criação de APIs REST.
- **TypeScript**: Superset do JavaScript que adiciona tipagem estática.
- **Prisma**: ORM (Object-Relational Mapper) para interação com o banco de dados.
- **Multer**: Middleware para upload de arquivos.
- **Adm-Zip**: Biblioteca para manipulação de arquivos ZIP.
- **xml2js**: Conversor de XML para objetos JavaScript.

---

## 🚀 Começando

Siga as instruções abaixo para configurar e executar o projeto em seu ambiente local.

### Pré-requisitos

- Node.js (versão 18.x ou superior recomendada)
- NPM ou Yarn
- Um banco de dados suportado pelo Prisma (ex: PostgreSQL, MySQL, SQLite).

### 1. Instalação

Clone o repositório e instale as dependências do projeto.

```bash
# Navegue até a pasta do backend
cd backend

# Instale as dependências
npm install
```

### 2. Configuração do Banco de Dados

Este projeto utiliza o Prisma para gerenciar o banco de dados.

1.  **Configure sua variável de ambiente**:
    Crie um arquivo `.env` na raiz da pasta `backend` e adicione a string de conexão do seu banco de dados.

    ```env
    # Exemplo para PostgreSQL
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
    ```

2.  **Execute as migrações do Prisma**:
    Isso criará as tabelas `Guia` e `Procedimento` no seu banco de dados com base no schema definido em `prisma/schema.prisma`.

    ```bash
    npx prisma migrate dev --name init
    ```

3.  **Gere o Prisma Client**:
    O Prisma Client é o query builder tipado que você usará para interagir com o banco.

    ```bash
    npx prisma generate
    ```

### 3. Executando a Aplicação

Para iniciar o servidor em modo de desenvolvimento (com hot-reload), execute:

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3007` (ou na porta definida em `PORT`). As rotas estão sob o prefixo `/api`.

---

## 📡 API

### Upload de Arquivos

- **Endpoint**: `POST /upload`
- **Descrição**: Envia um arquivo `.xml` ou `.zip` para processamento e armazenamento no banco de dados.
- **Formato**: `multipart/form-data`
- **Campo do arquivo**: `file`

#### Exemplo de uso com cURL:

```bash
# Para enviar um arquivo XML
curl -X POST -F "file=@/caminho/para/seu/arquivo.xml" http://localhost:3007/api/upload

# Para enviar um arquivo ZIP
curl -X POST -F "file=@/caminho/para/seu/arquivo.zip" http://localhost:3007/api/upload
```

#### Respostas

- **`200 OK`**: Arquivo(s) processado(s) com sucesso.
  ```json
  {
    "message": "✅ Arquivo(s) processado(s) com sucesso. Novas guias foram inseridas."
  }
  ```
- **`400 Bad Request`**: Erro na requisição (ex: nenhum arquivo enviado, tipo de arquivo não suportado, ZIP sem XMLs).
  ```json
  {
    "error": "Mensagem de erro detalhada."
  }
  ```
- **`500 Internal Server Error`**: Erro interno durante o processamento do arquivo.
  ```json
  {
    "error": "Erro interno ao processar o arquivo."
  }
  ```

---

## 🔐 Autenticação entre Microsserviços (API Key e Bearer opcional)

Este backend integra com microsserviços externos (por exemplo, ms-patients e ms-procedures). O cliente HTTP agora suporta envio automático de API Key e, opcionalmente, o cabeçalho `Authorization: Bearer ...`.

### Como funciona

- O `HttpClient` injeta automaticamente:
  - Cabeçalho de API Key: nome configurável (padrão `x-api-key`), valor vindo do `.env`.
  - Bearer Token: somente se habilitado via `.env`. Caso o token falhe ao ser obtido, a requisição segue sem `Authorization` (soft-fail).
- Health checks usam apenas API Key (sem Bearer por padrão).

### Variáveis de ambiente

Você pode configurar chaves globais ou específicas por serviço:

```env
# Porta do backend (opcional)
PORT=3007

# URLs dos microsserviços (exemplos)
MS_PATIENTS_URL=http://localhost:3001/api/v1
MS_PATIENTS_HEALTH=http://localhost:3001
MS_PROCEDURES_URL=http://localhost:3002/api/v1
MS_PROCEDURES_HEALTH=http://localhost:3002

# API Key (global) – usada como fallback
API_KEY=seu_api_key
API_KEY_HEADER=x-api-key

# API Key por serviço (opcional)
MS_PATIENTS_API_KEY=seu_api_key_pacientes
MS_PATIENTS_API_KEY_HEADER=x-api-key
MS_PROCEDURES_API_KEY=seu_api_key_procedures
MS_PROCEDURES_API_KEY_HEADER=x-api-key

# Habilitar Bearer por serviço (desabilitado por padrão)
MS_PATIENTS_USE_BEARER=false
MS_PROCEDURES_USE_BEARER=false

# Global (alternativa):
MS_USE_BEARER_AUTH=false

# Se Bearer estiver habilitado, configure também as credenciais do TokenManager
# MS_AUTH_URL=https://seu-auth
# MS_AUTH_TOKEN=token_inicial_opcional
# MS_REFRESH_TOKEN=refresh_token
```

Notas:
- Ordem de resolução da API Key: específica do serviço → global → sem chave.
- O cabeçalho padrão é `x-api-key`, mas você pode trocá-lo por serviço ou globalmente.
- Health checks usam `useAuth: false` (sem Bearer), mas incluem a API Key se configurada.

---

## 🔌 Integrações e Fluxo

Durante a importação de uma guia, o orquestrador pode:
- Buscar/criar paciente no ms-patients (`/patients/from-xml`).
- Validar e criar procedimentos no ms-procedures.
- Persistir a guia e os procedimentos localmente via Prisma.

Campos desconhecidos enviados para criação de `Guia` são ignorados com log para evitar erros do Prisma (whitelist de campos permitidos).

---

## 🧩 Prisma e Banco de Dados

Este projeto usa Prisma. Dicas úteis:

```bash
# Aplicar migrações (dev)
npx prisma migrate dev --name init

# Sincronizar schema com o banco existente (introspecção)
npx prisma db pull

# Gerar Prisma Client
npx prisma generate
```

Se você vir erros como `Unknown argument "patientId"` ao criar `Guia`, verifique se o schema contém o campo `patientId` e a relação com `Patient`. Depois rode `npx prisma generate` para atualizar o client.

---

## 📜 Changelog (resumo das últimas alterações)

- Suporte a API Key no `HttpClient` com cabeçalho configurável e headers extras.
- Bearer Token opcional (por serviço) com degradação suave quando ausente.
- `patientsClient` e `proceduresClient` atualizados para usar API Key automaticamente.
- Health checks sem Bearer, apenas API Key.
- Orquestrador saneia campos de `Guia` para evitar erros de Prisma por argumentos desconhecidos.
