/* ============================================================
   MOVIE MANIA 101 — TRAILER ADD-ON
   Drop this into your existing script.js (or link as a
   separate <script> tag at the bottom of index.html).

   HOW IT WORKS:
   1. Watches for new movie cards added to the DOM (MutationObserver)
   2. Injects a "▶ Trailer" button onto every card automatically
   3. On click, searches YouTube for the official trailer and
      opens it in a sleek fullscreen modal — no API key needed

   INSTALL:
   Option A) Paste the whole thing at the bottom of script.js
   Option B) Save as trailer-addon.js and add to index.html:
             <script src="trailer-addon.js"></script>
   ============================================================ */

(function () {
  "use strict";

  /* ── 1. INJECT STYLES ─────────────────────────────────────── */
  const style = document.createElement("style");
  style.textContent = `
    /* Trailer button */
    .mm-trailer-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
      padding: 7px 14px;
      background: #e63946;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      transition: background 0.2s, transform 0.15s;
      font-family: inherit;
      width: 100%;
      justify-content: center;
    }
    .mm-trailer-btn:hover {
      background: #c1121f;
      transform: translateY(-1px);
    }
    .mm-trailer-btn svg {
      flex-shrink: 0;
    }

    /* Modal overlay */
    #mm-trailer-modal {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: rgba(0, 0, 0, 0.90);
      backdrop-filter: blur(12px);
      align-items: center;
      justify-content: center;
      animation: mmFadeIn 0.25s ease;
    }
    #mm-trailer-modal.open {
      display: flex;
    }
    @keyframes mmFadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    /* Modal box */
    .mm-modal-box {
      width: 90%;
      max-width: 860px;
      animation: mmSlideUp 0.28s ease;
    }
    @keyframes mmSlideUp {
      from { transform: translateY(24px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    /* Modal header */
    .mm-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .mm-modal-title {
      color: #fff;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.03em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 80%;
      font-family: inherit;
    }
    .mm-modal-close {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.25);
      color: #fff;
      padding: 6px 16px;
      border-radius: 4px;
      font-size: 12px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.2s;
      flex-shrink: 0;
    }
    .mm-modal-close:hover { background: rgba(255,255,255,0.2); }

    /* Video container */
    .mm-video-container {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      background: #111;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .mm-video-container iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: none;
    }

    /* Loading state inside modal */
    .mm-video-loading {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      color: rgba(255,255,255,0.5);
      font-size: 13px;
      letter-spacing: 0.06em;
      font-family: inherit;
    }
    .mm-spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: #e63946;
      border-radius: 50%;
      animation: mmSpin 0.7s linear infinite;
    }
    @keyframes mmSpin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);

  /* ── 2. BUILD MODAL ────────────────────────────────────────── */
  const modal = document.createElement("div");
  modal.id = "mm-trailer-modal";
  modal.innerHTML = `
    <div class="mm-modal-box">
      <div class="mm-modal-header">
        <div class="mm-modal-title" id="mm-modal-title">Loading…</div>
        <button class="mm-modal-close" id="mm-modal-close">✕ Close</button>
      </div>
      <div class="mm-video-container" id="mm-video-container">
        <div class="mm-video-loading" id="mm-video-loading">
          <div class="mm-spinner"></div>
          <span>Searching for trailer…</span>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const closeModal = () => {
    modal.classList.remove("open");
    // Stop video by removing iframe
    const existing = document.getElementById("mm-trailer-iframe");
    if (existing) existing.remove();
    document.getElementById("mm-video-loading").style.display = "flex";
  };

  document.getElementById("mm-modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  /* ── 3. OPEN TRAILER ───────────────────────────────────────── */
  function openTrailer(title, year) {
    document.getElementById("mm-modal-title").textContent = title;
    document.getElementById("mm-video-loading").style.display = "flex";

    // Remove any old iframe
    const old = document.getElementById("mm-trailer-iframe");
    if (old) old.remove();

    modal.classList.add("open");

    // Build YouTube search query → redirect to first result embed
    // We use YouTube's no-cookie embed with the search query as a fallback,
    // but the cleanest approach is constructing a search URL that YouTube
    // resolves. Since we can't call YouTube API without a key, we embed a
    // YouTube search iframe which auto-plays the top result.
    const query = encodeURIComponent(`${title} ${year || ""} official trailer`);
    const src = `https://www.youtube-nocookie.com/embed?listType=search&list=${query}&autoplay=1&rel=0`;

    const iframe = document.createElement("iframe");
    iframe.id = "mm-trailer-iframe";
    iframe.src = src;
    iframe.allow = "autoplay; encrypted-media; fullscreen";
    iframe.allowFullscreen = true;
    iframe.onload = () => {
      document.getElementById("mm-video-loading").style.display = "none";
    };

    document.getElementById("mm-video-container").appendChild(iframe);
  }

  /* ── 4. CREATE TRAILER BUTTON ──────────────────────────────── */
  function createTrailerButton(title, year) {
    const btn = document.createElement("button");
    btn.className = "mm-trailer-btn";
    btn.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z"/>
      </svg>
      Trailer
    `;
    btn.title = `Watch trailer for ${title}`;
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // don't trigger card click
      openTrailer(title, year);
    });
    return btn;
  }

  /* ── 5. INJECT BUTTON INTO A CARD ─────────────────────────── */
  function injectButton(card) {
    // Skip if already has a button
    if (card.querySelector(".mm-trailer-btn")) return;

    // Try to read title from common patterns used in OMDB-based apps:
    // <h2>, <h3>, <h4>, .movie-title, [data-title], img[alt], etc.
    let title =
      card.querySelector("h2, h3, h4, .movie-title, .title, .card-title")?.textContent?.trim() ||
      card.querySelector("img")?.alt?.trim() ||
      card.getAttribute("data-title") ||
      card.getAttribute("data-imdbid") ||
      "";

    // Year — optional, improves search accuracy
    let year =
      card.querySelector(".year, .movie-year, .release-date, [data-year]")?.textContent?.trim() ||
      card.getAttribute("data-year") ||
      "";

    if (!title) return; // can't do anything without a title

    const btn = createTrailerButton(title, year);

    // Append to card — try to find a natural footer/info area first
    const footer =
      card.querySelector(".card-body, .movie-info, .info, .details, .card-footer, .movie-details") ||
      card;

    footer.appendChild(btn);
  }

  /* ── 6. WATCH DOM FOR NEW CARDS ────────────────────────────── */
  // Covers: initial load, search results, infinite scroll, etc.

  // Common selectors for movie card containers in OMDB-style apps
  const CARD_SELECTORS = [
    ".movie-card",
    ".card",
    ".movie",
    ".movie-item",
    ".result",
    ".movie-result",
    "[data-imdbid]",
    "[data-title]",
  ];

  function processAll() {
    CARD_SELECTORS.forEach((sel) => {
      document.querySelectorAll(sel).forEach(injectButton);
    });
  }

  // Run once on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", processAll);
  } else {
    processAll();
  }

  // Watch for dynamically added cards (search results)
  const observer = new MutationObserver(() => processAll());
  observer.observe(document.body, { childList: true, subtree: true });

})();
