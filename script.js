const appStatuses = document.querySelectorAll('[data-app-status]');
const appLinks = document.querySelectorAll('[data-app-link]');
const configuredUrl = window.HC_EVANGELIO_CONFIG?.appUrl?.trim() ?? '';

if (configuredUrl) {
  let destination;

  try {
    const candidate = new URL(configuredUrl);
    const isLocalDevelopment =
      candidate.hostname === 'localhost' || candidate.hostname === '127.0.0.1';

    if (
      candidate.protocol !== 'https:' &&
      !(isLocalDevelopment && candidate.protocol === 'http:')
    ) {
      throw new Error('La dirección pública debe usar HTTPS.');
    }

    destination = candidate;
  } catch (error) {
    appStatuses.forEach((status) => {
      status.textContent = 'No se pudo preparar el acceso. Revisa la dirección en config.js.';
    });
    appLinks.forEach((link) => {
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
      link.setAttribute('tabindex', '-1');
      link.classList.add('is-unavailable');
    });
    console.error('La dirección de la aplicación no es válida:', error);
  }

  if (destination) {
    appLinks.forEach((link) => {
      link.href = destination.href;
      link.removeAttribute('aria-disabled');
      link.removeAttribute('tabindex');
      link.classList.remove('is-unavailable');
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener');
    });
    appStatuses.forEach((status) => {
      status.hidden = false;
    });
  }
}

const menuButton = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('#site-nav');

function closeNavigation() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir navegación');
  siteNav.classList.remove('is-open');
}

menuButton.addEventListener('click', () => {
  const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isExpanded));
  menuButton.setAttribute('aria-label', isExpanded ? 'Abrir navegación' : 'Cerrar navegación');
  siteNav.classList.toggle('is-open', !isExpanded);
});

siteNav.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeNavigation();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeNavigation();
    menuButton.focus();
  }

  if (
    event.key === '/' &&
    !event.ctrlKey &&
    !event.metaKey &&
    !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)
  ) {
    event.preventDefault();
    hymnSearch.focus();
  }
});

const hymnSearch = document.querySelector('#hymn-search');
const searchResults = document.querySelector('#search-results');
const searchStatus = document.querySelector('#search-status');
const searchSuggestions = Array.from(document.querySelectorAll('[data-query]'));

const sampleHymn = document.querySelector('#sample-hymn');
const sampleScroll = sampleHymn.querySelector('[data-sample-scroll]');
const sampleBack = sampleHymn.querySelector('[data-sample-back]');
const sampleNum = sampleHymn.querySelector('[data-sample-num]');
const sampleTitle = sampleHymn.querySelector('[data-sample-title]');
const sampleMeter = sampleHymn.querySelector('[data-sample-meter]');
const samplePosition = sampleHymn.querySelector('[data-sample-position]');
const sampleVerses = sampleHymn.querySelector('[data-sample-verses]');
const sampleLyrics = sampleHymn.querySelector('[data-sample-lyrics]');

const CHORUS_LABEL = /(?:Coro Final:|Coro:|\(Coro\)|Final Refrain:|Refrain:|\(Refrain\))/i;
const VERSE_START = /^\d+\./;

let selectedHymnId = null;
let resultsStatus = '';

/** Separa la métrica en melodía y compás, como la vista real del himno. */
function splitMeter(rawMeter = '') {
  const separator = rawMeter.lastIndexOf(';');

  if (separator < 0) {
    return { melody: '', meter: rawMeter.trim() };
  }

  return {
    melody: rawMeter.slice(0, separator).trim(),
    meter: rawMeter.slice(separator + 1).trim(),
  };
}

/** Reconstruye las líneas de la letra respetando el color del coro de la app. */
function buildSampleLyrics(lyrics) {
  let isChorus = false;
  const fragment = document.createDocumentFragment();

  lyrics.split('\n').forEach((line) => {
    if (VERSE_START.test(line)) isChorus = false;
    if (CHORUS_LABEL.test(line)) isChorus = true;

    const span = document.createElement('span');
    if (isChorus) span.className = 'sample-lyrics-chorus';
    span.textContent = `${line}\n`;
    fragment.append(span);
  });

  return fragment;
}

