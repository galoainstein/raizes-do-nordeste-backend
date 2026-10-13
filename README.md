# Raízes do Nordeste — Back-end

API REST para gestão de pedidos multicanal, estoque, fidelização e
pagamento mock da rede de lanchonetes Raízes do Nordeste.

## Repositório

https://github.com/galoainstein/raizes-do-nordeste-backend

## Stack

- Node.js 18+ com Express
- SQLite (better-sqlite3)
- JWT (jsonwebtoken) + bcryptjs
- Swagger/OpenAPI (swagger-jsdoc e swagger-ui-express)

## Requisitos

- Node.js 18 ou superior
- npm 9 ou superior
- Nenhum servidor de banco externo (SQLite é um arquivo local)

## Como rodar

1. Clone o repositório:
   git clone https://github.com/galoainstein/raizes-do-nordeste-backend.git
   cd raizes-do-nordeste-backend

2. Instale as dependências:
   npm install

3. Configure as variáveis de ambiente:
   cp .env.example .env
   Edite o .env e ajuste os valores conforme necessário.

4. Crie as tabelas:
   node src/infrastructure/migrate.js

5. Popule o banco com dados de teste:
   npm run seed

6. Inicie a API:
   npm run dev

A API sobe em http://localhost:3000.

## Variáveis de ambiente

O arquivo .env.example contém:

- PORT: porta da API (padrão 3000)
- JWT_SECRET: chave usada para assinar os tokens
- JWT_EXPIRATION: tempo de expiração do token em segundos
- DB_FILE: caminho do arquivo SQLite

## Documentação Swagger

Acesse http://localhost:3000/swagger após iniciar a API.

## Coleção Postman

Importe o arquivo `postman/raizes.postman_collection.json` no Postman.
Configure a variável de ambiente `baseUrl` como http://localhost:3000.

Ordem sugerida para execução:

1. Auth / Login Cliente
2. Produtos / Listar
3. Pedidos / Criar
4. Pagamentos / Aprovar
5. Fidelidade / Consultar Saldo
6. Auth / Login Admin
7. Pedidos / Atualizar Status
8. Estoque / Movimentar
9. Erros / Sem Token
10. Erros / Sem Permissão
11. Erros / Estoque Insuficiente
12. Erros / Canal Inválido
13. Erros / Produto Inexistente
14. Pagamentos / Recusar

## Credenciais de teste

| Perfil  | E-mail              | Senha      |
|---------|---------------------|------------|
| Admin   | admin@raizes.com    | Senha@123  |
| Cliente | cliente@teste.com   | Senha@123  |

## Estrutura de pastas

src/
  config/         conexão com o banco e Swagger
  application/    serviços de auditoria
  infrastructure/ migrations e seed
  api/
    controllers/  regras de negócio
    middlewares/  autenticação e autorização
    routes/       rotas REST

docs/             diagramas (casos de uso, DER, classes, sequência)
postman/          coleção de testes