# Control de Stock Despensa / Pequeño Comercio
## GDS - TUP - Trabajo Final Integrador (Plan)

**Integrantes:** Vinzon Alan, Ansa Santiago, Almarante Manuel, Saenz Federico
**Stack:** HTML + CSS + JS + localStorage (sin backend) + GitHub + GitHub Projects
**Fecha objetivo interna:** 05/11/2026 (cierre oficial aula: 10/11/2026)

---

## 1. Problema y propuesta

**Problema:** En hogares y kioscos chicos no se sabe qué hay en stock. Se compra duplicado, faltan productos clave y se vencen alimentos por falta de control. Hoy se maneja de memoria, papelitos o WhatsApp.

**Propuesta:** Web simple para cargar productos, ver stock, descontar uso / sumar compra, alertar faltantes y vencimientos próximos, y generar lista de compras automática.

**Responde:**
- ¿Qué vamos a desarrollar? Control mínimo de stock con alertas.
- ¿Para quién? Encargado de compras + quien usa la despensa.
- ¿Qué problema resuelve? Olvidos, faltantes y vencidos.

**Beneficio esperado:** menos quiebres de stock, menos vencidos, lista de compras en 1 clic.

## 2. Usuarios

1. **Encargado de compras:** carga, edita, ve alertas, genera lista.
2. **Usuario hogareño / empleado:** consulta, descuenta uso, marca comprado.

Sin login real en MVP (fuera de alcance). Rol simulado con selector simple si hace falta.

## 3. Alcance

**Incluye:**
- ABM productos (nombre, categoría, cantidad, stock mínimo, vencimiento)
- Lista, búsqueda y filtros
- Movimientos sumar / descontar
- Alertas faltante y vencimiento 7 días
- Lista de compras automática + marcar comprado
- Resumen / dashboard + persistencia localStorage + export/import JSON

**Queda fuera (explícito para Correctia):**
- Login real / multiusuario / permisos
- Código de barras / QR
- Backend / DB real / sincronización nube
- Pagos, facturación
- App móvil nativa

**Limitaciones:** 4 personas, desde cero, ~3 semanas útiles, solo front, sin backend, tiempo parcial por parciales.

**Convención de diseño (mobile-first):** toda la UI se construye responsive mobile-first: estilos base pensados para celular y media queries que mejoran progresivamente pantallas más grandes. Cada HU se entrega responsiva desde su implementación; HU13 queda como pulido (modo oscuro y refinos), no como base del responsive.

## 4. Backlog (13 ítems)

Escala: Baja=2h / Media=5h / Alta=8h. Total estimado: 57h.

| ID | Historia | Prioridad | Est. | Estado inicial | Criterio Done |
|----|----------|-----------|------|----------------|---------------|
| HU1 | Como encargado quiero alta de producto (nombre, categoría, cantidad, mínimo, vencimiento) | Alta | 5h | Pendiente | Valida campos, guarda, aparece en lista |
| HU2 | Como usuario quiero ver lista de stock | Alta | 2h | Pendiente | Tabla carga desde storage |
| HU3 | Como usuario quiero buscar/filtrar por nombre/categoría | Alta | 2h | Pendiente | Filtro funciona en vivo |
| HU4 | Como usuario quiero sumar/descontar cantidad | Alta | 5h | Pendiente | No permite negativo, actualiza vista |
| HU5 | Como encargado quiero alerta faltantes (stock<=mínimo) | Alta | 5h | Pendiente | Resalta en rojo + contador |
| HU6 | Como encargado quiero alerta vencimiento próximo 7 días | Alta | 5h | Pendiente | Resalta amarillo + contador |
| HU7 | Como encargado quiero lista de compras automática | Media | 5h | Pendiente | Genera desde faltantes |
| HU8 | Como usuario quiero editar producto | Media | 2h | Pendiente | Edita y persiste |
| HU9 | Como encargado quiero eliminar con confirmación | Baja | 2h | Pendiente | Pide confirmar, borra |
| HU10 | Como usuario quiero marcar comprado (vuelve a stock) | Media | 5h | Pendiente | Descuenta de lista, suma a stock |
| HU11 | Como encargado quiero resumen (totales, faltantes, vencidos) | Media | 8h | Pendiente | Tarjetas con números reales |
| HU12 | Como usuario quiero persistencia localStorage + export/import JSON | Alta | 8h | Pendiente | Recarga mantiene datos, JSON round-trip |
| HU13 | Como usuario quiero responsive / modo oscuro | Baja | 3h | Pendiente | Usable en celu (reserva, puede quedar pendiente) |