function showSampleHymn(hymn) {
  const { melody, meter } = splitMeter(hymn.meter);

  selectedHymnId = hymn.id;
  resultsStatus = searchStatus.textContent;

  sampleNum.textContent = String(hymn.id);
  sampleTitle.textContent = hymn.title;
  sampleMeter.textContent = melody ? `${melody}; ${meter}` : meter;
  samplePosition.textContent = `Himnos · N° ${hymn.id}`;

  const citations = hymn.verses
    .split('|')
    .map((citation) => citation.trim())
    .filter(Boolean);
  const verseFragment = document.createDocumentFragment();
  citations.forEach((citation) => {
    const line = document.createElement('span');
    line.textContent = citation;
    verseFragment.append(line);
  });
  sampleVerses.replaceChildren(verseFragment);

  sampleLyrics.replaceChildren(buildSampleLyrics(hymn.lyrics));
  sampleScroll.scrollTop = 0;
  sampleHymn.hidden = false;
  searchResults.hidden = true;
  searchStatus.textContent = `Vista de ejemplo del himno ${hymn.id}. La reproducción y los enlaces están desactivados.`;
}

function hideSampleHymn(focusResult = false) {
  if (sampleHymn.hidden) return;

  sampleHymn.hidden = true;
  searchResults.hidden = false;
  searchStatus.textContent = resultsStatus;

  if (focusResult && selectedHymnId !== null) {
    const result = searchResults.querySelector(
      `.result-button[data-hymn-id="${selectedHymnId}"]`,
    );
    result?.focus();
  }
}

