/* =========================================================
   CONFIGURACIÓN
   SHEET_ID ya apunta a la hoja "Registro de Ventas - Blue Team
   Realty" creada en tu Drive. Si más adelante usas otra hoja,
   solo cambia el ID (está en la URL de la hoja, entre /d/ y /edit).
========================================================= */
const CONFIG = {
  SHEET_ID: "11MfuU-R8fd4AMozsZW10PwOzfPJ9OFP1VzTmXMPf0Wg",
  GID: "0", // pestaña de la hoja (0 = la primera)
  REFRESH_INTERVAL_MS: 60000, // 1 minuto
  // URL del "Publicar en la web" de Google Sheets (Archivo → Compartir → Publicar en la web).
  // Cambia esta línea si vuelves a publicar la hoja o apuntas a otra.
  SHEET_EMBED_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTjQjwVjCjN6XOFLojw-92EekWK6yNLeh2nNU7cmogT7Z2l6wj6WbmhTJDhbWffRlawV42ZPrX23hT7/pubhtml?widget=true&headers=false",
};

const COLUMNAS = {
  fecha: "Fecha",
  agente: "Agente",
  leads: "Leads Atendidos",
  llamadas: "Llamadas Agendadas",
  visitas: "Visitas Agendadas",
  cotizaciones: "Cotizaciones Enviadas",
  rentas: "Rentas Cerradas",
  ventas: "Ventas Cerradas",
};

let filasCrudas = [];
let chartAgentes = null;

function urlCSV() {
  return `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:csv&gid=${CONFIG.GID}&_=${Date.now()}`;
}

async function cargarDatos() {
  try {
    const resp = await fetch(urlCSV());
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const texto = await resp.text();

    const parsed = Papa.parse(texto, { header: true, skipEmptyLines: true });
    filasCrudas = parsed.data
      .map((r) => ({
        fecha: r[COLUMNAS.fecha],
        agente: (r[COLUMNAS.agente] || "").trim(),
        leads: Number(r[COLUMNAS.leads]) || 0,
        llamadas: Number(r[COLUMNAS.llamadas]) || 0,
        visitas: Number(r[COLUMNAS.visitas]) || 0,
        cotizaciones: Number(r[COLUMNAS.cotizaciones]) || 0,
        rentas: Number(r[COLUMNAS.rentas]) || 0,
        ventas: Number(r[COLUMNAS.ventas]) || 0,
      }))
      .filter((r) => r.agente && r.fecha);

    poblarSelectorMeses();
    renderTodo();

    document.getElementById("estadoCarga").style.display = "none";
    document.getElementById("estadoError").style.display = "none";
    document.getElementById("contenido").style.display = "block";
    document.getElementById("ultimaActualizacion").textContent =
      "Actualizado: " + new Date().toLocaleTimeString("es-MX");
  } catch (err) {
    console.error(err);
    document.getElementById("estadoCarga").style.display = "none";
    document.getElementById("contenido").style.display = filasCrudas.length ? "block" : "none";
    const el = document.getElementById("estadoError");
    el.style.display = "block";
    el.textContent =
      "No se pudo leer la hoja de Google Sheets. Revisa que esté compartida como \"Cualquier persona con el enlace: Lector\" y que el SHEET_ID en script.js sea correcto.";
  }
}

