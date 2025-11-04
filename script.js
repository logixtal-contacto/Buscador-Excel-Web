let datos = [];
const perfil = new URLSearchParams(window.location.search).get('perfil');

document.addEventListener('DOMContentLoaded', () => {
  const adminPanel = document.getElementById('adminPanel');
  const titulo = document.getElementById('titulo');

  if (perfil === 'admin') {
    adminPanel.classList.remove('hidden');
    titulo.textContent = "👑 Panel del Administrador";
  } else {
    titulo.textContent = "🔍 Buscador de Información";
    cargarDesdeLocalStorage(); // carga base guardada por el admin
  }

  document.getElementById('inputBuscar').addEventListener('input', filtrarTabla);
  document.getElementById('inputExcel')?.addEventListener('change', leerExcel);
  document.getElementById('btnGuardar')?.addEventListener('click', guardarEnLocalStorage);
});

function leerExcel(event) {
  const archivo = event.target.files[0];
  if (!archivo) return;

  const lector = new FileReader();
  lector.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    datos = XLSX.utils.sheet_to_json(hoja, { header: 1 });
    mostrarTabla(datos);
  };
  lector.readAsArrayBuffer(archivo);
}

function mostrarTabla(data) {
  const tabla = document.getElementById('tablaResultados');
  const thead = tabla.querySelector('thead');
  const tbody = tabla.querySelector('tbody');

  thead.innerHTML = '';
  tbody.innerHTML = '';

  if (data.length === 0) {
    tabla.classList.add('hidden');
    return;
  }

  // Cabecera
  const encabezados = data[0];
  const filaEncabezado = document.createElement('tr');
  encabezados.forEach(texto => {
    const th = document.createElement('th');
    th.textContent = texto;
    th.className = 'border px-4 py-2';
    filaEncabezado.appendChild(th);
  });
  thead.appendChild(filaEncabezado);

  // Filas
  data.slice(1).forEach(fila => {
    const tr = document.createElement('tr');
    fila.forEach(celda => {
      const td = document.createElement('td');
      td.textContent = celda || '';
      td.className = 'border px-4 py-2';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  tabla.classList.remove('hidden');
}

function filtrarTabla() {
  const texto = document.getElementById('inputBuscar').value.toLowerCase();

  if (!texto) {
    // En el modo usuario no mostrar nada al inicio
    if (perfil !== 'admin') {
      document.getElementById('tablaResultados').classList.add('hidden');
      return;
    }
    mostrarTabla(datos);
    return;
  }

  const encabezados = datos[0];
  const filasFiltradas = datos.slice(1).filter(fila =>
    fila.some(celda => celda && celda.toString().toLowerCase().includes(texto))
  );

  if (filasFiltradas.length > 0) {
    mostrarTabla([encabezados, ...filasFiltradas]);
  } else {
    document.getElementById('tablaResultados').classList.add('hidden');
  }
}

function guardarEnLocalStorage() {
  if (datos.length === 0) {
    alert("Primero carga un archivo Excel.");
    return;
  }
  localStorage.setItem('baseExcel', JSON.stringify(datos));
  alert("✅ Base de datos guardada correctamente. Los usuarios ya pueden buscar.");
}

function cargarDesdeLocalStorage() {
  const guardado = localStorage.getItem('baseExcel');
  if (!guardado) {
    alert("⚠️ No hay base de datos cargada. Pide al administrador que la suba.");
    return;
  }
  datos = JSON.parse(guardado);
}
