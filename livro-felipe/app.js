(() => {
  "use strict";
  const config = window.RECOMECO_CONFIG || {};
  const safeUrl = (value) => {
    if (!value) return null;
    try {
      const url = new URL(value, window.location.href);
      return ["https:", "http:"].includes(url.protocol) ? url : null;
    } catch { return null; }
  };
  const checkout = safeUrl(config.checkoutUrl);
  if (checkout) document.querySelectorAll(".checkout-link").forEach((link) => { link.href = checkout.href; });
  const vsl = config.vsl || {};
  const videoUrl = safeUrl(vsl.url);
  const button = document.querySelector(".vsl-play");
  const host = document.querySelector(".vsl-player");
  if (!videoUrl || !["embed", "video"].includes(vsl.type) || !button || !host) return;
  button.hidden = false;
  if (vsl.orientation === "portrait") document.getElementById("vsl").classList.add("is-portrait");
  document.querySelector("[data-vsl-fallback]").hidden = true;
  button.addEventListener("click", () => {
    let player;
    if (vsl.type === "video") {
      player = document.createElement("video");
      player.controls = true;
      player.playsInline = true;
      player.src = videoUrl.href;
      player.setAttribute("aria-label", "Mensagem de Felipe Rissi sobre o devocional");
      const captions = safeUrl(vsl.captionsUrl);
      if (captions) {
        const track = document.createElement("track");
        track.kind = "captions"; track.srclang = "pt-BR"; track.label = "Português";
        track.src = captions.href; track.default = true; player.append(track);
      }
    } else {
      player = document.createElement("iframe");
      player.src = videoUrl.href;
      player.title = "Mensagem de Felipe Rissi sobre o Deus de Processos";
      player.allow = "autoplay; fullscreen; picture-in-picture; encrypted-media";
      player.referrerPolicy = "strict-origin-when-cross-origin";
      player.allowFullscreen = true;
    }
    host.replaceChildren(player); host.hidden = false; button.hidden = true;
    document.querySelector(".vsl-poster").hidden = true;
    document.getElementById("vsl").classList.add("is-playing");
    player.tabIndex = 0; player.focus();
    if (vsl.type === "video") player.play().catch(() => {});
  }, { once: true });
})();
