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








/* ===== Grid Toggle Button 고정 패치: 닫힘 기본, 바깥 클릭/ESC/접힘 시 닫힘, 지연 로드 대응 ===== */
(function(){
  // 다형 셀렉터 헬퍼
  function pick(root, sels){ for(const s of sels){ const el=root.querySelector(s); if(el) return el; } return null; }

  function setupGridToggle(root = document){
    const header = root.querySelector('header');
    if (!header) return false;

    // 버튼/메뉴 이름이 다를 경우도 커버
    const btn  = pick(header, ['#gridToggleBtn','[data-grid-toggle]','.grid-toggle','.toggle-grid','button[aria-controls="pageGrid"]']);
    const grid = pick(header, ['#pageGrid','#page-grid','.page-grid','[data-grid="pageGrid"]']);
    if (!btn || !grid) return false;

    // 중복 초기화 방지
    if (btn.dataset.gridReady === '1') return true;
    btn.dataset.gridReady = '1';

    // 초기 상태: 무조건 닫힘
    grid.classList.remove('is-open');
    btn.setAttribute('aria-expanded','false');

    // 열기/닫기/토글
    const open  = ()=>{ grid.classList.add('is-open');  btn.setAttribute('aria-expanded','true');  };
    const close = ()=>{ grid.classList.remove('is-open');btn.setAttribute('aria-expanded','false'); };
    const toggle=(e)=>{
      if (e && (e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)) return; // 수정키는 원래 동작 유지
      e && e.preventDefault(); e && e.stopPropagation();
      (grid.classList.contains('is-open') ? close : open)();
    };

    // 이벤트 바인딩
    btn.addEventListener('click', toggle);

    // 바깥 클릭/ESC/스크롤/리사이즈 → 닫힘
    document.addEventListener('click', (e)=>{
      if (!grid.classList.contains('is-open')) return;
      if (btn.contains(e.target) || grid.contains(e.target)) return;
      close();
    });
    document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') close(); });
    window.addEventListener('scroll', ()=> grid.classList.contains('is-open') && close(), {passive:true});
    window.addEventListener('resize', ()=> grid.classList.contains('is-open') && close(), {passive:true});

    // 헤더 접힘(collapsed) 상태 감시 → 닫힘
    new MutationObserver(()=>{ if (header.classList.contains('collapsed')) close(); })
      .observe(header, { attributes:true, attributeFilter:['class'] });

    // 디버그(필요시 콘솔에서 확인)
    // console.debug('[gridToggle] ready', {btn, grid});
    return true;
  }

  // 즉시 시도, 실패하면 DOM 주입될 때까지 관찰 (외부 header.html 로드 타이밍 대응)
  if (!setupGridToggle()) {
    const mo = new MutationObserver(() => { if (setupGridToggle()) mo.disconnect(); });
    mo.observe(document.documentElement, { childList:true, subtree:true });
  }
})();
