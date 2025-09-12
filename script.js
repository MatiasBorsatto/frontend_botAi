const contenedorConversacion = document.querySelector("#conversacion");
const btnEnviar = document.querySelector("#boton-enviar");
const input = document.querySelector("#input-prompt");

btnEnviar.addEventListener("click", async (e) => {
  e.preventDefault();
  console.log(input.value);
  const inputValue = input.value;

  if (!inputValue.trim()) {
    alert("Debe ingresar un prompt");
    return;
  }

  contenedorConversacion.innerHTML += `
    <div class="mensaje-usuario">
      <p>${inputValue}</p>
    </div>
  `;

  input.value = "";

  try {
    const res = await fetch("https://backend-bot-ai.vercel.app/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: inputValue,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      console.log(data);
      contenedorConversacion.innerHTML += `
      <div class="mensaje-bot">
        <p>${data.respuesta}</p>
      </div>
    `;
    }
  } catch (error) {
    contenedorConversacion.innerHTML += `
      <div class="mensaje-error">
        <p>Error en la consulta: ${error.message}</p>
      </div>
    `;
    console.error("Error: ", error);
  }

  contenedorConversacion.scrollTop = contenedorConversacion.scrollHeight;
});
