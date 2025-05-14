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
    document.querySelectorAll('.btn-link.text-warning').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const icon = this.querySelector('i');
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
        });
    });

    // Confirmação para exclusão
    document.querySelectorAll('.btn-outline-danger').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja excluir este item do estoque?')) {
                // Lógica para excluir o item
                const row = this.closest('tr');
                row.style.opacity = '0';
                setTimeout(() => {
                    row.remove();
                    // Atualizar contagem de itens
                    updateStockCount();
                }, 300);
            }
        });
    });

    // Função para atualizar contagem de estoque
    function updateStockCount() {
        const totalItems = document.querySelectorAll('tbody tr').length;
        const lowStock = document.querySelectorAll('.badge.bg-warning').length;
        const outOfStock = document.querySelectorAll('.badge.bg-danger').length;
        const inStock = document.querySelectorAll('.badge.bg-success').length;
        
        // Atualiza os cards (simulação)
        document.querySelectorAll('.card-text.fs-5')[3].textContent = `${lowStock} itens`;
        document.querySelectorAll('.card-text.fs-5')[4].textContent = `${outOfStock} itens`;
        document.querySelectorAll('.card-text.fs-5')[5].textContent = `${inStock} itens`;
    }
});