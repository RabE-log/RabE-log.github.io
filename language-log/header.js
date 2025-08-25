// header.js
function initHeader() {
  const header = document.querySelector("header");
  const gridToggleBtn = document.getElementById("gridToggleBtn");
  const pageGrid = document.getElementById("pageGrid");

  // 화면 고정 햄버거(☰) 토글 버튼: header 밖에 존재해야 함
  const headerToggleBtn = document.getElementById("headerToggleBtn");

  // 검색 버튼(헤더 내부) + 검색 팝업(헤더 밖: #searchWrapper)
  const searchToggleBtn = document.querySelector(".search-toggle-btn");
  const searchWrapper =
    document.getElementById("searchWrapper") ||
    document.querySelector(".search-input-wrapper");
  const searchInput = searchWrapper
    ? searchWrapper.querySelector('input[type="text"]')
    : null;

  if (!header) return;

  /* -----------------------------------
   * (A) 헤더 표시/자동 숨김 + ☰ 버튼 토글
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
    hideToggleBtn(); // 헤더가 보이는 동안 ☰ 버튼 숨김
    resetHideTimer();
  };

  const hideHeader = () => {
    header.classList.remove("visible");
    header.style.opacity = "0";
    header.style.pointerEvents = "none";
    // 열려 있던 패널 닫기
    if (pageGrid) {
      pageGrid.style.display = "none";
      pageGrid.setAttribute("aria-hidden", "true");
    }
    if (searchWrapper) searchWrapper.classList.remove("open");
    showToggleBtn(); // 헤더가 사라지면 ☰ 버튼 다시 보이기
  };

  const resetHideTimer = () => {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideHeader, 10000); // 10초 무활동 시 숨김
  };

  // 초기 상태: 헤더 숨김 + 토글 버튼 보이기
  hideHeader();
  showToggleBtn();

  // ☰ 버튼 클릭 → 헤더 보이기
  if (headerToggleBtn) {
    headerToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showHeader();
    });
  }

  // 헤더/검색 팝업 내부 상호작용 시 타이머 리셋
  ["click", "mousemove", "touchstart", "keydown", "focusin"].forEach((evt) => {
    header.addEventListener(evt, resetHideTimer, { passive: true });
    if (searchWrapper)
      searchWrapper.addEventListener(evt, resetHideTimer, { passive: true });
  });

  // ESC로 열려있는 패널 닫기
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
   * (B) 페이지 선택 라디오 그리드 토글
   * ----------------------------------- */
  function positionPageGrid() {
    if (!gridToggleBtn || !pageGrid) return;
    const rect = gridToggleBtn.getBoundingClientRect();
    const gap = 12;
    let top = rect.top + window.scrollY;
    let left = rect.right + window.scrollX + gap;

    // 뷰포트 넘어가면 좌측에 배치
    const menuW = pageGrid.offsetWidth || 200;
    const viewportRight = window.scrollX + document.documentElement.clientWidth;
    if (left + menuW + 8 > viewportRight) {
      left = rect.left + window.scrollX - gap - menuW;
    }
    pageGrid.style.top = `${Math.max(16, top)}px`;
    pageGrid.style.left = `${left}px`;
  }

  if (gridToggleBtn && pageGrid) {
    gridToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showHeader(); // 상호작용 → 헤더 유지
      const isVisible = pageGrid.style.display === "flex";
      if (!isVisible) {
        positionPageGrid();
        pageGrid.style.display = "flex";
        pageGrid.setAttribute("aria-hidden", "false");
      } else {
        pageGrid.style.display = "none";
        pageGrid.setAttribute("aria-hidden", "true");
      }
    });

    pageGrid.addEventListener("change", (e) => {
      if (e.target && e.target.name === "page") {
        const url = e.target.dataset.url;
        if (url) window.location.href = url;
      }
    });

    // 바깥 클릭 시 닫기
    document.addEventListener("click", (e) => {
      if (pageGrid.style.display === "flex") {
        if (!gridToggleBtn.contains(e.target) && !pageGrid.contains(e.target)) {
          pageGrid.style.display = "none";
          pageGrid.setAttribute("aria-hidden", "true");
        }
      }
    });

    // 스크롤/리사이즈 시 위치 보정(열려있으면)
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
   * (C) 검색 팝업 (버튼 오른쪽, 헤더 밖)
   * ----------------------------------- */
  function positionSearchPopup() {
    if (!searchToggleBtn || !searchWrapper) return;
    const rect = searchToggleBtn.getBoundingClientRect();
    const gap = 12;

    // 기본 위치: 버튼 우측
    let top = rect.top + window.scrollY;
    let left = rect.right + window.scrollX + gap;

    // 뷰포트 오른쪽 초과 시 왼쪽으로
    const popupW = searchWrapper.offsetWidth || 220;
    const viewportRight = window.scrollX + document.documentElement.clientWidth;
    if (left + popupW + 8 > viewportRight) {
      left = rect.left + window.scrollX - gap - popupW;
    }

    // 화면 아래 초과 시 위로 보정
    const popupH = searchWrapper.offsetHeight || 48;
    const viewportBottom = window.scrollY + document.documentElement.clientHeight;
    if (top + popupH + 8 > viewportBottom) {
      top = Math.max(8, viewportBottom - popupH - 8);
    }

    searchWrapper.style.top = `${top}px`;
    searchWrapper.style.left = `${left}px`;
  }

  if (searchToggleBtn && searchWrapper) {
    searchWrapper.classList.remove("open"); // 초기 숨김

    searchToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showHeader(); // 상호작용 → 헤더 유지
      const willOpen = !searchWrapper.classList.contains("open");

      // 다른 열린 검색 팝업 닫기(안전)
      document.querySelectorAll(".search-input-wrapper.open").forEach((el) => {
        if (el !== searchWrapper) el.classList.remove("open");
      });

      if (willOpen) {
        searchWrapper.classList.add("open"); // 먼저 열고
        positionSearchPopup();               // 위치 계산
        if (searchInput) setTimeout(() => searchInput.focus(), 80);
      } else {
        searchWrapper.classList.remove("open");
      }
    });

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
    document.addEventListener("click", (e) => {
      if (searchWrapper.classList.contains("open")) {
        const insidePopup = searchWrapper.contains(e.target);
        const onButton = searchToggleBtn.contains(e.target);
        if (!insidePopup && !onButton) searchWrapper.classList.remove("open");
      }
    });
  }

  /* -----------------------------------
   * (D) 현재 페이지 라디오 자동 선택(기존)
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
  } catch {
    /* no-op */
  }
}

// 전역 노출
window.initHeader = initHeader;
