document.addEventListener("DOMContentLoaded", function () {
    const addUserBtn = document.getElementById("addUserBtn");
    const userTabs = document.querySelectorAll('#userTabs button[data-bs-toggle="tab"]');
    let currentUserTab = "clients-tab"; // valor padrão

    // Atualiza botão + aba ativa
    userTabs.forEach(tab => {
      tab.addEventListener("shown.bs.tab", function (event) {
        currentUserTab = event.target.id;

        if (currentUserTab === "clients-tab") {
          addUserBtn.innerHTML = `<i class="fas fa-plus me-2"></i> Adicionar Cliente`;
        } else if (currentUserTab === "staff-tab") {
          addUserBtn.innerHTML = `<i class="fas fa-plus me-2"></i> Adicionar Funcionário`;
        }
      });
    });

    // Ao abrir o modal
    const newUserModal = document.getElementById('newUserModal');
    newUserModal.addEventListener('show.bs.modal', function () {
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
    newUserModal.addEventListener('hidden.bs.modal', function () {
      document.getElementById("newClient-tab").classList.remove("disabled");
      document.getElementById("newClient-tab").removeAttribute("tabindex");

      document.getElementById("newStaff-tab").classList.remove("disabled");
      document.getElementById("newStaff-tab").removeAttribute("tabindex");
    });

    // Botão salvar (mantém seu código)
    document.getElementById("saveUserBtn").addEventListener("click", function () {
      const activeTab = document.querySelector("#userTypeTabs .nav-link.active").id;

      if (activeTab === "newClient-tab") {
        if (document.getElementById("newClientForm").reportValidity()) {
          alert("Cliente cadastrado com sucesso!");
          // lógica de cadastro de cliente
        }
      } else {
        if (document.getElementById("newStaffForm").reportValidity()) {
          alert("Funcionário cadastrado com sucesso!");
          // lógica de cadastro de funcionário
        }
      }
    });
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
