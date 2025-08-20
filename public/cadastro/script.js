const BASE_API_URL = "/.netlify/functions/cadastro";

// Pegando o ID secreto da URL (caso necessário na API)
const urlParams = new URLSearchParams(window.location.search);
const SECRET_ID = urlParams.get("id");

// Pegando elementos da DOM
const tableBody = document.querySelector("#UsersTable tbody");
const loading = document.getElementById("loading");
const message = document.getElementById("message");
const btnFilter = document.getElementById("btnFilter");
const btnReset = document.getElementById("btnReset");
const btnExport = document.getElementById("btnExport");
const btnNewUser = document.getElementById("newUser");
const btnEditUser = document.getElementById("editUser");
const btnDelUser = document.getElementById("delUser");

const filterVendedor = document.getElementById("filterVendedor");
const filterStartDate = document.getElementById("filterStartDate");
const filterEndDate = document.getElementById("filterEndDate");

let Users = [];

function formatDateBR(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return "-";
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function setButtonsDisabled(state) {
  btnFilter.disabled = state;
  btnReset.disabled = state;
}

function validateFilters() {
  message.textContent = "";

  const start = filterStartDate.value;
  const end = filterEndDate.value;

  if (start && end && start > end) {
    message.textContent = "Data inicial não pode ser maior que a data final.";
    return false;
  }
  return true;
}

function areFiltersEmpty() {
  return (
    filterVendedor.value.trim() === "" &&
    filterStartDate.value === "" &&
    filterEndDate.value === ""
  );
}

function updateFilterButtonState() {
  btnFilter.disabled = areFiltersEmpty();
}

function buildQueryString() {
  const params = new URLSearchParams();
  if (filterVendedor.value.trim() !== "") {
    params.append("vendedor", filterVendedor.value.trim());
  }
  if (filterStartDate.value) {
    params.append("startDate", filterStartDate.value);
  }
  if (filterEndDate.value) {
    const endDate = new Date(filterEndDate.value);
    endDate.setDate(endDate.getDate() + 1); // Inclui o dia final
    const adjustedEndDate = endDate.toISOString().split('T')[0];
    params.append("endDate", adjustedEndDate);
  }
  if (SECRET_ID) {
    params.append("id", SECRET_ID); // Se estiver usando autenticação via URL
  }
  return params.toString();
}

function loadUsers() {
  if (!validateFilters()) return;

  setButtonsDisabled(true);
  loading.style.display = "block";
  message.textContent = "";
  tableBody.innerHTML = "";

  const queryString = buildQueryString();
  const url = `${BASE_API_URL}?tipo=Users&${queryString}`;


  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("Erro ao carregar dados");
      return res.json();
    })
    .then(data => {
      Users = data.data || [];
      if (Users.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Nenhum Usuario encontrado.</td></tr>`;
      } else {
        renderTable(Users);
      }
      loading.style.display = "none";
      setButtonsDisabled(false);
      updateFilterButtonState();
    })
    .catch(err => {
      loading.style.display = "none";
      message.textContent = err.message || "Erro ao carregar dados.";
      setButtonsDisabled(false);
      updateFilterButtonState();
    });
}

function renderTable(data) {
  tableBody.innerHTML = "";
  data.forEach(user => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td data-label="Atendente">${user.avaliadorId || "-"}</td>
      <td data-label="Empresa/Nome">${user.company || "-"}</td>
      <td data-label="Avaliações">${user.ratings || "-"}</td>
      <td data-label="Data">${formatDateBR(user.date || user.data)}</td>
      <td data-label="Link">${user.link || "-"}</td>
    `;
    tableBody.appendChild(tr);
  });
}

function resetFilters() {
  filterVendedor.value = "";
  filterStartDate.value = "";
  filterEndDate.value = "";
  message.textContent = "";
  updateFilterButtonState();
  loadUsers();
}

function exportToCSV() {
  if (!Users.length) {
    message.textContent = "Nada para exportar.";
    return;
  }
  const headers = ['Atendente', 'Empresa/Nome', 'Avaliações', 'Data', 'Link'];
  const rows = Users.map(user => [
    user.avaliadorId || '-',
    user.company || '-',
    user.ratings || '-',
    formatDateBR(user.date || user.data),
    user.link || '-'
  ]);

  let csvContent = headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `Users_${new Date().toISOString().slice(0,10)}.csv`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Eventos
btnFilter.addEventListener('click', loadUsers);
btnReset.addEventListener('click', resetFilters);
btnExport.addEventListener('click', exportToCSV);

btnNewUser.addEventListener('click', () => {
  alert("Funcionalidade de criação de novo usuário ainda não implementada.");
});

btnEditUser.addEventListener('click', () => {
  alert("Funcionalidade de edição ainda não implementada.");
});

btnDelUser.addEventListener('click', () => {
  alert("Funcionalidade de exclusão ainda não implementada.");
});

filterVendedor.addEventListener('input', updateFilterButtonState);
filterStartDate.addEventListener('change', updateFilterButtonState);
filterEndDate.addEventListener('change', updateFilterButtonState);

// Inicializa o carregamento ao abrir a página
loadUsers();
