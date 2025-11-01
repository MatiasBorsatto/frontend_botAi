const login = document.querySelector("form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");

login.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value;
  const password = passwordInput.value;

  const res = await fetch(`http://localhost:3000/api/login`, {
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

  if (data.message === "Login correcto!") {
    alert(data.message);
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", data.usuarioId);
    window.location.href = "../home/index.html";
    console.log(data);
  }

  if (data.error) {
    alert(data.error);
  }
});
