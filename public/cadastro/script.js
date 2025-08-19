const BASE_API_URL = "/.netlify/functions/relatorio";

const urlParams = new URLSearchParams(window.location.search);
const SECRET_ID = urlParams.get("id");

// REMOVI o bloqueio por falta do ID secreto
// Antes tinha um if que bloqueava a página se não tivesse o ID.
// Agora ele simplesmente não obriga o ID, então segue normalmente.

const tableBody = document.querySelector("#feedbackTable tbody");
const loading = document.getElementById("loading");
const message = document.getElementById("message");
const filterVendedor = document.getElementById("filterVendedor");
const filterStartDate = document.getElementById("filterStartDate");
const filterEndDate = document.getElementById("filterEndDate");
const btnFilter = document.getElementById("btnFilter");
const btnReset = document.getElementById("btnReset");
const btnExport = document.getElementById("btnExport");
const btnNewUser = document.getElementById("newUser");
const btnEditUser = document.getElementById("editUser");
const btnDelUser = document.getElementById("delUser");

let feedbacks = [];

function formatDateBR(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return "-";
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
    endDate.setDate(endDate.getDate() + 1);
    const adjustedEndDate = endDate.toISOString().split('T')[0];
    params.append("endDate", adjustedEndDate);
  }
  return params.toString();
}


function loadFeedbacks() {
  if (!validateFilters()) return;

  setButtonsDisabled(true);
  loading.style.display = "block";
  message.textContent = "";
  tableBody.innerHTML = "";

  const queryString = buildQueryString();
  const url = `${BASE_API_URL}?${queryString}`;

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("Erro ao carregar dados");
      return res.json();
    })
    .then(data => {
      feedbacks = data.data || [];
      if (feedbacks.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Nenhum feedback encontrado.</td></tr>`;
      } else {
        renderTable(feedbacks);
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
  data.forEach(fb => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td data-label="Atendente">${user.avaliadorId || "-"}</td>
      <td data-label="Empresa/Nome">${user.company || "-"}</td>
      <td data-label="Avaliações">${user.ratings || "-"}</td>
      <td data-label="Comentário">${user.comment || "-"}</td>
      <td data-label="Data">${formatDateBR(user.created_at || user.createdAt || user.date)}</td>
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
  loadFeedbacks();
}

function exportToCSV() {
  if (!feedbacks.length) {
    message.textContent = "Nada para exportar.";
    return;
  }
  const headers = ['Atendente', 'Empresa/Nome', 'Avaliações', 'Data', 'Link'];
  const rows = feedbacks.map(user => [
    user.avaliadorId || '-',
    user.company || '-',
    user.ratings || '-',
    formatDateBR(user.created_at || user.createdAt || user.date) || '-',
    user.link || '-'
  ]);

  let csvContent = headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `feedbacks_${new Date().toISOString().slice(0,10)}.csv`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Eventos dos botões e inputs
btnFilter.addEventListener('click', () => {
  if (validateFilters()) loadFeedbacks();
});

btnReset.addEventListener('click', resetFilters);

btnExport.addEventListener('click', exportToCSV);

btnNewUser.addEventListener('click', () => {
  //EDITAR
});

filterVendedor.addEventListener('input', updateFilterButtonState);
filterStartDate.addEventListener('input', updateFilterButtonState);
filterEndDate.addEventListener('input', updateFilterButtonState);

// Inicializa o carregamento dos feedbacks ao abrir a página
loadFeedbacks();
