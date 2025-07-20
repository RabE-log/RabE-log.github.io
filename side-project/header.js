// header.js
function initHeader() {
  const header = document.querySelector("header");
  const gridToggleBtn = document.getElementById("gridToggleBtn");
  const pageGrid = document.getElementById("pageGrid");

  if (!header || !gridToggleBtn || !pageGrid) return;

  let hideTimer;

  function hideHeader() {
    header.style.opacity = "0";
    header.style.pointerEvents = "none";
  }

  function showHeader() {
    header.style.opacity = "1";
    header.style.pointerEvents = "auto";
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideHeader, 11000);
  }

  function positionPageGrid() {
    const rect = gridToggleBtn.getBoundingClientRect();
    const menuWidth = pageGrid.offsetWidth || 180; // 안전하게 계산
    pageGrid.style.top = `${rect.bottom + window.scrollY + 4}px`;
    pageGrid.style.left = `${rect.right + window.scrollX - menuWidth}px`;
  }

  gridToggleBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    const isVisible = pageGrid.style.display === "flex";
    if (!isVisible) {
      positionPageGrid();
      pageGrid.style.display = "flex";
    } else {
      pageGrid.style.display = "none";
    }
  });

  pageGrid.addEventListener("change", function (e) {
    if (e.target.name === "page") {
      const url = e.target.dataset.url;
      if (url) {
        window.location.href = url;
      }
    }
  });

  document.addEventListener("click", function (e) {
    if (!gridToggleBtn.contains(e.target) && !pageGrid.contains(e.target)) {
      pageGrid.style.display = "none";
    }
  });

  ["mousemove", "scroll", "touchstart"].forEach(event =>
    window.addEventListener(event, showHeader, { passive: true })
  );

  pageGrid.style.display = "none";
  hideTimer = setTimeout(hideHeader, 11000);
}

// 타이틀 텍스트와 label 텍스트가 같으면 해당 라디오를 체크
const pageTitle = document.title.trim();
const radioInputs = pageGrid.querySelectorAll('input[name="page"]');

radioInputs.forEach(input => {
  const label = pageGrid.querySelector(`label[for="${input.id}"]`);
  if (label && label.textContent.trim() === pageTitle) {
    input.checked = true;
    input.dispatchEvent(new Event("change")); // 선택된 효과 적용
  }
});
