(() => {
  "use strict";
  const carousel = document.querySelector(".page-carousel");
  const viewer = document.getElementById("page-viewer");
  if (!carousel || !viewer) return;
  const slides = [...carousel.querySelectorAll("[data-reading-slide]")];
  const dots = [...carousel.querySelectorAll("[data-carousel-dot]")];
  const previews = [...carousel.querySelectorAll(".page-preview")];
  const image = viewer.querySelector(".viewer-image");
  const title = viewer.querySelector("#page-viewer-title");
  const body = viewer.querySelector(".viewer-body");
  const zoom = viewer.querySelector("[data-viewer-zoom]");
  let slideIndex = 0;
  let pageIndex = 0;
  let returnFocus = null;

  function showSlide(index) {
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== slideIndex; });
    dots.forEach((dot, i) => {
      if (i === slideIndex) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
    carousel.querySelector(".carousel-counter").textContent = `Leitura ${slideIndex + 1} de ${slides.length}`;
  }
  carousel.querySelector("[data-carousel-prev]").addEventListener("click", () => showSlide(slideIndex - 1));
  carousel.querySelector("[data-carousel-next]").addEventListener("click", () => showSlide(slideIndex + 1));
  dots.forEach((dot, index) => dot.addEventListener("click", () => showSlide(index)));
  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      // Keep a focused preview on its equivalent page in the next reading.
      const position = previews.indexOf(document.activeElement) % 2;
      showSlide(slideIndex + (event.key === "ArrowRight" ? 1 : -1));
      if (position >= 0) slides[slideIndex].querySelectorAll(".page-preview")[position].focus();
    }
  });

  function resetZoom() {
    body.classList.remove("is-zoomed");
    zoom.setAttribute("aria-pressed", "false");
    zoom.textContent = "Aproximar";
    body.scrollTo(0, 0);
  }
  function showPage(index) {
    pageIndex = (index + previews.length) % previews.length;
    const preview = previews[pageIndex];
    image.src = preview.dataset.pageSrc;
    image.alt = preview.querySelector("img").alt;
    image.width = Number(preview.querySelector("img").getAttribute("width"));
    image.height = Number(preview.querySelector("img").getAttribute("height"));
    title.textContent = preview.dataset.pageTitle;
    viewer.querySelector(".viewer-counter").textContent = `${pageIndex + 1} de ${previews.length}`;
    resetZoom();
  }
  previews.forEach((preview, index) => {
    preview.setAttribute("aria-haspopup", "dialog");
    preview.addEventListener("click", () => {
      returnFocus = preview;
      showPage(index);
      viewer.showModal();
      document.documentElement.classList.add("has-page-viewer");
      viewer.querySelector(".viewer-close").focus();
    });
  });
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
})();
