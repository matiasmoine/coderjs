document.addEventListener("DOMContentLoaded", () => {
  const ingresoInput = document.getElementById("ingreso");
  const guardarIngresoBtn = document.getElementById("guardarIngreso");
  const reiniciarIngresoBtn = document.getElementById("reiniciarIngreso");
  const gastoForm = document.getElementById("gastoForm");
  const gastosTable = document.getElementById("gastosTable");
  const borrarTodoBtn = document.getElementById("borrarTodo");
  const categoriaFiltro = document.getElementById("categoriaFiltro");
  const advertenciaDiv = document.getElementById("advertencia");

  document.getElementById("limpiarPantalla").addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });


  let ingresos = parseFloat(localStorage.getItem("ingreso")) || 0;
  let gastos = JSON.parse(localStorage.getItem("gastos")) || [];

  function actualizarResumen() {
    const totalGastos = gastos.reduce((acc, g) => acc + g.monto, 0);
    const saldo = ingresos - totalGastos;
    const porcentaje = ingresos > 0 ? ((totalGastos / ingresos) * 100).toFixed(2) : 0;

    document.getElementById("ingresosTotal").textContent = ingresos.toFixed(2);
    document.getElementById("gastosTotal").textContent = totalGastos.toFixed(2);

    const saldoElemento = document.getElementById("saldoTotal");
    saldoElemento.textContent = saldo.toFixed(2);

    console.log(saldoElemento.textContent);

    // Aplicar estilo y advertencia si el saldo es negativo
    if (saldo < 0) {
      saldoElemento.classList.add("saldo-negativo");
      advertenciaDiv.textContent = "⚠️ ¡Advertencia! Sus gastos superaron sus ingresos.";
    } else {
      saldoElemento.classList.remove("saldo-negativo");
      advertenciaDiv.textContent = "";
    }

    document.getElementById("porcentajeGastado").textContent = porcentaje + "%";
  }

  function renderGastos(filtro = "Todas") {
    gastosTable.innerHTML = "";
    const filtrados = filtro === "Todas" ? gastos : gastos.filter(g => g.categoria === filtro);
    filtrados.forEach((gasto, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${gasto.fecha}</td>
        <td>${gasto.categoria}</td>
        <td>${gasto.nombre}</td>
        <td>$${gasto.monto.toFixed(2)}</td>
        <td><button onclick="eliminarGasto(${index})">🗑️</button></td>
      `;
      gastosTable.appendChild(row);
    });
  }
  function tomarIngreso(){
    ingresos = parseFloat(ingresoInput.value) || 0;
    localStorage.setItem("ingreso", ingresos);
    actualizarResumen();
  };
  window.eliminarGasto = function (index) {
    gastos.splice(index, 1);
    localStorage.setItem("gastos", JSON.stringify(gastos));
    renderGastos(categoriaFiltro.value);
    actualizarResumen();
  };
  ingresoInput.addEventListener("keydown", () => tomarIngreso());
  guardarIngresoBtn.addEventListener("click", () => tomarIngreso());

  reiniciarIngresoBtn.addEventListener("click", () => {
    ingresos = 0;
    localStorage.removeItem("ingreso");
    ingresoInput.value = "";
    actualizarResumen();
  });

  gastoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value;
    const monto = parseFloat(document.getElementById("monto").value);
    const categoria = document.getElementById("categoria").value;
    const fecha = document.getElementById("fecha").value;

    if (!nombre || isNaN(monto) || !categoria || !fecha) return;

    gastos.push({ nombre, monto, categoria, fecha });
    localStorage.setItem("gastos", JSON.stringify(gastos));
    gastoForm.reset();
    renderGastos(categoriaFiltro.value);
    actualizarResumen();
  });

  borrarTodoBtn.addEventListener("click", () => {
    gastos = [];
    localStorage.removeItem("gastos");
    renderGastos();
    actualizarResumen();
  });

  categoriaFiltro.addEventListener("change", () => {
    renderGastos(categoriaFiltro.value);
  });

  ingresoInput.value = ingresos || "";
  actualizarResumen();
  renderGastos();
});