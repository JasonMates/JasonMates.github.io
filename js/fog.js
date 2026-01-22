(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotion.matches) return;

  const fog = document.querySelector(".fog");
  if (!fog) return;

  let cx = 0.5;
  let cy = 0.5;

  let tx = 0.5;
  let ty = 0.5;

  const maxShift = 8;

  const base = {
    x1: 15, y1: 20,
    x2: 80, y2: 30,
    x3: 50, y3: 80
  };

  // smoothing factor
  const ease = 0.08;

  function clamp01(n) {
    return Math.max(0, Math.min(1, n));
  }

  function onMove(e) {
    tx = clamp01(e.clientX / window.innerWidth);
    ty = clamp01(e.clientY / window.innerHeight);
  }

  // support touch
  function onTouchMove(e) {
    if (!e.touches || !e.touches.length) return;
    tx = clamp01(e.touches[0].clientX / window.innerWidth);
    ty = clamp01(e.touches[0].clientY / window.innerHeight);
  }

  // render loop
  function tick() {
    cx += (tx - cx) * ease;
    cy += (ty - cy) * ease;

    const nx = (cx - 0.5) * 2;
    const ny = (cy - 0.5) * 2;

    const x1 = base.x1 + nx * maxShift * 1.0;
    const y1 = base.y1 + ny * maxShift * 0.9;

    const x2 = base.x2 + nx * maxShift * 0.8;
    const y2 = base.y2 + ny * maxShift * 0.7;

    const x3 = base.x3 + nx * maxShift * 0.6;
    const y3 = base.y3 + ny * maxShift * 0.8;

    // Update CSS variables
    fog.style.setProperty("--x1", `${x1}%`);
    fog.style.setProperty("--y1", `${y1}%`);
    fog.style.setProperty("--x2", `${x2}%`);
    fog.style.setProperty("--y2", `${y2}%`);
    fog.style.setProperty("--x3", `${x3}%`);
    fog.style.setProperty("--y3", `${y3}%`);

    requestAnimationFrame(tick);
  }

  // pointer movement
  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: true });

  requestAnimationFrame(tick);
})();
