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
const btncreateUser = document.getElementById("btncreateUser");

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
  const url = `${BASE_API_URL}?${queryString}`;
  //remover
  console.log('Carregando feedbacks com URL:', url);

  fetch(url)
    .then(res => {
      //remover
      if (!res.ok) throw new Error("Erro ao carregar dados do usuário 1");
      console.log('Usuários encontrados:', users);
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

function attachAvaliacoesButtons() {
  document.querySelectorAll('.avaliacoesBtn').forEach(btn => {
    btn.onclick = async () => {
      const atendenteId = btn.getAttribute('data-id');
      if (!atendenteId) {
        openPopup('ID do atendente não encontrado.');
        return;
      }
      try {
        const res = await fetch(`/.netlify/functions/GetAvaliacoes?id=${encodeURIComponent(atendenteId)}`);
        if (!res.ok) throw new Error('Erro ao carregar avaliações.');

        const data = await res.json();

        if (!data.feedbacks || data.feedbacks.length === 0) {
          openPopup('Nenhuma avaliação encontrada para este atendente.');
          return;
        }

        const mensagens = data.feedbacks.map(fb => {
          const dataFormatada = formatDateBR(fb.created_at || fb.createdAt || fb.date || '');
          return `⭐ Nota: ${fb.rating}\nComentário: ${fb.comment || 'Sem comentário'}\nData: ${dataFormatada}`;
        }).join('\n\n');

        openPopup(mensagens);

      } catch (error) {
        openPopup('Erro ao carregar avaliações: ' + error.message);
      }
    };
  });
}

function renderTable(data) {
  tableBody.innerHTML = "";
  data.forEach(t => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td data-label="Atendente">${t.atendenteId || "-"}</td>
      <td data-label="Empresa/Nome">${t.company || "-"}</td>
      <td data-label="Avaliações">
        <button class="avaliacoesBtn" data-id="${t.atendenteId}" title="Ver avaliações" 
          style="background:#4E2A1E; border:none; color:#fff; padding:6px 10px; border-radius:4px; cursor:pointer;">
          👁️
        </button>
      </td>
      <td data-label="Data">${formatDateBR(t.created_at || t.createdAt || t.date)}</td>
      <td data-label="Link">
        <button class="copyBtn" title="Copiar link" aria-label="Copiar link"
          style="background-color: #0000002d; border: none; color: white; font-size: 16px; padding: 6px 10px; border-radius: 4px; cursor: pointer;"
          data-link="${t.link || '#'}">
          🔗
        </button>
      </td>
    `;

    const btn = tr.querySelector('.copyBtn');
    btn.addEventListener('click', () => {
      const link = btn.getAttribute('data-link');
      navigator.clipboard.writeText(link)
        .then(() => {
          btn.textContent = '📃';
          setTimeout(() => {
            btn.textContent = '🔗';
          }, 1500);
        })
        .catch(() => {
          alert('Erro ao copiar o link!');
        });
    });

    tableBody.appendChild(tr);
  });

  attachAvaliacoesButtons();
}

function openPopupUser() {
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
  overlay.style.zIndex = 9999;

  const popup = document.createElement('div');
  popup.style.background = '#fff';
  popup.style.padding = '20px 25px';
  popup.style.borderRadius = '8px';
  popup.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
  popup.style.width = '90vw';
  popup.style.maxWidth = '400px';

  const form = document.createElement('form');
  form.id = 'popupForm';

  form.innerHTML = `
    <label for="atendenteId">Atendente ID</label>
    <input type="text" id="atendenteId" name="atendenteId" required>
    <label for="company">Empresa/Nome</label>
    <input type="text" id="company" name="company" required>
    <button type="submit" style="margin-top:10px; background:#4E2A1E; color:#fff; border:none; padding:8px 12px; border-radius:4px; cursor:pointer;">Salvar</button>
  `;

  form.onsubmit = e => {
    e.preventDefault();
    // Implementar salvar usuário aqui, se quiser
    alert('Função de salvar ainda não implementada.');
    document.body.removeChild(overlay);
  };

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

  popup.appendChild(closeBtn);
  popup.appendChild(form);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
}

btnFilter.addEventListener("click", () => {
  loadFeedbacks();
});

btnReset.addEventListener("click", () => {
  filterVendedor.value = "";
  filterStartDate.value = "";
  filterEndDate.value = "";
  loadFeedbacks();
});

btnExport.addEventListener("click", () => {
  if (!users || users.length === 0) {
    alert("Nada para exportar!");
    return;
  }

  let csv = "Atendente,Empresa/Nome,Data,Link\n";
  users.forEach(t => {
    const dataFormatada = formatDateBR(t.created_at || t.createdAt || t.date);
    const line = `"${t.atendenteId || "-"}","${t.company || "-"}","${dataFormatada}","${t.link || "#"}"`;
    csv += line + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "usuarios.csv";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

btncreateUser.addEventListener("click", () => {
  openPopupUser();
});

// Atualiza estado do botão filtrar ao alterar filtros
[filterVendedor, filterStartDate, filterEndDate].forEach(input => {
  input.addEventListener('input', updateFilterButtonState);
});

updateFilterButtonState();
loadFeedbacks();
