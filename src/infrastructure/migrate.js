const db = require('../config/database');

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha_hash TEXT NOT NULL,
      perfil TEXT NOT NULL CHECK (perfil IN ('ADMIN','GERENTE','CLIENTE','ATENDENTE','COZINHA')),
      consentimento_lgpd INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS unidade (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      endereco TEXT,
      cidade TEXT,
      uf TEXT,
      ativo INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS produto (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      preco REAL NOT NULL,
      categoria TEXT,
      sazonal INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS produto_unidade (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      produto_id INTEGER NOT NULL,
      unidade_id INTEGER NOT NULL,
      disponivel INTEGER DEFAULT 1,
      FOREIGN KEY (produto_id) REFERENCES produto(id),
      FOREIGN KEY (unidade_id) REFERENCES unidade(id),
      UNIQUE (produto_id, unidade_id)
    );

    CREATE TABLE IF NOT EXISTS estoque (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unidade_id INTEGER NOT NULL,
      produto_id INTEGER NOT NULL,
      quantidade INTEGER NOT NULL DEFAULT 0,
      minimo INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (unidade_id) REFERENCES unidade(id),
      FOREIGN KEY (produto_id) REFERENCES produto(id),
      UNIQUE (unidade_id, produto_id)
    );

    CREATE TABLE IF NOT EXISTS pedido (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      unidade_id INTEGER NOT NULL,
      canal_pedido TEXT NOT NULL CHECK (canal_pedido IN ('APP','TOTEM','BALCAO','PICKUP','WEB')),
      status TEXT NOT NULL CHECK (status IN ('AGUARDANDO_PAGAMENTO','PAGO','EM_PREPARO','PRONTO','ENTREGUE','CANCELADO')),
      total REAL NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES usuario(id),
      FOREIGN KEY (unidade_id) REFERENCES unidade(id)
    );

    CREATE TABLE IF NOT EXISTS item_pedido (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER NOT NULL,
      produto_id INTEGER NOT NULL,
      quantidade INTEGER NOT NULL,
      preco_unitario REAL NOT NULL,
      FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE CASCADE,
      FOREIGN KEY (produto_id) REFERENCES produto(id)
    );

    CREATE TABLE IF NOT EXISTS pagamento (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('APROVADO','RECUSADO','PENDENTE')),
      valor REAL NOT NULL,
      transacao_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pedido_id) REFERENCES pedido(id)
    );

    CREATE TABLE IF NOT EXISTS fidelidade (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER UNIQUE NOT NULL,
      pontos INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES usuario(id)
    );

    CREATE TABLE IF NOT EXISTS log_auditoria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      acao TEXT NOT NULL,
      entidade TEXT NOT NULL,
      entidade_id INTEGER,
      usuario_id INTEGER,
      detalhes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Tabelas criadas com sucesso.');
}

migrate();