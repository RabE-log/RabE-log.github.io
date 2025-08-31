// ===== 기본 요소 참조 (Hero/Swiper 없어도 안전하도록 전부 가드) =====
let cardContainer = document.getElementById("cardContainer"); // 없으면 null
let gridContainer = document.getElementById("postGridContainer"); // 리스트 컨테이너

const totalPosts = 30;
let swiper = null;
let currentLabelIndex = null;

let loadedGridCount = 0;
const gridLoadBatch = 8;
let isFiltering = false;

const postDataList = [];

// ===== 유틸 =====
function calculateDaysAgo(dateString) {
  const postDate = new Date(dateString);
  const today = new Date();
  const diffTime = today - postDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} days ago`;
}

function setTotalCount(n){
  // id, data-attr 모두 업데이트
  const els = document.querySelectorAll("#totalCount, [data-total-count]");
  els.forEach(el => { el.textContent = `${n} logs`; });
}

// ===== 리스트 렌더링 =====
function createBlogItem(data) {
  const item = document.createElement("article");
  item.className = "blog-item no-thumb"; // ← 이미지 없는 카드 표시용 클래스

  item.innerHTML = `
    <div class="blog-main">
      <h3 class="blog-title">
        <a href="/language-log/note.html?label=${data.labelIndex}">${data.title}</a>
      </h3>
      <div class="blog-meta">By <span class="folder-author">${data.author}</span> · ${calculateDaysAgo(data.date)}</div>
      <p class="blog-excerpt">${data.desc}</p>
      <div class="blog-actions">
        <a class="folder-btn note" href="/language-log/note.html?label=${data.labelIndex}">Log</a>
        ${data.githubLink && data.githubLink !== "#" ? `<a class="folder-btn" href="${data.githubLink}" target="_blank" rel="noopener">Notion</a>` : ""}
      </div>
    </div>
  `;
  return item;
}

function loadNextGridBatch() {
  if (!gridContainer) return;

  const nextBatch = postDataList.slice(loadedGridCount, loadedGridCount + gridLoadBatch);
  nextBatch.forEach(data => gridContainer.appendChild(createBlogItem(data)));
  loadedGridCount += nextBatch.length;

  resetLoadMoreVisibility();
}

// ===== 필터 & 정렬 =====
function filterGridCards(keyword) {
  if (!gridContainer) return;

  const kw = (keyword || "").toLowerCase();
  isFiltering = kw.length > 0;
  gridContainer.innerHTML = "";

  const filtered = postDataList.filter(d =>
    d.title.toLowerCase().includes(kw) ||
    d.desc.toLowerCase().includes(kw) ||
    d.author.toLowerCase().includes(kw)
  );

  setTotalCount(filtered.length);

  if (filtered.length === 0) {
    const msg = document.createElement("div");
    msg.textContent = "No results found";
    msg.style.textAlign = "center";
    msg.style.color = "#999";
    gridContainer.appendChild(msg);
    resetLoadMoreVisibility();
    return;
  }

  // 필터링된 결과는 페이지네이션 없이 전부 표시
  filtered.forEach(d => gridContainer.appendChild(createBlogItem(d)));
  resetLoadMoreVisibility();
}

function sortPosts(mode) {
  if (mode === "title") {
    postDataList.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
  } else if (mode === "oldest") {
    postDataList.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else {
    // latest (기본)
    postDataList.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
}

// ===== Load More 표시 제어 =====
function resetLoadMoreVisibility(){
  const btn = document.getElementById("loadMoreBtn");
  if(!btn) return;
  const shouldShow = !isFiltering && (loadedGridCount < postDataList.length);
  btn.style.display = shouldShow ? "inline-flex" : "none";
}

// ===== Swiper (Hero가 없으니, 있어도 안전하게) =====
function updatePostNumber() {
  if (!swiper || typeof swiper.realIndex === "undefined") return;
  const leftMostIndex = swiper.realIndex % totalPosts;
  const number = String(leftMostIndex + 1).padStart(2, '0');
  const display = document.getElementById("postNumber");
  if (display) display.textContent = number;
}

function highlightLeftmostSlide() {
  if (!swiper || !swiper.slides) return;
  swiper.slides.forEach(slide => slide.classList.remove("highlighted"));
  const leftSlide = swiper.slides[swiper.activeIndex];
  if (leftSlide) leftSlide.classList.add("highlighted");
}

function initSwiper() {
  const container = document.querySelector(".mySwiper");
  if (!container) return; // Swiper 컨테이너가 없으면 종료

  swiper = new Swiper(".mySwiper", {
    slidesPerView: 3,
    spaceBetween: 30,
    loop: true,
    autoplay: { delay: 3000, disableOnInteraction: false },
    speed: 800,
    navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
    breakpoints: {
      0: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    },
    init: false
  });

  swiper.on("init", () => { updatePostNumber(); highlightLeftmostSlide(); });
  swiper.on("slideChangeTransitionStart", () => { updatePostNumber(); highlightLeftmostSlide(); });
  swiper.init();
}

// ===== 데이터 로드 =====
async function loadCards() {
  for (let i = 1; i <= totalPosts; i++) {
    try {
      const response = await fetch(`post/post${i}.html`);
      if (!response.ok) continue;

      const html = await response.text();
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      const title = tempDiv.querySelector("h3")?.textContent?.trim() || `Post ${i}`;
      const desc = tempDiv.querySelector("p")?.textContent?.trim() || "";
      const imgThumb = tempDiv.querySelector("img.card-thumbnail")?.getAttribute("src") || "";
      const imgBg = tempDiv.querySelector("img.background-image")?.getAttribute("src") || "";
      const date = tempDiv.querySelector(".post-date")?.textContent?.trim() || "1970-01-01";
      const author = tempDiv.querySelector(".post-author")?.textContent?.trim() || "Unknown";
      const githubLink = tempDiv.querySelector(".post-github")?.getAttribute("href") || "#";

      postDataList.push({
        html, title, desc, imgThumb, imgBg, date, author, githubLink, labelIndex: i
      });
    } catch (err) {
      console.warn(`post${i}.html 불러오기 실패`, err);
    }
  }

  // 정렬 기본값: 최신순
  sortPosts("latest");
  setTotalCount(postDataList.length);

  // 초기 렌더
  loadedGridCount = 0;
  loadNextGridBatch();

  // 이벤트들 연결
  wireSearchAndSort();
  initSwiper(); // (없으면 가드로 무시)
  initDiscoverBtn();
  initLoadMoreBtn();
}

// ===== 이벤트 바인딩 =====
function wireSearchAndSort(){
  // 헤더가 동적으로 로드되므로 MutationObserver로 감지
  const headerPlaceholder = document.getElementById("header-placeholder");
  if (!headerPlaceholder) return;

  const wire = () => {
    const searchInput = document.querySelector(".search-input-wrapper input[type='text']") ||
                        document.getElementById("postSearchInput");
    const searchButton = document.querySelector(".search-button");
    const sortSelect = document.getElementById("sortSelect");

    // 검색
    if (searchInput) {
      const runSearch = () => filterGridCards(searchInput.value.trim());
      searchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); runSearch(); } });
      if (searchButton) searchButton.addEventListener("click", (e) => { e.preventDefault(); runSearch(); });
      // 타이핑 즉시 반영
      searchInput.addEventListener("input", runSearch);
    }

    // 정렬
    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        const v = sortSelect.value; // latest|oldest|title
        sortPosts(v);

        const kw = (document.querySelector(".search-input-wrapper input[type='text']")?.value ||
                    document.getElementById("postSearchInput")?.value || "").trim();
        if (kw) {
          // 필터 중이면 필터 상태 유지
          filterGridCards(kw);
        } else {
          // 초기 리스트 다시 렌더
          isFiltering = false;
          if (gridContainer) gridContainer.innerHTML = "";
          loadedGridCount = 0;
          setTotalCount(postDataList.length);
          loadNextGridBatch();
        }
      });
    }

    return !!searchInput || !!sortSelect;
  };

  // 헤더 로드 감지
  const observer = new MutationObserver(() => {
    if (wire()) observer.disconnect();
  });
  observer.observe(headerPlaceholder, { childList: true, subtree: true });

  // 혹시 이미 로드되어 있으면 즉시 시도
  wire();
}

function initLoadMoreBtn(){
  const loadBtn = document.getElementById("loadMoreBtn");
  if (loadBtn) {
    loadBtn.addEventListener("click", loadNextGridBatch);
    resetLoadMoreVisibility();
  }
}

function initDiscoverBtn(){
  const discoverBtn = document.getElementById("discoverBtn");
  if (!discoverBtn) return; // Hero 삭제한 경우

  discoverBtn.addEventListener("click", () => {
    const labelIndexToUse = (currentLabelIndex ?? postDataList.length) || 1;
    window.location.href = `/language-log/note.html?label=${labelIndexToUse}`;
  });
}

// ===== 시작 =====
document.addEventListener("DOMContentLoaded", () => {
  // 컨테이너 재확인(만약 동적 삽입/변경을 대비)
  cardContainer = document.getElementById("cardContainer") || null;
  gridContainer = document.getElementById("postGridContainer") || null;

  loadCards();
});
















