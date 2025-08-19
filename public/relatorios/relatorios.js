async function loadFeedbacks() {
  const token = sessionStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch('/.netlify/functions/report', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });

    if (res.status === 401) {
      sessionStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }

    const data = await res.json();
    // Aqui renderiza seus dados na tela
    console.log(data.data);
  } catch (err) {
    console.error('Erro ao carregar relatório', err);
  }
}

loadFeedbacks();
