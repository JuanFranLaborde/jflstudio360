JFL Studio 360 — Sitio V8 · Sistema JFL 360
"Mismo estudio. Otro criterio."

El sitio se rehízo sobre el sistema de diseño del rediseño 2026 (dossier de marca
y kit de lanzamiento de Instagram), para que la web y las redes se vean como una
sola marca.

Reglas del sistema aplicadas:
- Tres superficies: papel (#FBF3E3 / crema #F5E8D0), tinta (#151338) y foto
  (blanco y negro cálido).
- Navy #1D2252 es la tinta del texto y el único fondo oscuro.
- Coral #E8614A como acento: una palabra, una línea o un punto por pieza.
- Dos familias: Archivo (grotesca, firme y directa) + EB Garamond (serif de firma).
- Titulares en dos tonos: palabra firme en navy + resto en greige (#857A6B).
- Sin checks ni íconos: guiones, números y aire.

Páginas:
- index.html      Portada, Qué hacemos, Trabajos en foco (carrusel formato 4:5),
                  Cómo pensamos, Manifiesto y cierre.
- servicios.html  Las cuatro disciplinas con foto, alcance y qué incluye,
                  y el proceso "Así nace una marca" en seis etapas.
- trabajos.html   Índice de proyectos con filtros (Identidad, Producto, Web,
                  Contenido). Acepta ?f=producto para abrir ya filtrado.
- estudio.html    El estudio en números, Caso 00 (nos rediseñamos), paleta,
                  tipografía y formación técnica.
- contacto.html   Formulario (arma el mail listo para enviar), qué mandarme
                  y cómo empezamos.

Archivos:
- styles.css   Sistema completo: tokens, superficies, componentes y responsive.
- script.js    Interacción sin dependencias: intro, tema papel/tinta, menú,
               apariciones al scroll, números, carrusel, filtros y formulario.
- assets/img/foto-*.webp  Fotos B/N cálidas tomadas del kit de lanzamiento.

Notas:
- Tema "Papel" por defecto; "Tinta" (oscuro) se elige desde el header y se recuerda.
- Transiciones entre páginas con View Transitions (si el navegador no las soporta,
  la navegación es normal). Con "reducir movimiento" todo aparece sin animación.
- La V7 usaba la librería Motion; ya no hace falta. package.json y node_modules
  quedaron de esa versión y se pueden borrar.

Sitio estático, sin build. Listo para Netlify (publish = ".").
