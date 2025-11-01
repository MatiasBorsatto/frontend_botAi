const login = document.querySelector("form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const passwordInputAgain = document.querySelector("#password-again");

login.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value;
  const passwordAgain = passwordInputAgain.value;
  const password = passwordInput.value;

  if (password != passwordAgain) {
    console.log(password + " " + passwordAgain);
    return alert("Las contraseñas no coinciden");
  }

  const res = await fetch(`http://localhost:3000/api/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await res.json();

  console.log(data);

  if (data.mensaje === "Usuario registrado correctamente") {
    alert(data.mensaje);
    window.location.href = "../login/login.html";
    console.log(data);
  }

  if (data.error) {
    alert(data.error);
  }
});
