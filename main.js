// Espera a que el DOM esté listo y luego conecta el botón
document.addEventListener("DOMContentLoaded", function () {
  const comenzarBtn = document.getElementById("comenzarBtn");
  comenzarBtn.addEventListener("click", iniciarSimulador);
});

// Variables globales
let ingresosMensuales = 0;

// Arrays por categoría
const vivienda = [];
const comida = [];
const transporte = [];
const ocio = [];

// Función para pedir un número positivo
function pedirNumeroPositivo(mensaje) {
  let valor;
  do {
    valor = prompt(mensaje);
    if (valor === null) return null;
    valor = parseFloat(valor);
    if (isNaN(valor) || valor < 0) {
      alert("❌ Ingrese un número válido y no negativo.");
    }
  } while (isNaN(valor) || valor < 0);
  return valor;
}

// Función para ingresar ingresos
function ingresarIngresos() {
  const ingreso = pedirNumeroPositivo("Ingrese sus ingresos mensuales:");
  if (ingreso !== null) {
    ingresosMensuales = ingreso;
    console.log("💰 Ingresos registrados: $" + ingresosMensuales);
  } else {
    alert("Operación cancelada. No se ingresaron ingresos.");
  }
}

// Función para seleccionar categoría
function seleccionarCategoria() {
  let categoria = prompt(
    "Seleccione la categoría del gasto:\n1 - Vivienda\n2 - Comida\n3 - Transporte\n4 - Ocio"
  );
  switch (categoria) {
    case "1":
      return vivienda;
    case "2":
      return comida;
    case "3":
      return transporte;
    case "4":
      return ocio;
    default:
      alert("Categoría inválida. Se asignará a 'Ocio' por defecto.");
      return ocio;
  }
}

// Función para agregar gasto
function agregarGasto() {
  const nombre = prompt("Ingrese el nombre del gasto:");
  if (!nombre || nombre.trim() === "") {    
    alert("❌ El nombre del gasto no puede estar vacío.");
    return;
  }

  const monto = pedirNumeroPositivo("Ingrese el monto del gasto:");
  if (monto === null) {
    alert("Operación cancelada. No se agregó el gasto.");
    return;
  }

  const categoriaArray = seleccionarCategoria();
  categoriaArray.push({ nombre, monto });
  console.log(`🧾 Gasto agregado: ${nombre} -> $${monto}`);
}

// Función para calcular totales
function calcularTotalesPorCategoria() {
  function sumar(array) {
    return array.reduce((acc, gasto) => acc + gasto.monto, 0);
  }

  const totalVivienda = sumar(vivienda);
  const totalComida = sumar(comida);
  const totalTransporte = sumar(transporte);
  const totalOcio = sumar(ocio);

  const totalGastos = totalVivienda + totalComida + totalTransporte + totalOcio;
  const saldo = ingresosMensuales - totalGastos;

  console.log("📊 Totales por categoría:");
  console.log("🏠 Vivienda: $ " + totalVivienda);
  console.log("🍽️ Comida: $" + totalComida);
  console.log("🚗 Transporte: $" + totalTransporte);
  console.log("🎉 Ocio: $" + totalOcio);
  console.log("🧮 Total de gastos: $" + totalGastos);
  console.log("💼 Saldo disponible: $" + saldo);

  if (saldo < 0) {
    alert("⚠️ ¡Cuidado! Has excedido tu presupuesto.\nSaldo negativo: $" + saldo);
  } else if (saldo < ingresosMensuales * 0.2) {
    alert("🔔 Advertencia: Tu saldo es inferior al 20% de tu ingreso mensual.\nSaldo restante: $" + saldo);
  } else {
    alert("✅ ¡Buen trabajo! Tu saldo es saludable.\nSaldo restante: $" + saldo);
  }
}

// Función principal que se ejecuta al presionar el botón
function iniciarSimulador() {
  console.clear();
  ingresarIngresos();

  if (ingresosMensuales > 0) {
    do {
      agregarGasto();
    } while (confirm("¿Desea agregar otro gasto?"));

    calcularTotalesPorCategoria();
  }
}