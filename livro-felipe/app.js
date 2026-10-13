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
  const setupVideoControls = (player) => {
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "vsl-toggle is-paused";
    toggle.innerHTML = '<span class="vsl-toggle-symbol" aria-hidden="true"><svg class="vsl-resume-icon" viewBox="0 0 64 64"><path d="M18 10 53 32 18 54Z"/></svg><svg class="vsl-pause-icon" viewBox="0 0 64 64"><path d="M18 12h10v40H18zM36 12h10v40H36z"/></svg></span><span class="vsl-resume-label">Continuar</span>';
    const progress = document.createElement("div");
    progress.className = "vsl-progress";
    progress.setAttribute("role", "progressbar");
    progress.setAttribute("aria-label", "Progresso do vídeo");
    progress.setAttribute("aria-valuemin", "0");
    progress.setAttribute("aria-valuemax", "100");
    progress.setAttribute("aria-valuenow", "0");
    progress.innerHTML = '<span class="vsl-progress-fill"></span>';
    const status = document.createElement("span");
    status.className = "vsl-status";
    status.setAttribute("role", "status");
    status.hidden = true;
    const syncPlayback = () => {
      const paused = player.paused || player.ended;
      toggle.classList.toggle("is-paused", paused);
      toggle.setAttribute("aria-label", player.ended ? "Assistir novamente" : paused ? "Continuar vídeo" : "Pausar vídeo");
      toggle.querySelector(".vsl-resume-label").textContent = player.ended ? "Assistir novamente" : "Continuar";
    };
    const syncProgress = () => {
      const fraction = Number.isFinite(player.duration) && player.duration > 0 ? Math.min(1, Math.max(0, player.currentTime / player.duration)) : 0;
      // Ease-out visual: fast at the start, slower at the end. The real
      // playback position drives it, so it stops during pauses and buffering.
      const visual = player.ended ? 1 : Math.min(0.995, 1 - Math.pow(1 - fraction, 2.4));
      progress.style.setProperty("--vsl-progress", visual);
      progress.setAttribute("aria-valuenow", String(Math.round(fraction * 100)));
    };
    const play = () => {
      if (player.ended) player.currentTime = 0;
      player.play().catch(() => { syncPlayback(); });
    };
    toggle.addEventListener("click", () => {
      if (player.paused || player.ended) play(); else player.pause();
      syncPlayback(); syncProgress();
    });
    player.addEventListener("keydown", (event) => {
      if ([" ", "k", "K"].includes(event.key)) {
        event.preventDefault(); toggle.click();
      }
    });
    for (const event of ["play", "pause", "ended"]) player.addEventListener(event, syncPlayback);
    for (const event of ["timeupdate", "loadedmetadata", "seeked", "ended"]) player.addEventListener(event, syncProgress);
    player.addEventListener("waiting", () => { status.textContent = "Carregando…"; status.hidden = false; });
    player.addEventListener("playing", () => { status.hidden = true; });
    player.addEventListener("pause", () => { status.hidden = true; });
    player.addEventListener("error", () => { status.textContent = "Não foi possível carregar o vídeo. Atualize a página para tentar novamente."; status.hidden = false; });
    host.append(toggle, progress, status);
    syncPlayback(); syncProgress();
    return toggle;
  };
  button.addEventListener("click", () => {
    let player;
    if (vsl.type === "video") {
      player = document.createElement("video");
      player.controls = false;
      player.playsInline = true;
      player.disablePictureInPicture = true;
      player.disableRemotePlayback = true;
      player.preload = "metadata";
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
    const focusTarget = vsl.type === "video" ? setupVideoControls(player) : player;
    focusTarget.tabIndex = 0; focusTarget.focus();
    if (vsl.type === "video") player.play().catch(() => {});
  }, { once: true });
})();