const hymnSamples = [
  {
    id: 1,
    title: 'A CASA VETE Y CUENTA ALLÍ...',
    section: 'Himnos',
    meter: 'GO HOME AND TELL; M.R.D.',
    verses: 'Mr. 5.19 | Lc. 8.39 | Hch. 10.42, 43',
    lyrics:
      '1. A casa vete y cuenta allí\nque Cristo te salvó;\nque tus amigos vean en ti\nlo que Él por gracia obró.\n\nCoro:\nA casa vete y vean en ti\nque Dios te hizo bien,\ny puede ser que los de allí\nlo buscarán también.\n\n2. A casa vete y cuenta allí\nque Cristo comprendió\ntu gran necesidad, y así\nsu sangre derramó.\n\n3. Ve, cuenta a los de en derredor\nque Él satisfará\nsus almas, puesto que en su amor\nla cruz sufrido ha.\n\n4. Ve, cuenta a los de más allá\nque en Cristo hay perdón,\ny que Él a todos salvará,\nsi quieren salvación.',
  },
  {
    id: 2,
    title: 'A JESUCRISTO VEN SIN TARDAR...',
    section: 'Himnos',
    meter: 'COME TO THE SAVIOR; 9.9.9.6.D.',
    verses: 'Jn. 7.37, 14.3, 5.40, 17.24',
    lyrics:
      '1. A Jesucristo ven sin tardar,\nque entre nosotros hoy Él está;\ny te convida con dulce afán,\ntierno diciendo: «Ven».\n\nCoro:\n¡Oh cuán grata nuestra reunión!\nCuando al fin en celestial mansión\ncon Él estemos en comunión,\ngozando eterno bien.\n\n2. Piensa que Él solo puede colmar\ntu triste pecho de gozo y paz;\ny porque anhela tu bienestar,\nvuelve a decirte: «Ven».\n\n3. Su voz escucha sin vacilar\ny grato acepta lo que hoy te da.\nTal vez mañana no habrá lugar;\nno te detengas, ven.',
  },
  {
    id: 3,
    title: 'A LA TIERRA MARCHAMOS DO VIVEN LOS SANTOS...',
    section: 'Himnos',
    meter: 'THE EDEN ABOVE; 12.11.12.11. con coro',
    verses: 'Ap. 4.1, 21.4, 22.5',
    lyrics:
      '1. A la tierra marchamos do viven los santos\nen gozo y gloria y honra inmortal.\nY tú, que sin Dios corres presto a la muerte,\noh di: ¿Quieres ir al Edén celestial?\n\nCoro:\n¿Quieres ir? ¿Quieres ir?\n¿Quieres ir? ¿Quieres ir?\nOh di: ¿Quieres ir al Edén celestial?\n\n2. En ese país ni dolor ni gemido\njamás en sus prados cabida tendrán.\nY tú que te sientes del mal oprimido,\noh di: ¿Quieres ir al Edén celestial?\n\n3. Allá no hay pobreza; poseen los salvos\ninmensas riquezas con Cristo Jesús.\nAllá no hay enfermos, están todos sanos.\nOh di: ¿Quieres ir al Edén celestial?\n\n4. Ven, pues, con nosotros. Jesús es la puerta,\ny franca la entrada al cielo te da;\nal reino de Dios, a su gloria eterna.\nOh di: ¿Quieres ir al Edén celestial?',
  },
  {
    id: 4,
    title: 'A TU PUERTA CRISTO ESTÁ. ÁBRELE...',
    section: 'Himnos',
    meter: 'LET HIM IN; 7.3.7.3.7.7.7.3.',
    verses: 'Ap. 3.20 | Sal. 22.26 | Prov. 1.28',
    lyrics:
      '1. A tu puerta Cristo está. Ábrele.\nSi tú le abres, entrará. Ábrele.\nTu pecado quitará, luz y paz derramará,\ndía alegre te será. Ábrele.\n\n2. Ábrele, oh pecador. Ábrele.\nAbre ahora al Salvador. Ábrele.\nTe ofrece salvación, del pecado el perdón.\nSaciará tu corazón. Ábrele.\n\n3. ¡Oh! no le hagas esperar. Ábrele.\nTal vez pronto marchará. Ábrele.\n¡Que dolor después tendrás, cuando en vano clamarás,\ny perdido te hallarás! Ábrele.',
  },
  {
    id: 5,
    title: 'AL CIELO VOY, AL CIELO VOY...',
    section: 'Himnos',
    meter: 'STAND UP FOR JESUS; M.L.D.',
    verses: '2Ti. 1.12 | 2Co. 5.1 | Sal. 17.15',
    lyrics:
      '1. Al cielo voy, al cielo voy,\nyo confío en Jesús.\nÉl me salvó, Él me salvó;\npor mí Él ha muerto en la cruz.\nYo te veré, mi Salvador,\nyo te veré a Ti, Señor,\nen dulce luz y resplandor,\nyo te veré, mi Salvador.\n\n2. Al cielo voy, al cielo voy,\nyo confío en Jesús.\nÉl me salvó, Él me salvó;\npor mí Él ha muerto en la cruz.\nTu pura sangre carmesí\nla culpa vil borró de mí;\ny gozaré ventura allí.\nYo te veré, mi Salvador.\n\n3. Al cielo voy, al cielo voy,\nyo confío en Jesús.\nÉl me salvó, Él me salvó;\npor mí Él ha muerto en la cruz.\nFeliz aquel que en Ti confió\ny Salvador te proclamó.\nEn Ti también espero yo;\nyo te veré, mi Salvador.',
  },
];

function normalizeText(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .trim();
}

