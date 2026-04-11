(() => {
  const AD_SPEED = 16;       // velocidade do anúncio (16x = ~1s visível)
  const AD_VOLUME = 0;       // mudo durante o anúncio
  const POLL_MS  = 50;       // intervalo de verificação em ms
  const debug    = false;    // true para logs no console

  const log = (...args) => debug && console.log("[YT-AD-Skipper]", ...args);

  // ── Seletores atualizados (2024-2025) ────────────────────────────────────
  const SKIP_SELECTORS = [
    ".ytp-ad-skip-button",
    ".ytp-ad-skip-button-modern",
    ".ytp-skip-ad-button",
    "[class*='skip-button']",
  ].join(",");

  const AD_SHOWING_SELECTORS = [
    ".ad-showing",
    ".ytp-ad-player-overlay",
  ];

  const SIDE_AD_SELECTORS = [
    "ytd-action-companion-ad-renderer",
    "ytd-banner-promo-renderer",
    "ytd-statement-banner-renderer",
    "#masthead-ad",
  ].join(",");

  const POPUP_SELECTORS = {
    overlay:  "tp-yt-iron-overlay-backdrop",
    popup:    [
      ".style-scope ytd-enforcement-message-view-model",
      "ytd-enforcement-message-view-model",
      "#dialog-body ytd-enforcement-message-view-model",
    ].join(","),
    dismiss:  "#dismiss-button",
    playBtn:  "#ytp-play-button.ytp-button, .ytp-play-button",
  };

  // ── Verifica se anúncio está tocando ─────────────────────────────────────
  function isAdPlaying() {
    return AD_SHOWING_SELECTORS.some(sel => document.querySelector(sel) !== null);
  }

  // ── Pega o elemento <video> principal ────────────────────────────────────
  function getVideo() {
    return (
      document.querySelector("#movie_player video.html5-main-video") ||
      document.querySelector("#movie_player .html5-video-container video") ||
      document.querySelector("video")
    );
  }

  // ── Acelera o anúncio e tenta clicar em "Pular" ──────────────────────────
  function handleAd() {
    if (!isAdPlaying()) return;

    const video = getVideo();
    if (video) {
      if (video.playbackRate !== AD_SPEED) {
        video.playbackRate = AD_SPEED;
        log(`playbackRate → ${AD_SPEED}`);
      }
      video.volume = AD_VOLUME;
      video.muted  = true;
    }

    const skipBtn = document.querySelector(SKIP_SELECTORS);
    if (skipBtn) {
      skipBtn.click();
      log("Botão pular clicado");
    }
  }

  // ── Restaura o vídeo após o anúncio ──────────────────────────────────────
  function restoreVideo() {
    if (isAdPlaying()) return;
    const video = getVideo();
    if (!video) return;

    if (video.playbackRate === AD_SPEED) {
      video.playbackRate = 1;
      video.muted  = false;
      video.volume = 1;
      log("Vídeo restaurado");
    }
  }

  // ── Remove anúncios laterais ──────────────────────────────────────────────
  function removeSideAds() {
    document.querySelectorAll(SIDE_AD_SELECTORS).forEach(el => {
      log("Side-ad removido:", el.tagName);
      el.remove();
    });
  }

  // ── Remove popup "Desative o bloqueador" ──────────────────────────────────
  let unpauseCountdown = 0;

  function removeAdblockPopup() {
    const overlay = document.querySelector(POPUP_SELECTORS.overlay);
    const popup   = document.querySelector(POPUP_SELECTORS.popup);

    if (overlay) {
      overlay.removeAttribute("opened");
      overlay.remove();
    }

    if (popup) {
      log("Popup detectado, removendo...");
      const dismiss = document.querySelector(POPUP_SELECTORS.dismiss);
      dismiss && dismiss.click();
      popup.remove();
      unpauseCountdown = 3;
    }

    // Retoma o vídeo se ficou pausado por causa do popup
    if (unpauseCountdown > 0) {
      const video = getVideo();
      if (video) {
        if (video.paused) {
          unpauseVideo();
        } else {
          unpauseCountdown--;
        }
      }
    }

    // Garante barra de scroll visível (o popup bloqueia ela)
    document.body.style.setProperty("overflow-y", "scroll", "important");
  }

  function unpauseVideo() {
    // Simula tecla K (play/pause) — funciona mesmo com foco fora do player
    document.dispatchEvent(new KeyboardEvent("keydown", {
      key: "k", code: "KeyK", keyCode: 75, which: 75,
      bubbles: true, cancelable: true, view: window,
    }));
    unpauseCountdown = 0;
    log("Vídeo despausado via tecla K");
  }

  // ── Loop principal ────────────────────────────────────────────────────────
  setInterval(() => {
    handleAd();
    restoreVideo();
    removeSideAds();
    removeAdblockPopup();
  }, POLL_MS);

  // ── Observa mudanças no DOM (navegação SPA do YouTube) ────────────────────
  const observer = new MutationObserver(() => {
    removeSideAds();
    removeAdblockPopup();
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });

  log("Extensão iniciada ✓");
})();
