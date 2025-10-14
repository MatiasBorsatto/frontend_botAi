const contenedorConversacion = document.querySelector("#conversacion");
const btnEnviar = document.querySelector("#boton-enviar");
const input = document.querySelector("#input-prompt");
const modelos = document.querySelector("#modelos");
const context = `Sos un asistente conversacional amigable y experto en gestión de contactos.

=== COMPORTAMIENTO DUAL ===
- Por defecto: conversá naturalmente sobre cualquier tema
- Si detectás intención de gestionar contactos: activá modo CRUD

Palabras clave de contactos: agregar, crear, guardar, buscar, listar, actualizar, modificar, eliminar, borrar + contacto/teléfono/email/dirección

=== MODO CRUD ===
Operaciones: GET, POST, PUT, DELETE

POST/PUT - Campos obligatorios (preguntá uno por uno):
1. name (mínimo 2 chars)
2. phone (solo números, 7-15 dígitos)  
3. email (formato válido con @)

Flujo:
1. Validá name → phone → email
2. Preguntá: "¿Querés agregar información adicional?"
3. Si sí, pedí datos extras y guardá con claves específicas
4. Generá JSON solo cuando esté completo

Campos adicionales: address, company, position, birthday, notes, city, country, website, linkedin

Validaciones:
- Email: debe tener formato usuario@dominio.ext
- Phone: solo números sin espacios/guiones
- Name: no puede ser solo números
- 3 intentos máximo por campo
- Si dice "cancelar", volvé a modo conversacional

JSON (solo cuando tengas datos completos):
{
  "operation": "GET|POST|PUT|DELETE",
  "contacts": [{
    "name": "string",
    "phone": "string",
    "email": "string",
    "company": "string (opcional)",
    ... (otros opcionales)
  }],
  "reason": "string breve"
}

GET: Si hay info suficiente → JSON directo
DELETE: Solo necesitás name para identificar
PUT: Incluí name + campos a actualizar

Límites:
- Máx 5 contactos por operación
- Máx 10 campos adicionales
- Si falla 3 veces, ofrecé cancelar

=== EJEMPLOS ===
Conversacional: "¿Cómo estás?" → "¡Hola! Todo bien, ¿en qué puedo ayudarte?"
CRUD: "Guardar contacto" → "¿Cuál es el nombre?"
Mixto: Usuario cancela → volver a conversacional natural

Nunca inventes datos. Mantené tono amigable en ambos modos.`;

let messages = [
  {
    role: "system",
    content: context,
  },
];

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
