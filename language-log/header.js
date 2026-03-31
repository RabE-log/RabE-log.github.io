// Language Log — header.js
function initHeader() {
  const header   = document.querySelector("header");
  const gridBtn  = document.getElementById("gridToggleBtn");
  const dropdown = document.getElementById("pageGrid");
  if (!header || !gridBtn || !dropdown) return;

  let hideTimer;

  function hideHeader() {
    header.style.opacity = "0.9";
    gridBtn.style.pointerEvents = "none";
  }
  function showHeader() {
    header.style.opacity = "1";
    gridBtn.style.pointerEvents = "auto";
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideHeader, 11000);
  }

  function positionDropdown() {
    const rect = gridBtn.getBoundingClientRect();
    dropdown.style.top   = (rect.bottom + 8) + "px";
    dropdown.style.right = (window.innerWidth - rect.right) + "px";
    dropdown.style.left  = "auto";
  }

  gridBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = dropdown.classList.contains("open");
    if (!open) { positionDropdown(); dropdown.classList.add("open"); }
    else        { dropdown.classList.remove("open"); }
  });

  document.addEventListener("click", (e) => {
    if (!gridBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove("open");
    }
  });

  dropdown.querySelectorAll('input[name="page"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
      if (e.isTrusted) {
        const url = e.target.dataset.url;
        if (url) window.location.href = url;
      }
    });
  });

  const title = document.title.trim();
  dropdown.querySelectorAll("label").forEach(label => {
    if (label.textContent.trim() === title) {
      const radio = document.getElementById(label.getAttribute("for"));
      if (radio) radio.checked = true;
    }
  });

  ["mousemove", "scroll", "touchstart"].forEach(ev =>
    window.addEventListener(ev, showHeader, { passive: true })
  );

  dropdown.classList.remove("open");
  hideTimer = setTimeout(hideHeader, 11000);
}