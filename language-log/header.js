// header.js — 헤더 버튼(☰, 🔍, 그리드) 클릭 시 페이지 맨 위로 이동 + 기존 기능 유지
function initHeader() {
  const header = document.querySelector("header");
  const gridToggleBtn = document.getElementById("gridToggleBtn");
  const pageGrid = document.getElementById("pageGrid");

  // 헤더 밖 고정 토글 버튼(☰)
  const headerToggleBtn = document.getElementById("headerToggleBtn");

  // 검색 토글 버튼(헤더 안) + 검색 팝업(헤더 밖: #searchWrapper)
  const searchToggleBtn = document.querySelector(".search-toggle-btn");
  const searchWrapper =
    document.getElementById("searchWrapper") ||
    document.querySelector(".search-input-wrapper");
  const searchInput = searchWrapper
    ? searchWrapper.querySelector('input[type="text"]')
    : null;

  if (!header) return;

  /* -------------------------------------------------
   * 공용: 모든 상황에서 "맨 위로" 보장하는 유틸
   * ------------------------------------------------- */
  function ensureTopSentinel() {
    let el = document.getElementById("top-sentinel");
    if (!el) {
      el = document.createElement("div");
      el.id = "top-sentinel";
      el.style.cssText = "position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;";
      document.body.prepend(el);
    }
    return el;
  }

  function scrollToTopEverywhere() {
    // 1) 가장 안전: 센티넬을 뷰로
    ensureTopSentinel().scrollIntoView({ behavior: "smooth", block: "start" });

    // 2) 표준 윈도우/루트
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch {}
    const root = document.scrollingElement || document.documentElement || document.body;
    try {
      if (root && typeof root.scrollTo === "function") {
        root.scrollTo({ top: 0, behavior: "smooth" });
      } else if (root) {
        root.scrollTop = 0;
      }
    } catch {}

    // 3) 별도 스크롤 컨테이너들(overflow:auto/scroll)도 함께 올림
    try {
      const all = Array.from(document.querySelectorAll("*"));
      let count = 0;
      for (const el of all) {
        if (count > 50) break; // 과도한 작업 방지
        const cs = getComputedStyle(el);
        if (
          (cs.overflowY === "auto" || cs.overflowY === "scroll") &&
          el.scrollHeight > el.clientHeight
        ) {
          if (typeof el.scrollTo === "function") el.scrollTo({ top: 0, behavior: "smooth" });
          else el.scrollTop = 0;
          count++;
        }
      }
    } catch {}
  }

  /* -----------------------------------
   * A. 헤더 표시/자동 숨김 + ☰ 버튼 토글
   * ----------------------------------- */
  let hideTimer = null;

  const showToggleBtn = () => {
    if (!headerToggleBtn) return;
    headerToggleBtn.style.display = "inline-flex";
    headerToggleBtn.setAttribute("aria-hidden", "false");
    headerToggleBtn.style.opacity = "1";
    headerToggleBtn.style.pointerEvents = "auto";
  };
  const hideToggleBtn = () => {
    if (!headerToggleBtn) return;
    headerToggleBtn.style.display = "none";
    headerToggleBtn.setAttribute("aria-hidden", "true");
    headerToggleBtn.style.opacity = "0";
    headerToggleBtn.style.pointerEvents = "none";
  };

  const showHeader = () => {
    header.classList.add("visible");
    header.style.opacity = "1";
    header.style.pointerEvents = "auto";
    hideToggleBtn(); // 헤더가 보이는 동안 ☰ 숨김
    resetHideTimer();
  };

  const hideHeader = () => {
    header.classList.remove("visible");
    header.style.opacity = "0";
    header.style.pointerEvents = "none";
    if (pageGrid) {
      pageGrid.style.display = "none";
      pageGrid.setAttribute("aria-hidden", "true");
    }
    if (searchWrapper) searchWrapper.classList.remove("open");
    showToggleBtn(); // 헤더가 사라지면 ☰ 다시 표시
  };

  const resetHideTimer = () => {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideHeader, 7500); // 10초 무활동 시 숨김
  };

  // 초기 상태: 헤더 숨김 + ☰ 버튼 보이기
  hideHeader();
  showToggleBtn();

  // ☰ 버튼 클릭 → 맨 위로 + 헤더 보이기
  if (headerToggleBtn) {
    headerToggleBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      scrollToTopEverywhere();  // ✅ 확실하게 최상단으로
      showHeader();
    });
  }

  // 헤더/검색 팝업 내부 상호작용 → 타이머 리셋
  ["click", "mousemove", "touchstart", "keydown", "focusin"].forEach((evt) => {
    header.addEventListener(evt, resetHideTimer, { passive: true });
    if (searchWrapper)
      searchWrapper.addEventListener(evt, resetHideTimer, { passive: true });
  });

  // ESC로 열린 패널 닫기
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (pageGrid) {
        pageGrid.style.display = "none";
        pageGrid.setAttribute("aria-hidden", "true");
      }
      if (searchWrapper) searchWrapper.classList.remove("open");
    }
  });

  /* -----------------------------------
   * B. 페이지 선택 라디오 그리드 토글
   * ----------------------------------- */
  function positionPageGrid() {
    if (!gridToggleBtn || !pageGrid) return;
    const rect = gridToggleBtn.getBoundingClientRect();
    const gap = 12;
    let top = rect.top + window.scrollY;
    let left = rect.right + window.scrollX + gap;

    // 화면 우측 넘어가면 좌측으로
    const w = pageGrid.offsetWidth || 200;
    const viewportRight = window.scrollX + document.documentElement.clientWidth;
    if (left + w + 8 > viewportRight) {
      left = rect.left + window.scrollX - gap - w;
    }

    pageGrid.style.top = `${Math.max(16, top)}px`;
    pageGrid.style.left = `${left}px`;
  }

  if (gridToggleBtn && pageGrid) {
    gridToggleBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      scrollToTopEverywhere(); // ✅ 그리드 버튼도 위로
      showHeader();

      const open = pageGrid.style.display === "flex";
      if (!open) {
        positionPageGrid();
        pageGrid.style.display = "flex";
        pageGrid.setAttribute("aria-hidden", "false");
      } else {
        pageGrid.style.display = "none";
        pageGrid.setAttribute("aria-hidden", "true");
      }
    });

    pageGrid.addEventListener("change", function (e) {
      if (e.target && e.target.name === "page") {
        const url = e.target.dataset.url;
        if (url) window.location.href = url;
      }
    });

    // 바깥 클릭 시 닫기
    document.addEventListener("click", function (e) {
      if (pageGrid.style.display === "flex") {
        if (!gridToggleBtn.contains(e.target) && !pageGrid.contains(e.target)) {
          pageGrid.style.display = "none";
          pageGrid.setAttribute("aria-hidden", "true");
        }
      }
    });

    // 스크롤/리사이즈 시 위치 보정(열려 있을 때만)
    ["scroll", "resize"].forEach((evt) =>
      window.addEventListener(
        evt,
        () => {
          if (pageGrid.style.display === "flex") positionPageGrid();
        },
        { passive: true }
      )
    );
  }

  /* -----------------------------------
   * C. 검색 팝업 (버튼 오른쪽, 헤더 밖)
   * ----------------------------------- */
  function positionSearchPopup() {
    if (!searchToggleBtn || !searchWrapper) return;
    const rect = searchToggleBtn.getBoundingClientRect();
    const gap = 12;

    // 기본: 버튼 오른쪽
    let top = rect.top + window.scrollY;
    let left = rect.right + window.scrollX + gap;

    // 우측 넘침 보정 → 왼쪽으로
    const popupW = searchWrapper.offsetWidth || 220;
    const viewportRight = window.scrollX + document.documentElement.clientWidth;
    if (left + popupW + 8 > viewportRight) {
      left = rect.left + window.scrollX - gap - popupW;
    }

    // 아래 넘침 보정
    const popupH = searchWrapper.offsetHeight || 48;
    const viewportBottom = window.scrollY + document.documentElement.clientHeight;
    if (top + popupH + 8 > viewportBottom) {
      top = Math.max(8, viewportBottom - popupH - 8);
    }

    searchWrapper.style.top = `${top}px`;
    searchWrapper.style.left = `${left}px`;
  }

  if (searchToggleBtn && searchWrapper) {
    searchWrapper.classList.remove("open"); // 초기 감춤

    // 🔍 버튼 클릭 → 위로 + 헤더 유지 + 팝업 토글
    searchToggleBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      scrollToTopEverywhere();  // ✅ 검색 버튼도 위로
      showHeader();

      const willOpen = !searchWrapper.classList.contains("open");

      // 다른 열린 검색 팝업 닫기
      document
        .querySelectorAll(".search-input-wrapper.open")
        .forEach((el) => {
          if (el !== searchWrapper) el.classList.remove("open");
        });

      if (willOpen) {
        searchWrapper.classList.add("open");
        positionSearchPopup();
        if (searchInput) setTimeout(() => searchInput.focus(), 80);
      } else {
        searchWrapper.classList.remove("open");
      }
    });

    // 'Go' 버튼도 위로
    const searchGoBtn = searchWrapper.querySelector(".search-button");
    if (searchGoBtn) {
      searchGoBtn.addEventListener("click", function () {
        scrollToTopEverywhere();
      });
    }

    // 스크롤/리사이즈 시 위치 재계산
    ["scroll", "resize"].forEach((evt) =>
      window.addEventListener(
        evt,
        () => {
          if (searchWrapper.classList.contains("open")) positionSearchPopup();
        },
        { passive: true }
      )
    );

    // 바깥 클릭 시 닫기
    document.addEventListener("click", function (e) {
      if (searchWrapper.classList.contains("open")) {
        const inside = searchWrapper.contains(e.target);
        const onBtn = searchToggleBtn.contains(e.target);
        if (!inside && !onBtn) searchWrapper.classList.remove("open");
      }
    });
  }

  /* -----------------------------------
   * D. 현재 페이지 라디오 자동 체크
   * ----------------------------------- */
  try {
    if (pageGrid) {
      const pageTitle = document.title.trim();
      const radios = pageGrid.querySelectorAll('input[name="page"]');
      radios.forEach((input) => {
        const label = pageGrid.querySelector(`label[for="${input.id}"]`);
        if (label && label.textContent.trim() === pageTitle) {
          input.checked = true;
        }
      });
    }
  } catch { /* no-op */ }
}

// 전역 노출
window.initHeader = initHeader;
