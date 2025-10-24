document.addEventListener("DOMContentLoaded", () => {
  const ingresoInput = document.getElementById("ingreso");
  const guardarIngresoBtn = document.getElementById("guardarIngreso");
  const formGasto = document.getElementById("formGasto");
  const agregarGastoBtn = document.getElementById("agregarGasto");
  const nombreGasto = document.getElementById("nombreGasto");
  const montoGasto = document.getElementById("montoGasto");
  const categoriaGasto = document.getElementById("categoriaGasto");
  const listaGastosFallback = document.getElementById("listaGastos"); // fallback único (opcional)
  const resumen = document.getElementById("resumen");
  const totales = document.getElementById("totales");

  let ingresos = JSON.parse(localStorage.getItem("ingresos")) || 0;
  let gastos = JSON.parse(localStorage.getItem("gastos")) || [];

  // Mostrar ingreso guardado y secciones si corresponde
  if (ingresos > 0) {
    ingresoInput.value = ingresos;
    formGasto?.classList.remove("oculto");
    resumen?.classList.remove("oculto");
  }

  // Render inicial (robusto)
  renderGastos();
  actualizarTotales();

  guardarIngresoBtn?.addEventListener("click", () => {
    const valor = parseFloat(ingresoInput.value);
    if (isNaN(valor) || valor <= 0) {
      alert("Ingrese un valor válido para el ingreso.");
      return;
    }
    ingresos = valor;
    localStorage.setItem("ingresos", JSON.stringify(ingresos));
    formGasto?.classList.remove("oculto");
    resumen?.classList.remove("oculto");
    actualizarTotales();
  });

  agregarGastoBtn?.addEventListener("click", () => {
    const nombre = nombreGasto.value?.trim();
    const monto = parseFloat(montoGasto.value);
    const categoria = categoriaGasto.value?.trim().toLowerCase();

    const categoriasValidas = ["vivienda", "comida", "transporte", "ocio"];

    if (!nombre || isNaN(monto) || monto <= 0 || !categoriasValidas.includes(categoria)) {
      alert("Complete todos los campos correctamente y seleccione una categoría válida.");
      return;
    }

    const nuevoGasto = { nombre, monto, categoria };
    gastos.push(nuevoGasto);
    localStorage.setItem("gastos", JSON.stringify(gastos));

    nombreGasto.value = "";
    montoGasto.value = "";
    renderGastos();
    actualizarTotales();
    const montoTotal = parseFloat(montoGasto.value);
    const categoriaTotal = categoriaGasto.value;

    if (!nombre || isNaN(montoTotal) || montoTotal <= 0) {
      alert("Complete todos los campos correctamente.");
      return;
    }

    const nuevoGasto = { nombre, montoTotal, categoriaTotal };
    gastos.push(nuevoGasto);
    localStorage.setItem("gastos", JSON.stringify(gastos));

    // limpiar inputs
    nombreGasto.value = "";
    montoGasto.value = "";

    renderGastos();
    actualizarTotales();

    // ---------- funciones ----------
    function renderGastos() {
      // Limpia fallback list si existe
      if (listaGastosFallback) listaGastosFallback.innerHTML = "";

      // Si existen columnas por categoría, limpiarlas
      document.querySelectorAll(".listaCategoria").forEach(div => {
        if (div) div.innerHTML = "";

        // Totales por categoría
        const categorias = ["vivienda", "comida", "transporte", "ocio"];
        const totalesPorCat = categorias.reduce((acc, c) => { acc[c] = 0; return acc; }, {});

        // Recorremos gastos por su índice global (para eliminar con índice seguro)
        gastos.forEach((g, globalIndex) => {
          // suma por categoría
          if (totalesPorCat.hasOwnProperty(g.categoria)) totalesPorCat[g.categoria] += g.monto;

          // Intentamos colocar en la columna correspondiente
          const contenedorColumna = document.querySelector(`#col-${g.categoria.replace(/[^a-zA-Z0-9_-]/g, '')} .listaCategoria`);

          // Si la columna existe (nuevo layout), agregamos ahí
          if (contenedorColumna) {
            const item = crearItemGasto(g, globalIndex);
            contenedorColumna.appendChild(item);
          } else if (listaGastosFallback) {
            // Sino, agregamos al fallback (versión antigua)
            const item = document.createElement("div");
            item.textContent = `${g.nombre} - $${g.monto} (${g.categoria})`;
            const btnEliminar = document.createElement("button");
            btnEliminar.textContent = "❌";
            btnEliminar.style.marginLeft = "10px";
            btnEliminar.onclick = () => eliminarGasto(globalIndex);
            item.appendChild(btnEliminar);
            listaGastosFallback.appendChild(item);
          }

          // Actualizar totales por columna si existen elementos .totalCategoria
          categorias.forEach(cat => {
            const totalEl = document.querySelector(`#col-${cat} .totalCategoria`);
            if (totalEl) totalEl.textContent = `Total: $${totalesPorCat[cat]}`;

            // Si no hay columnas, actualizamos el texto general de totales en #totales (fallback)
            if (!document.querySelector(`#col-vivienda .listaCategoria`) && totales) {
              const totalGastos = gastos.reduce((a, b) => a + b.monto, 0);
              const saldo = ingresos - totalGastos;
              totales.textContent = `Ingresos: $${ingresos} | Gastos: $${totalGastos} | Saldo: $${saldo}`;
            }
          }

  function crearItemGasto(gasto, globalIndex) {
              const item = document.createElement("div");
              const left = document.createElement("span");
              left.textContent = `${gasto.nombre}`;
              const right = document.createElement("span");
              right.textContent = `$${gasto.monto}`;
              right.style.marginLeft = "8px";
              // boton eliminar
              const btn = document.createElement("button");
              btn.textContent = "❌";
              btn.onclick = () => eliminarGasto(globalIndex);

              // estructura flexible
              item.style.display = "flex";
              item.style.justifyContent = "space-between";
              item.style.alignItems = "center";
              item.appendChild(left);

              const rightWrap = document.createElement("div");
              rightWrap.style.display = "flex";
              rightWrap.style.gap = "8px";
              rightWrap.appendChild(right);
              rightWrap.appendChild(btn);

              item.appendChild(rightWrap);
              return item;
            }

  function eliminarGasto(index) {
              if (index < 0 || index >= gastos.length) return;
              gastos.splice(index, 1);
              localStorage.setItem("gastos", JSON.stringify(gastos));
              renderGastos();
              actualizarTotales();
            }

  function actualizarTotales() {
              const totalGastos = gastos.reduce((acc, g) => acc + g.monto, 0);
              const saldo = ingresos - totalGastos;

              // Totales por categoría (para mostrar en el bloque general si hace falta)
              const categorias = ["vivienda", "comida", "transporte", "ocio"];
              const porCategoria = categorias.map(cat => {
                const suma = gastos.filter(g => g.categoria === cat).reduce((a, b) => a + b.monto, 0);
                return `${cat}: $${suma}`;
              }).join(" | ");

              if (totales) {
                totales.textContent = `Ingresos: $${ingresos} | Gastos: $${totalGastos} | Saldo: $${saldo} | ${porCategoria}`;
              }

              if (saldo < 0) {
                // aviso en consola (no spamear alerts)
                console.warn("⚠️ Has excedido tu presupuesto.");
              }
            }
              /* ==== BOTÓN LIMPIAR ==== */
              .acciones {
                text- align: center;
          margin - top: 1.5rem;
        }

#limpiarTodo {
          background- color: #e53935;
        color: white;
        border: none;
        padding: 0.7rem 1.2rem;
        border - radius: var(--radio);
        font - size: 1rem;
        cursor: pointer;
        transition: background 0.3s ease;
      }

#limpiarTodo: hover {
        background- color: #c62828;
    }
