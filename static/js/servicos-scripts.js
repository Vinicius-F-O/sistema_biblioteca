document.addEventListener("DOMContentLoaded", function () {
  // Toggle Sidebar
  const toggleBtn = document.getElementById("toggle-btn");
  const sidebar = document.getElementById("sidebar");

  toggleBtn.addEventListener("click", function () {
    sidebar.classList.toggle("collapsed");

    const icon = document.getElementById("sidebar-toggle-icon");

    // Alterna o ícone entre 'fa-bars' e 'fa-chevron-right'
    if (sidebar.classList.contains("collapsed")) {
      icon.classList.remove("fa-bars");
      icon.classList.add("fa-chevron-right");
    } else {
      icon.classList.remove("fa-chevron-right");
      icon.classList.add("fa-bars");
    }

    // Em mobile, alternar a classe 'active'
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle("active");
    }
  });

  // Fechar sidebar quando clicar fora (em mobile)
  document.addEventListener("click", function (e) {
    if (
      window.innerWidth <= 768 &&
      !sidebar.contains(e.target) &&
      e.target !== toggleBtn
    ) {
      sidebar.classList.remove("active");
    }
  });

  // Atualizar layout quando a janela for redimensionada
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
      sidebar.classList.remove("active");
    }
  });
});

// Dynamic due date for loans
const loanRadio = document.getElementById("loan");
const saleRadio = document.getElementById("sale");
const dueDateField = document.getElementById("dueDate");

loanRadio.addEventListener("change", function () {
  dueDateField.disabled = false;
  dueDateField.required = true;
  // Set default due date (today + 7 days)
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 7);
  dueDateField.valueAsDate = dueDate;
});

saleRadio.addEventListener("change", function () {
  dueDateField.disabled = true;
  dueDateField.required = false;
  dueDateField.value = "";
});

// Set default date to today
document.getElementById("transactionDate").valueAsDate = new Date();

// ================== BUSCA DE LIVRO ==================
const input = document.getElementById("bookSearch");
const suggestionBox = document.getElementById("suggestions");

input.addEventListener("input", async () => {
  const query = input.value.trim();

  if (query.length < 2) {
    suggestionBox.style.display = "none";
    return;
  }

  try {
    const response = await fetch(
      `/buscar-livros?query=${encodeURIComponent(query)}`
    );
    const data = await response.json();

    suggestionBox.innerHTML = "";
    const filtered = data.livros || [];

    if (filtered.length === 0) {
      suggestionBox.innerHTML =
        '<li class="dropdown-item disabled">Nenhum livro encontrado</li>';
    }

    filtered.forEach((book) => {
      const li = document.createElement("li");
      li.classList.add("dropdown-item");

      if (book.disponibilidade === false) {
        li.textContent = `${book.titulo} - ${book.autor} (Indisponível)`;
        li.classList.add("disabled", "text-muted");
        li.style.pointerEvents = "none";
      } else {
        li.textContent = `${book.titulo} - ${book.autor}`;
        li.addEventListener("click", () => {
          input.value = book.titulo;
          suggestionBox.innerHTML = "";
          suggestionBox.style.display = "none";
        });
      }

      suggestionBox.appendChild(li);
    });

    suggestionBox.style.display = "block";
  } catch (error) {
    console.error("Erro na busca de livros:", error);
  }
});

// Esconde o dropdown quando clicar fora
document.addEventListener("click", (e) => {
  if (!input.contains(e.target) && !suggestionBox.contains(e.target)) {
    suggestionBox.style.display = "none";
  }
});

// ================== BUSCA DE CLIENTE ==================
const inputCPF = document.getElementById("clienteSelect");
const clienteInfoDiv = document.getElementById("clienteInfo");
const btnAdicionar = document.querySelector(".btnAdicionar");

