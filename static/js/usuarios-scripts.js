document.addEventListener("DOMContentLoaded", function () {
  const addUserBtn = document.getElementById("addUserBtn");
  const userTabs = document.querySelectorAll(
    '#userTabs button[data-bs-toggle="tab"]'
  );
  let currentUserTab = "clients-tab"; // valor padrão

  // Atualiza botão + aba ativa
  userTabs.forEach((tab) => {
    tab.addEventListener("shown.bs.tab", function (event) {
      currentUserTab = event.target.id;

      if (currentUserTab === "clients-tab") {
        addUserBtn.innerHTML = `<i class="fas fa-plus me-2"></i> Adicionar Cliente`;
      } else if (currentUserTab === "staff-tab") {
        addUserBtn.innerHTML = `<i class="fas fa-plus me-2"></i> Adicionar Funcionário`;
      }
    });
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

  // Ao abrir o modal
  const newUserModal = document.getElementById("newUserModal");
  newUserModal.addEventListener("show.bs.modal", function () {
    const clientTab = document.getElementById("newClient-tab");
    const staffTab = document.getElementById("newStaff-tab");

    if (currentUserTab === "clients-tab") {
      // Ativa aba de cliente
      new bootstrap.Tab(clientTab).show();

      // Desabilita aba de funcionário
      staffTab.classList.add("disabled");
      staffTab.setAttribute("tabindex", "-1");
    } else {
      // Ativa aba de funcionário
      new bootstrap.Tab(staffTab).show();

      // Desabilita aba de cliente
      clientTab.classList.add("disabled");
      clientTab.setAttribute("tabindex", "-1");
    }
  });

  // Ao fechar o modal, reabilita as abas
  newUserModal.addEventListener("hidden.bs.modal", function () {
    document.getElementById("newClient-tab").classList.remove("disabled");
    document.getElementById("newClient-tab").removeAttribute("tabindex");

    document.getElementById("newStaff-tab").classList.remove("disabled");
    document.getElementById("newStaff-tab").removeAttribute("tabindex");
  });

  // Adiciona log ao clicar no botão de adicionar usuário
  addUserBtn.addEventListener("click", function () {
    // Aba ativa (tab-pane)
    const activeTabPane = document.querySelector(".tab-pane.active");
    // Aba selecionada (botão de tab)
    const selectedTabBtn = document.querySelector("#userTabs button.active");
    console.log(
      "Aba ativa (tab-pane):",
      activeTabPane ? activeTabPane.id : null
    );
    console.log(
      "Aba selecionada (tab):",
      selectedTabBtn ? selectedTabBtn.id : null
    );
    console.log("currentUserTab:", currentUserTab);
  });
});

// Botão para gerar senha aleatória
document
  .getElementById("generatePassword")
  .addEventListener("click", function () {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    passwordField.value = password;
    passwordField.setAttribute("type", "text");
    togglePassword.querySelector("i").classList.add("fa-eye-slash");
  });

// Gerar senha aleatória
document
  .getElementById("generatePassword")
  .addEventListener("click", function () {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById("staffPassword").value = password;
  });

// Botão para mostrar/ocultar senha
const togglePassword = document.getElementById("togglePassword");
const passwordField = document.getElementById("staffPassword");

togglePassword.addEventListener("click", function () {
  const type =
    passwordField.getAttribute("type") === "password" ? "text" : "password";
  passwordField.setAttribute("type", type);
  this.querySelector("i").classList.toggle("fa-eye-slash");
});

// Máscara para CPF
document.getElementById("clientCpf").addEventListener("input", function (e) {
  let value = e.target.value.replace(/\D/g, "");
  if (value.length > 3) value = value.replace(/^(\d{3})/, "$1.");
  if (value.length > 7) value = value.replace(/^(\d{3})\.(\d{3})/, "$1.$2.");
  if (value.length > 11)
    value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})/, "$1.$2.$3-");
  e.target.value = value.substring(0, 14);
});

// Máscara para telefone
document.getElementById("clientPhone").addEventListener("input", function (e) {
  let value = e.target.value.replace(/\D/g, "");
  if (value.length > 0) value = "(" + value;
  if (value.length > 3)
    value = value.substring(0, 3) + ") " + value.substring(3);
  if (value.length > 10)
    value = value.substring(0, 10) + "-" + value.substring(10);
  e.target.value = value.substring(0, 15);
});

// Validação de CPF e Email no formulário de novo cliente
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let soma = 0,
    resto;
  for (let i = 1; i <= 9; i++)
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++)
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;
  return true;
}

