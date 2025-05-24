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

  // Gráfico de Empréstimos Mensais
  const loansCtx = document.getElementById("loansChart").getContext("2d");
  const loansChart = new Chart(loansCtx, {
    type: "line",
    data: {
      labels: [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
      ],
      datasets: [
        {
          label: "Empréstimos",
          data: typeof emprestimosPorMes !== "undefined" ? emprestimosPorMes : [0,0,0,0,0,0,0,0,0,0,0,0],
          backgroundColor: "rgba(52, 152, 219, 0.2)",
          borderColor: "rgba(52, 152, 219, 1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2, // largura / altura
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  // Gráfico de Tipos de Livros
  const booksCtx = document.getElementById("booksChart").getContext("2d");
  const booksChart = new Chart(booksCtx, {
    type: "doughnut",
    data: {
      labels: typeof generosLabels !== "undefined" ? generosLabels : [],
      datasets: [
        {
          data: typeof generosCounts !== "undefined" ? generosCounts : [],
          backgroundColor: [
            "rgba(52, 152, 219, 0.8)",
            "rgba(46, 204, 113, 0.8)",
            "rgba(230, 126, 34, 0.8)",
            "rgba(155, 89, 182, 0.8)",
            "rgba(231, 76, 60, 0.8)",
            "rgba(241, 196, 15, 0.8)",
            "rgba(52, 73, 94, 0.8)",
          ],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2, // largura / altura
      plugins: {
        legend: {
          position: "right",
        },
      },
    },
  });

  document.addEventListener("DOMContentLoaded", () => {
    const photoBtn = document.getElementById("changePhotoBtn");
    const photoInput = document.getElementById("profilePhotoInput");
    const preview = document.getElementById("profilePreview");

    photoBtn.addEventListener("click", () => {
      photoInput.click();
    });

    photoInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function (event) {
          preview.src = event.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });

    document
      .getElementById("profileForm")
      .addEventListener("submit", function (e) {
        e.preventDefault();
        // Aqui você pode capturar os dados e enviar para o backend
        const nome = document.getElementById("nameInput").value;
        const email = document.getElementById("emailInput").value;

        alert(`Perfil atualizado!\nNome: ${nome}\nEmail: ${email}`);
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("profileModal")
        );
        modal.hide();
      });
  });
});

// Mostrar/ocultar senha
document.getElementById('toggleNovaSenha').addEventListener('click', function() {
  const passwordField = document.getElementById('novaSenha');
  const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordField.setAttribute('type', type);
  this.querySelector('i').classList.toggle('fa-eye-slash');
});

document.getElementById('toggleRepetirSenha').addEventListener('click', function() {
  const passwordField = document.getElementById('repetirSenha');
  const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordField.setAttribute('type', type);
  this.querySelector('i').classList.toggle('fa-eye-slash');
});

// Validar força da senha
document.getElementById('novaSenha').addEventListener('input', function() {
  const password = this.value;
  const strengthBar = document.querySelector('.password-strength .progress-bar');
  const strengthText = document.getElementById('passwordStrengthText');
  const submitBtn = document.getElementById('submitPasswordChange');
  
  let strength = 0;
  if (password.length > 0) strength += 20;
  if (password.length >= 8) strength += 20;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 20;
  if (/[^A-Za-z0-9]/.test(password)) strength += 20;
  
  strengthBar.style.width = strength + '%';
  
  if (strength < 40) {
      strengthBar.className = 'progress-bar bg-danger';
      strengthText.textContent = 'fraca';
  } else if (strength < 70) {
      strengthBar.className = 'progress-bar bg-warning';
      strengthText.textContent = 'média';
  } else {
      strengthBar.className = 'progress-bar bg-success';
      strengthText.textContent = 'forte';
  }
  
  validatePasswords();
});

// Verificar se as senhas coincidem
document.getElementById('repetirSenha').addEventListener('input', validatePasswords);

function validatePasswords() {
  const password = document.getElementById('novaSenha').value;
  const repeatPassword = document.getElementById('repetirSenha').value;
  const feedback = document.getElementById('passwordMatchFeedback');
  const submitBtn = document.getElementById('submitPasswordChange');
  
  if (repeatPassword.length === 0) {
      feedback.innerHTML = '';
      submitBtn.disabled = true;
      return;
  }
  
  if (password === repeatPassword) {
      feedback.innerHTML = '<span class="text-success"><i class="fas fa-check-circle me-1"></i> As senhas coincidem</span>';
      submitBtn.disabled = password.length < 8;
  } else {
      feedback.innerHTML = '<span class="text-danger"><i class="fas fa-times-circle me-1"></i> As senhas não coincidem</span>';
      submitBtn.disabled = true;
  }
}