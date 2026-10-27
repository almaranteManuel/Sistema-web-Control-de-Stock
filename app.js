/* HU1: alta de producto — validates fields, saves to localStorage
   and shows the product in the list.
   HU4: allows adding and subtracting one unit from the stock.
   HU6: alerta vencimiento próximo 7 días (resalta amarillo + contador).
   HU9: deletes a product after asking for confirmation. */

const STORAGE_KEY = 'stock:productos';
const filtroNombre = document.querySelector('#filtro-nombre');
const filtroCategoria = document.querySelector('#filtro-categoria');
const form = document.querySelector('#form-producto');
const formTitle = document.querySelector('#titulo-formulario');
const submitButton = document.querySelector('#guardar-producto');
const cancelEditButton = document.querySelector('#cancelar-edicion');
const tabla = document.querySelector('#tabla-productos');
const tablaBody = tabla.querySelector('tbody');
const tablaVacia = document.querySelector('#tabla-vacia');
const feedback = document.querySelector('#feedback');
const alertaVencimientos = document.querySelector('#alerta-vencimientos');
const contadorVencimientos = document.querySelector('#contador-vencimientos');
const contadorVencimientoSingular = document.querySelector('#contador-vencimiento');
let editingProductId = null;

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

function getDaysUntilExpiration(isoDate) {
  if (!isoDate) {
    return Infinity;
  }
  const [year, month, day] = isoDate.split('-').map(Number);
  const expDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expDate.setHours(0, 0, 0, 0);
  const diffTime = expDate.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

function isExpiringSoon(isoDate) {
  const days = getDaysUntilExpiration(isoDate);
  return days <= 7;
}

function changeQuantity(productId, change) {
  const products = loadProducts();
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return;
  }

  if (change < 0 && product.cantidad === 0) {
    showFeedback(`"${product.nombre}" ya tiene cantidad 0.`);
    return;
  }

  product.cantidad += change;
  saveProducts(products);
  renderList();
  showFeedback(`Cantidad de "${product.nombre}" actualizada.`);
}

function deleteProduct(productId) {
  const products = loadProducts();
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return;
  }

  if (!confirm(`¿Seguro que querés eliminar "${product.nombre}"?`)) {
    return;
  }

  saveProducts(products.filter((item) => item.id !== productId));
  if (editingProductId === productId) {
    form.reset();
    clearErrors();
    leaveEditMode();
  }
  renderList();
  showFeedback(`"${product.nombre}" eliminado.`);
}

function enterEditMode(productId) {
  const product = loadProducts().find((item) => item.id === productId);
  if (!product) {
    return;
  }

  editingProductId = product.id;
  form.elements.nombre.value = product.nombre;
  form.elements.categoria.value = product.categoria;
  form.elements.cantidad.value = product.cantidad;
  form.elements.minimo.value = product.minimo;
  form.elements.vencimiento.value = product.vencimiento;
  clearErrors();
  formTitle.textContent = 'Editar producto';
  submitButton.textContent = 'Guardar cambios';
  cancelEditButton.hidden = false;
  form.elements.nombre.focus();
}

function leaveEditMode() {
  editingProductId = null;
  formTitle.textContent = 'Alta de producto';
  submitButton.textContent = 'Guardar producto';
  cancelEditButton.hidden = true;
}

function renderList() {
  const products = loadProducts();

  const countVencimientos = products.filter((item) =>
    isExpiringSoon(item.vencimiento)
  ).length;

  if (alertaVencimientos) {
    alertaVencimientos.hidden = countVencimientos === 0;
  }
  if (contadorVencimientoSingular) {
    contadorVencimientoSingular.textContent = String(countVencimientos);
  } else if (contadorVencimientos) {
    contadorVencimientos.textContent = String(countVencimientos);
  }

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

    if (isExpiringSoon(product.vencimiento)) {
      row.classList.add('vencimiento-proximo', 'alerta-vencimiento');
    }

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

    const actionsCell = document.createElement('td');
    actionsCell.className = 'product-actions';

    const subtractButton = document.createElement('button');
    subtractButton.type = 'button';
    subtractButton.className = 'quantity-button';
    subtractButton.dataset.action = 'subtract';
    subtractButton.dataset.id = product.id;
    subtractButton.textContent = '-1';
    subtractButton.title = `Descontar una unidad de ${product.nombre}`;
    subtractButton.disabled = product.cantidad === 0;

    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'quantity-button';
    addButton.dataset.action = 'add';
    addButton.dataset.id = product.id;
    addButton.textContent = '+1';
    addButton.title = `Sumar una unidad a ${product.nombre}`;

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'quantity-button';
    editButton.dataset.action = 'edit';
    editButton.dataset.id = product.id;
    editButton.textContent = 'Editar';
    editButton.title = `Editar ${product.nombre}`;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'quantity-button delete-button';
    deleteButton.dataset.action = 'delete';
    deleteButton.dataset.id = product.id;
    deleteButton.textContent = 'Eliminar';
    deleteButton.title = `Eliminar ${product.nombre}`;

    actionsCell.append(subtractButton, addButton, editButton, deleteButton);
    row.appendChild(actionsCell);
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

  const productValues = {
    nombre: form.elements.nombre.value.trim(),
    categoria: form.elements.categoria.value.trim(),
    cantidad: Number(form.elements.cantidad.value),
    minimo: Number(form.elements.minimo.value),
    vencimiento: form.elements.vencimiento.value,
  };

  const products = loadProducts();
  const wasEditing = editingProductId !== null;
  let product;

  if (editingProductId) {
    const productIndex = products.findIndex((item) => item.id === editingProductId);
    if (productIndex === -1) {
      form.reset();
      clearErrors();
      leaveEditMode();
      showFeedback('El producto ya no existe. Volvé a seleccionarlo para editar.');
      renderList();
      return;
    }

    product = { ...products[productIndex], ...productValues, id: editingProductId };
    products[productIndex] = product;
  } else {
    product = { id: crypto.randomUUID(), ...productValues };
    products.push(product);
  }

  saveProducts(products);

  form.reset();
  clearErrors();
  leaveEditMode();
  form.elements.nombre.focus();
  renderList();
  showFeedback(`"${product.nombre}" ${wasEditing ? 'actualizado' : 'guardado'} correctamente.`);
});

cancelEditButton.addEventListener('click', () => {
  form.reset();
  clearErrors();
  leaveEditMode();
  form.elements.nombre.focus();
});


filtroNombre.addEventListener('input', renderList);
filtroCategoria.addEventListener('change', renderList);

tablaBody.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) {
    return;
  }

  if (button.dataset.action === 'delete') {
    deleteProduct(button.dataset.id);
    return;
  }

  if (button.dataset.action === 'edit') {
    enterEditMode(button.dataset.id);
    return;
  }

  if (button.dataset.action !== 'add' && button.dataset.action !== 'subtract') {
    return;
  }

  const change = button.dataset.action === 'add' ? 1 : -1;
  changeQuantity(button.dataset.id, change);
});

renderList();