inputCPF.addEventListener("input", () => {
  const cpf = inputCPF.value.replace(/\D/g, "");

  // Máscara de CPF
  let value = inputCPF.value.replace(/\D/g, "");
  if (value.length > 3) value = value.replace(/^(\d{3})/, "$1.");
  if (value.length > 7) value = value.replace(/^(\d{3})\.(\d{3})/, "$1.$2.");
  if (value.length > 11)
    value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})/, "$1.$2.$3-");
  inputCPF.value = value.substring(0, 14);

  if (cpf.length === 11) {
    fetch(`/buscar-cliente?cpf=${cpf}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.found) {
          let multaInfo = "";
          let avisoMulta = "";
          let avisoStatus = "";

          const temMulta = data.multas_pendentes && data.multas_pendentes > 0;
          const inativo = data.status === "Inativo";

          if (temMulta) {
            multaInfo = `
              <span class="small text-danger mt-1">
                <i class="fas fa-exclamation-triangle me-1"></i>
                Multa pendente: R$ ${data.multa.toFixed(2)}
              </span>
            `;
            avisoMulta = `
              <span class="text-danger d-block mt-2 fs-6">
                Este cliente possui multas pendentes e não pode realizar novos serviços.
              </span>
            `;
          }

          if (inativo) {
            avisoStatus = `
              <span class="text-danger d-block mt-2 fs-6">
                O cliente selecionado está inativo e portanto não pode ter novos serviços cadastrados.
              </span>
            `;
          }

          clienteInfoDiv.innerHTML = `
            <div class="card border-primary mb-2" style="max-width: 350px;">
              <div class="card-body py-2 px-3">
                <div class="d-flex flex-column">
                  <span class="fw-bold text-primary mb-1">
                    <i class="fas fa-user me-1"></i> ${data.nome}
                  </span>
                  <span class="small text-muted mb-1">
                    <i class="fas fa-id-card me-1"></i> ID: ${data.id}
                  </span>
                  <span class="small text-muted mb-1">
                    <i class="fas fa-envelope me-1"></i> ${data.email}
                  </span>
                  ${multaInfo}
                  ${data.status === "Inativo" ? `<span class="small text-muted">
                    <i class="fas fa-info-circle me-1"></i>Status: ${data.status}
                  </span>` : ""}
                </div>
              </div>
            </div>
            ${avisoMulta}
            ${avisoStatus}
          `;

          // Desativa o botão se cliente tem multa ou está inativo
          btnAdicionar.disabled = temMulta || inativo;
        } else {
          clienteInfoDiv.innerHTML = `<span class="text-danger">Cliente não encontrado.</span>`;
          btnAdicionar.disabled = true;
        }
      })
      .catch((error) => {
        clienteInfoDiv.innerHTML = `<span class="text-danger">Erro ao buscar cliente.</span>`;
        btnAdicionar.disabled = true;
        console.error(error);
      });
  } else {
    clienteInfoDiv.innerHTML = "";
    btnAdicionar.disabled = false;
  }
});

// ================== SUBMISSÃO ==================
const form = document.getElementById("formServico");

form.addEventListener("submit", function (e) {
  const cpfInput = document.getElementById("clienteSelect");
  cpfInput.value = cpfInput.value.replace(/\D/g, "");

  if (btnAdicionar.disabled) {
    e.preventDefault();
    alert("O cliente não está apto para realizar novos serviços.");
  }
});

let servicoIdSelecionado = null;

document.querySelectorAll(".btn-devolver").forEach((btn) => {
  btn.addEventListener("click", function () {
    servicoIdSelecionado = this.getAttribute("data-id");
    // Exibir informações do serviço no modal (opcional)
    const tituloLivro = this.getAttribute("data-titulo");
    document.getElementById(
      "infoDevolucao"
    ).innerHTML = `<strong>Livro:</strong> ${tituloLivro}`;
    // Abrir o modal
    const modal = new bootstrap.Modal(
      document.getElementById("modalDevolucao")
    );
    modal.show();
  });
});

document
  .getElementById("btnConfirmarDevolucao")
  .addEventListener("click", function () {
    if (servicoIdSelecionado) {
      fetch(`/devolver-servico/${servicoIdSelecionado}`, {
        method: "POST",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Fecha o modal
            const modal = bootstrap.Modal.getInstance(
              document.getElementById("modalDevolucao")
            );
            modal.hide();
            // Recarrega a página para atualizar a tabela
            location.reload();
          } else {
            alert("Erro ao devolver serviço.");
          }
        });
    }
  });

// Configuração do modal de pagamento de multa
document.querySelectorAll(".btn-pagamento").forEach((btn) => {
  btn.addEventListener("click", function () {
    const servicoId = this.getAttribute("data-id");
    fetch(`/api/servico/${servicoId}`)
      .then((response) => response.json())
      .then((servico) => {
        document.getElementById("multaCapaLivro").src = servico.livro.capa;
        document.getElementById("multaTituloLivro").textContent =
          servico.livro.titulo;
        document.getElementById("multaNomeCliente").textContent =
          servico.cliente.nome;
        document.getElementById("multaMotivo").textContent =
          servico.motivoMulta;
        document.getElementById("multaDataDevolucao").textContent =
          servico.dataDevolucao || '-';
        document.getElementById("multaDataDevolucaoReal").textContent =
          servico.dataDevolucaoReal || '-';
        document.getElementById("multaValor").textContent =
          `R$ ${parseFloat(servico.multa).toFixed(2)}`;
      });
  });
});

// Configuração do modal de renovação (substituindo o botão de edição)
document.querySelectorAll(".btn-editar").forEach((btn) => {
  btn.addEventListener("click", function () {
    const servicoId = this.getAttribute("data-id");
    fetch(`/api/servico/${servicoId}`)
      .then((response) => response.json())
      .then((servico) => {
        document.getElementById("renovacaoCapaLivro").src = servico.livro.capa;
        document.getElementById("renovacaoTituloLivro").textContent =
          servico.livro.titulo;
        document.getElementById("renovacaoNomeCliente").textContent =
          servico.cliente.nome;
        document.getElementById("renovacaoDataAtual").textContent =
          servico.dataDevolucao;

        // Configurar data mínima/máxima para renovação
        const hoje = new Date();
        const dataMaxima = new Date();
        dataMaxima.setDate(hoje.getDate() + 15);

        const inputData = document.getElementById("novaDataDevolucao");
        inputData.min = hoje.toISOString().split("T")[0];
        inputData.max = dataMaxima.toISOString().split("T")[0];
        inputData.value = dataMaxima.toISOString().split("T")[0];
      });
  });
});
