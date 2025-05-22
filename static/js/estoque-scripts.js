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

  // Preview da capa no modal de edição
  const editImgCapaInput = document.getElementById("editImgCapa");
  let editPreviewCapa = document.getElementById("editPreviewCapa");
  if (!editPreviewCapa) {
    editPreviewCapa = document.createElement("img");
    editPreviewCapa.id = "editPreviewCapa";
    editImgCapaInput.parentNode.appendChild(editPreviewCapa);
  }

  editImgCapaInput.addEventListener("input", function () {
    if (this.value) {
      editPreviewCapa.src = this.value;
      editPreviewCapa.style.display = "block";
    } else {
      editPreviewCapa.style.display = "none";
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

document.querySelectorAll(".btn-outline-primary").forEach((btn) => {
  btn.addEventListener("click", function () {
    const row = this.closest("tr");
    const livroId = row.id.replace("linha-livro-", "");

    // Pegando diretamente do DOM apenas título e autor
    const titulo = row.querySelector(".fw-bold").textContent.trim();
    const autor = row.querySelector("small").textContent.trim();

    // Preenchendo os campos de título e autor
    document.getElementById("editLivroId").value = livroId;
    document.getElementById("editTituloLivro").value = titulo;
    document.getElementById("editAutorLivro").value = autor;

    // Requisição AJAX para obter os demais dados
    fetch(`/livros/${livroId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar dados do livro");
        return res.json();
      })
      .then((data) => {
        document.getElementById("editEditoraLivro").value = data.editora || "";
        document.getElementById("editGeneroLivro").value = data.genero || "";
        document.getElementById("editQtdEstoque").value =
          data.qtd_estoque || "";
        document.getElementById("editPrecoLivro").value = data.preco || "";
        document.getElementById("editNotaLivro").value = data.nota || "";
        document.getElementById("editImgCapa").value = data.imgCapa || "";
        document.getElementById("editAnoPublicacao").value =
          data.anoPublicacao || "";

        // Atualiza o preview da capa imediatamente
        const editPreviewCapa = document.getElementById("editPreviewCapa");
        const editImgCapaInput = document.getElementById("editImgCapa");
        if (editImgCapaInput.value) {
          editPreviewCapa.src = editImgCapaInput.value;
          editPreviewCapa.style.display = "block";
        } else {
          editPreviewCapa.style.display = "none";
        }

        // Abre o modal só depois dos dados estarem carregados
        new bootstrap.Modal(document.getElementById("editarLivroModal")).show();
      })
      .catch((error) => {
        alert("Erro ao carregar dados do livro.");
        console.error(error);
      });
  });
});

// Ao salvar edição
document
  .getElementById("formEditarLivro")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const livroId = document.getElementById("editLivroId").value;
    const data = {
      titulo: document.getElementById("editTituloLivro").value,
      autor: document.getElementById("editAutorLivro").value,
      editora: document.getElementById("editEditoraLivro").value,
      anoPublicacao: document.getElementById("editAnoPublicacao").value,
      genero: document.getElementById("editGeneroLivro").value,
      preco: document.getElementById("editPrecoLivro").value,
      nota: document.getElementById("editNotaLivro").value,
      qtdEstoque: document.getElementById("editQtdEstoque").value,
      imgCapa: document.getElementById("editImgCapa").value,
    };
    fetch(`/editar-livro/${livroId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Mostra um feedback visual antes de recarregar
          alert("Livro atualizado com sucesso!");
          location.reload();
        } else {
          alert("Erro ao editar livro!");
        }
      })
      .catch((err) => {
        alert("Erro ao editar livro!");
        console.error(err);
      });
  });

document.querySelectorAll(".disponibilidade-switch").forEach((switchBtn) => {
  switchBtn.addEventListener("change", async function () {
    const livroId = this.dataset.id;
    const disponibilidade = this.checked;

    try {
      const response = await fetch(`/atualizar-disponibilidade/${livroId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ disponibilidade: disponibilidade }),
      });

      const resultado = await response.json();

      if (resultado.success) {
        console.log(
          `Disponibilidade atualizada: Livro ${livroId} -> ${
            disponibilidade ? "Ativo" : "Inativo"
          }`
        );
        // 🔥 Opcional: Toast, alerta ou badge indicando sucesso.
      } else {
        console.error("Erro na resposta do servidor.");
        alert("Erro ao atualizar disponibilidade.");
        // Volta o switch pro estado anterior
        this.checked = !disponibilidade;
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro na conexão com o servidor.");
      // Volta o switch pro estado anterior
      this.checked = !disponibilidade;
    }
  });
});
