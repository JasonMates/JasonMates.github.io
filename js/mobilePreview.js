(function () {
  "use strict";

  const modal = document.getElementById("mobileModal");
  const frame = document.getElementById("mobilePreviewFrame");
  if (!modal || !frame) return;

  function isMobile() {
    return window.matchMedia("(max-width: 900px)").matches;
  }

  function openModal({ type, media, alt }) {
    // Clear old content
    frame.innerHTML = "";
    frame.classList.remove("is-iphone", "is-fourthree");

    // Set aspect type
    if (type === "fourthree") frame.classList.add("is-fourthree");
    else frame.classList.add("is-iphone");

    // Render media
    const isVideo = /\.mp4(\?.*)?$/i.test(media);

    if (isVideo) {
      const v = document.createElement("video");
      v.setAttribute("controls", "true");
      v.setAttribute("playsinline", "true");
      v.setAttribute("preload", "metadata");
      v.style.width = "100%";
      v.style.height = "100%";

      const src = document.createElement("source");
      src.src = media;
      src.type = "video/mp4";
      v.appendChild(src);

      v.appendChild(document.createTextNode("Your browser does not support the video tag."));
      frame.appendChild(v);
    } else {
      const img = document.createElement("img");
      img.src = media;
      img.alt = alt || "Project preview";
      frame.appendChild(img);
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    frame.innerHTML = "";
    document.body.style.overflow = "";
  }

  // Close handlers
  modal.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.getAttribute && t.getAttribute("data-close") === "true") closeModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  // Timeline tap handler (only on mobile)
  document.addEventListener("click", (e) => {
    if (!isMobile()) return;

    const btn = e.target.closest(".timeline-item");
    if (!btn) return;

    const media = btn.getAttribute("data-media");
    if (!media) return;

    const type = btn.getAttribute("data-type") || "iphone";
    const alt = btn.getAttribute("data-alt") || btn.textContent.trim();

    openModal({ type, media, alt });
  });

  // If they rotate / resize to desktop while open, close it
  window.addEventListener("resize", () => {
    if (!isMobile() && modal.classList.contains("is-open")) closeModal();
  });
})();
