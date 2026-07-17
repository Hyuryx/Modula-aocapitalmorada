const formulario = document.getElementById("formularioAviso");
const listaAvisos = document.getElementById("listaAvisos");
const statusServidor = document.getElementById("statusServidor");
const quantidadeAvisos = document.getElementById("quantidadeAvisos");
const tituloFormulario = document.getElementById("tituloFormulario");
const cancelarEdicao = document.getElementById("cancelarEdicao");
const salvarArquivo = document.getElementById("salvarArquivo");

let avisos = [];
let idEmEdicao = null;

function escaparHtml(valor = "") {
  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function criarId(titulo) {
  const slug = titulo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${slug}-${Date.now()}`;
}

function converterParaISOComFuso(valor) {
  if (!valor) {
    return "";
  }

  return `${valor}:00-03:00`;
}

function converterParaCampoData(valor) {
  if (!valor) {
    return "";
  }

  return valor.substring(0, 16);
}

function formatarData(valor) {
  if (!valor) {
    return "Não informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo"
  }).format(new Date(valor));
}

function prioridadePeso(prioridade) {
  const pesos = {
    urgente: 1,
    importante: 2,
    normal: 3
  };

  return pesos[prioridade] || 99;
}

async function carregarAvisos() {
  try {
    const resposta = await fetch("/api/avisos");

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar os avisos.");
    }

    avisos = await resposta.json();

    statusServidor.textContent = "Arquivo carregado";
    statusServidor.className = "status sucesso";

    renderizarAvisos();
  } catch (erro) {
    statusServidor.textContent = erro.message;
    statusServidor.className = "status erro";
  }
}

function renderizarAvisos() {
  const avisosOrdenados = avisos
    .map((aviso, indiceOriginal) => ({
      aviso,
      indiceOriginal
    }))
    .sort((a, b) => {
      return (
        prioridadePeso(a.aviso.prioridade) -
        prioridadePeso(b.aviso.prioridade)
      );
    });

  quantidadeAvisos.textContent =
    avisos.length === 1
      ? "1 aviso cadastrado"
      : `${avisos.length} avisos cadastrados`;

  if (avisos.length === 0) {
    listaAvisos.innerHTML = `
      <div class="lista-vazia">
        Nenhum aviso foi cadastrado.
      </div>
    `;

    return;
  }

  listaAvisos.innerHTML = avisosOrdenados
    .map(({ aviso, indiceOriginal }) => {
      return `
        <article class="item-aviso prioridade-${aviso.prioridade}">
          <div class="item-conteudo">
            <div class="item-topo">
              <span class="categoria">
                ${escaparHtml(aviso.categoria)}
              </span>

              <span class="prioridade">
                ${escaparHtml(aviso.prioridade)}
              </span>

              ${
                aviso.ativo
                  ? '<span class="situacao ativo">Ativo</span>'
                  : '<span class="situacao inativo">Inativo</span>'
              }
            </div>

            <h3>${escaparHtml(aviso.titulo)}</h3>

            <p>${escaparHtml(aviso.descricao)}</p>

            <div class="datas">
              <span>
                <strong>Início:</strong>
                ${formatarData(aviso.inicio)}
              </span>

              <span>
                <strong>Fim:</strong>
                ${formatarData(aviso.fim)}
              </span>
            </div>

            <div class="formas-exibicao">
              ${aviso.mostrarPopup ? "<span>Pop-up</span>" : ""}
              ${
                aviso.mostrarAvisosGerais
                  ? "<span>Avisos Gerais</span>"
                  : ""
              }
              ${aviso.piscar ? "<span>Destacado</span>" : ""}
            </div>
          </div>

          <div class="item-acoes">
            <button
              type="button"
              onclick="editarAviso('${aviso.id}')"
              class="botao secundario"
            >
              Editar
            </button>

            <button
              type="button"
              onclick="excluirAviso('${aviso.id}')"
              class="botao perigo"
            >
              Excluir
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const inicio = document.getElementById("inicio").value;
  const fim = document.getElementById("fim").value;

  if (new Date(inicio) >= new Date(fim)) {
    alert(
      "A data de encerramento precisa ser posterior à data inicial."
    );

    return;
  }

  const titulo = document.getElementById("titulo").value.trim();

  const avisoExistente =
    idEmEdicao !== null ? avisos.find((a) => a.id === idEmEdicao) : null;

  const aviso = {
    id: avisoExistente?.id || criarId(titulo),
    titulo,
    descricao: document
      .getElementById("descricao")
      .value
      .trim(),
    categoria: document.getElementById("categoria").value,
    prioridade: document.getElementById("prioridade").value,
    inicio: converterParaISOComFuso(inicio),
    fim: converterParaISOComFuso(fim),
    link: document.getElementById("link").value.trim(),
    mostrarPopup: document
      .getElementById("mostrarPopup")
      .checked,
    mostrarAvisosGerais: document
      .getElementById("mostrarAvisosGerais")
      .checked,
    piscar: document.getElementById("piscar").checked,
    ativo: document.getElementById("ativo").checked
  };

  if (idEmEdicao === null) {
    avisos.push(aviso);
  } else {
    const index = avisos.findIndex((a) => a.id === idEmEdicao);
    if (index !== -1) {
      avisos[index] = aviso;
    }
  }

  limparFormulario();
  renderizarAvisos();

  statusServidor.textContent =
    "Alterações ainda não salvas no arquivo";

  statusServidor.className = "status pendente";
});