function renderHymnResults(query = '') {
  const normalizedQuery = normalizeText(query);
  const matches = hymnSamples.filter(({ id, title }) => {
    return (
      !normalizedQuery ||
      normalizeText(title).includes(normalizedQuery) ||
      (String(id) === normalizedQuery && normalizedQuery.length > 0)
    );
  });

  searchResults.replaceChildren();

  if (!matches.length) {
    const emptyState = document.createElement('div');
    emptyState.className = 'result-empty';
    emptyState.innerHTML =
      '<strong>No hay coincidencias en esta muestra.</strong><span>Prueba con «Cristo», «cielo» o «casa».</span>';
    searchResults.append(emptyState);
    searchStatus.textContent =
      'Estos son ejemplos; la aplicación reúne el catálogo completo.';
    return;
  }

  matches.forEach((hymn, index) => {
    const { id, title, section } = hymn;
    const result = document.createElement('button');
    result.className = 'result-button';
    result.type = 'button';
    result.dataset.hymnId = String(id);
    result.setAttribute('aria-pressed', String(index === 0));
    result.setAttribute('aria-label', `${section} número ${id}: ${title}`);

    const number = document.createElement('span');
    number.className = 'result-number';
    number.textContent = String(id).padStart(2, '0');

    const name = document.createElement('span');
    name.className = 'result-title';
    name.textContent = title;

    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrow.setAttribute('viewBox', '0 0 24 24');
    arrow.setAttribute('fill', 'none');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.classList.add('result-arrow');
    const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrowPath.setAttribute('d', 'm9 18 6-6-6-6');
    arrowPath.setAttribute('stroke', 'currentColor');
    arrowPath.setAttribute('stroke-linecap', 'round');
    arrowPath.setAttribute('stroke-linejoin', 'round');
    arrowPath.setAttribute('stroke-width', '1.8');
    arrow.append(arrowPath);

    result.append(number, name, arrow);
    result.addEventListener('click', () => {
      searchResults.querySelectorAll('.result-button').forEach((button) => {
        button.setAttribute('aria-pressed', String(button === result));
      });
      showSampleHymn(hymn);
    });
    searchResults.append(result);
  });

  searchStatus.textContent = normalizedQuery
    ? `${matches.length} ${matches.length === 1 ? 'ejemplo de la muestra coincide' : 'ejemplos de la muestra coinciden'} con tu búsqueda.`
    : 'Cinco títulos de ejemplo tomados del catálogo';
}

hymnSearch.addEventListener('input', () => {
  hideSampleHymn();
  renderHymnResults(hymnSearch.value);
  searchSuggestions.forEach((suggestion) => {
    suggestion.setAttribute('aria-pressed', 'false');
  });
});

hymnSearch.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;

  if (hymnSearch.value) {
    hymnSearch.value = '';
    hymnSearch.dispatchEvent(new Event('input'));
    return;
  }

  hideSampleHymn(true);
});

searchSuggestions.forEach((suggestion) => {
  suggestion.addEventListener('click', () => {
    hideSampleHymn();
    hymnSearch.value = suggestion.dataset.query;
    renderHymnResults(hymnSearch.value);
    searchSuggestions.forEach((item) => {
      item.setAttribute('aria-pressed', String(item === suggestion));
    });
    searchResults.querySelector('.result-button')?.focus();
  });
});

sampleBack.addEventListener('click', () => hideSampleHymn(true));

renderHymnResults();

const screenTabs = Array.from(document.querySelectorAll('[data-screen]'));
const screenImage = document.querySelector('#app-preview-image');
const screenPanel = document.querySelector('#app-preview');
const viewerTitle = document.querySelector('[data-viewer-title]');
const viewerCopy = document.querySelector('[data-viewer-copy]');
const viewerIndex = document.querySelector('[data-viewer-index]');
const viewerCurrent = document.querySelector('[data-viewer-current]');
const screenContent = [
  {
    id: 'catalogo',
    image: 'assets/captura-portada.png',
    alt: 'Pantalla de inicio y catálogo de la aplicación.',
    title: 'Empieza por donde quieras',
    description: 'Recorre las secciones o busca por número y por palabras que recuerdes.',
  },
  {
    id: 'himno',
    image: 'assets/captura-himno.png',
    alt: 'Lectura de un himno con sus referencias bíblicas y controles de melodía.',
    title: 'Quédate con la letra',
    description: 'Lee el himno, consulta sus referencias y escucha su melodía.',
  },
];

function selectScreen(index, focus = false) {
  const selected = screenContent[index];

  screenTabs.forEach((tab, tabIndex) => {
    const isSelected = tabIndex === index;
    tab.setAttribute('aria-selected', String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
  });

  screenImage.src = selected.image;
  screenImage.alt = selected.alt;
  viewerTitle.textContent = selected.title;
  viewerCopy.textContent = selected.description;
  viewerIndex.textContent = String(index + 1).padStart(2, '0');
  viewerCurrent.textContent = String(index + 1).padStart(2, '0');
  screenPanel.setAttribute('aria-labelledby', screenTabs[index].id);

  if (focus) screenTabs[index].focus();
}

screenTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectScreen(index));
  tab.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      selectScreen((index + direction + screenTabs.length) % screenTabs.length, true);
    }
  });
});

