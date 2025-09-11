const contenedorConversacion = document.querySelector("#conversacion");
const btnEnviar = document.querySelector("#boton-enviar");
const input = document.querySelector("#input-prompt");
const checkInput = document.querySelector("#check-input");

checkInput.addEventListener("click", () => {
  console.log(input.value);
});

btnEnviar.addEventListener("click", async () => {
  console.log(input.value);
  const inputValue = input.value;

  if (!inputValue.trim()) return;

  contenedorConversacion.innerHTML += `
    <div class="mensaje-usuario">
      <p>${inputValue}</p>
    </div>
  `;

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

  input.value = "";
  contenedorConversacion.scrollTop = contenedorConversacion.scrollHeight;
});