window.editarAviso = function(id) {
  const aviso = avisos.find((a) => a.id === id);
  if (!aviso) return;

  idEmEdicao = id;

  document.getElementById("avisoId").value = aviso.id;
  document.getElementById("titulo").value = aviso.titulo;
  document.getElementById("descricao").value = aviso.descricao;
  document.getElementById("categoria").value = aviso.categoria;
  document.getElementById("prioridade").value = aviso.prioridade;
  document.getElementById("inicio").value =
    converterParaCampoData(aviso.inicio);
  document.getElementById("fim").value =
    converterParaCampoData(aviso.fim);
  document.getElementById("link").value = aviso.link || "";
  document.getElementById("mostrarPopup").checked =
    aviso.mostrarPopup;
  document.getElementById("mostrarAvisosGerais").checked =
    aviso.mostrarAvisosGerais;
  document.getElementById("piscar").checked = aviso.piscar;
  document.getElementById("ativo").checked = aviso.ativo;

  tituloFormulario.textContent = "Editar aviso";
  cancelarEdicao.hidden = false;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

window.excluirAviso = function(id) {
  const aviso = avisos.find((a) => a.id === id);
  if (!aviso) return;

  const confirmou = confirm(
    `Deseja excluir o aviso "${aviso.titulo}"?`
  );

  if (!confirmou) {
    return;
  }

  avisos = avisos.filter((a) => a.id !== id);

  if (idEmEdicao === id) {
    limparFormulario();
  }

  renderizarAvisos();

  statusServidor.textContent =
    "Alterações ainda não salvas no arquivo";

  statusServidor.className = "status pendente";
}

function limparFormulario() {
  idEmEdicao = null;

  formulario.reset();

  document.getElementById("mostrarPopup").checked = true;
  document.getElementById("mostrarAvisosGerais").checked = true;
  document.getElementById("ativo").checked = true;

  tituloFormulario.textContent = "Novo aviso";
  cancelarEdicao.hidden = true;
}

cancelarEdicao.addEventListener("click", limparFormulario);

salvarArquivo.addEventListener("click", async () => {
  try {
    salvarArquivo.disabled = true;
    salvarArquivo.textContent = "Salvando...";

    const resposta = await fetch("/api/avisos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(avisos)
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        resultado.erro || "Não foi possível salvar."
      );
    }

    statusServidor.textContent = "Arquivo salvo com sucesso";
    statusServidor.className = "status sucesso";

    alert(
      "Os avisos foram salvos e um backup foi criado."
    );
  } catch (erro) {
    statusServidor.textContent = erro.message;
    statusServidor.className = "status erro";
  } finally {
    salvarArquivo.disabled = false;
    salvarArquivo.textContent = "Salvar avisos.json";
  }
});

carregarAvisos();
