const db = require('../config/database');
const bcrypt = require('bcryptjs');

function seed() {
  const senhaHash = bcrypt.hashSync('Senha@123', 10);

  db.prepare(`INSERT OR IGNORE INTO usuario (nome, email, senha_hash, perfil, consentimento_lgpd)
              VALUES (?, ?, ?, ?, ?)`)
    .run('Administrador', 'admin@raizes.com', senhaHash, 'ADMIN', 1);

  db.prepare(`INSERT OR IGNORE INTO usuario (nome, email, senha_hash, perfil, consentimento_lgpd)
              VALUES (?, ?, ?, ?, ?)`)
    .run('Cliente Teste', 'cliente@teste.com', senhaHash, 'CLIENTE', 1);

  db.prepare(`INSERT OR IGNORE INTO unidade (nome, endereco, cidade, uf)
              VALUES (?, ?, ?, ?)`)
    .run('Raízes Recife Centro', 'Rua das Flores, 100', 'Recife', 'PE');

  db.prepare(`INSERT OR IGNORE INTO unidade (nome, endereco, cidade, uf)
              VALUES (?, ?, ?, ?)`)
    .run('Raízes São Paulo', 'Av. Paulista, 500', 'São Paulo', 'SP');

  const produtos = [
    ['Tapioca de Queijo', 'Tapioca recheada com queijo coalho', 15.90, 'Tapiocas', 0],
    ['Cuscuz Recheado', 'Cuscuz com carne de sol', 22.50, 'Cuscuz', 0],
    ['Bolo de Macaxeira', 'Fatia de bolo tradicional', 12.00, 'Bolos', 0],
    ['Suco de Cajá', 'Suco natural 500ml', 9.90, 'Bebidas', 0]
  ];

  const insertProduto = db.prepare(`INSERT INTO produto (nome, descricao, preco, categoria, sazonal)
                                    VALUES (?, ?, ?, ?, ?)`);
  produtos.forEach(p => insertProduto.run(...p));

  const insertEstoque = db.prepare(`INSERT OR IGNORE INTO estoque (unidade_id, produto_id, quantidade, minimo)
                                    VALUES (?, ?, ?, ?)`);
  for (let u = 1; u <= 2; u++) {
    for (let p = 1; p <= 4; p++) {
      insertEstoque.run(u, p, 50, 5);
    }
  }

  db.prepare(`INSERT OR IGNORE INTO fidelidade (cliente_id, pontos) VALUES (?, ?)`).run(2, 100);

  console.log('Seed executado com sucesso.');
}

seed();