function claveMes(fechaStr) {
  const d = new Date(fechaStr);
  if (isNaN(d)) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function nombreMes(claveMes) {
  const [anio, mes] = claveMes.split("-");
  const nombres = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  return `${nombres[Number(mes) - 1]} ${anio}`;
}

function poblarSelectorMeses() {
  const select = document.getElementById("mesSelect");
  const valorPrevio = select.value;

  const meses = [...new Set(filasCrudas.map((r) => claveMes(r.fecha)).filter(Boolean))].sort();
  select.innerHTML = meses.map((m) => `<option value="${m}">${nombreMes(m)}</option>`).join("");

  if (valorPrevio && meses.includes(valorPrevio)) {
    select.value = valorPrevio;
  } else if (meses.length) {
    select.value = meses[meses.length - 1]; // el más reciente
  }

  select.onchange = renderTodo;
}

function filasDelMes() {
  const mes = document.getElementById("mesSelect").value;
  return filasCrudas.filter((r) => claveMes(r.fecha) === mes);
}

function agregarPorAgente(filas) {
  const mapa = {};
  filas.forEach((r) => {
    if (!mapa[r.agente]) {
      mapa[r.agente] = { agente: r.agente, leads: 0, llamadas: 0, visitas: 0, cotizaciones: 0, rentas: 0, ventas: 0 };
    }
    mapa[r.agente].leads += r.leads;
    mapa[r.agente].llamadas += r.llamadas;
    mapa[r.agente].visitas += r.visitas;
    mapa[r.agente].cotizaciones += r.cotizaciones;
    mapa[r.agente].rentas += r.rentas;
    mapa[r.agente].ventas += r.ventas;
  });
  return Object.values(mapa).sort((a, b) => (b.ventas + b.rentas) - (a.ventas + a.rentas));
}

function renderTodo() {
  const filas = filasDelMes();
  const porAgente = agregarPorAgente(filas);

  const totales = porAgente.reduce(
    (acc, a) => {
      acc.leads += a.leads;
      acc.llamadas += a.llamadas;
      acc.visitas += a.visitas;
      acc.cotizaciones += a.cotizaciones;
      acc.rentas += a.rentas;
      acc.ventas += a.ventas;
      return acc;
    },
    { leads: 0, llamadas: 0, visitas: 0, cotizaciones: 0, rentas: 0, ventas: 0 }
  );

  document.getElementById("totalLeads").textContent = totales.leads;
  document.getElementById("totalLlamadas").textContent = totales.llamadas;
  document.getElementById("totalVisitas").textContent = totales.visitas;
  document.getElementById("totalCotizaciones").textContent = totales.cotizaciones;
  document.getElementById("totalRentas").textContent = totales.rentas;
  document.getElementById("totalVentas").textContent = totales.ventas;

  document.getElementById("ftLeads").textContent = totales.leads;
  document.getElementById("ftLlamadas").textContent = totales.llamadas;
  document.getElementById("ftVisitas").textContent = totales.visitas;
  document.getElementById("ftCotizaciones").textContent = totales.cotizaciones;
  document.getElementById("ftRentas").textContent = totales.rentas;
  document.getElementById("ftVentas").textContent = totales.ventas;

  const tbody = document.getElementById("tablaAgentesBody");
  tbody.innerHTML = porAgente
    .map(
      (a) => `<tr>
        <td>${a.agente}</td>
        <td>${a.leads}</td>
        <td>${a.llamadas}</td>
        <td>${a.visitas}</td>
        <td>${a.cotizaciones}</td>
        <td>${a.rentas}</td>
        <td><strong>${a.ventas}</strong></td>
      </tr>`
    )
    .join("");

  renderGrafica(porAgente);
}

function renderGrafica(porAgente) {
  const ctx = document.getElementById("chartAgentes").getContext("2d");
  const labels = porAgente.map((a) => a.agente);
  const dataRentas = porAgente.map((a) => a.rentas);
  const dataVentas = porAgente.map((a) => a.ventas);

  if (chartAgentes) chartAgentes.destroy();

  chartAgentes = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Rentas cerradas", data: dataRentas, backgroundColor: "#7FA6C9" },
        { label: "Ventas cerradas", data: dataVentas, backgroundColor: "#1F3A5F" },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
    },
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("sheetEmbed").src = CONFIG.SHEET_EMBED_URL;
  cargarDatos();
  document.getElementById("btnRefrescar").addEventListener("click", cargarDatos);
  setInterval(cargarDatos, CONFIG.REFRESH_INTERVAL_MS);
});
