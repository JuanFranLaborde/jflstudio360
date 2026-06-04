JFL Studio 360 — Landing V7 · Multi-página + Motion

Qué cambió en esta versión:
- El sitio pasó de una sola página a una experiencia MULTI-PÁGINA estilo Apple:
    index.html      -> Inicio (hero cinemático, marquee, stats, statement,
                       servicios, showcase, galería destacados, método, formación, CTA)
    servicios.html  -> Servicios en detalle (filas alternadas) + Método (sticky storytelling)
    trabajos.html   -> Slider destacados + portfolio filtrable completo
    estudio.html    -> Sobre el estudio + stats + formación (certificaciones)
    contacto.html   -> Formulario (compone un mailto) + métodos de contacto
- Animaciones con la librería Motion (vendorizada en assets/vendor/motion.js):
    reveals al scroll con stagger, títulos con máscara, parallax, hero cinemático,
    botones magnéticos, contadores, galería horizontal con scroll-snap.
- Transiciones entre páginas con la View Transitions API (+ velo de respaldo).
- Se conservan tema claro/oscuro, menú responsive y la protección básica de imágenes.

Archivos principales:
- index.html, servicios.html, trabajos.html, estudio.html, contacto.html
- styles.css        (sistema base de componentes)
- app.css           (capa V7: estilo Apple, multi-página, transiciones)
- script.js         (motor de interacción con Motion)
- assets/vendor/motion.js  (Motion v12 vendorizado, expone window.Motion)
- assets/img/...

Notas técnicas:
- Sitio estático, sin build. Motion se carga como <script> global (window.Motion),
  por lo que funciona offline y se publica con Netlify (publish = ".").
- Sin JS o con prefers-reduced-motion el contenido permanece visible (degradado seguro).

Listo para subir a Netlify.
