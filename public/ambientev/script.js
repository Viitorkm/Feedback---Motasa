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
const btnremoveUser = document.getElementById("btnremoveUser");

let users = [];

function popupRating(userId) {
  // Busca avaliações do atendente
  fetch(`/.netlify/functions/GetAvaliacoes?id=${userId}`)
    .then(res => res.json())
    .then(data => {
      const feedbacks = data.feedbacks || [];
      if (feedbacks.length === 0) {
        openPopup("Nenhuma avaliação encontrada para este atendente.");
      } else {
        // Monta HTML das avaliações
        const html = feedbacks.map(fb => `
          <div style="margin-bottom:12px;">
            <strong>Estrelas:</strong> ${fb.rating} <br>
            <strong>Comentário:</strong> ${fb.comment || "Sem comentário"} <br>
            <strong>Setor:</strong> ${setor_nome} || "Sem Setor" <br>
            <strong>Data:</strong> ${fb.created_at}
          </div>
        `).join("");
        openPopup(html);
      }
    })
    .catch(() => openPopup("Erro ao buscar avaliações."));
}

function openPopup(message) {
  // Overlay escuro
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

  // Popup central
  const popup = document.createElement('div');
  popup.style.background = '#fff';
  popup.style.padding = '32px 24px 24px 24px';
  popup.style.borderRadius = '18px';
  popup.style.maxWidth = '520px';
  popup.style.width = '95vw';
  popup.style.maxHeight = '80vh';
  popup.style.overflowY = 'auto';
  popup.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)';
  popup.style.position = 'relative';
  popup.style.display = 'flex';
  popup.style.flexDirection = 'column';
  popup.style.gap = '18px';

  // Botão fechar fixo no overlay
  const closeBtn = document.createElement('span');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.position = 'fixed';
  closeBtn.style.top = 'calc(50% - 40vh + 18px)';
  closeBtn.style.right = 'calc(50% - 260px + 24px)';
  closeBtn.style.width = '40px';
  closeBtn.style.height = '40px';
  closeBtn.style.background = '#fff';
  closeBtn.style.borderRadius = '50%';
  closeBtn.style.boxShadow = '0 2px 8px rgba(78,42,30,0.10)';
  closeBtn.style.zIndex = '1101';
  closeBtn.style.fontSize = '32px';
  closeBtn.style.color = '#4E2A1E';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.display = 'flex';
  closeBtn.style.alignItems = 'center';
  closeBtn.style.justifyContent = 'center';
  closeBtn.style.textAlign = 'center';
  closeBtn.style.lineHeight = '40px'; // Centraliza verticalmente
  closeBtn.title = "Fechar";
  closeBtn.onclick = () => {
    document.body.removeChild(overlay);
  };

  // Título
  const title = document.createElement('h2');
  title.textContent = 'Avaliações do Atendente';
  title.style.margin = '0 0 12px 0';
  title.style.fontSize = '1.3rem';
  title.style.color = '#4E2A1E';
  title.style.textAlign = 'center';

  // Conteúdo das avaliações
  const content = document.createElement('div');
  content.style.display = 'flex';
  content.style.flexDirection = 'column';
  content.style.gap = '0';

  if (!message || message.includes('Nenhuma avaliação')) {
    content.innerHTML = '<div style="text-align:center;color:#888;">Sem avaliações encontradas.</div>';
  } else {
    const cards = message.split('<div style="margin-bottom:12px;">').filter(Boolean);
    cards.forEach((raw, idx) => {
      let html = raw.replace('</div>', '');
      const ratingMatch = html.match(/Estrelas:<\/strong>\s*(\d+)/);
      const commentMatch = html.match(/Comentário:<\/strong>\s*([^<]*)/);
      const dateMatch = html.match(/Data:<\/strong>\s*([^<]*)/);

      const rating = ratingMatch ? Number(ratingMatch[1]) : '-';
      const comment = commentMatch ? commentMatch[1] : 'Sem comentário';
      const date = dateMatch ? dateMatch[1] : '-';

      const card = document.createElement('div');
      card.style.background = '#f7f6f4';
      card.style.borderRadius = '14px';
      card.style.padding = '20px 16px';
      card.style.boxShadow = '0 2px 8px rgba(78,42,30,0.10)';
      card.style.border = '2px solid #e0d7cf';
      card.style.margin = '0 0 24px 0';
      card.style.position = 'relative';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.gap = '8px';

      const star = document.createElement('span');
      star.innerHTML = '⭐'.repeat(rating);
      star.style.fontSize = '22px';
      star.style.color = '#f7b801';
      star.style.position = 'absolute';
      star.style.top = '18px';
      star.style.right = '18px';

      card.innerHTML = `
        <div style="font-weight:600;color:#4E2A1E;margin-bottom:8px;">Comentário #${idx + 1}</div>
        <div style="margin-bottom:6px;"><strong>Estrelas:</strong> ${rating}</div>
        <div style="margin-bottom:6px;word-break:break-word;white-space:pre-line;"><strong>Comentário:</strong> ${comment}</div>
        <div style="margin-bottom:0;"><strong>Data:</strong> ${date}</div>
      `;
      card.appendChild(star);

      if (idx > 0) {
        const separator = document.createElement('div');
        separator.style.height = '3px';
        separator.style.background = 'linear-gradient(90deg,#e0d7cf 0%,#fff 100%)';
        separator.style.margin = '0 0 24px 0';
        separator.style.borderRadius = '2px';
        content.appendChild(separator);
      }

      content.appendChild(card);
    });
  }

  popup.appendChild(title);
  popup.appendChild(content);
  overlay.appendChild(popup);
  overlay.appendChild(closeBtn); // Adiciona o botão ao overlay, não ao popup
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
    params.append("atendenteId", filterVendedor.value.trim());
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
      if (!res.ok) throw new Error("Erro ao carregar dados do usuário");
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

