const contenedorConversacion = document.querySelector("#conversacion");
const btnEnviar = document.querySelector("#boton-enviar");
const input = document.querySelector("#input-prompt");
const modelos = document.querySelector("#modelos");

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
    <div class="message-bubble message-bubble-user message-user message">
      <p>${inputValue}</p>
    </div>
  `;

  messages.push({ role: "user", content: inputValue });
  console.log(messages);

  input.value = "";

  try {
    const res = await fetch(`http://localhost:3000/api/deepseek`, {
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
      <div class="message-bubble message-bubble-assistant message-assistant message">
        <p>${data.respuesta}</p>
      </div>
    `;

      messages.push({
        role: "assistant",
        content: data.raw,
      });
      console.log(messages);
      console.log("Esto es deepseek");
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
