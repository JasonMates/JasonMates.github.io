(function () {
  "use strict";

  const timelineBox = document.getElementById("timelineBox");
  const items = document.querySelectorAll(".timeline-item");

  const previewLayer = document.getElementById("previewLayer");
  const previewCard = document.getElementById("previewCard");
  const previewMediaWrap = document.getElementById("previewMediaWrap");
  const previewMedia = document.getElementById("previewMedia");
  const previewChip = document.getElementById("previewChip");

  const infoToggle = document.querySelector(".info-toggle");
  const infoPanel = document.getElementById("infoPanel");
  const infoBackdrop = document.querySelector(".info-backdrop");

  // track pointer and prevent reposition caused by mouse clicks
  let lastPointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let suppressFocusPosition = false;

  function closeInfo() {
    infoPanel.hidden = true;
    infoBackdrop.hidden = true;
    infoToggle.setAttribute("aria-expanded", "false");
  }

  function openInfo() {
    infoPanel.hidden = false;
    infoBackdrop.hidden = false;
    infoToggle.setAttribute("aria-expanded", "true");
  }

  if (infoToggle) {
    infoToggle.addEventListener("click", () => {
      const isOpen = infoToggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeInfo() : openInfo();
    });
  }

infoBackdrop?.addEventListener("click", closeInfo);

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function clamp01(n) {
    return clamp(n, 0, 1);
  }

  function setAspectAndSize(aspect) {
    previewMediaWrap.classList.remove("aspect-iphone", "aspect-fourthree");
    previewCard.classList.remove("size-iphone", "size-fourthree");

    if (aspect === "fourthree") {
      previewMediaWrap.classList.add("aspect-fourthree");
      previewCard.classList.add("size-fourthree");
    } else {
      previewMediaWrap.classList.add("aspect-iphone");
      previewCard.classList.add("size-iphone");
    }
  }

function renderMedia(type, src) {
  previewMedia.innerHTML = "";

  if (type === "video") {
    const v = document.createElement("video");

    // Safari autoplay requirements (especially for dynamically created videos)
    v.muted = true;
    v.autoplay = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = "metadata";

    // Set attributes too (Safari can be picky about dynamic elements)
    v.setAttribute("muted", "");
    v.setAttribute("autoplay", "");
    v.setAttribute("loop", "");
    v.setAttribute("playsinline", "");

    // If you want the preview to fill its box, keep CSS object-fit rules.
    // (No aspect ratio changes here.)

    const s = document.createElement("source");
    s.src = src;
    s.type = "video/mp4"; // OK if your files are truly H.264/AAC MP4
    v.appendChild(s);

    previewMedia.appendChild(v);

    // Important for Safari when sources are injected dynamically
    v.load();

    const tryPlay = () => {
      const p = v.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // Autoplay blocked or codec issue: allow manual start
          v.controls = true;
        });
      }
    };

    // Try immediately and again when it can play
    tryPlay();
    v.addEventListener("canplay", tryPlay, { once: true });

    return;
  }

  const img = document.createElement("img");
  img.src = src;
  img.alt = "";
  previewMedia.appendChild(img);
}


  function showPreviewContent(el) {
    const mediaType = el.dataset.mediaType || "image";
    const mediaSrc = el.dataset.mediaSrc || "";
    const aspect = el.dataset.aspect || "iphone";
    const role = el.dataset.role || "";

    setAspectAndSize(aspect);
    if (mediaSrc) renderMedia(mediaType, mediaSrc);
    if (previewChip) previewChip.textContent = role;

    previewLayer.classList.add("is-visible");
    previewLayer.setAttribute("aria-hidden", "false");
  }

  function hidePreview() {
    previewLayer.classList.remove("is-visible");
    previewLayer.setAttribute("aria-hidden", "true");

    if (previewChip) previewChip.textContent = "";

    const v = previewMedia.querySelector("video");
    if (v) v.pause();
  }

  function positionPreview(e, el) {
    if (!timelineBox || !previewCard) return;

    const boxRect = timelineBox.getBoundingClientRect();
    const itemRect = el.getBoundingClientRect();
    const cardRect = previewCard.getBoundingClientRect();

    // normalized cursor
    const vY = clamp01(e.clientY / window.innerHeight);
    const tX = clamp01((e.clientX - itemRect.left) / itemRect.width);

    const aspect = el.dataset.aspect || "iphone";

    // 4:3 more centered iphone slightly right, changed from right to match
    const baseX = aspect === "fourthree" ? window.innerWidth * 0.52 : window.innerWidth * 0.52;
    const baseY = window.innerHeight * 0.52;

    // travel ranges
    const yTravel = 160;
    const xTravel = 80;

    const yOffset = (vY - 0.5) * 2 * (yTravel / 2);

    // horizontal drift
    const xOffset = (tX - 0.5) * 2 * (xTravel / 2);

    // overlap
    const maxOverlap = aspect === "fourthree" ? 55 : 90;
    const overlap = (1 - tX) * maxOverlap;

    // compute position
    let x = baseX + xOffset - overlap;
    let y = baseY + yOffset;

    x = x - cardRect.width / 2;
    y = y - cardRect.height / 2;

    // clamp to viewport
    const gutter = 18;
    x = clamp(x, gutter, window.innerWidth - cardRect.width - gutter);
    y = clamp(y, gutter, window.innerHeight - cardRect.height - gutter);

    // dont let it drift too far left
    const minX = boxRect.left + 12;
    x = Math.max(x, minX);

    previewCard.style.left = `${x}px`;
    previewCard.style.top = `${y}px`;
  }

  items.forEach((el) => {
    // detect click focus and prevent handler from jumping
    el.addEventListener(
      "pointerdown",
      (e) => {
        suppressFocusPosition = true;
        lastPointer.x = e.clientX;
        lastPointer.y = e.clientY;

        setTimeout(() => {
          suppressFocusPosition = false;
        }, 0);
      },
      { passive: true }
    );

    el.addEventListener("mouseenter", (e) => {
      lastPointer.x = e.clientX;
      lastPointer.y = e.clientY;

      showPreviewContent(el);
      positionPreview(e, el);
    });

    el.addEventListener("mousemove", (e) => {
      lastPointer.x = e.clientX;
      lastPointer.y = e.clientY;

      positionPreview(e, el);
    });

    el.addEventListener("mouseleave", hidePreview);

    el.addEventListener("focus", () => {
      showPreviewContent(el);

      // if focus came from a pointer click dont override pointer position
      if (suppressFocusPosition) {
        positionPreview(
          { clientX: lastPointer.x, clientY: lastPointer.y },
          el
        );
        return;
      }

      const r = el.getBoundingClientRect();
      positionPreview(
        { clientX: r.left + r.width / 2, clientY: window.innerHeight * 0.52 },
        el
      );
    });

    el.addEventListener("blur", hidePreview);
  });

  window.addEventListener("resize", () => {
    const active = document.querySelector(".timeline-item:hover, .timeline-item:focus");
    if (!active) return;

    const isHovering = !!document.querySelector(".timeline-item:hover");
    if (isHovering) {
      positionPreview(
        { clientX: lastPointer.x, clientY: lastPointer.y },
        active
      );
      return;
    }

    const r = active.getBoundingClientRect();
    positionPreview(
      { clientX: r.left + r.width / 2, clientY: window.innerHeight * 0.52 },
      active
    );
  });
})();
