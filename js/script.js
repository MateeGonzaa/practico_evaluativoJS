document.addEventListener("DOMContentLoaded", () => {
  let libros = JSON.parse(localStorage.getItem("libros")) || [];
  let ordenAsc = true;

  const form = document.getElementById("formLibro");
  const titulo = document.getElementById("titulo");
  const autor = document.getElementById("autor");
  const anio = document.getElementById("anio");
  const genero = document.getElementById("genero");
  const editIndex = document.getElementById("editIndex");
  const filtroTitulo = document.getElementById("filtroTitulo");
  const filtroGenero = document.getElementById("filtroGenero");
  const tabla = document.querySelector("#tablaLibros tbody");
  const estadisticas = document.getElementById("estadisticas");

  form.addEventListener("submit", guardarLibro);
  filtroTitulo.addEventListener("input", mostrarLibros);
  filtroGenero.addEventListener("change", mostrarLibros);
  document.getElementById("ordenarBtn").addEventListener("click", ordenarPorAnio);

  function guardarLibro(e) {
    e.preventDefault();
    const nuevo = {
      titulo: titulo.value.trim(),
      autor: autor.value.trim(),
      anio: parseInt(anio.value),
      genero: genero.value,
      leido: false 
    };

    if (!nuevo.titulo || !nuevo.autor || !nuevo.anio || !nuevo.genero)
      return alert("Completa todos los campos");

    if (nuevo.anio < 1900 || nuevo.anio > new Date().getFullYear())
      return alert("Año fuera de rango");

    const repetido = libros.some((a,b) =>
      a.titulo.toLowerCase() === nuevo.titulo.toLowerCase() &&
      a.autor.toLowerCase() === nuevo.autor.toLowerCase() &&
      b != editIndex.value
    );
    if (repetido) return alert("Libro ya registrado");

    if (editIndex.value !== "") {
      libros[editIndex.value] = nuevo;
      editIndex.value = "";
    } else {
      libros.push(nuevo);
    }

    form.reset();
    guardarYMostrar();
  }

  function guardarYMostrar() {
    localStorage.setItem("libros", JSON.stringify(libros));
    mostrarLibros();
  }

  function mostrarLibros() {
    tabla.innerHTML = "";
    const texto = filtroTitulo.value.toLowerCase();
    const generoSel = filtroGenero.value;
    const filtrados = libros.filter(a =>
      a.titulo.toLowerCase().includes(texto) &&
      (!generoSel || a.genero === generoSel)
    );

    filtrados.forEach((a, b) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${b + 1}</td>
        <td>${a.titulo}</td>
        <td>${a.autor}</td>
        <td>${a.anio}</td>
        <td>${a.genero}</td>
        <td>
          <button onclick="editar(${b})">Editar</button>
          <button onclick="eliminar(${b})">Eliminar</button>
          <button onclick="marcarLeido(${b})">${a.leido ? 'Marcar no leído' : 'Marcar leído'}</button>
        </td>
      `;
      tabla.appendChild(fila);
    });

    actualizarGeneros();
    mostrarEstadisticas();
  }

  window.editar = (a) => {
    const b = libros[a];
    titulo.value = b.titulo;
    autor.value = b.autor;
    anio.value = b.anio;
    genero.value = b.genero;
    editIndex.value = a;
  };

  window.eliminar = (a) => {
    if (confirm("¿Eliminar este libro?")) {
      libros.splice(a, 1);
      guardarYMostrar();
    }
  };

  window.marcarLeido = (index) => {
    libros[index].leido = !libros[index].leido; 
    guardarYMostrar(); 
  };

  function actualizarGeneros() {
    filtroGenero.innerHTML = '<option value="">Filtrar por género</option>';
  }

  function mostrarEstadisticas() {
    if (!libros.length) {
      estadisticas.innerText = "No hay libros registrados.";
      return;
    }
    const total = libros.length;
    const promedio = libros.reduce((sum, libro) => sum + libro.anio) / total;
    const posteriores2010 = libros.filter(a => a.anio > 2010).length;
    const antiguo = libros.reduce((a, b) => a.anio < b.anio ? a : b);
    const reciente = libros.reduce((a, b) => a.anio > b.anio ? a : b);
    const leidos = libros.filter(libro => libro.leido).length;
    const noLeidos = total - leidos;

    estadisticas.innerHTML = `
      Total: ${total}<br>
      Promedio año: ${promedio.toFixed(2)}<br>
      Posteriores a 2010: ${posteriores2010}<br>
      Más antiguo: ${antiguo.titulo} (${antiguo.anio})<br>
      Más reciente: ${reciente.titulo} (${reciente.anio})<br>
      Libros leídos: ${leidos}<br>
      Libros no leídos: ${noLeidos}
    `;
  }

  function ordenarPorAnio() {
    libros.sort((a, b) => ordenAsc ? a.anio - b.anio : b.anio - a.anio);
    ordenAsc = !ordenAsc;
    mostrarLibros();
  }

  mostrarLibros();
});