> HU13 se deja como pendiente planificado para evidenciar recorte.

## 5. Organización y prioridades

- **Alta:** sin esto no hay producto (HU1,2,3,4,5,6,12).
- **Media:** aporta valor, va a Iteración 2 (HU7,8,10,11).
- **Baja:** sacrificable (HU9,13).

Justificación 1 línea para PDF: priorizamos evitar quiebres y pérdida de datos antes que cosmética.

## 6. Estimación

Método: juicio experto + talles relativos. No se espera exactitud.
Total inicial: 57h. Al cierre comparar Estimado vs Real por HU y total para indicador de desvío.

## 7. Plan en 2 iteraciones

**Iteración 1 - Base usable:** HU1, HU2, HU3, HU4, HU8, HU9
Propuesto: ABM mínimo navegable. Terminado esperado: 6/6. Pendiente: resto.

**Iteración 2 - Valor gestión:** HU5, HU6, HU7, HU10, HU11, HU12
Propuesto: alertas + lista + resumen + persistencia. Terminado esperado: 6/7 (HU13 queda pendiente a propósito).

Cada iteración documentar: propuesto / seleccionado / quiénes / terminado / pendiente.

## 8. Seguimiento y registro

- **Tablero:** GitHub Projects con columnas PENDIENTE → EN PROCESO → FINALIZADA. Captura al fin de I1 e I2.
- **Repo:** `index.html / style.css / app.js / README.md`. 2-3 commits por persona por iteración. Captura historial + diff para PDF.
- **DoD:** funciona, cumple HU, probado por otro integrante, sin errores graves, integrado a main.

## 9. Riesgos (4 mínimos)

| Riesgo | Qué provoca | Mitigación |
|--------|-------------|------------|
| R1 Falta de tiempo por parciales | Retraso I2 | Recortar HU13, repartir parejo |
| R2 Dificultad JS/localStorage | Bugs persistencia | Prototipo temprano HU12 parcial en I1, pair programming |
| R3 Descoordinación horarios x4 | Bloqueos | Reunión corta 2x semana + tablero al día |
| R4 Alcance se agranda (login/back) | No terminar | Congelar alcance, lista explícita Fuera |

Al final indicar si ocurrió y cómo se resolvió.

## 10. Cambio previsto (1 mínimo)

Candidato: `Vencimiento con fecha exacta obligatoria → rango opcional + alerta 7/30 días`.
Formato PDF: QUÉ CAMBIÓ → POR QUÉ (era engorroso, frenaba carga) → QUÉ DECIDIMOS.

## 11. Indicadores (2 mínimos)

- I-A: previstas vs terminadas (ej. 13 previstas, 12 terminadas = 92%).
- I-B: desvío estimación (estimado 57h vs real XXh, % desvío por HU).

Responder: ¿cómo nos fue vs lo planificado?

## 12. DERA x4 (plantilla)

Formato: DECISIÓN → EVIDENCIA → RESULTADO → APRENDIZAJE.
Candidatos:
1. localStorage en vez de backend.
2. Congelar login.
3. Tabla simple antes que dashboard.
4. Trabajo por parejas en HU4/HU12.

## 13. Faltantes para cerrar (checklist ejecución)

- [ ] Crear repo + Projects + invitaciones x4
- [ ] Ejecutar I1 + capturas tablero + commits
- [ ] Ejecutar I2 + capturas tablero + commits
- [ ] Medir horas reales por HU
- [ ] Capturas app funcionando (lista, alerta, resumen)
- [ ] Armar PDF 20 puntos en orden
- [ ] Grabar video 2-3 min c/u + link en PDF
- [ ] Declarar uso IA + verificación
- [ ] Entregar antes del 10/11/2026
