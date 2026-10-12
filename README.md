# Raízes do Nordeste — Back-end

API REST para gestão de pedidos multicanal, estoque, fidelização e pagamento mock.

## Stack
- Node.js + Express
- SQLite (better-sqlite3)
- JWT + bcrypt
- Swagger/OpenAPI

## Como rodar
1. `npm install`
2. Copie `.env.example` para `.env` e ajuste
3. `node src/infrastructure/migrate.js`
4. `npm run seed`
5. `npm run dev`

## Swagger
http://localhost:3000/swagger

## Coleção Postman
Importe `postman/raizes.postman_collection.json`.

## Credenciais de teste
| Perfil | E-mail | Senha |
|---|---|---|
| Admin | admin@raizes.com | Senha@123 |
| Cliente | cliente@teste.com | Senha@123 |