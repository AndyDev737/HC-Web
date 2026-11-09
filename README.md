# Sitio de presentación

Este sitio es independiente de la aplicación y está hecho con HTML, CSS y
JavaScript sin dependencias de compilación.

## Contenido e interacciones

La página presenta la colección, la evolución hacia la web, el lector bíblico
RVR1960, la fidelidad musical (MIDI y partituras), el uso sin conexión y una
síntesis de la historia del proyecto. Incluye una búsqueda de demostración
limitada a cinco títulos reales del catálogo; no es una búsqueda completa de la
aplicación. Al elegir uno de esos cinco himnos se abre una vista de ejemplo
calcada del detalle real (número, título, métrica, versículos, letra y
reproductor), plana y sin enlaces ni audio, con «Volver a los resultados» para
regresar a la búsqueda. Las capturas de portada y lectura se pueden alternar con
sus pestañas o controles, y la historia se recorre por etapas desde la
cronología.

## Marca y créditos

El logo animado del encabezado se muestra sin la placa violeta: el video se
invierte y se funde con el fondo mediante `mix-blend-mode`, y la imagen estática
cubre el arranque del video hasta que la animación dibuja el logo, de modo que
nunca aparece un hueco. Al terminar la animación vuelve la imagen estática, sin
repetición. La preferencia de movimiento reducido mantiene solo la imagen fija.

El pie conserva el logo sobre una placa violeta e incluye el contacto del autor
del logo (Natanael Jiménez, `@nata_neudesign`) y del desarrollador
(`andydev737@gmail.com`).

## Configurar el acceso a la app

La dirección pública se define en `appUrl` dentro de
[`config.js`](./config.js). Los botones «Abrir el himnario» y «Abrir la
aplicación web» se habilitan automáticamente y se abren en otra pestaña.

La dirección configurada actualmente es
`https://himnos-y-canticos-del-evangelio.pages.dev/`.

## Probarlo localmente

Desde la raíz del repositorio, ejecuta:

```powershell
python -m http.server 4173 --directory landing-page
```

Luego abre `http://localhost:4173`. También se puede publicar el contenido
completo de esta carpeta en cualquier hosting estático; no es necesario
modificar `src-web`.

Las capturas muestran la portada y la lectura de la versión web actual. El
video conserva la animación original del logo, se reproduce una sola vez y
respeta la preferencia de movimiento reducido. Las imágenes y tipografías se
sirven desde esta carpeta, sin dependencias de una CDN; las fuentes incluyen sus
licencias.
