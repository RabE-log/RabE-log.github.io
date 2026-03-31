// header.js
function initHeader() {
  const header = document.querySelector("header");
  const gridToggleBtn = document.getElementById("gridToggleBtn");
  const pageGrid = document.getElementById("pageGrid");
  if (!header || !gridToggleBtn || !pageGrid) return;

  let hideTimer;

  function hideHeader(){
    header.style.opacity="0.92";
    // ★ header 전체 pointerEvents:none 대신 검색박스는 살려둠
    gridToggleBtn.style.pointerEvents="none";
    pageGrid.style.pointerEvents="none";
  }

  function showHeader(){
    header.style.opacity="1";
    gridToggleBtn.style.pointerEvents="auto";
    pageGrid.style.pointerEvents="auto";
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideHeader, 11000);
  }

  function positionPageGrid(){
    const rect = gridToggleBtn.getBoundingClientRect();
    const menuWidth = pageGrid.offsetWidth || 180;
    pageGrid.style.top  = `${rect.bottom + window.scrollY + 4}px`;
    pageGrid.style.left = `${rect.right  + window.scrollX - menuWidth}px`;
  }

  gridToggleBtn.addEventListener("click", (e)=>{
    e.stopPropagation();
    const isVisible = pageGrid.style.display === "flex";
    if(!isVisible){ positionPageGrid(); pageGrid.style.display = "flex"; }
    else          { pageGrid.style.display = "none"; }
  });

  // 사용자 조작일 때만 페이지 이동
  pageGrid.addEventListener("change", (e)=>{
    if (e.target.name === "page" && e.isTrusted) {
      const url = e.target.dataset.url;
      if (url) window.location.href = url;
    }
  });

  document.addEventListener("click", (e)=>{
    if (!gridToggleBtn.contains(e.target) && !pageGrid.contains(e.target)) {
      pageGrid.style.display = "none";
    }
  });

  ["mousemove","scroll","touchstart"].forEach(ev =>
    window.addEventListener(ev, showHeader, { passive:true })
  );

  // 현재 페이지 라디오 체크
  const pageTitle = document.title.trim();
  const radios = pageGrid.querySelectorAll('input[name="page"]');
  radios.forEach(input => {
    const label = pageGrid.querySelector(`label[for="${input.id}"]`);
    if (label && label.textContent.trim() === pageTitle) {
      input.checked = true;
    }
  });

  pageGrid.style.display = "none";
  hideTimer = setTimeout(hideHeader, 11000);
}