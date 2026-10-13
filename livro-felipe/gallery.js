(() => {
  "use strict";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Each carousel also works with its buttons and arrow keys.
  function addSwipe(surface, move) {
    let start = null;
    let suppressClickUntil = 0;
    surface.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "touch" || event.pointerType === "pen") start = { x: event.clientX, y: event.clientY };
    });
    surface.addEventListener("pointerup", (event) => {
      if (!start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      start = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        suppressClickUntil = Date.now() + 450;
        move(dx < 0 ? 1 : -1);
      }
    });
    surface.addEventListener("pointercancel", () => { start = null; });
    surface.addEventListener("click", (event) => {
      if (Date.now() < suppressClickUntil) { event.preventDefault(); event.stopImmediatePropagation(); }
    }, true);
  }

  const carousel = document.querySelector(".book-carousel");
  const viewer = document.getElementById("page-viewer");
  if (carousel && viewer) {
    const slides = [...carousel.querySelectorAll("[data-book-page]")];
    const dots = [...carousel.querySelectorAll("[data-carousel-dot]")];
    const previews = [...carousel.querySelectorAll(".page-preview")];
    const stage = carousel.querySelector(".book-stage");
    let active = 0;
    let turningAnimation = null;

    function turnTo(index, direction = 1) {
      const next = (index + slides.length) % slides.length;
      if (next === active) return;
      const oldImage = previews[active].querySelector("img");
      const wasPreviewFocused = previews.includes(document.activeElement);
      turningAnimation?.cancel();
      active = next;
      slides.forEach((slide, i) => { slide.hidden = i !== active; });
      dots.forEach((dot, i) => {
        if (i === active) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
      carousel.querySelector(".book-day").textContent = `Dia ${slides[active].dataset.day}`;
      carousel.querySelector(".book-topic").textContent = slides[active].dataset.topic;
      carousel.querySelector(".carousel-counter").textContent = `Página ${active + 1} de ${slides.length}`;
      previews[active].querySelector("img").loading = "eager";
      previews[(active + 1) % slides.length].querySelector("img").loading = "eager";
      if (wasPreviewFocused) previews[active].focus({ preventScroll: true });

      if (reducedMotion.matches || !oldImage.complete || !oldImage.naturalWidth) return;
      const sheet = document.createElement("div");
      sheet.className = "turning-sheet";
      sheet.setAttribute("aria-hidden", "true");
      const front = document.createElement("div");
      front.className = "turning-sheet-front";
      const image = oldImage.cloneNode();
      image.alt = "";
      image.loading = "eager";
      front.append(image);
      const back = document.createElement("div");
      back.className = "turning-sheet-back";
      sheet.append(front, back);
      stage.append(sheet);
      sheet.style.transformOrigin = direction > 0 ? "left center" : "right center";
      const angle = direction > 0 ? -176 : 176;
      const animation = sheet.animate([
        { transform: "rotateY(0deg)", opacity: 1 },
        { transform: `rotateY(${angle * .28}deg)`, opacity: 1, offset: .38 },
        { transform: `rotateY(${angle * .75}deg)`, opacity: .88, offset: .78 },
        { transform: `rotateY(${angle}deg)`, opacity: 0 }
      ], { duration: 780, easing: "cubic-bezier(.35,.05,.4,1)", fill: "forwards" });
      turningAnimation = animation;
      stage.dataset.turning = "true";
      const cleanup = () => {
        sheet.remove();
        if (turningAnimation === animation) { turningAnimation = null; delete stage.dataset.turning; }
      };
      animation.finished.then(cleanup, cleanup);
    }
    reducedMotion.addEventListener("change", (event) => { if (event.matches) turningAnimation?.cancel(); });
    previews[1].querySelector("img").loading = "eager";
    carousel.querySelector("[data-carousel-prev]").addEventListener("click", () => turnTo(active - 1, -1));
    carousel.querySelector("[data-carousel-next]").addEventListener("click", () => turnTo(active + 1, 1));
    dots.forEach((dot, index) => dot.addEventListener("click", () => turnTo(index, index > active ? 1 : -1)));
    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        turnTo(active + direction, direction);
      }
    });
    addSwipe(stage, (direction) => turnTo(active + direction, direction));

    const image = viewer.querySelector(".viewer-image");
    const title = viewer.querySelector("#page-viewer-title");
    const body = viewer.querySelector(".viewer-body");
    const zoom = viewer.querySelector("[data-viewer-zoom]");
    let pageIndex = 0;
    let returnFocus = null;
    function resetZoom() {
      body.classList.remove("is-zoomed");
      zoom.setAttribute("aria-pressed", "false");
      zoom.textContent = "Aproximar";
      body.scrollTo(0, 0);
    }
    function showPage(index) {
      pageIndex = (index + previews.length) % previews.length;
      const preview = previews[pageIndex];
      const sourceImage = preview.querySelector("img");
      image.src = preview.dataset.pageSrc;
      image.alt = sourceImage.alt;
      image.width = Number(sourceImage.getAttribute("width"));
      image.height = Number(sourceImage.getAttribute("height"));
      title.textContent = preview.dataset.pageTitle;
      viewer.querySelector(".viewer-counter").textContent = `${pageIndex + 1} de ${previews.length}`;
      resetZoom();
    }
    function openPage(index, opener) {
      returnFocus = opener;
      showPage(index);
      viewer.showModal();
      document.documentElement.classList.add("has-page-viewer");
      viewer.querySelector(".viewer-close").focus();
    }
    previews.forEach((preview, index) => {
      preview.setAttribute("aria-haspopup", "dialog");
      preview.addEventListener("click", () => openPage(index, preview));
    });
    const enlarge = carousel.querySelector("[data-book-enlarge]");
    enlarge.setAttribute("aria-haspopup", "dialog");
    enlarge.addEventListener("click", () => openPage(active, enlarge));
    viewer.querySelector(".viewer-close").addEventListener("click", () => viewer.close());
    viewer.querySelector("[data-viewer-prev]").addEventListener("click", () => showPage(pageIndex - 1));
    viewer.querySelector("[data-viewer-next]").addEventListener("click", () => showPage(pageIndex + 1));
    zoom.addEventListener("click", () => {
      const expanded = body.classList.toggle("is-zoomed");
      zoom.setAttribute("aria-pressed", String(expanded));
      zoom.textContent = expanded ? "Ajustar à tela" : "Aproximar";
    });
    viewer.addEventListener("click", (event) => {
      if (event.target !== viewer) return;
      const rect = viewer.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) viewer.close();
    });
    viewer.addEventListener("close", () => {
      document.documentElement.classList.remove("has-page-viewer");
      resetZoom();
      returnFocus?.focus();
    });
  }

  const ipad = document.querySelector(".ipad-carousel");
  if (ipad) {
    const slides = [...ipad.querySelectorAll("[data-ipad-slide]")];
    const dots = [...ipad.querySelectorAll("[data-ipad-dot]")];
    let current = 0;
    let textAnimation = null;
    function showText(index, direction = 1) {
      textAnimation?.cancel();
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => { slide.hidden = i !== current; });
      dots.forEach((dot, i) => {
        if (i === current) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
      ipad.querySelector(".ipad-counter").textContent = `Trecho ${current + 1} de ${slides.length}`;
      if (!reducedMotion.matches) textAnimation = slides[current].animate([
        { opacity: 0, transform: `translateX(${direction * 20}px)` },
        { opacity: 1, transform: "translateX(0)" }
      ], { duration: 280, easing: "ease-out" });
    }
    ipad.querySelector("[data-ipad-prev]").addEventListener("click", () => showText(current - 1, -1));
    ipad.querySelector("[data-ipad-next]").addEventListener("click", () => showText(current + 1, 1));
    dots.forEach((dot, index) => dot.addEventListener("click", () => showText(index, index >= current ? 1 : -1)));
    ipad.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        showText(current + direction, direction);
      }
    });
    addSwipe(ipad.querySelector(".ipad-screen"), (direction) => showText(current + direction, direction));
    reducedMotion.addEventListener("change", (event) => { if (event.matches) textAnimation?.cancel(); });
  }
})();
