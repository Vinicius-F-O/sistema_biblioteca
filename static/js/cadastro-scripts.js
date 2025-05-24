// Script para fechar mensagens flash automaticamente
function fadeOutAlert(alert) {
    alert.classList.remove("animate__fadeInRight");
    alert.classList.add("animate__fadeOutRight");
    setTimeout(() => {
      alert.remove();
      const container = document.querySelector(".flash-messages-container");
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 500);
  }
  
  document.addEventListener("DOMContentLoaded", function () {
    // === Flash messages ===
    const alerts = document.querySelectorAll(".alert");
    alerts.forEach((alert) => {
      const autoCloseTimer = setTimeout(() => {
        fadeOutAlert(alert);
      }, 5000);
  
      const closeBtn = alert.querySelector(".btn-close");
      if (closeBtn) {
        closeBtn.addEventListener("click", function (e) {
          e.preventDefault();
          clearTimeout(autoCloseTimer);
          fadeOutAlert(alert);
        });
      }
  
      alert.addEventListener("mouseenter", () => {
        clearTimeout(autoCloseTimer);
      });
  
      alert.addEventListener("mouseleave", () => {
        setTimeout(() => {
          fadeOutAlert(alert);
        }, 5000);
      });
    });
  
    // === Validação de senha ===
    const form = document.querySelector('form[action=""]');
    if (form) {
      form.addEventListener("submit", function (e) {
        const senha = document.getElementById("senha");
        const repetirSenha = document.getElementById("repetirSenha");
        const erroSenha = document.getElementById("senhaErro");
  
        // Reset dos erros
        senha.classList.remove("is-invalid");
        repetirSenha.classList.remove("is-invalid");
        erroSenha.style.display = "none";
  
        // Verificação de igualdade das senhas
        if (senha.value !== repetirSenha.value) {
          e.preventDefault();
          senha.classList.add("is-invalid");
          repetirSenha.classList.add("is-invalid");
          erroSenha.style.display = "block";
          repetirSenha.focus();
        }
      });
    }
  });