function renderTable(data) {
  tableBody.innerHTML = "";
  data.forEach(t => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td data-label="Atendente">${t.atendenteId || "-"}</td>
      <td data-label="Empresa/Nome">${t.company || "-"}</td>
      <td data-label="Setor">${t.setor_nome || "-"}</td>
      <td data-label="Avaliações">
        <button class="ratingBtn" style="background:#4E2A1E;color:#fff;border:none;padding:6px 10px;border-radius:4px;cursor:pointer;">
          ⭐
        </button>
      </td>
      <td data-label="Data">${formatDateBR(t.created_at || t.createdAt || t.date)}</td>
      <td data-label="Link">
        <button class="copyBtn" title="Copiar link" aria-label="Copiar link"
          style="background-color: #0000004b; border: none; color: white; font-size: 16px; padding: 6px 10px; border-radius: 4px; cursor: pointer;"
          data-link="${t.link || '#'}">
          🔗
        </button>
      </td>
    `;

    // Botão de avaliações
    const ratingBtn = tr.querySelector('.ratingBtn');
    ratingBtn.addEventListener('click', () => popupRating(t.atendenteId));

    // Botão de copiar link
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
  overlay.style.zIndex = '1000';

  const popup = document.createElement('div');
  popup.style.background = 'white';
  popup.style.padding = '20px 25px';
  popup.style.borderRadius = '8px';
  popup.style.maxWidth = '400px';
  popup.style.width = '90vw';
  popup.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
  popup.style.position = 'relative';

  // Botão fechar
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

  // Título
  const title = document.createElement('h2');
  title.textContent = 'Cadastrar Usuário';
  title.style.color = '#4E2A1E';
  title.style.textAlign = 'center';
  title.style.marginBottom = '20px';

  // Formulário
  const form = document.createElement('form');
  form.style.display = 'flex';
  form.style.flexDirection = 'column';
  form.style.gap = '15px';

  // Campo ID do Atendente
  const labelAtendente = document.createElement('label');
  labelAtendente.textContent = 'ID do Atendente:';
  labelAtendente.htmlFor = 'inputAtendenteId';
  labelAtendente.style.fontWeight = '600';

  const inputAtendente = document.createElement('input');
  inputAtendente.type = 'number';
  inputAtendente.id = 'inputAtendenteId';
  inputAtendente.name = 'atendenteId';
  inputAtendente.required = true;
  inputAtendente.style.padding = '8px 10px';
  inputAtendente.style.border = '1px solid #ccc';
  inputAtendente.style.borderRadius = '4px';

  // Campo Empresa
  const labelEmpresa = document.createElement('label');
  labelEmpresa.textContent = 'Empresa:';
  labelEmpresa.htmlFor = 'inputEmpresa';
  labelEmpresa.style.fontWeight = '600';

  const inputEmpresa = document.createElement('input');
  inputEmpresa.type = 'text';
  inputEmpresa.id = 'inputEmpresa';
  inputEmpresa.name = 'company';
  inputEmpresa.required = true;
  inputEmpresa.style.padding = '8px 10px';
  inputEmpresa.style.border = '1px solid #ccc';
  inputEmpresa.style.borderRadius = '4px';

  // Botão submit
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.textContent = 'Cadastrar';
  submitBtn.style.backgroundColor = '#4E2A1E';
  submitBtn.style.color = 'white';
  submitBtn.style.padding = '10px';
  submitBtn.style.border = 'none';
  submitBtn.style.borderRadius = '4px';
  submitBtn.style.cursor = 'pointer';
  submitBtn.style.fontWeight = '600';

  submitBtn.addEventListener('mouseover', () => {
    submitBtn.style.backgroundColor = '#3e2216';
  });
  submitBtn.addEventListener('mouseout', () => {
    submitBtn.style.backgroundColor = '#4E2A1E';
  });

  form.appendChild(labelAtendente);
  form.appendChild(inputAtendente);
  form.appendChild(labelEmpresa);
  form.appendChild(inputEmpresa);
  form.appendChild(submitBtn);

  form.onsubmit = async (e) => {
    e.preventDefault();
    const atendenteId = inputAtendente.value.trim();
    const company = inputEmpresa.value.trim();

    if (!atendenteId || !company) {
      alert('Preencha todos os campos!');
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/Users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ atendenteId: Number(atendenteId), company }),
      });
      //remover
      console.log(response)
      console.log(response.ok)
      if (!response.ok) throw new Error('Erro ao cadastrar usuário.');

      alert('Usuário cadastrado com sucesso!');
      document.body.removeChild(overlay);
      loadFeedbacks(); // aqui atualiza a lista depois de criar o usuario
    } catch (error) {
      alert('Erro ao cadastrar usuário: ' + error.message);
    }
  };

  popup.appendChild(closeBtn);
  popup.appendChild(title);
  popup.appendChild(form);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
}

function openPopupDeleteUser() {
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
  popup.style.background = 'white';
  popup.style.padding = '20px 25px';
  popup.style.borderRadius = '8px';
  popup.style.maxWidth = '400px';
  popup.style.width = '90vw';
  popup.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
  popup.style.position = 'relative';

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

  const title = document.createElement('h2');
  title.textContent = 'Remover Usuário';
  title.style.color = '#4E2A1E';
  title.style.textAlign = 'center';
  title.style.marginBottom = '20px';

  const form = document.createElement('form');
  form.style.display = 'flex';
  form.style.flexDirection = 'column';
  form.style.gap = '15px';

  const labelAtendente = document.createElement('label');
  labelAtendente.textContent = 'ID do Atendente:';
  labelAtendente.htmlFor = 'inputDeleteAtendenteId';
  labelAtendente.style.fontWeight = '600';

  const inputAtendente = document.createElement('input');
  inputAtendente.type = 'number';
  inputAtendente.id = 'inputDeleteAtendenteId';
  inputAtendente.name = 'atendenteId';
  inputAtendente.required = true;
  inputAtendente.style.padding = '8px 10px';
  inputAtendente.style.border = '1px solid #ccc';
  inputAtendente.style.borderRadius = '4px';

  const checkboxWrapper = document.createElement('label');
  checkboxWrapper.style.display = 'flex';
  checkboxWrapper.style.alignItems = 'center';
  checkboxWrapper.style.gap = '8px';
  checkboxWrapper.style.fontWeight = '600';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'deleteFeedbacks';

  const checkboxText = document.createTextNode('Apagar também as avaliações');

  checkboxWrapper.appendChild(checkbox);
  checkboxWrapper.appendChild(checkboxText);

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.textContent = 'Remover';
  submitBtn.style.backgroundColor = '#4E2A1E';
  submitBtn.style.color = 'white';
  submitBtn.style.padding = '10px';
  submitBtn.style.border = 'none';
  submitBtn.style.borderRadius = '4px';
  submitBtn.style.cursor = 'pointer';
  submitBtn.style.fontWeight = '600';

  submitBtn.addEventListener('mouseover', () => {
    submitBtn.style.backgroundColor = '#3e2216';
  });
  submitBtn.addEventListener('mouseout', () => {
    submitBtn.style.backgroundColor = '#4E2A1E';
  });

  form.appendChild(labelAtendente);
  form.appendChild(inputAtendente);
  form.appendChild(checkboxWrapper);
  form.appendChild(submitBtn);

  form.onsubmit = async (e) => {
    e.preventDefault();
    const atendenteId = inputAtendente.value.trim();
    const deleteAvaliacoes = checkbox.checked;

    if (!atendenteId) {
      alert('Informe o ID do atendente!');
      return;
    }

    try {
      const url = `${BASE_API_URL}?atendenteId=${atendenteId}&deleteFeedbacks=${deleteAvaliacoes}`;
      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('O usuário não existe.');

      alert('Usuário removido com sucesso!');
      document.body.removeChild(overlay);
      loadFeedbacks(); // Atualiza lista
    } catch (error) {
      alert('O Usuário não existe');
    }
  };

  popup.appendChild(closeBtn);
  popup.appendChild(title);
  popup.appendChild(form);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
}


document.addEventListener('DOMContentLoaded', () => {
  const btncreateUser = document.getElementById('btncreateUser');
  if (btncreateUser) {
    btncreateUser.addEventListener('click', openPopupUser);
  }
});

btnremoveUser.addEventListener('click', openPopupDeleteUser);

function resetFilters() {
  filterVendedor.value = "";
  filterStartDate.value = "";
  filterEndDate.value = "";
  message.textContent = "";
  updateFilterButtonState();
  loadFeedbacks();
}

function exportToCSV() {
  if (!users.length) {
    message.textContent = "Nada para exportar.";
    return;
  }
  const headers = ['Atendente', 'Empresa/Nome', 'Avaliacoes', 'Data', 'Link'];
  const rows = users.map(u => [
    u.atendenteId || '-',
    u.company || '-',
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
  console.log(filterVendedor)
  if (validateFilters()) loadFeedbacks();
});

btnReset.addEventListener('click', resetFilters);

btnExport.addEventListener('click', exportToCSV);

btncreateUser.addEventListener('click', openPopupUser)

filterVendedor.addEventListener('input', updateFilterButtonState);
filterStartDate.addEventListener('input', updateFilterButtonState);
filterEndDate.addEventListener('input', updateFilterButtonState);

// Inicializa o carregamento dos feedbacks ao abrir a página
loadFeedbacks();
