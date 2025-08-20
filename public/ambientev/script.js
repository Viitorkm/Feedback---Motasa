const BASE_API_URL = "/.netlify/functions/Users";

const urlParams = new URLSearchParams(window.location.search);
const SECRET_ID = urlParams.get("id");

// REMOVI o bloqueio por falta do ID secreto
// Antes tinha um if que bloqueava a página se não tivesse o ID.
// Agora ele simplesmente não obriga o ID, então segue normalmente.

const tableBody = document.querySelector("#usersTable tbody");
const loading = document.getElementById("loading");
const message = document.getElementById("message");
const filterVendedor = document.getElementById("filterVendedor");
const filterStartDate = document.getElementById("filterStartDate");
const filterEndDate = document.getElementById("filterEndDate");
const btnFilter = document.getElementById("btnFilter");
const btnReset = document.getElementById("btnReset");
const btnExport = document.getElementById("btnExport");

let users = [];

function openPopup(message) {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.4)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '1000';


  const popup = document.createElement('div');
  popup.style.background = 'white';
  popup.style.padding = '20px 25px';
  popup.style.borderRadius = '8px';
  popup.style.maxWidth = '90vw';
  popup.style.maxHeight = '80vh';
  popup.style.overflowY = 'auto';
  popup.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
  popup.style.textAlign = 'left';
  popup.style.position = 'relative';
  popup.style.wordBreak = 'break-word';
  popup.style.overflowWrap = 'break-word';


  const closeBtn = document.createElement('span');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '10px';
  closeBtn.style.right = '15px';
  closeBtn.style.fontSize = '24px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.color = '#4E2A1E';
  closeBtn.title = "Fechar";

  closeBtn.onclick = () => {
    document.body.removeChild(overlay);
  };

  const text = document.createElement('p');
  text.textContent = message || 'Sem comentário';
  text.style.color = '#333';
  text.style.whiteSpace = 'pre-wrap';
  text.style.lineHeight = '1.5';
  text.style.fontSize = '15px';
  text.style.margin = '0';

  popup.appendChild(closeBtn);
  popup.appendChild(text);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
}



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
  const url = `${BASE_API_URL}?tipo=Users&${queryString}`;
  //remover
  console.log('Carregando feedbacks com URL:', url);

  fetch(url)
    .then(res => {
      //remover
      if (!res.ok) throw new Error("Erro ao carregar dados do usuário 1");
      console.log(error)
      return res.json();
    })
    .then(data => {
      users = data.data || [];
      if (users.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Nenhum usuário encontrado.</td></tr>`;
      } else {
        renderTable(users);
      }
      loading.style.display = "none";
      setButtonsDisabled(false);
      updateFilterButtonState();
    })
    .catch(err => {
      loading.style.display = "none";
      message.textContent = err.message || "Erro ao carregar dados.";
      //remover
      console.error(err.message);
      setButtonsDisabled(false);
      updateFilterButtonState();
    });
}

function renderTable(data) {
  tableBody.innerHTML = "";
  data.forEach(t => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td data-label="Atendente">${t.avaliadorId || "-"}</td>
      <td data-label="Empresa/Nome">${t.company || "-"}</td>
      <td data-label="Avaliações">${t.ratings || "-"}</td>
      <td data-label="Data">${formatDateBR(t.created_at || t.createdAt || t.date)}</td>
      <td data-label="Link">${t.link || "-"}</td>
    `;

    const btn = tr.querySelector('.commentBtn');
    btn.addEventListener('click', () => {
      const comentario = t.comentario || t.comment || "Sem comentário";
      openPopup(comentario);
    });

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
  const headers = ['Atendente', 'Empresa/Nome', 'Avaliacoes', 'Data', 'Link'];
  const rows = users.map(u => [
    u.atendenteId || '-',
    u.empresa || '-',
    u.avaliacoes || '-',
    u.link || '-',
    formatDateBR(u.created_at || u.createdAt || u.date),
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

filterVendedor.addEventListener('input', updateFilterButtonState);
filterStartDate.addEventListener('input', updateFilterButtonState);
filterEndDate.addEventListener('input', updateFilterButtonState);

// Inicializa o carregamento dos feedbacks ao abrir a página
loadFeedbacks();
