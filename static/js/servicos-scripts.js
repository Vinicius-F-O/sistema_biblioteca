// Toggle sidebar
document.getElementById("toggle-btn").addEventListener("click", function () {
  document.getElementById("sidebar").classList.toggle("collapsed");
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

const input = document.getElementById("bookSearch");
const suggestionBox = document.getElementById("suggestions");

input.addEventListener("input", function () {
  const query = this.value.toLowerCase();
  suggestionBox.innerHTML = "";

  if (query.length < 2) {
    suggestionBox.style.display = "none";
    return;
  }

  const filtered = books.filter(
    (book) =>
      book.titulo.toLowerCase().includes(query) ||
      book.autor.toLowerCase().includes(query) ||
      book.editora.toLowerCase().includes(query) ||
      String(book.id).includes(query)
  );

  if (filtered.length === 0) {
    suggestionBox.style.display = "none";
    return;
  }

  filtered.forEach((book) => {
    const li = document.createElement("li");
    li.classList.add("dropdown-item");
    li.textContent = `${book.titulo} - ${book.autor}`;
    li.addEventListener("click", () => {
      input.value = `${book.titulo} - ${book.autor}`;
      suggestionBox.innerHTML = "";
      suggestionBox.style.display = "none";
    });
    suggestionBox.appendChild(li);
  });

  suggestionBox.style.display = "block";
});

// Esconde o dropdown quando clicar fora
document.addEventListener("click", (e) => {
  if (!input.contains(e.target) && !suggestionBox.contains(e.target)) {
    suggestionBox.style.display = "none";
  }
});

//Busca Cliente
const inputCPF = document.getElementById("clienteSelect");
const clienteInfoDiv = document.getElementById("clienteInfo");

inputCPF.addEventListener("input", () => {
  const cpf = inputCPF.value.replace(/\D/g, ""); // Remove não dígitos

  if (cpf.length === 11) {
    fetch(`/buscar-cliente?cpf=${cpf}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.found) {
          clienteInfoDiv.innerHTML = `
              <strong>Nome:</strong> ${data.nome}<br>
              <strong>ID:</strong> ${data.id}<br>
              <strong>Email:</strong> ${data.email}
            `;
        } else {
          clienteInfoDiv.innerHTML = `<span class="text-danger">Cliente não encontrado.</span>`;
        }
      })
      .catch((error) => {
        clienteInfoDiv.innerHTML = `<span class="text-danger">Erro ao buscar cliente.</span>`;
        console.error(error);
      });
  } else {
    clienteInfoDiv.innerHTML = "";
  }
});
