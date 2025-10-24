const contenedorConversacion = document.querySelector(".messages-wrapper");
const btnEnviar = document.querySelector("#boton-enviar");
const input = document.querySelector("#input-prompt");
const modelos = document.querySelector("#modelos");
const btnSlide = document.querySelector("#toggleSideBtn");
const contChats = document.querySelector("#contenedor-chats");
const body = document.body;
const context = `Sos un asistente conversacional amigable y experto en gestion de contactos.

COMPORTAMIENTO DUAL
- Por defecto: conversa naturalmente sobre cualquier tema
- Si detectas intencion de gestionar contactos: activa modo CRUD

Palabras clave de contactos: agregar, crear, guardar, buscar, listar, actualizar, modificar, eliminar, borrar mas contacto telefono email

MODO CRUD
Operaciones: GET, POST, PUT, DELETE

POST PUT - Campos obligatorios:
1. name (minimo 2 chars)
2. phone (solo numeros, 7-15 digitos)
3. email (formato valido con @)

Flujo:
1. Si el usuario proporciona name, phone y email en un solo mensaje, genera el JSON inmediatamente sin preguntar nada
2. Si faltan datos, pregunta uno por uno: name phone email
3. Una vez que tengas los 3 campos obligatorios, genera el JSON inmediatamente
4. NO preguntes por datos adicionales
5. NO permitas agregar campos extras

IMPORTANTE: Solo se permiten estos 3 campos: name, phone, email. Ningun otro campo adicional esta permitido.

Validaciones:
- Email: debe tener formato usuario@dominio.ext
- Phone: solo numeros sin espacios guiones
- Name: no puede ser solo numeros
- 3 intentos maximo por campo
- Si dice cancelar, volve a modo conversacional

JSON (solo cuando tengas datos completos):
{
  "operation": "GET POST PUT DELETE",
  "contacts": [{
    "name": "string",
    "phone": "string",
    "email": "string"
  }],
  "reason": "string breve"
}

GET: Si hay info suficiente JSON directo sin preguntar nada
DELETE: Solo necesitas name para identificar, genera JSON directo
PUT: Incluí name mas campos a actualizar, genera JSON directo si esta completo

Limites:
- Max 5 contactos por operacion
- Si falla 3 veces, ofrece cancelar

EJEMPLOS
Conversacional: Como estas? Respuesta: Hola! Todo bien, en que puedo ayudarte?

CRUD con datos completos: Agregar contacto Juan Perez telefono 1234567890 email juan@mail.com
Respuesta directa:
{
  "operation": "POST",
  "contacts": [{
    "name": "Juan Perez",
    "phone": "1234567890",
    "email": "juan@mail.com"
  }],
  "reason": "Contacto creado"
}

CRUD sin datos: Guardar contacto
Respuesta: Cual es el nombre?

Mixto: Usuario cancela volver a conversacional natural

REGLA CRITICA DE RESPUESTA JSON:
Cuando generes el JSON final, responde UNICAMENTE con el JSON puro, sin texto adicional antes ni despues. No agregues explicaciones, confirmaciones ni mensajes. Solo el objeto JSON y nada mas.

Ejemplo CORRECTO de respuesta final:
{
  "operation": "POST",
  "contacts": [{
    "name": "Juan Perez",
    "phone": "1234567890",
    "email": "juan@mail.com"
  }],
  "reason": "Contacto creado"
}

Ejemplo INCORRECTO (NO hacer):
Perfecto! Aqui esta el contacto guardado:
{
  "operation": "POST",
  ...
}

Si el usuario intenta agregar campos adicionales como direccion, empresa, cumpleanos, etc, responde: Solo puedo guardar nombre, telefono y email.

Si el usuario proporciona todos los datos necesarios en un solo mensaje, genera el JSON inmediatamente sin preguntar ni confirmar nada.

Nunca inventes datos. Mantene tono amigable en ambos modos excepto al enviar JSON final.`;

let messages = [
  {
    role: "system",
    content: context,
  },
];

btnSlide.addEventListener("click", () => {
  const abierto = body.classList.toggle("expandido");
  contChats.classList.toggle("contchat-abierto", abierto);
});

btnEnviar.addEventListener("click", async (e) => {
  e.preventDefault();
  console.log(input.value);
  const inputValue = input.value;

  if (!inputValue.trim()) {
    alert("Debe ingresar un prompt");
    return;
  }

  contenedorConversacion.innerHTML += `
  <div class="message message-user">
    <div class="estructura-message">
      <div class="message-bubble message-bubble-user">
        ${inputValue}
      </div>
      <div class="avatar avatar-user">
      <img src="assests/img/user-svgrepo-com.svg" alt="">
      </div>
    </div>
  </div>
  `;

  function scrollToBottom() {
    const container = document.getElementById("messagesContainer");
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }

  // Cada vez que agregues un mensaje, llamá a:
  scrollToBottom();

  messages.push({ role: "user", content: inputValue });
  console.log(messages);

  input.value = "";

  try {
    const res = await fetch(`http://localhost:3000/api/prompt`, {
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
      // Validar si la respuesta del backend es un JSON
      let mensajeParaMostrar = data.respuesta;
      try {
        const esJSON = data.raw;
        console.log("data.raw: " + data.raw);
        if (typeof esJSON === "object") {
          // Si es JSON, usar la respuesta raw directamente
          mensajeParaMostrar =
            "Las operación termino exitosamente! ¿Necesita alguna otra cosa?";
          messages.push({ role: "assistant", content: mensajeParaMostrar });
        }
      } catch (e) {
        // Si no es JSON, mantener data.respuesta
      }

      contenedorConversacion.innerHTML += `
        <div class="message message-assistant">
          <div class="estructura-message">
            <div class="avatar avatar-bot">
              <img src="assests/img/bot-svgrepo-com.svg" alt="">
            </div>
            <div class="message-bubble message-bubble-assistant">
              ${mensajeParaMostrar}
            </div>
          </div>
        </div>
      `;

      // Cada vez que agregues un mensaje, llamá a:
      scrollToBottom();

      messages.push({
        role: "assistant",
        content: data.respuesta,
      });
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
