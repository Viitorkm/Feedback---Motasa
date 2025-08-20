const form = document.getElementById("loginForm");
const error = document.getElementById("error");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch('/.netlify/functions/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      sessionStorage.setItem("token", data.token);
      window.location.href = "/usuarios/usuarios.html";

    } else {
      error.textContent = data.error || "Erro no login";
    }
  } catch (err) {
    error.textContent = "Erro na conexão com o servidor";
  }
});
