# Sistema web de control de stock

[![Estado de compilación](https://img.shields.io/badge/build-manual-lightgrey?logo=github)](https://github.com/almaranteManuel/Sistema-web-Control-de-Stock)
[![Versión](https://img.shields.io/badge/version-MVP--0.1.0-blue)](https://github.com/almaranteManuel/Sistema-web-Control-de-Stock/commits/main)
[![Licencia](https://img.shields.io/badge/license-no%20declarada-lightgrey)](https://github.com/almaranteManuel/Sistema-web-Control-de-Stock)

Aplicación web sencilla para registrar y consultar el stock de una despensa o pequeño comercio. Está pensada para encargados de compras, familias y empleados que necesitan saber qué productos hay disponibles, detectar faltantes y anticipar vencimientos sin depender de anotaciones en papel o mensajes. Resuelve el control cotidiano de inventario con una interfaz responsive, persistencia local y una lista de compras automática.

> **Estado del proyecto:** MVP funcional. Es un sitio estático: no requiere backend, base de datos, login ni instalación de paquetes. El repositorio todavía no declara una licencia formal ni un pipeline de CI; por eso las insignias lo indican explícitamente.

## Funcionalidades

- Alta, edición y eliminación de productos.
- Datos de producto: nombre, categoría, cantidad, stock mínimo y vencimiento.
- Búsqueda por nombre y filtro por categoría.
- Incremento o descuento de unidades, sin permitir stock negativo.
- Alertas cuando el stock es menor o igual al mínimo.
- Alerta de productos que vencen dentro de los próximos 7 días.
- Resumen de productos, unidades, faltantes y próximos vencimientos.
- Lista de compras automática para recuperar el stock mínimo.
- Persistencia automática en `localStorage`.
- Exportación e importación de datos en formato JSON.
- Diseño responsive para pantallas pequeñas y grandes.

## Requisitos

- Navegador moderno con soporte para JavaScript, `localStorage`, `FileReader`, `Blob` y `crypto.randomUUID`.
- Python 3 para levantar un servidor local (recomendado). No se requiere Node.js, npm ni una base de datos.
- Git, únicamente si se desea clonar el repositorio desde la terminal.

## Instalación y ejecución

### Opción recomendada: clonar y servir localmente

```bash
git clone https://github.com/almaranteManuel/Sistema-web-Control-de-Stock.git
cd Sistema-web-Control-de-Stock
python3 -m http.server 8000
```

Luego abrir [http://localhost:8000](http://localhost:8000) en el navegador.

Para detener el servidor, volver a la terminal y presionar `Ctrl+C`.

### Ejecución sin clonar

También se puede descargar el repositorio como ZIP, descomprimirlo y abrir `index.html` con un navegador moderno. El servidor local es preferible porque reproduce mejor el entorno de una aplicación web y facilita las pruebas desde otros dispositivos de la red.

## Uso básico

1. En **Alta de producto**, completar nombre, categoría, cantidad, stock mínimo y fecha de vencimiento.
2. Presionar **Guardar producto**. El producto aparecerá en la tabla y los indicadores se actualizarán.
3. Usar `+` o `−` para registrar compras o consumos.
4. Buscar por nombre o seleccionar una categoría para filtrar la tabla.
5. Revisar las alertas de faltantes y vencimientos próximos.
6. Desde **Lista de compras**, presionar **Marcar comprado** para reponer automáticamente la cantidad sugerida.
7. Usar **Exportar JSON** para descargar una copia y **Importar JSON** para restaurarla en otro navegador o sesión.

### Ejemplo de escenario

Para controlar harina, cargar:

| Campo | Valor |
|---|---|
| Nombre | Harina 000 |
| Categoría | Comestibles |
| Cantidad | 2 |
| Stock mínimo | 5 |
| Vencimiento | una fecha futura |

El sistema marcará el producto como faltante porque `2 <= 5` y sugerirá comprar 3 unidades para volver al mínimo. Si la fecha está dentro de los próximos 7 días, también mostrará la alerta de vencimiento.

## Persistencia y respaldo

Los productos se guardan automáticamente en el almacenamiento local del navegador bajo la clave `stock:productos`. Por tratarse de `localStorage`, los datos quedan asociados al navegador y al dispositivo; no se sincronizan entre usuarios ni se envían a un servidor.

Se recomienda exportar periódicamente el archivo `stock-productos.json`. La importación reemplaza los datos actuales por los productos contenidos en el archivo seleccionado, por lo que conviene realizar un respaldo antes de importar.

## Estructura del proyecto

```text
.
├── index.html   # estructura de la interfaz
├── style.css    # estilos responsive
└── app.js       # validaciones, inventario, alertas y persistencia
```

## Limitaciones conocidas

- No hay autenticación, multiusuario, permisos ni sincronización en la nube.
- No hay backend ni base de datos.
- No incluye lector de código de barras, facturación ni aplicación móvil nativa.
- El control de versiones del MVP se identifica como `MVP-0.1.0` en la documentación; todavía no hay una release/tag formal publicada.
- La licencia aún no fue declarada en GitHub. Hasta que se agregue una, el código no debe redistribuirse como si tuviera una licencia permisiva.

## Equipo

Vinzon Alan · Ansa Santiago · Almarante Manuel · Saenz Federico
