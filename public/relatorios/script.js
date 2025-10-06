const BASE_API_URL = "/.netlify/functions/report"; // <-- Corrija aqui

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

let feedbacks = [];

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
  const url = `${BASE_API_URL}?${queryString}`;
  //remover
  console.log(url)

  const token = sessionStorage.getItem("token");

  fetch(url, {
    headers: {
      Authorization: "Bearer " + token
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Erro ao carregar dados, Por favor, faça login novamente");
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
      message.textContent = err.message || "Erro ao carregar dados, Por favor, faça login novamente";
      setButtonsDisabled(false);
      updateFilterButtonState();
    });
}

function renderTable(data) {
  tableBody.innerHTML = "";
  data.forEach(fb => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td data-label="Avaliador">${fb.vendedor || "-"}</td>
      <td data-label="Empresa/Nome">${fb.empresa || "-"}</td>
      <td data-label="Setor">${fb.setor_nome || "-"}</td> 
      <td data-label="Estrelas">${fb.rating || "-"}</td>
      <td data-label="Comentário">
        <button class="commentBtn" title="Ver comentário" aria-label="Ver comentário"
          style="background-color: #4E2A1E; border: none; color: white; font-size: 14px; padding: 6px 10px; border-radius: 4px; cursor: pointer;">
          👁️
        </button>
      </td>
      <td data-label="Data">${formatDateBR(fb.created_at || fb.createdAt || fb.date)}</td>
    `;

    const btn = tr.querySelector('.commentBtn');
    btn.addEventListener('click', () => {
      const comentario = fb.comentario || fb.comment || "Sem comentário";
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
    alert('Não há dados para exportar');
    return;
  }

  // Updated headers to match the current table structure
  const headers = ['Avaliador', 'Empresa/Nome', 'Setor', 'Estrelas', 'Comentário', 'Data'];

  // Map the data with proper field names
  const rows = feedbacks.map(fb => [
    fb.vendedor || '-',
    fb.empresa || '-',
    fb.setor_nome || '-',
    fb.rating || '-',
    // Properly escape comments that contain commas or quotes
    `"${(fb.comment || '-').replace(/"/g, '""')}"`,
    formatDateBR(fb.created_at),
    fb.ip_address || '-'
  ]);

  // Create CSV content with headers and rows
  let csvContent = headers.join(",") + "\n" + 
                  rows.map(r => r.join(",")).join("\n");

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `feedbacks_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Média das avaliações
async function openMediaPopup() {
  let token = sessionStorage.getItem("token");
  let res = await fetch('/.netlify/functions/report', {
    headers: { Authorization: 'Bearer ' + token }
  });
  let data = await res.json();
  let feedbacks = data.data || [];

  if (!feedbacks.length) {
    showMediaPopup("Nenhuma avaliação encontrada.");
    return;
  }

  let total = feedbacks.length;
  let soma = 0;
  let contagem = [0, 0, 0, 0, 0];

  feedbacks.forEach(fb => {
    let r = Number(fb.rating);
    if (r >= 1 && r <= 5) {
      soma += r;
      contagem[r - 1]++;
    }
  });

  let media = soma / total;
  media = isNaN(media) ? 0 : media;

  let starsHtml = '';
  for (let i = 1; i <= 5; i++) {
    starsHtml += `<span class="media-star${i <= Math.round(media) ? ' filled' : ''}">&#9733;</span>`;
  }

  let max = Math.max(...contagem, 1);
  let barras = '';
  for (let i = 5; i >= 1; i--) {
    let width = (contagem[i - 1] / max) * 100;
    barras += `
      <div class="media-bar-row">
        <span class="media-bar-label">${i}★</span>
        <div class="media-bar-bg">
          <div class="media-bar-fill" style="width:${width}%"></div>
        </div>
        <span class="media-bar-count">${contagem[i - 1]}</span>
      </div>
    `;
  }

  let html = `
    <div class="media-popup-content">
      <div class="media-popup-header">
        <span class="media-popup-media">${media.toFixed(1)}</span>
        <span>${starsHtml}</span>
      </div>
      <div class="media-popup-total">${total} avaliação${total > 1 ? 's' : ''}</div>
      <div class="media-popup-bars">${barras}</div>
    </div>
  `;

  showMediaPopup(html);
}

function showMediaPopup(contentHtml) {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(0,0,0,0.4)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '1000';

  const popup = document.createElement('div');
  popup.style.background = '#fff';
  popup.style.padding = '32px 24px 24px 24px';
  popup.style.borderRadius = '18px';
  popup.style.maxWidth = '340px';
  popup.style.width = '95vw';
  popup.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)';
  popup.style.position = 'relative';
  popup.innerHTML = contentHtml;

  const closeBtn = document.createElement('span');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '10px';
  closeBtn.style.right = '18px';
  closeBtn.style.fontSize = '28px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.color = '#4E2A1E';
  closeBtn.title = "Fechar";
  closeBtn.onclick = () => document.body.removeChild(overlay);

  popup.appendChild(closeBtn);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
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

// Adiciona evento ao botão
document.getElementById('btnMediaAvaliacao').addEventListener('click', openMediaPopup);

// Inicializa o carregamento dos feedbacks ao abrir a página
loadFeedbacks();
