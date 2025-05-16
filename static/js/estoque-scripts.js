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

  // Toggle favorito
  document.querySelectorAll(".btn-link.text-warning").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const icon = this.querySelector("i");
      if (icon.classList.contains("far")) {
        icon.classList.remove("far");
        icon.classList.add("fas");
      } else {
        icon.classList.remove("fas");
        icon.classList.add("far");
      }
    });
  });

    const imgCapaInput = document.getElementById("imgCapa");
    const previewCapa = document.createElement("img");
    previewCapa.id = "previewCapa";
    imgCapaInput.parentNode.appendChild(previewCapa);

    imgCapaInput.addEventListener("input", function () {
      if (this.value) {
        previewCapa.src = this.value;
        previewCapa.style.display = "block";
      } else {
        previewCapa.style.display = "none";
      }
    });
});

function confirmarExclusao(id) {
  if (confirm("Tem certeza que deseja excluir este livro?")) {
    fetch(`/deletar-livro/${id}`, {
      method: "DELETE",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    })
      .then((response) => {
        if (response.ok) {
          const linha = document.getElementById(`linha-livro-${id}`);
          if (linha) linha.remove();
        } else {
          alert("Erro ao excluir o livro.");
        }
      })
      .catch((error) => {
        console.error("Erro:", error);
        alert("Erro ao excluir o livro.");
      });
  }
}
