(() => {
  const INTERVALO_ATUALIZACAO = 60_000;

  const prioridades = {
    urgente: 1,
    importante: 2,
    normal: 3
  };

  let container = null;

  function escaparHtml(valor = "") {
    return String(valor)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function obterContainer() {
    if (container) {
      return container;
    }

    container = document.createElement("aside");
    container.id = "central-notificacoes";
    container.setAttribute(
      "aria-label",
      "Avisos importantes"
    );

    document.body.appendChild(container);

    return container;
  }

  function estaAtivo(aviso, agora) {
    if (!aviso.ativo || !aviso.mostrarPopup) {
      return false;
    }

    const inicio = new Date(aviso.inicio);
    const fim = new Date(aviso.fim);

    if (
      Number.isNaN(inicio.getTime()) ||
      Number.isNaN(fim.getTime())
    ) {
      return false;
    }

    return agora >= inicio && agora < fim;
  }

  function formatarEncerramento(valor) {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo"
    }).format(new Date(valor));
  }

  function montarAviso(aviso) {
    const elemento = document.createElement("article");

    elemento.className = [
      "notificacao-site",
      `notificacao-${aviso.prioridade}`,
      aviso.piscar ? "notificacao-destaque" : ""
    ]
      .filter(Boolean)
      .join(" ");

    elemento.dataset.avisoId = aviso.id;

    elemento.innerHTML = `
      <button
        type="button"
        class="notificacao-fechar"
        aria-label="Fechar aviso"
      >
        ×
      </button>

      <div class="notificacao-cabecalho">
        <span class="notificacao-categoria">
          ${escaparHtml(aviso.categoria)}
        </span>

        <span class="notificacao-prioridade">
          ${escaparHtml(aviso.prioridade)}
        </span>
      </div>

      <h2>${escaparHtml(aviso.titulo)}</h2>

      <p>${escaparHtml(aviso.descricao)}</p>

      <div class="notificacao-rodape" style="display: flex; justify-content: space-between; align-items: center;">
        <small>
          Disponível até
          ${formatarEncerramento(aviso.fim)}
        </small>
        <small class="cronometro-aviso" data-fim="${aviso.fim}" style="font-weight: bold;"></small>
      </div>
    `;

    elemento
      .querySelector(".notificacao-fechar")
      .addEventListener("click", () => {
        elemento.style.display = "none";
      });

    return elemento;
  }

  function renderizar(avisos) {
    const central = obterContainer();

    central.innerHTML = "";

    avisos.forEach((aviso) => {
      central.appendChild(montarAviso(aviso));
    });

    central.hidden = avisos.length === 0;
  }

  async function carregarAvisos() {
    try {
      const resposta = await fetch(
        `public/dados/avisos.json?v=${Date.now()}`,
        {
          cache: "no-store"
        }
      );

      if (!resposta.ok) {
        throw new Error(
          `Erro ao carregar avisos: ${resposta.status}`
        );
      }

      const avisos = await resposta.json();

      if (!Array.isArray(avisos)) {
        throw new Error(
          "O conteúdo de avisos.json é inválido."
        );
      }

      const agora = new Date();

      const ativos = avisos
        .filter((aviso) => estaAtivo(aviso, agora))
        .sort((a, b) => {
          return (
            (prioridades[a.prioridade] || 99) -
            (prioridades[b.prioridade] || 99)
          );
        });

      renderizar(ativos);
    } catch (erro) {
      console.error(erro);

      if (container) {
        container.hidden = true;
      }
    }
  }

  function atualizarCronometros() {
    const cronometros = document.querySelectorAll('.cronometro-aviso');
    const agora = new Date().getTime();

    cronometros.forEach(cron => {
      const fim = new Date(cron.dataset.fim).getTime();
      const diff = fim - agora;

      if (diff <= 0) {
        const notificacao = cron.closest('.notificacao-site');
        if (notificacao && notificacao.style.display !== 'none') {
          notificacao.style.display = 'none';
        }
      } else {
        const totalHoras = Math.floor(diff / (1000 * 60 * 60));
        const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (totalHoras >= 24) {
          const dias = Math.floor(totalHoras / 24);
          const horasRestantes = totalHoras % 24;
          const textoDias = dias === 1 ? "1 dia" : `${dias} dias`;
          
          cron.textContent = `${textoDias} ${horasRestantes.toString().padStart(2, '0')}h ${minutos.toString().padStart(2, '0')}m`;
        } else {
          const segundos = Math.floor((diff % (1000 * 60)) / 1000);
          cron.textContent = `${totalHoras.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        }
      }
    });
  }

  function iniciar() {
    carregarAvisos();

    window.setInterval(
      carregarAvisos,
      INTERVALO_ATUALIZACAO
    );

    window.setInterval(atualizarCronometros, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();

async function carregarAvisosGerais() {
  const container = document.getElementById(
    "lista-avisos-gerais"
  );

  if (!container) return;

  try {
    const resposta = await fetch(
      `public/dados/avisos.json?v=${Date.now()}`,
      {
        cache: "no-store"
      }
    );

    const avisos = await resposta.json();
    const agora = new Date();

    const avisosGerais = avisos
      .filter((aviso) => {
        const inicio = new Date(aviso.inicio);
        const fim = new Date(aviso.fim);

        return (
          aviso.ativo &&
          aviso.mostrarAvisosGerais &&
          agora >= inicio &&
          agora < fim
        );
      })
      .sort((a, b) => {
        return new Date(b.inicio) - new Date(a.inicio);
      });

    if (avisosGerais.length === 0) {
      container.innerHTML = `
        <p>Nenhum aviso disponível no momento.</p>
      `;

      return;
    }

    window.avisosData = avisosGerais; // Store globally for the modal

    container.innerHTML = avisosGerais
      .map((aviso, index) => {
        return `
          <article class="aviso-geral" onclick="abrirModalAviso(${index})">
            <span class="aviso-badge">${aviso.categoria}</span>
            <h3>${aviso.titulo}</h3>
            <p>${aviso.descricao}</p>
          </article>
        `;
      })
      .join("");
  } catch (erro) {
    console.error("Erro ao carregar avisos gerais:", erro);
  }
}

function abrirModalAviso(index) {
  const aviso = window.avisosData[index];
  if (!aviso) return;

  let modal = document.getElementById("modal-aviso-geral");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-aviso-geral";
    document.body.appendChild(modal);
  }

  const formatarDataModal = (valor) => {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo"
    }).format(new Date(valor));
  };

  const linkHTML = aviso.link 
    ? `<a href="${aviso.link}" class="modal-aviso-link" target="_blank">Acessar Link</a>` 
    : `<a class="modal-aviso-link inativo">Acessar Link</a>`;

  modal.innerHTML = `
    <div class="modal-aviso-conteudo">
      <button class="modal-aviso-fechar" onclick="document.getElementById('modal-aviso-geral').style.display='none'">×</button>
      <h2>${aviso.titulo}</h2>
      <div class="modal-aviso-badges">
        <span class="aviso-badge">${aviso.categoria}</span>
        <span class="aviso-badge prioridade-${aviso.prioridade}">${aviso.prioridade}</span>
      </div>
      <p class="modal-aviso-desc">${aviso.descricao}</p>
      <div class="modal-aviso-datas">
        <p><strong>Início:</strong> ${formatarDataModal(aviso.inicio)}</p>
        <p><strong>Encerramento:</strong> ${formatarDataModal(aviso.fim)}</p>
      </div>
      ${linkHTML}
    </div>
  `;

  modal.style.display = "flex";
}

// Ensure carregarAvisosGerais runs when DOM is loaded, and also whenever #view-avisos is shown
document.addEventListener('DOMContentLoaded', carregarAvisosGerais);
