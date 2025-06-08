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