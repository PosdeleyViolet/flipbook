(function () {
  if (typeof St === 'undefined') {
    document.getElementById('loading').textContent = 'No se pudo cargar la librería page-flip (revisa conexión/CDN).';
    return;
  }
  const cfg = window.FLIPBOOK_CONFIG;
  const bookEl = document.getElementById("book");
  const indicator = document.getElementById("indicator");

  // 1) Lista de imágenes
  const files = Array.from({ length: cfg.totalImages }, (_, i) =>
    cfg.folder + cfg.prefix + String(i + 1).padStart(cfg.padLength, "0") + cfg.extension
  );

  // 2) Crear páginas (portada y contraportada "duras")
  const pages = files.map((src, i) => {
    const div = document.createElement("div");
    div.className = "page";
    if (i === 0 || i === files.length - 1) div.dataset.density = "hard";
    const img = document.createElement("img");
    img.src = src; img.alt = "Página " + (i + 1); img.draggable = false;
    div.appendChild(img);
    return div;
  });

  // 3) Con total impar, la contraportada quedaría emparejada con otra página.
  //    Se inserta una página en blanco antes de ella para que quede sola.
  if (pages.length % 2 !== 0) {
    const blank = document.createElement("div");
    blank.className = "page blank";
    pages.splice(pages.length - 1, 0, blank);
  }
  pages.forEach(p => bookEl.appendChild(p));

  // 4) Inicializar StPageFlip
  const flip = new St.PageFlip(bookEl, {
    width: cfg.pageWidth,
    height: cfg.pageHeight,
    size: "stretch",
    minWidth: 280, maxWidth: 1000,
    minHeight: 380, maxHeight: 1400,
    showCover: true,
    maxShadowOpacity: 0.5,
    mobileScrollSupport: false,
    flippingTime: 800,
    usePortrait: true
  });
  flip.loadFromHTML(pages);
  document.getElementById("loading").classList.add("hidden");

  // Centrar el libro cuando está cerrado (portada / contraportada)
  function centerBook() {
    const idx = flip.getCurrentPageIndex();
    const last = flip.getPageCount() - 1;
    let shift = 0;
    if (flip.getOrientation() === "landscape") {
      const pw = flip.getRender().getRect().pageWidth;
      if (idx === 0) shift = -pw / 2;
      else if (idx === last) shift = pw / 2;
    }
    bookEl.style.transform = "translateX(" + shift + "px)";
  }

  // 5) Indicador y controles
  const total = flip.getPageCount();
  const update = () => { indicator.textContent = (flip.getCurrentPageIndex() + 1) + " / " + total; };
  flip.on("flip", () => { update(); centerBook(); });
  flip.on("changeState", update);
  flip.on("changeOrientation", centerBook);
  window.addEventListener("resize", () => setTimeout(centerBook, 200));
  centerBook();
  update();

  const $ = id => document.getElementById(id);
  const on = (id, fn) => $(id).addEventListener("click", e => { e.preventDefault(); fn(); });
  on("btn-prev",  () => flip.flipPrev("bottom"));
  on("btn-next",  () => flip.flipNext("bottom"));
  on("btn-first", () => flip.turnToPage(0));
  on("btn-last",  () => flip.turnToPage(total - 1));
  on("btn-full",  () => {
    document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") flip.flipPrev("bottom");
    if (e.key === "ArrowRight") flip.flipNext("bottom");
  });
})();
