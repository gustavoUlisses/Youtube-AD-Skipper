(function () {
  // Configurações
  const adblocker = true;
  const removePopup = true;
  const debug = true;


  const domainsToRemove = ["*.youtube-nocookie.com/*"];
  const jsonPathsToRemove = [
    "playerResponse.adPlacements",
    "playerResponse.playerAds",
    "adPlacements",
    "playerAds",
    "playerConfig",
    "auxiliaryUi.messageRenderers.enforcementMessageViewModel",
  ];

  const observerConfig = {
    childList: true,
    subtree: true,
  };

  let unpausedAfterSkip = 0;

  if (debug) console.log("Remove Adblock Thing: Script started");

  window.__ytplayer_adblockDetected = false;

  if (adblocker) addblocker();
  if (removePopup) popupRemover();

  const observer = new MutationObserver(() => {
    removeJsonPaths(domainsToRemove, jsonPathsToRemove);
  });
  if (removePopup) observer.observe(document.body, observerConfig);

  function popupRemover() {
    removeJsonPaths(domainsToRemove, jsonPathsToRemove);

    setInterval(() => {
      const modalOverlay = document.querySelector(
        "tp-yt-iron-overlay-backdrop"
      );
      const popup = document.querySelector(
        ".style-scope ytd-enforcement-message-view-model"
      );
      const popupButton = document.getElementById("dismiss-button");
      const popupButton2 = document.querySelector(
        "#ytp-play-button.ytp-button"
      );
      const video1 = document.querySelector(
        "#movie_player > video.html5-main-video"
      );
      const video2 = document.querySelector(
        "#movie_player > .html5-video-container > video"
      );
      const bodyStyle = document.body.style;

      bodyStyle.setProperty("overflow-y", "scroll", "important");

      if (modalOverlay) {
        modalOverlay.removeAttribute("opened");
        modalOverlay.remove();
      }

      if (popup) {
        if (debug)
          console.log("Remove Adblock Thing: Popup detected, removing...");
        if (popupButton) popupButton.click();
        if (popupButton2) popupButton2.click();
        popup.remove();
        unpausedAfterSkip = 2;

        if (debug) console.log("Remove Adblock Thing: Popup removed");
      }

      if (!unpausedAfterSkip > 0) return;

      if (video1) {
        if (video1.paused) unPauseVideo();
        else if (unpausedAfterSkip > 0) unpausedAfterSkip--;
      }
      if (video2) {
        if (video2.paused) unPauseVideo();
        else if (unpausedAfterSkip > 0) unpausedAfterSkip--;
      }
    }, 1000);
  }

  function addblocker() {
    setInterval(() => {
      const skipBtn = document.querySelector(
        ".videoAdUiSkipButton,.ytp-ad-skip-button"
      );
      const ad = [...document.querySelectorAll(".ad-showing")][0];
      const sidAd = document.querySelector("ytd-action-companion-ad-renderer");

      if (ad) {
        document.querySelector("video").playbackRate = 10;
        document.querySelector("video").volume = 0;

        if (skipBtn) {
          skipBtn.click();
        }
      }
      if (sidAd) {
        sidAd.remove();
      }
    }, 50);
  }

  function unPauseVideo() {
    const keyEvent = new KeyboardEvent("keydown", {
      key: "k",
      code: "KeyK",
      keyCode: 75,
      which: 75,
      bubbles: true,
      cancelable: true,
      view: window,
    });
    document.dispatchEvent(keyEvent);
    unpausedAfterSkip = 0;
    if (debug)
      console.log("Remove Adblock Thing: Unpaused video using 'k' key");
  }

  function removeJsonPaths(domains, jsonPaths) {
    const currentDomain = window.location.hostname;

    if (!domains.includes(currentDomain)) return;

    jsonPaths.forEach((jsonPath) => {
      const pathParts = jsonPath.split(".");
      let obj = window;

      for (const part of pathParts) {
        if (obj.hasOwnProperty(part)) {
          obj = obj[part];
        } else {
          break;
        }
      }
      obj = undefined;
    });
  }
})();
