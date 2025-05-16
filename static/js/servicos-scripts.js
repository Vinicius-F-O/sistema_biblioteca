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
