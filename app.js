/* HU1: alta de producto — validates fields, saves to localStorage
   and shows the product in the list.
   HU4: allows adding and subtracting one unit from the stock.
   HU5: alerta faltantes (stock <= mínimo) — resalta en rojo + contador.
   HU6: alerta vencimiento próximo 7 días (resalta amarillo + contador).
   HU7: lista de compras automática generada desde los faltantes.
   HU9: deletes a product after asking for confirmation.
   HU10: marcar comprado repone el stock del faltante a su mínimo.
   HU11: resumen/dashboard con tarjetas de números reales.
   HU12: exportar e importar los datos en formato JSON. */

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
const tablaCompras = document.querySelector('#tabla-compras');
const tablaComprasBody = tablaCompras.querySelector('tbody');
const listaComprasVacia = document.querySelector('#lista-compras-vacia');
const feedback = document.querySelector('#feedback');
const alertaVencimientos = document.querySelector('#alerta-vencimientos');
const contadorVencimientos = document.querySelector('#contador-vencimientos');
const contadorVencimientoSingular = document.querySelector('#contador-vencimiento');
const alertaFaltantes = document.querySelector('#alerta-faltantes');
const contadorFaltantes = document.querySelector('#contador-faltantes');
const resumenProductos = document.querySelector('#resumen-productos');
const resumenUnidades = document.querySelector('#resumen-unidades');
const resumenFaltantes = document.querySelector('#resumen-faltantes');
const resumenVencidos = document.querySelector('#resumen-vencidos');
const exportarDatosButton = document.querySelector('#exportar-datos');
const importarDatosButton = document.querySelector('#importar-datos');
const archivoImportar = document.querySelector('#archivo-importar');
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

/* HU7: la lista de compras toma los productos faltantes (stock por debajo
   del mínimo) y sugiere comprar lo que falta para volver al mínimo.
   Un producto que está justo en el mínimo no entra en la lista:
   no hace falta comprar nada. */
function getShoppingListItems(products) {
  return products
    .filter((item) => item.cantidad < item.minimo)
    .map((item) => ({ ...item, comprar: item.minimo - item.cantidad }));
}

function renderShoppingList() {
  const items = getShoppingListItems(loadProducts());

  tablaCompras.hidden = items.length === 0;
  listaComprasVacia.hidden = items.length > 0;

  tablaComprasBody.replaceChildren();

  for (const item of items) {
    const row = document.createElement('tr');

    const values = [
      item.nombre,
      item.cantidad,
      item.minimo,
      item.comprar,
    ];

    values.forEach((value, index) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      if (index === values.length - 1) {
        cell.className = 'comprar-cantidad';
      }
      row.appendChild(cell);
    });

    const actionsCell = document.createElement('td');
    actionsCell.className = 'compra-acciones';

    const buyButton = document.createElement('button');
    buyButton.type = 'button';
    buyButton.className = 'quantity-button buy-button';
    buyButton.dataset.action = 'buy';
    buyButton.dataset.id = item.id;
    buyButton.textContent = 'Comprar';
    buyButton.title = `Marcar comprado a ${item.nombre}`;

    actionsCell.appendChild(buyButton);
    row.appendChild(actionsCell);

    tablaComprasBody.appendChild(row);
  }
}

/* HU10: comprar repone el stock del faltante a su mínimo (cantidad += comprar);
   al volver al mínimo deja de aparecer en la lista de compras. */
function markAsBought(productId) {
  const products = loadProducts();
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return;
  }

  product.cantidad += product.minimo - product.cantidad;
  saveProducts(products);
  renderList();
  showFeedback(`"${product.nombre}" comprado. Stock actualizado.`);
}

/* HU5: un producto está faltante cuando su stock llega o baja del mínimo. */
function isLowStock(product) {
  return product.cantidad <= product.minimo;
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

/* HU11: tarjetas del resumen con números reales calculados de los productos. */
function renderResumen() {
  const products = loadProducts();

  const totalProductos = products.length;
  const totalUnidades = products.reduce(
    (sum, item) => sum + item.cantidad,
    0
  );
  const totalFaltantes = products.filter((item) => isLowStock(item)).length;
  const totalVencidos = products.filter((item) =>
    isExpiringSoon(item.vencimiento)
  ).length;

  if (resumenProductos) {
    resumenProductos.textContent = String(totalProductos);
  }
  if (resumenUnidades) {
    resumenUnidades.textContent = String(totalUnidades);
  }
  if (resumenFaltantes) {
    resumenFaltantes.textContent = String(totalFaltantes);
  }
  if (resumenVencidos) {
    resumenVencidos.textContent = String(totalVencidos);
  }
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

  const countFaltantes = products.filter((item) => isLowStock(item)).length;

  if (alertaFaltantes) {
    alertaFaltantes.hidden = countFaltantes === 0;
  }
  if (contadorFaltantes) {
    contadorFaltantes.textContent = String(countFaltantes);
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

    if (isLowStock(product)) {
      row.classList.add('faltante');
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

  renderShoppingList();
  renderResumen();
}



function showFeedback(message) {
  feedback.textContent = message;
  feedback.hidden = false;
  setTimeout(() => {
    feedback.hidden = true;
  }, 3000);
}

function isValidImportedItem(item) {
  if (!item || typeof item !== 'object') {
    return false;
  }
  if (typeof item.nombre !== 'string' || !item.nombre.trim()) {
    return false;
  }
  if (item.cantidad === undefined || !Number.isInteger(Number(item.cantidad)) || Number(item.cantidad) < 0) {
    return false;
  }
  if (item.minimo !== undefined && (!Number.isInteger(Number(item.minimo)) || Number(item.minimo) < 0)) {
    return false;
  }
  if (item.vencimiento !== undefined && typeof item.vencimiento !== 'string') {
    return false;
  }
  return true;
}

function exportarDatos() {
  const products = loadProducts();
  if (products.length === 0) {
    showFeedback('No hay datos para exportar.');
    return;
  }

  const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'stock-productos.json';
  link.click();
  URL.revokeObjectURL(url);
}

function importarDatos(file) {
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    let parsed;
    try {
      parsed = JSON.parse(reader.result);
    } catch {
      showFeedback('El archivo no tiene un formato válido.');
      return;
    }

    if (!Array.isArray(parsed) || !parsed.every(isValidImportedItem)) {
      showFeedback('El archivo no tiene un formato válido.');
      return;
    }

    const items = parsed.map((item) => ({
      id: typeof item.id === 'string' && item.id ? item.id : crypto.randomUUID(),
      nombre: item.nombre.trim(),
      cantidad: Number(item.cantidad),
      minimo: item.minimo === undefined ? 0 : Number(item.minimo),
      vencimiento: item.vencimiento === undefined ? '' : item.vencimiento,
    }));

    saveProducts(items);
    renderList();
    showFeedback(`"${items.length}" productos importados correctamente.`);
  };
  reader.onerror = () => {
    showFeedback('El archivo no tiene un formato válido.');
  };
  reader.readAsText(file);
}

exportarDatosButton.addEventListener('click', exportarDatos);

importarDatosButton.addEventListener('click', () => {
  archivoImportar.click();
});

archivoImportar.addEventListener('change', () => {
  importarDatos(archivoImportar.files[0]);
  archivoImportar.value = '';
});

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

tablaComprasBody.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action="buy"]');
  if (!button) {
    return;
  }

  markAsBought(button.dataset.id);
});

renderList();
