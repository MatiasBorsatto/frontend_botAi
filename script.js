const contenedorConversacion = document.querySelector("#conversacion");
const btnEnviar = document.querySelector("#boton-enviar");
const input = document.querySelector("#input-prompt");

let messages = [];

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

  messages.push({ role: "user", content: inputValue });
  console.log(messages);

  input.value = "";

  try {
    const res = await fetch("https://backend-bot-ai.vercel.app/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
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

      messages.push({ role: "model", content: data.respuesta });
      console.log(messages);
    }
  } catch (error) {
    contenedorConversacion.innerHTML += `
      <div class="mensaje-error">
        <p>Error en la consulta: ${error.message}</p>
      </div>
    `;
    console.error("Error: ", error);
  }
});
