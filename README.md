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

O servidor estará rodando em `http://localhost:3000` (ou na porta definida no seu código).

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
curl -X POST -F "file=@/caminho/para/seu/arquivo.xml" http://localhost:3000/upload

# Para enviar um arquivo ZIP
curl -X POST -F "file=@/caminho/para/seu/arquivo.zip" http://localhost:3000/upload
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
