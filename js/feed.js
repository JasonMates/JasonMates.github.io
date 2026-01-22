(function () {
  "use strict";

  const tiles = Array.from(document.querySelectorAll(".tile-media"));
  const videos = Array.from(document.querySelectorAll(".tile video"));
  const topbar = document.querySelector(".topbar-overlay");
  const targets = Array.from(document.querySelectorAll(".topbar-brand, .topbar-center, .topbar-right"));


  function setPressed(el, pressed) {
    el.setAttribute("aria-pressed", pressed ? "true" : "false");
  }

  function pressOn(el) {
    el.classList.add("is-pressed");
    setPressed(el, true);
  }

  function pressOff(el) {
    el.classList.remove("is-pressed");
    setPressed(el, false);
  }

  // video autoplay
  if (videos.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const v = entry.target;
          if (entry.isIntersecting) v.play().catch(() => {});
          else v.pause();
        });
      },
      { threshold: 0.25 }
    );

    videos.forEach((v) => {
      v.muted = true;
      v.playsInline = true;
      v.loop = true;
      v.preload = "metadata";
      v.setAttribute("muted", "");
      v.setAttribute("playsinline", "");
      v.setAttribute("loop", "");
      v.setAttribute("autoplay", "");
      io.observe(v);
    });
  }

  // tile interactions (hover + press)
  tiles.forEach((tile) => {
    tile.addEventListener("mouseenter", () => tile.classList.add("is-hovered"));
    tile.addEventListener("mouseleave", () => tile.classList.remove("is-hovered"));

    tile.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      tile.setPointerCapture?.(e.pointerId);
      pressOn(tile);
    });

    tile.addEventListener("pointerup", () => pressOff(tile));
    tile.addEventListener("pointercancel", () => pressOff(tile));
    tile.addEventListener("pointerleave", () => pressOff(tile));

    tile.addEventListener("keydown", (e) => {
      if (e.repeat) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        pressOn(tile);
      }
    });

    tile.addEventListener("keyup", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        pressOff(tile);
      }
    });

    tile.addEventListener("blur", () => pressOff(tile));
  });

  // topbar blend AHHHHHHHHHHHHHH!!!
  if (topbar && tiles.length) {
    function overlaps(a, b) {
      return !(
        a.right < b.left ||
        a.left > b.right ||
        a.bottom < b.top ||
        a.top > b.bottom
      );
    }

    function updateTopbarBlend() {
      const t = topbar.getBoundingClientRect();
      let hit = false;

        for (const target of targets) {
          const t = target.getBoundingClientRect();

          for (const tile of tiles) {
            const r = tile.getBoundingClientRect();
            if (r.bottom < t.top - 8) continue;
            if (r.top > t.bottom + 120) continue;

            if (overlaps(t, r)) { hit = true; break; }
          }

          if (hit) break;
        }

        document.querySelector(".topbar-overlay")?.classList.toggle("is-over-tiles", hit);

    }

    let scheduled = false;
    function scheduleUpdate() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        updateTopbarBlend();
      });
    }

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    updateTopbarBlend();
  }
})();
