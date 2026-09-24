/* HU1: alta de producto — validates fields, saves to localStorage
   and shows the product in the list. */

const STORAGE_KEY = 'stock:productos';
const filtroNombre = document.querySelector('#filtro-nombre');
const filtroCategoria = document.querySelector('#filtro-categoria');
const form = document.querySelector('#form-producto');
const tabla = document.querySelector('#tabla-productos');
const tablaBody = tabla.querySelector('tbody');
const tablaVacia = document.querySelector('#tabla-vacia');
const feedback = document.querySelector('#feedback');

function loadProducts() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return []; // corrupted storage must not break the page
  }
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function setFieldError(name, message) {
  const input = form.elements[name];
  const errorEl = form.querySelector(`[data-error-for="${name}"]`);
  input.classList.toggle('invalid', Boolean(message));
  errorEl.textContent = message || '';
}

function clearErrors() {
  form.querySelectorAll('.error').forEach((el) => (el.textContent = ''));
  form.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));
}

function validateForm() {
  const { nombre, categoria, cantidad, minimo, vencimiento } = form.elements;
  const errors = [];

  if (!nombre.value.trim()) {
    errors.push(['nombre', 'Ingresá el nombre del producto.']);
  }
  if (!categoria.value) {
    errors.push(['categoria', 'Elegí una categoría.']);
  }

  const cantidadVal = Number(cantidad.value);
  if (cantidad.value === '' || !Number.isInteger(cantidadVal) || cantidadVal < 0) {
    errors.push(['cantidad', 'La cantidad debe ser un número entero mayor o igual a 0.']);
  }

  const minimoVal = Number(minimo.value);
  if (minimo.value === '' || !Number.isInteger(minimoVal) || minimoVal < 0) {
    errors.push(['minimo', 'El stock mínimo debe ser un número entero mayor o igual a 0.']);
  }

  if (!vencimiento.value) {
    errors.push(['vencimiento', 'Ingresá la fecha de vencimiento.']);
  }

  return errors;
}

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

function renderList() {
  const products = loadProducts();

  const nombreBuscado = filtroNombre.value.trim().toLowerCase();
  const categoriaBuscada = filtroCategoria.value;

  const productosFiltrados = products.filter((product) => {
    const coincideNombre =
      product.nombre.toLowerCase().includes(nombreBuscado);

    const coincideCategoria =
      categoriaBuscada === '' || product.categoria === categoriaBuscada;

    return coincideNombre && coincideCategoria;
  });

  tablaBody.replaceChildren();

  tabla.hidden = productosFiltrados.length === 0;
  tablaVacia.hidden = productosFiltrados.length > 0;

  for (const product of productosFiltrados) {
    const row = document.createElement('tr');

    const values = [
      product.nombre,
      product.categoria,
      product.cantidad,
      product.minimo,
      formatDate(product.vencimiento),
    ];

    for (const value of values) {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    }

    tablaBody.appendChild(row);
  }
}



function showFeedback(message) {
  feedback.textContent = message;
  feedback.hidden = false;
  setTimeout(() => {
    feedback.hidden = true;
  }, 3000);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearErrors();

  const errors = validateForm();
  if (errors.length > 0) {
    for (const [name, message] of errors) {
      setFieldError(name, message);
    }
    return;
  }

  const product = {
    id: crypto.randomUUID(),
    nombre: form.elements.nombre.value.trim(),
    categoria: form.elements.categoria.value.trim(),
    cantidad: Number(form.elements.cantidad.value),
    minimo: Number(form.elements.minimo.value),
    vencimiento: form.elements.vencimiento.value,
  };

  const products = loadProducts();
  products.push(product);
  saveProducts(products);

  form.reset();
  form.elements.nombre.focus();
  renderList();
  showFeedback(`"${product.nombre}" guardado correctamente.`);
});


filtroNombre.addEventListener('input', renderList);
filtroCategoria.addEventListener('change', renderList);

renderList();
