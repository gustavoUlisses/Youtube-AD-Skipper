(() => {
  const adblocker = true;
  const removePopup = true;
  const debug = true;
  const domains = ["*.youtube-nocookie.com/*"];
  const paths = [
    "playerResponse.adPlacements",
    "playerResponse.playerAds",
    "adPlacements",
    "playerAds",
    "playerConfig",
    "auxiliaryUi.messageRenderers.enforcementMessageViewModel",
  ];

  const observerConfig = { childList: true, subtree: true };
  let unpausedAfterSkip = 0;
  if (debug) console.log("Remove Adblock Thing: Script started");
  window.__ytplayer_adblockDetected = false;
  if (adblocker) addblocker();
  if (removePopup) popupRemover();

  const observer = new MutationObserver(() => removeJsonPaths(domains, paths));
  if (removePopup) observer.observe(document.body, observerConfig);

  function popupRemover() {
    removeJsonPaths(domains, paths);
    setInterval(() => {
      const modalOverlay = document.querySelector("tp-yt-iron-overlay-backdrop");
      const popup = document.querySelector(".style-scope ytd-enforcement-message-view-model");
      const popupButton = document.getElementById("dismiss-button");
      const popupButton2 = document.querySelector("#ytp-play-button.ytp-button");
      const video1 = document.querySelector("#movie_player > video.html5-main-video");
      const video2 = document.querySelector("#movie_player > .html5-video-container > video");
      document.body.style.setProperty("overflow-y", "scroll", "important");
      if (modalOverlay) modalOverlay.removeAttribute("opened") && modalOverlay.remove();
      if (popup) {
        if (debug) console.log("Remove Adblock Thing: Popup detected, removing...");
        popupButton && popupButton.click();
        popupButton2 && popupButton2.click();
        popup.remove();
        unpausedAfterSkip = 2;
        if (debug) console.log("Remove Adblock Thing: Popup removed");
      }
      if (!unpausedAfterSkip > 0) return;
      [video1, video2].forEach(video => {
        video && (video.paused ? unPauseVideo() : unpausedAfterSkip--);
      });
    }, 1000);
  }

  function addblocker() {
    setInterval(() => {
      const skipBtn = document.querySelector(".videoAdUiSkipButton,.ytp-ad-skip-button");
      const ad = [...document.querySelectorAll(".ad-showing")][0];
      const sidAd = document.querySelector("ytd-action-companion-ad-renderer");
      if (ad) {
        document.querySelector("video").playbackRate = 10;
        document.querySelector("video").volume = 0;
        skipBtn && skipBtn.click();
      }
      sidAd && sidAd.remove();
    }, 50);
  }

  function unPauseVideo() {
    const keyEvent = new KeyboardEvent("keydown", { key: "k", code: "KeyK", keyCode: 75, which: 75, bubbles: true, cancelable: true, view: window });
    document.dispatchEvent(keyEvent);
    unpausedAfterSkip = 0;
    if (debug) console.log("Remove Adblock Thing: Unpaused video using 'k' key");
  }

  function removeJsonPaths(domains, paths) {
    const domain = window.location.hostname;
    if (!domains.includes(domain)) return;
    paths.forEach(path => {
      const parts = path.split(".");
      let obj = window;
      for (const part of parts) {
        if (obj.hasOwnProperty(part)) obj = obj[part];
        else break;
      }
      obj = undefined;
    });
  }
})();
