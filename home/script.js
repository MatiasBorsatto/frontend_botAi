const contenedorConversacion = document.querySelector(".messages-wrapper");
const contenedorConversacion2 = document.querySelector(".messages-container");
const btnEnviar = document.querySelector("#boton-enviar");
const input = document.querySelector("#input-prompt");
const modelos = document.querySelector("#modelos");
const btnSlide = document.querySelector("#toggleSideBtn");
const contChats = document.querySelector("#contenedor-chats");
const body = document.body;
const userBtn = document.getElementById("userBtn");
const dropdown = document.getElementById("dropdownMenu");
const logoutBtn = document.getElementById("logoutBtn");
const asideChats = document.querySelector(".chat");
const nuevoChat = document.querySelector(".chat-nuevo");

const context = `Sos un asistente conversacional amigable y experto en gestion de contactos.

COMPORTAMIENTO DUAL
- Por defecto: conversa naturalmente sobre cualquier tema
- Si detectas intencion de gestionar contactos: activa modo CRUD

Palabras clave de contactos: agregar, crear, guardar, buscar, listar, actualizar, modificar, eliminar, borrar mas contacto telefono email

MODO CRUD
Operaciones: GET, POST, PUT, DELETE

POST PUT - Campos obligatorios:
1. name (minimo 3 chars)
2. phone (solo numeros, 7-15 digitos)
3. email (formato valido con @ y .com) -OPCIONAL-

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

let chatActual = null;
let dataContextoGlobal = null;

const token = localStorage.getItem("token");
const usuario = localStorage.getItem("usuario");

let messages = [
  { role: "system", content: context },
  {
    role: "assistant",
    content: "¡Hola! Soy tu asistente de AuraAI. ¿En qué puedo ayudarte hoy?",
  },
];

// ✅ Función para guardar el historial actual
const guardarHistorialActual = async () => {
  if (!token || !usuario) return;

  const mensajesUsuario = messages.filter((msg) => msg.role === "user");

  if (mensajesUsuario.length === 0) {
    console.log("No hay mensajes del usuario para guardar");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/guardar-contexto", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        usuario: usuario,
      },
      body: JSON.stringify({
        messages,
        id_chat: chatActual,
      }),
    });

    const data = await response.json();

    if (!chatActual && data.id_chat) {
      chatActual = data.id_chat;
      console.log("Nuevo chat creado con ID:", chatActual);
    }

    console.log("Historial guardado:", data);
    return data;
  } catch (error) {
    console.error("Error al guardar historial:", error);
  }
};

const obtenerContexto = async () => {
  if (!token) return;

  const traerHistorial = await fetch(
    "http://localhost:3000/api/obtener-contexto",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authentication: `Bearer ${token}`,
        usuario: usuario,
      },
    }
  );

  const dataContexto = await traerHistorial.json();
  dataContextoGlobal = dataContexto;

  asideChats.innerHTML = "";
  dataContexto.historiales.forEach((c) => {
    const fecha = new Date(c.createdAt);
    asideChats.innerHTML += `
        <div class="chat-contenedor">
          <div class="cont-datos" tabindex="0" data-id="${c.id_chat}">
            <p class="chat-titulo">${c.titulo}</p>
            <p class="chat-fecha">${fecha.toLocaleString("es-AR")}</p>
          </div>
          <div class="cont-eliminar">
            <button class="btn-eliminar" data-id="${c.id_chat}">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                  <path d="M18 6V16.2C18 17.8802 18 18.7202 17.673 19.362C17.3854 19.9265 16.9265 20.3854 16.362 20.673C15.7202 21 14.8802 21 13.2 21H10.8C9.11984 21 8.27976 21 7.63803 20.673C7.07354 20.3854 6.6146 19.9265 6.32698 19.362C6 18.7202 6 17.8802 6 16.2V6M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6" stroke="#ff5252" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                </g>
              </svg>
            </button>
          </div>
        </div>
    `;
  });

  // ✅ Agregar listeners para seleccionar chats
  document.querySelectorAll(".cont-datos").forEach((chat) => {
    chat.replaceWith(chat.cloneNode(true));
  });

  const nuevosChats = document.querySelectorAll(".cont-datos");

  nuevosChats.forEach((chat) => {
    chat.addEventListener("click", () => {
      const id = chat.dataset.id;
      const seleccionado = dataContexto.historiales.find(
        (c) => c.id_chat == id
      );

      if (!seleccionado) {
        console.error("No se encontró el chat seleccionado");
        return;
      }

      chatActual = seleccionado.id_chat;
      console.log("Chat actual:", chatActual);

      mostrarHistorial(seleccionado.historial);

      messages = [
        { role: "system", content: context },
        ...seleccionado.historial,
      ];
    });
  });

  // ✅ Agregar listeners para eliminar chats
  document.querySelectorAll(".btn-eliminar").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation(); // Evita que se active el click del chat

      const chatId = btn.dataset.id;

      if (!confirm("¿Estás seguro de que deseas eliminar este chat?")) {
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3000/api/borrar-contexto",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ chat_id: chatId }),
          }
        );

        if (!response.ok) {
          throw new Error("Error al eliminar el chat");
        }

        const data = await response.json();
        console.log("Chat eliminado:", data);

        // ✅ Si el chat eliminado era el activo, resetear
        if (chatActual == chatId) {
          chatActual = null;
          messages = [
            { role: "system", content: context },
            {
              role: "assistant",
              content:
                "¡Hola! Soy tu asistente de AuraAI. ¿En qué puedo ayudarte hoy?",
            },
          ];
          contenedorConversacion.innerHTML = `
            <div class="message message-assistant">
              <div class="estructura-message">
                <div class="avatar avatar-bot">
                  <img src="../assests/img/bot-svgrepo-com.svg" alt="">
                </div>
                <div class="message-bubble message-bubble-assistant">
                  ¡Hola! Soy tu asistente de AuraAI. ¿En qué puedo ayudarte hoy?
                </div>
              </div>
            </div>`;
        }

        // ✅ Recargar la lista de chats
        await obtenerContexto();
      } catch (error) {
        console.error("Error al eliminar chat:", error);
        alert("Error al eliminar el chat. Intenta nuevamente.");
      }
    });
  });
};

function mostrarHistorial(historial) {
  contenedorConversacion.innerHTML = "";

  historial.forEach((msg) => {
    if (msg.role === "user") {
      contenedorConversacion.innerHTML += `
        <div class="message message-user">
          <div class="estructura-message">
            <div class="message-bubble message-bubble-user">${msg.content}</div>
            <div class="avatar avatar-user">
              <img src="../assests/img/user-svgrepo-com.svg" alt="">
            </div>
          </div>
        </div>`;
    } else if (msg.role === "assistant") {
      contenedorConversacion.innerHTML += `
        <div class="message message-assistant">
          <div class="estructura-message">
            <div class="avatar avatar-bot">
              <img src="../assests/img/bot-svgrepo-com.svg" alt="">
            </div>
            <div class="message-bubble message-bubble-assistant">${msg.content}</div>
          </div>
        </div>`;
    }
  });
}

obtenerContexto();

btnSlide.addEventListener("click", () => {
  const abierto = body.classList.toggle("expandido");
  contChats.classList.toggle("contchat-abierto", abierto);
});

btnEnviar.addEventListener("click", async (e) => {
  e.preventDefault();
  const inputValue = input.value.trim();
  if (!inputValue) return alert("Debe ingresar un prompt");

  contenedorConversacion.innerHTML += `
    <div class="message message-user">
      <div class="estructura-message">
        <div class="message-bubble message-bubble-user">${inputValue}</div>
        <div class="avatar avatar-user">
          <img src="../assests/img/user-svgrepo-com.svg" alt="">
        </div>
      </div>
    </div>`;

  contenedorConversacion2.scrollTo({
    top: contenedorConversacion2.scrollHeight,
    behavior: "smooth",
  });

  messages.push({ role: "user", content: inputValue });
  input.value = "";

  try {
    if (!token) {
      alert("Token inexistente o expirado, vuelva a iniciar sesion");
      return (window.location.href = "../login/login.html");
    }
    const res = await fetch("http://localhost:3000/api/prompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Autentication: `Bearer ${token}`,
      },
      body: JSON.stringify({ messages }),
    });

    const data = await res.json();
    let mensajeParaMostrar = data.respuesta;

    if (
      typeof mensajeParaMostrar === "string" &&
      mensajeParaMostrar.trim().startsWith("{")
    ) {
      try {
        mensajeParaMostrar = JSON.parse(mensajeParaMostrar);
      } catch {
        console.warn("No se pudo parsear la respuesta JSON");
      }
    }

    let contenidoMostrar = "";

    if (mensajeParaMostrar && typeof mensajeParaMostrar === "object") {
      if (
        mensajeParaMostrar.operation === "GET" &&
        mensajeParaMostrar.contacts &&
        mensajeParaMostrar.contacts.length > 0
      ) {
        contenidoMostrar = `
          <div class="contactos-lista">
            <p><strong>${
              mensajeParaMostrar.reason || "Contactos encontrados"
            }</strong></p>
            ${mensajeParaMostrar.contacts
              .map(
                (contacto, index) => `
              <div class="contacto-card">
                <p><strong>#${index + 1}</strong></p>
                <p>📇 <strong>${contacto.name}</strong></p>
                <p>📱 ${contacto.phone}</p>
                <p>📧 ${contacto.email}</p>
              </div>
            `
              )
              .join("")}
          </div>
        `;
      } else {
        contenidoMostrar =
          mensajeParaMostrar.reason || "Operación realizada correctamente";
      }
    } else {
      contenidoMostrar = mensajeParaMostrar;
    }

    contenedorConversacion.innerHTML += `
      <div class="message message-assistant">
        <div class="estructura-message">
          <div class="avatar avatar-bot">
            <img src="../assests/img/bot-svgrepo-com.svg" alt="">
          </div>
          <div class="message-bubble message-bubble-assistant">${contenidoMostrar}</div>
        </div>
      </div>`;

    contenedorConversacion2.scrollTo({
      top: contenedorConversacion2.scrollHeight,
      behavior: "smooth",
    });

    messages.push({ role: "assistant", content: contenidoMostrar });

    await guardarHistorialActual();
    await obtenerContexto();
  } catch (error) {
    console.error("Error en la consulta:", error);
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await guardarHistorialActual();

    localStorage.clear();
    window.location.href = "../login/login.html";
  } catch (error) {
    console.error("Error al guardar contexto:", error);
  }
});

userBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdown.classList.toggle("show");
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".user-menu")) {
    dropdown.classList.remove("show");
  }
});

nuevoChat.addEventListener("click", () => {
  chatActual = null;
  messages = [
    { role: "system", content: context },
    {
      role: "assistant",
      content: "¡Hola! Soy tu asistente de AuraAI. ¿En qué puedo ayudarte hoy?",
    },
  ];
  contenedorConversacion.innerHTML = `
    <div class="message message-assistant">
      <div class="estructura-message">
        <div class="avatar avatar-bot">
          <img src="../assests/img/bot-svgrepo-com.svg" alt="">
        </div>
        <div class="message-bubble message-bubble-assistant">
          ¡Hola! Soy tu asistente de AuraAI. ¿En qué puedo ayudarte hoy?
        </div>
      </div>
    </div>`;
  console.log("Nuevo chat iniciado");
});
