document.addEventListener("DOMContentLoaded", function () {
  const vendedoresValidos = [123]; // Coloque os vendedores autorizados aqui (números)

  const stars = document.querySelectorAll(".rating-box label");
  let lastChecked = null;

  stars.forEach((star) => {
    star.addEventListener("click", function () {
      const input = this.control; // Pega o input relacionado à label clicada
      if (input === lastChecked) {
        // Se clicar na mesma estrela já marcada, desmarca
        input.checked = false;
        lastChecked = null;
      } else {
        lastChecked = input;
      }
    });
  });

  const submitBtn = document.querySelector(".submit-btn");
  const loadingElement = document.querySelector(".loading-spinner");
  const messageElement = document.querySelector(".feedback-message");

  submitBtn.addEventListener("click", async function () {
    const ratingInput = document.querySelector("input[name='rating']:checked");
    const feedbackText = document.querySelector(".feedback-text").value.trim();
    const empresaInput = document.querySelector(".empresa-nome").value.trim();

    if (!ratingInput) {
      submitBtn.style.display = "none";
      messageElement.textContent = "Por favor, selecione pelo menos uma estrela!";
      messageElement.style.color = "red";
      messageElement.style.display = "block";

      // Desmarca as estrelas e reseta lastChecked
      document.querySelectorAll("input[name='rating']").forEach((radio) => (radio.checked = false));
      lastChecked = null;

      setTimeout(() => {
        submitBtn.style.display = "inline-block";
        messageElement.style.display = "none";
      }, 3000);

      return;
    }

    //Captura o vendedor e armazena no banco
    const urlParams = new URLSearchParams(window.location.search);
    const vendedorId = urlParams.get("atendente");

    // VALIDAÇÃO DO VENDEDOR - INÍCIO
    const vendedorNum = Number(vendedorId);
    if (!vendedorId || !vendedoresValidos.includes(vendedorNum)) {
      alert("Atendente inválido ou não autorizado.");
      return;
    }
    // VALIDAÇÃO DO VENDEDOR - FIM


    const feedback = {
      rating: parseInt(ratingInput.value),
      comment: feedbackText,
      empresa: empresaInput,
      vendedor: vendedorId
    };

    messageElement.style.display = "none";
    loadingElement.style.display = "inline-block";
    submitBtn.style.display = "none";

    try {
      const response = await fetch("https://feedbackmotasa.netlify.app/.netlify/functions/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback),
      });

      const result = await response.json();

      if (response.ok) {
        loadingElement.style.display = "none";
        messageElement.textContent = "Feedback enviado com sucesso!";
        messageElement.style.color = "green";
        messageElement.style.display = "block";

        document.querySelector(".feedback-text").value = "";
        document.querySelector(".empresa-nome").value = "";
        document.querySelectorAll("input[name='rating']").forEach((radio) => (radio.checked = false));
        lastChecked = null;

        setTimeout(() => {
          submitBtn.style.display = "inline-block";
          messageElement.style.display = "none";
        }, 3000);
      } else {
        loadingElement.style.display = "none";
        messageElement.textContent = "Erro ao enviar feedback: " + result.error;
        messageElement.style.color = "red";
        messageElement.style.display = "block";

        // Também desmarca e reseta para evitar estrela marcada após erro
        document.querySelectorAll("input[name='rating']").forEach((radio) => (radio.checked = false));
        lastChecked = null;

        setTimeout(() => {
          submitBtn.style.display = "inline-block";
        }, 3000);
      }
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      loadingElement.style.display = "none";
      messageElement.textContent = "Erro ao enviar feedback.";
      messageElement.style.color = "red";
      messageElement.style.display = "block";

      // Também desmarca e reseta aqui
      document.querySelectorAll("input[name='rating']").forEach((radio) => (radio.checked = false));
      lastChecked = null;

      setTimeout(() => {
        submitBtn.style.display = "inline-block";
        messageElement.style.display = "none";
      }, 3000);
    }
  });
});
