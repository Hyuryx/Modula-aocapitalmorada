const express = require("express");
const fs = require("node:fs");
const path = require("node:path");

const app = express();
const PORTA = 3001;

const PASTA_PROJETO = path.resolve(__dirname, "..");

const ARQUIVO_AVISOS = path.join(
  PASTA_PROJETO,
  "public",
  "dados",
  "avisos.json"
);

const PASTA_BACKUPS = path.join(
  PASTA_PROJETO,
  "backups-avisos"
);

app.use(express.json({ limit: "1mb" }));

app.use(
  express.static(path.join(__dirname))
);

function garantirEstrutura() {
  const pastaDados = path.dirname(ARQUIVO_AVISOS);

  if (!fs.existsSync(pastaDados)) {
    fs.mkdirSync(pastaDados, { recursive: true });
  }

  if (!fs.existsSync(PASTA_BACKUPS)) {
    fs.mkdirSync(PASTA_BACKUPS, { recursive: true });
  }

  if (!fs.existsSync(ARQUIVO_AVISOS)) {
    fs.writeFileSync(
      ARQUIVO_AVISOS,
      JSON.stringify([], null, 2),
      "utf8"
    );
  }
}

function lerAvisos() {
  garantirEstrutura();

  const conteudo = fs.readFileSync(
    ARQUIVO_AVISOS,
    "utf8"
  );

  const avisos = JSON.parse(conteudo);

  if (!Array.isArray(avisos)) {
    throw new Error(
      "O arquivo avisos.json precisa conter um array."
    );
  }

  return avisos;
}

function criarBackup() {
  garantirEstrutura();

  if (!fs.existsSync(ARQUIVO_AVISOS)) {
    return;
  }

  const agora = new Date();

  const identificador = agora
    .toISOString()
    .replaceAll(":", "-")
    .replaceAll(".", "-");

  const destino = path.join(
    PASTA_BACKUPS,
    `avisos-${identificador}.json`
  );

  fs.copyFileSync(ARQUIVO_AVISOS, destino);
}

function salvarAvisos(avisos) {
  if (!Array.isArray(avisos)) {
    throw new Error("A lista de avisos é inválida.");
  }

  criarBackup();

  fs.writeFileSync(
    ARQUIVO_AVISOS,
    JSON.stringify(avisos, null, 2),
    "utf8"
  );
}

app.get("/api/avisos", (req, res) => {
  try {
    res.json(lerAvisos());
  } catch (erro) {
    res.status(500).json({
      erro: erro.message
    });
  }
});

app.post("/api/avisos", (req, res) => {
  try {
    salvarAvisos(req.body);

    res.json({
      sucesso: true,
      mensagem: "Arquivo avisos.json atualizado."
    });
  } catch (erro) {
    res.status(400).json({
      sucesso: false,
      erro: erro.message
    });
  }
});

app.listen(PORTA, "127.0.0.1", () => {
  garantirEstrutura();

  console.log("");
  console.log("Painel de avisos iniciado.");
  console.log(`Acesse: http://localhost:${PORTA}`);
  console.log("");
});