document.querySelector('[data-viewer-prev]').addEventListener('click', () => {
  const currentIndex = screenTabs.findIndex(
    (tab) => tab.getAttribute('aria-selected') === 'true',
  );
  selectScreen((currentIndex - 1 + screenTabs.length) % screenTabs.length);
});

document.querySelector('[data-viewer-next]').addEventListener('click', () => {
  const currentIndex = screenTabs.findIndex(
    (tab) => tab.getAttribute('aria-selected') === 'true',
  );
  selectScreen((currentIndex + 1) % screenTabs.length);
});

const storyStops = Array.from(document.querySelectorAll('[data-story]'));
const storyDate = document.querySelector('[data-story-date]');
const storyHeading = document.querySelector('[data-story-heading]');
const storyText = document.querySelector('[data-story-text]');
const timelineProgress = document.querySelector('[data-timeline-progress]');
const storyContent = [
  {
    date: '2023',
    heading: 'Todo empezó en una computadora.',
    text: 'Una aplicación de escritorio sencilla ayudó a aprender una nueva tecnología. Reunía los 585 himnos y 67 coritos del Himnario Venezolano.',
  },
  {
    date: 'Finales de 2023 / principios de 2024',
    heading: 'El himnario llegó a los teléfonos.',
    text: 'El interés de otras personas abrió la oportunidad de llevar aquella aplicación de escritorio a Android.',
  },
  {
    date: 'Enero de 2025',
    heading: 'Crecer también fue aprender a corregir.',
    text: 'El relato original describe esta etapa como una sucesión de pruebas, ajustes y problemas conocidos; en enero de 2025, el autor consideró que la app ya funcionaba plenamente.',
  },
  {
    date: 'Una nueva etapa',
    heading: 'El proyecto vuelve a tomar forma en la web.',
    text: 'Hoy, la colección se reconstruye como una aplicación web que busca llevar sus himnos, letras, melodías y partituras también a quienes usan otros dispositivos.',
  },
];

function selectStory(index, focus = false) {
  const selected = storyContent[index];

  storyStops.forEach((stop, stopIndex) => {
    stop.setAttribute('aria-pressed', String(stopIndex === index));
  });

  storyDate.textContent = selected.date;
  storyHeading.textContent = selected.heading;
  storyText.textContent = selected.text;
  timelineProgress.style.width = `${(index / (storyStops.length - 1)) * 100}%`;

  if (focus) storyStops[index].focus();
}

storyStops.forEach((stop, index) => {
  stop.addEventListener('click', () => selectStory(index));
  stop.addEventListener('keydown', (event) => {
    let nextIndex = index;

    if (event.key === 'ArrowRight') nextIndex = Math.min(index + 1, storyStops.length - 1);
    if (event.key === 'ArrowLeft') nextIndex = Math.max(index - 1, 0);
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = storyStops.length - 1;

    if (nextIndex !== index) {
      event.preventDefault();
      selectStory(nextIndex, true);
    }
  });
});

const logoVideo = document.querySelector('.brand-motion');
const brandMark = document.querySelector('.brand-mark');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
// El video arranca con el lienzo vacío y tarda ~1,3 s en dibujar la silueta del
// logo. La imagen estática se mantiene visible hasta entonces para que el logo
// nunca desaparezca; después la animación toma el relevo (relleno y trazos).
const LOGO_REVEAL_AT = 1.3;

function showStaticLogo() {
  brandMark.classList.remove('is-animated');
}

function revealAnimatedLogo() {
  if (!motionPreference.matches) brandMark.classList.add('is-animated');
}

function syncLogoMotion() {
  logoVideo.pause();
  showStaticLogo();

  if (motionPreference.matches) return;

  logoVideo.currentTime = 0;
  logoVideo.play().catch((error) => {
    console.info('La animación del logo no pudo iniciarse; se muestra la imagen estática.', error);
  });
}

logoVideo.addEventListener('timeupdate', () => {
  if (logoVideo.currentTime >= LOGO_REVEAL_AT) revealAnimatedLogo();
});
// Al terminar, el logo estático vuelve sin saltos y la animación no se repite.
logoVideo.addEventListener('ended', showStaticLogo);
motionPreference.addEventListener('change', syncLogoMotion);
syncLogoMotion();