function validarEmail(email) {
  // Regex simples para validação de email
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Adiciona validação ao submit do formulário de novo cliente
const newClientForm = document.getElementById("newClientForm");
if (newClientForm) {
  newClientForm.addEventListener("submit", function (e) {
    const cpfInput = document.getElementById("clientCpf");
    const phoneInput = document.getElementById("clientPhone");
    const email = document.getElementById("clientEmail").value;
    let mensagemErro = "";
    // Remove máscara do CPF e telefone antes de validar e enviar
    const cpf = cpfInput.value.replace(/\D/g, "");
    const phone = phoneInput.value.replace(/\D/g, "");
    if (!validarCPF(cpf)) {
      mensagemErro += "CPF inválido!\n";
    }
    if (!validarEmail(email)) {
      mensagemErro += "Email inválido!\n";
    }
    if (mensagemErro) {
      alert(mensagemErro);
      e.preventDefault();
    } else {
      // Atualiza os valores dos inputs para os dados sem máscara antes de enviar
      cpfInput.value = cpf;
      phoneInput.value = phone;
    }
  });
}

// Modal de edição
document.querySelectorAll("#clients .btn-outline-primary").forEach((btn) => {
  btn.addEventListener("click", function () {
    const row = this.closest("tr");
    const cliente = {
      nome: row.querySelector(".user-name").textContent,
      cpf: row.cells[2].textContent,
      email: row.querySelector(".user-email").textContent,
      telefone: row.cells[3].textContent,
      id: row.dataset.id,
    };

    document.getElementById("editarNome").value = cliente.nome;
    document.getElementById("editarCpf").value = cliente.cpf;
    document.getElementById("editarEmail").value = cliente.email;
    document.getElementById("editarTelefone").value = cliente.telefone;
    document.getElementById("editarClienteId").value = cliente.id;
    document.getElementById("formEditarCliente").action =
      "/editar-cliente/" + cliente.id;

    const modalEditarCliente = bootstrap.Modal.getOrCreateInstance(
      document.getElementById("modalEditarCliente")
    );
    modalEditarCliente.show();
  });
});

// Modal de alteração de status
document
  .querySelectorAll(
    "#clients .btn-outline-danger, #clients .btn-outline-success"
  )
  .forEach((btn) => {
    btn.setAttribute("data-bs-toggle", "modal");
    btn.setAttribute("data-bs-target", "#modalStatusCliente");

    btn.addEventListener("click", function () {
      const row = this.closest("tr");
      const nome = row.querySelector(".user-name").textContent;
      const avatar = row.querySelector(".user-avatar").src;
      const status = row.querySelector(".badge").textContent.trim();
      const clienteId = row.dataset.id;

      const acao = status === "Ativo" ? "desativar" : "ativar";
      const novoStatus = status === "Ativo" ? "Inativo" : "Ativo";

      document.getElementById("statusClienteAvatar").src = avatar;
      document.getElementById("statusClienteNome").textContent = nome;
      document.getElementById(
        "infoStatusCliente"
      ).innerHTML = `<strong>${nome}</strong> (Status atual: <span class='badge ${
        status === "Ativo" ? "bg-success" : "bg-secondary"
      }'>${status}</span>)`;
      document.getElementById("acaoStatusCliente").textContent = acao;

      document.getElementById("statusClienteId").value = clienteId;
      document.getElementById("novoStatusCliente").value = novoStatus;
      document.getElementById("formStatusCliente").action =
        "/alterar-status-cliente/" + clienteId;

      // Muda a cor do header e do botão conforme a ação
      const modalHeader = document.getElementById("modalStatusClienteHeader");
      const btnConfirmar = document.getElementById("btnConfirmarStatusCliente");

      if (acao === "ativar") {
        modalHeader.classList.remove("bg-danger");
        modalHeader.classList.add("bg-success");
        btnConfirmar.classList.remove("btn-danger");
        btnConfirmar.classList.add("btn-success");
      } else {
        modalHeader.classList.remove("bg-success");
        modalHeader.classList.add("bg-danger");
        btnConfirmar.classList.remove("btn-success");
        btnConfirmar.classList.add("btn-danger");
      }

      const iconStatusCliente = document.getElementById("iconStatusCliente");
      if (acao === "ativar") {
        iconStatusCliente.className = "fas fa-user-check me-2";
      } else {
        iconStatusCliente.className = "fas fa-user-slash me-2";
      }
    });
  });

const modalStatusCliente = document.getElementById("modalStatusCliente");
modalStatusCliente.addEventListener("hidden.bs.modal", function () {
  const modalHeader = document.getElementById("modalStatusClienteHeader");
  const btnConfirmar = document.getElementById("btnConfirmarStatusCliente");
  modalHeader.classList.remove("bg-success");
  modalHeader.classList.add("bg-danger");
  btnConfirmar.classList.remove("btn-success");
  btnConfirmar.classList.add("btn-danger");
});

// Modal de detalhes
document.querySelectorAll(".btn-detalhes").forEach((btn) => {
  btn.addEventListener("click", async function () {
    const cpf = this.dataset.cpf; // Salve o CPF no botão com data-cpf="{{cliente.cpf}}"

    try {
      const response = await fetch(`/buscar-cliente?cpf=${cpf}`);
      const data = await response.json();

      if (!data.found) {
        alert("Cliente não encontrado.");
        return;
      }

      // Preenche dados básicos
      document.getElementById(
        "detalhesAvatar"
      ).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        data.nome
      )}&background=7B2CBF&color=fff&size=120&rounded=true&bold=true`;
      document.getElementById("detalhesNome").textContent = data.nome;
      document.getElementById("detalhesCpf").textContent = data.cpf;
      document.getElementById("detalhesEmail").textContent = data.email;
      document.getElementById("detalhesTelefone").textContent = data.telefone;
      document.getElementById("detalhesEndereco").textContent = data.endereco;
      document.getElementById("detalhesDataCadastro").textContent =
        data.data_cadastro;

      // Status
      const statusBadge = document.getElementById("detalhesStatus");
      statusBadge.textContent = data.status;
      statusBadge.className =
        "badge " + (data.status === "Ativo" ? "bg-success" : "bg-secondary");

      // Emprestimos
      const emprestimosContainer = document.getElementById(
        "emprestimosContainer"
      );
      emprestimosContainer.innerHTML = "";

      data.emprestimos.forEach((e) => {
        const statusBadge =
          e.status === "Atrasado"
            ? `<span class="badge bg-danger">Atrasado</span>`
            : `<span class="badge bg-warning text-dark">Devolver até ${e.data_devolucao}</span>`;

        emprestimosContainer.innerHTML += `
          <div class="col-md-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h6 class="card-title mb-0 fw-bold">${e.titulo}</h6>
                  ${statusBadge}
                </div>
                <p class="card-text small text-muted mb-2">${e.autor}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <span class="badge bg-light text-dark small">
                      <i class="fas fa-calendar-alt me-1"></i> Empréstimo: ${e.data_emprestimo}
                    </span>
                  </div>
                  <!-- <button class="btn btn-sm btn-outline-primary py-0 px-2">
                    <i class="fas fa-eye"></i> Detalhes
                  </button> -->
                </div>
              </div>
            </div>
          </div>
        `;
      });

      document.getElementById("totalEmprestimos").textContent =
        data.emprestimos.length;

      // Multas
      const multasContainer = document.getElementById("multasContainer");
      multasContainer.innerHTML = "";
      data.multas.forEach((m) => {
        multasContainer.innerHTML += `
          <div class="col-md-6">
            <div class="card border-0 border-start border-3 border-danger shadow-sm">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h6 class="card-title mb-0 fw-bold">${m.motivo}</h6>
                  <span class="badge bg-danger">${m.valor}</span>
                </div>
                <p class="card-text small text-muted mb-2">Livro: ${m.livro}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <span class="badge bg-light text-dark small mb-1">
                      <i class="fas fa-calendar-times me-1"></i> Vencimento: ${m.vencimento}
                    </span>
                  </div>
                  <!-- <button class="btn btn-sm btn-outline-danger py-0 px-2">
                    <i class="fas fa-dollar-sign"></i> Pagar
                  </button> -->
                </div>
                <div>
                    <span class="badge bg-light text-dark small">
                      <i class="fa-solid fa-calendar-check me-1"></i> Data Devolucao: ${m.data_devolucao}
                    </span>
                  </div>
              </div>
            </div>
          </div>
        `;
      });

      document.getElementById("totalMultas").textContent = data.multas.length;

      // Abre o modal
      const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modalDetalhesCliente")
      );
      modal.show();
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      alert("Erro ao buscar dados do cliente.");
    }
  });
});

// Função para abrir modal de edição de funcionário
document.querySelectorAll("#staff .btn-editar-funcionario").forEach((btn) => {
  btn.addEventListener("click", function () {
    const row = this.closest("tr");
    const funcionarioId = row.dataset.id;

    document.getElementById("editarFuncionarioId").value = funcionarioId;
    document.getElementById("editarNomeFuncionario").value =
      row.querySelector(".user-name").textContent;
    document.getElementById("editarEmailFuncionario").value =
      row.querySelector(".user-email").textContent;
    document.getElementById("editarCargoFuncionario").value =
      row.cells[2].textContent.trim();
    document.getElementById("editarSenhaFuncionario").value = "";

    document.getElementById("formEditarFuncionario").action =
      "/editar-funcionario/" + funcionarioId;

    const modal = bootstrap.Modal.getOrCreateInstance(
      document.getElementById("modalEditarFuncionario")
    );
    modal.show();
  });
});

// Referências
const nivelAcessoSelect = document.getElementById("nivelAcesso");
const checkEmprestimos = document.getElementById("permEmprestimos");
const checkEstoque = document.getElementById("permEstoque");
const checkUsuarios = document.getElementById("permUsuarios");
const acessoTotalSwitch = document.getElementById("permAcessoTotal");

// Resetar campos ao abrir o modal
function resetarCampos() {
  nivelAcessoSelect.value = "";
  acessoTotalSwitch.checked = false;
  toggleBloqueioCampos(false);
}

// Buscar permissões atuais do funcionário
async function carregarPermissoes(funcionarioId) {
  try {
    const resposta = await fetch(
      `/api/permissoes-funcionario/${funcionarioId}`
    );
    if (!resposta.ok) throw new Error("Erro ao buscar permissões");

    const dados = await resposta.json();

    checkEmprestimos.checked = dados.permEmprestimos;
    checkEstoque.checked = dados.permEstoque;
    checkUsuarios.checked = dados.permUsuarios;

    // Se vier o campo acessoTotal, marque o switch e bloqueie os campos
    if (dados.acessoTotal) {
      acessoTotalSwitch.checked = true;
      toggleBloqueioCampos(true);
    } else {
      acessoTotalSwitch.checked = false;
      toggleBloqueioCampos(false);
    }
  } catch (erro) {
    console.error("Erro ao carregar permissões:", erro);
    // Como fallback, desmarca tudo
    checkEmprestimos.checked = false;
    checkEstoque.checked = false;
    checkUsuarios.checked = false;
    acessoTotalSwitch.checked = false;
    toggleBloqueioCampos(false);
  }
}

// Atualizar checkboxes com base no nível de acesso (apenas atalho)
function atualizarPermissoesPorNivel() {
  const nivel = parseInt(nivelAcessoSelect.value);

  if (nivel === 1) {
    checkEmprestimos.checked = false;
    checkEstoque.checked = false;
    checkUsuarios.checked = false;
  } else if (nivel === 2) {
    checkEmprestimos.checked = true;
    checkEstoque.checked = false;
    checkUsuarios.checked = false;
  } else if (nivel === 3) {
    checkEmprestimos.checked = true;
    checkEstoque.checked = true;
    checkUsuarios.checked = true;
    acessoTotalSwitch.checked = false;
  } else if (nivel === 4) {
    checkEmprestimos.checked = true;
    checkEstoque.checked = true;
    checkUsuarios.checked = true;
    acessoTotalSwitch.checked = true;
    toggleBloqueioCampos(true);
  }
}

// Ativar ou desativar bloqueio total (apenas atalho)
function toggleBloqueioCampos(bloquear) {
  const campos = [
    nivelAcessoSelect,
    checkEmprestimos,
    checkEstoque,
    checkUsuarios,
  ];

  campos.forEach((campo) => {
    campo.disabled = bloquear;
  });

  if (bloquear) {
    checkEmprestimos.checked = true;
    checkEstoque.checked = true;
    checkUsuarios.checked = true;
  }
}

// Eventos
nivelAcessoSelect.addEventListener("change", atualizarPermissoesPorNivel);

acessoTotalSwitch.addEventListener("change", () => {
  if (acessoTotalSwitch.checked) {
    toggleBloqueioCampos(true);
  } else {
    toggleBloqueioCampos(false);
  }
});

// Abrir o modal de permissões
document.querySelectorAll("#staff .btn-permissoes").forEach((btn) => {
  btn.addEventListener("click", async function () {
    const row = this.closest("tr");
    const funcionario = {
      nome: row.querySelector(".user-name").textContent,
      cargo: row.cells[2].textContent.trim(),
      avatar: row.querySelector(".user-avatar").src,
      id: row.dataset.id,
    };

    // Preencher dados visuais
    document.getElementById("permissaoAvatar").src = funcionario.avatar;
    document.getElementById("permissaoNome").textContent = funcionario.nome;
    document.getElementById("permissaoCargo").textContent = funcionario.cargo;
    document.getElementById("permissoesFuncionarioId").value = funcionario.id;
    document.getElementById("formPermissoesFuncionario").action =
      "/alterar-permissoes-funcionario/" + funcionario.id;

    // Resetar estado visual do modal
    resetarCampos();

    // Carregar permissões do funcionário
    await carregarPermissoes(funcionario.id);

    // Abrir modal
    const modalPermissoes = bootstrap.Modal.getOrCreateInstance(
      document.getElementById("modalPermissoesFuncionario")
    );
    modalPermissoes.show();
  });
});

// Gerar senha aleatória para redefinir senha do funcionário no modal de edição
const btnGerarSenhaFuncionario = document.getElementById(
  "gerarSenhaFuncionario"
);
if (btnGerarSenhaFuncionario) {
  btnGerarSenhaFuncionario.addEventListener("click", function () {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById("editarSenhaFuncionario").value = password;
  });
}

// Ativar ou desativar funcionário
document
  .querySelectorAll("#staff .btn-outline-danger, #staff .btn-outline-success")
  .forEach((btn) => {
    btn.addEventListener("click", function () {
      const row = this.closest("tr");
      const nome = row.querySelector(".user-name").textContent;
      const cargo = row.cells[2].textContent.trim();
      const avatar = row.querySelector(".user-avatar").src;
      const funcionarioId = row.dataset.id;
      const status = row.querySelector(".badge").textContent.trim();

      const acao = status === "Ativo" ? "Desativar" : "Ativar";
      const cor = status === "Ativo" ? "danger" : "success";

      // Preencher dados no modal
      document.getElementById("desativarAvatar").src = avatar;
      document.getElementById("desativarNome").textContent = nome;
      document.getElementById("desativarCargo").textContent = cargo;
      document.getElementById("desativarFuncionarioId").value = funcionarioId;
      document.getElementById("novoStatusFuncionario").value =
        acao === "Desativar" ? "Inativo" : "Ativo";

      // Atualizar action do form
      document.getElementById("formDesativarFuncionario").action =
        "/alterar-status-funcionario/" + funcionarioId;

      // Atualizar cabeçalho
      const modalHeader = document.querySelector(
        "#modalDesativarFuncionario .modal-header"
      );
      modalHeader.classList.remove("bg-danger", "bg-success");
      modalHeader.classList.add("bg-" + cor);

      // Atualizar título e ícone do cabeçalho
      const modalTitle = modalHeader.querySelector(".modal-title");
      modalTitle.innerHTML = `<i class="fas ${
        acao === "Ativar" ? "fa-user-check" : "fa-user-slash"
      } me-2"></i>${acao} Funcionário`;

      // Atualizar alerta
      const alerta = document.querySelector(
        "#modalDesativarFuncionario .alert"
      );
      alerta.classList.remove("alert-warning", "alert-success");
      alerta.classList.add(
        acao === "Desativar" ? "alert-warning" : "alert-success"
      );
      alerta.innerHTML = `
      <i class="fas fa-exclamation-triangle me-2"></i>
      <div>
        <strong>Atenção:</strong> Esta ação irá ${
          acao === "Desativar"
            ? "desativar o acesso do funcionário ao sistema."
            : "reativar o acesso do funcionário ao sistema."
        }
      </div>
    `;

      // Atualizar botão confirmar
      const btnConfirmar = document.querySelector(
        "#modalDesativarFuncionario .btn.btn-danger, #modalDesativarFuncionario .btn.btn-success"
      );
      btnConfirmar.classList.remove("btn-danger", "btn-success");
      btnConfirmar.classList.add("btn-" + cor);
      btnConfirmar.textContent = `Confirmar ${acao}`;

      const motivoGroup = document.getElementById("motivoDesativacaoGroup");
      const motivoSelect = document.getElementById("motivoDesativacao");

      // Se for desativar, mostra o campo e torna obrigatório
      if (acao === "Desativar") {
        motivoGroup.style.display = "";
        motivoSelect.required = true;
      } else {
        // Se for ativar, esconde o campo e remove o required
        motivoGroup.style.display = "none";
        motivoSelect.required = false;
        motivoSelect.value = ""; // Limpa seleção anterior
      }
    });
  });

document
  .getElementById("formPermissoesFuncionario")
  .addEventListener("submit", function (e) {
    // Habilita os campos para garantir que sejam enviados no POST
    checkEmprestimos.disabled = false;
    checkEstoque.disabled = false;
    checkUsuarios.disabled = false;
  });
