# USDINFORMATION — Estructura del Proyecto

## Archivos principales

| Archivo | Líneas | Qué contiene |
|---------|--------|--------------|
| `index.html` | ~2,440 | Estructura HTML completa: login, menú, secciones, modales |
| `js/utils.js` | ~186 | Funciones base: toast, modales, skeleton, helpers |
| `js/login.js` | ~546 | Sesión, bloqueo de usuarios, autenticación, roles |
| `js/app.js` | ~4,076 | Núcleo: Excel, gráficas, asistencia, ranking, grupos, navegación |
| `js/asistencia.js` | ~1,044 | Módulo detallado de asistencia |
| `js/nomina.js` | ~691 | Procesamiento de nómina |
| `js/chat.js` | ~1,983 | Chat individual y grupal |
| `js/calidad.js` | ~827 | Módulo de calidad |
| `js/config.js` | ~274 | Configuración visual de interfaz |
| `js/breaks.js` | ~481 | Módulo de breaks y pausas |
| `js/exportar.js` | ~1,317 | Exportar PDF, sparklines, historial comparativo |
| `js/contable.js` | ~759 | Módulo contable: ingresos/egresos |
| `js/documentos.js` | ~684 | Referencias laborales y desprendibles PDF |

## Cómo subir a GitHub

1. Sube TODOS los archivos al repositorio (index.html + carpeta js/ completa)
2. Deben estar en la misma carpeta raíz del repositorio
3. GitHub Pages funciona igual que antes

## Cómo encontrar lo que quieres modificar

| Quiero modificar... | Archivo |
|---------------------|---------|
| El diseño visual, colores, estilos | `index.html` (sección `<style>`) |
| La pantalla de login | `index.html` (HTML) + `js/login.js` |
| Las gráficas del inicio | `js/app.js` → busca `renderContadoresGeneral` |
| La tabla de asistencia | `js/app.js` → busca `renderAsistencia` |
| El ranking | `js/app.js` → busca `renderRanking` |
| Los puntos | `js/app.js` → busca `renderPuntos` |
| El chat | `js/chat.js` |
| La nómina | `js/nomina.js` |
| Las evaluaciones de calidad | `js/calidad.js` |
| Los colores/tipografía/interfaz | `js/config.js` |
| Los breaks/pausas | `js/breaks.js` |
| Exportar PDF de asistencia/nómina | `js/exportar.js` |
| Los módulos contables | `js/contable.js` |
| Cartas de referencia / desprendibles | `js/documentos.js` |
| La configuración de Firebase | `index.html` (primeras 336 líneas) |

## Si quieres seguir creciendo

Cada vez que agregues una función nueva, ponla en el archivo correspondiente según el módulo.
Si creas una función completamente nueva (ej: un módulo de vacaciones), crea un nuevo archivo
`js/vacaciones.js` y agrégalo al final de los `<script>` en `index.html`.
