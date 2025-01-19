// Obtén la referencia a la imagen
const imagen = document.getElementById('miImagen');

// Cambio de imagen y animación de desvanecimiento al pasar el mouse
imagen.addEventListener('mouseover', function() {
  imagen.classList.add('hidden');  // Aplica la clase 'hidden' para hacer que se desvanezca
  // Cambia la imagen después de un breve retraso, para que se desvanezca antes de cambiarla
  setTimeout(function() {
    imagen.src = 'assets/media/screenshot2.jpg';  // Cambia la ruta de la imagen
    imagen.classList.remove('hidden');  // Vuelve a hacer que la imagen sea visible
  }, 100);  // El retraso debe coincidir con la duración de la transición de opacidad
});

// Vuelve a la imagen original y realiza la animación de desvanecimiento
imagen.addEventListener('mouseout', function() {
  imagen.classList.add('hidden');  // Aplica la clase 'hidden' para hacer que se desvanezca
  // Cambia la imagen después de un breve retraso
  setTimeout(function() {
    imagen.src = 'assets/media/screenshot1.jpg';  // Restaura la imagen original
    imagen.classList.remove('hidden');  // Vuelve a hacer que la imagen sea visible
  }, 100);  // El retraso debe coincidir con la duración de la transición de opacidad
});

document.addEventListener('contextmenu', function(e) {
  if (e.target.tagName === 'VIDEO' || e.target.tagName === 'IMG') {
      e.preventDefault(); // Evita el menú contextual en videos
  }
});