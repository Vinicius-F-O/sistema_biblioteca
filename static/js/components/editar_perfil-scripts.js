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
