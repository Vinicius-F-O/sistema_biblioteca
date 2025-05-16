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
          data: [120, 190, 170, 220, 250, 280, 240, 260, 230, 210, 190, 150],
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
      labels: ["Ficção", "Não-Ficção", "Didáticos", "Infantil", "Biografias"],
      datasets: [
        {
          data: [35, 25, 15, 15, 10],
          backgroundColor: [
            "rgba(52, 152, 219, 0.8)",
            "rgba(46, 204, 113, 0.8)",
            "rgba(230, 126, 34, 0.8)",
            "rgba(155, 89, 182, 0.8)",
            "rgba(231, 76, 60, 0.8)",
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

  // Simular dados para os cards (opcional)
  function updateStats() {
    const stats = document.querySelectorAll(".card-text.fs-4");
    stats.forEach((stat) => {
      const current = parseInt(stat.textContent.replace(/,/g, ""));
      const variation = Math.floor(Math.random() * 10) - 3; // -3 a +6
      const newValue = Math.max(0, current + variation);
      stat.textContent = newValue.toLocaleString();
    });
  }

  // Atualizar estatísticas a cada 10 segundos (simulação)
  setInterval(updateStats, 10000);

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
