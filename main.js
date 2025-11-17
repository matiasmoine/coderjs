document.addEventListener("DOMContentLoaded", () => {
  const ingresoInput = document.getElementById("ingreso");
  const guardarIngresoBtn = document.getElementById("guardarIngreso");
  const reiniciarIngresoBtn = document.getElementById("reiniciarIngreso");
  const gastoForm = document.getElementById("gastoForm");
  const gastosTable = document.getElementById("gastosTable");
  const borrarTodoBtn = document.getElementById("borrarTodo");
  const categoriaFiltro = document.getElementById("categoriaFiltro");
  const advertenciaDiv = document.getElementById("advertencia");

  //  async function mostrarCotizacionDolar() {
  //   try {
  //     const response = await fetch('https://api.bcra.gob.ar/estadisticascambiarias/v1.0/Cotizaciones');
  //     const data = await response.json();

  //     if (data.status === 200 && data.results && data.results.detalle) {
  //       const dolar = data.results.detalle.find(item => item.codigoMoneda === "USD");
  //       if (dolar) {
  //         document.getElementById("cotizacionDolar").textContent = `USD: $${dolar.tipoCotizacion.toFixed(2)}`;
  //         document.getElementById("fechaCotizacion").textContent = `Fecha: ${data.results.fecha}`;
  //       } else {
  //         document.getElementById("cotizacionDolar").textContent = "Cotización no disponible";
  //         document.getElementById("fechaCotizacion").textContent = "";
  //       }
  //     } else {
  //       document.getElementById("cotizacionDolar").textContent = "Error al obtener cotización";
  //       document.getElementById("fechaCotizacion").textContent = "";
  //     }
  //   } catch (error) {
  //     console.error("Error al consultar la API:", error);
  //     document.getElementById("cotizacionDolar").textContent = "Error de conexión";
  //     document.getElementById("fechaCotizacion").textContent = "";
  //   }
  // }
  async function mostrarCotizacionDolar() {
    try {
      const hoy = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
      let url = `https://api.bcra.gob.ar/estadisticascambiarias/v1.0/Cotizaciones?fecha=${hoy}`;
      let response = await fetch(url);
      let data = await response.json();

      // Si no hay datos para hoy, hacemos fallback a la última cotización disponible
      if (!(data.status === 200 && data.results && data.results.detalle && data.results.detalle.length > 0)) {
        console.warn("No hay datos para la fecha actual, usando última cotización disponible...");
        response = await fetch('https://api.bcra.gob.ar/estadisticascambiarias/v1.0/Cotizaciones');
        data = await response.json();
      }

      if (data.status === 200 && data.results && data.results.detalle) {
        const dolar = data.results.detalle.find(item => item.codigoMoneda === "USD");
        if (dolar) {
          document.getElementById("cotizacionDolar").textContent = `USD: $${dolar.tipoCotizacion.toFixed(2)}`;
          document.getElementById("fechaCotizacion").textContent = `Fecha: ${data.results.fecha}`;
        } else {
          document.getElementById("cotizacionDolar").textContent = "Cotización no disponible";
          document.getElementById("fechaCotizacion").textContent = "";
        }
      } else {
        document.getElementById("cotizacionDolar").textContent = "Error al obtener cotización";
        document.getElementById("fechaCotizacion").textContent = "";
      }
    } catch (error) {
      console.error("Error al consultar la API:", error);
      document.getElementById("cotizacionDolar").textContent = "Error de conexión";
      document.getElementById("fechaCotizacion").textContent = "";
    }
  }
  mostrarCotizacionDolar();

  document.getElementById("limpiarPantalla").addEventListener("click", () => {
    Swal.fire({
      title: '¿Limpiar pantalla?',
      text: 'Se eliminarán todos los datos y se recargará la página.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        location.reload();
      }
    });
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

  function tomarIngreso() {
    ingresos = parseFloat(ingresoInput.value) || 0;
    localStorage.setItem("ingreso", ingresos);
    actualizarResumen();
  }

  // ✅ Eliminar gasto con confirmación
  window.eliminarGasto = function (index) {
    Swal.fire({
      title: '¿Eliminar este gasto?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        gastos.splice(index, 1);
        localStorage.setItem("gastos", JSON.stringify(gastos));
        renderGastos(categoriaFiltro.value);
        actualizarResumen();
        Swal.fire('Eliminado', 'El gasto ha sido eliminado.', 'success');
      }
    });
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

  // ✅ Borrar todos los gastos con confirmación
  borrarTodoBtn.addEventListener("click", () => {
    Swal.fire({
      title: '¿Eliminar todos los gastos?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, borrar todo',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        gastos = [];
        localStorage.removeItem("gastos");
        renderGastos();
        actualizarResumen();
        Swal.fire('Borrado', 'Todos los gastos han sido eliminados.', 'success');
      }
    });
  });

  categoriaFiltro.addEventListener("change", () => {
    renderGastos(categoriaFiltro.value);
  });

  ingresoInput.value = ingresos || "";
  actualizarResumen();
  renderGastos();
});