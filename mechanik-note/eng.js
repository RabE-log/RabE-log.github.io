const cardContainer = document.getElementById("cardContainer");
const gridContainer = document.getElementById("postGridContainer");
const totalPosts = 30;
let swiper;
let currentLabelIndex = null;
let loadedGridCount = 0;
const gridLoadBatch = 8;
const postDataList = [];

function calculateDaysAgo(dateString) {
  const postDate = new Date(dateString);
  const today = new Date();
  const diffTime = today - postDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} days ago`;
}

function updateHero(title, desc, imgSrc, labelIndex = 1) {
  const heroSection = document.querySelector(".hero");
  const heroLeft = document.getElementById("hero-left");

  document.getElementById("hero-title").textContent = title;
  document.getElementById("hero-desc").textContent = desc;
  heroSection.style.backgroundImage = `url(${imgSrc})`;
  heroSection.style.backgroundSize = "cover";
  heroSection.style.backgroundPosition = "center";
  heroSection.style.backgroundRepeat = "no-repeat";
  currentLabelIndex = labelIndex;

  const oldLabel = document.querySelector(".label-content");
  if (oldLabel) oldLabel.remove();

  
}

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
  swiper = new Swiper(".mySwiper", {
    slidesPerView: 3,
    spaceBetween: 30,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false
    },
    speed: 800,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev"
    },
    breakpoints: {
      0: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    },
    init: false
  });

  swiper.on("init", () => {
    updatePostNumber();
    highlightLeftmostSlide();
  });

  swiper.on("slideChangeTransitionStart", () => {
    updatePostNumber();
    highlightLeftmostSlide();
  });

  swiper.init();
}

function loadNextGridBatch() {
  const nextBatch = postDataList.slice(loadedGridCount, loadedGridCount + gridLoadBatch);
  nextBatch.forEach(data => {
    const gridCard = document.createElement("div");
    gridCard.className = "post-grid";

    const titleDiv = document.createElement("div");
    titleDiv.className = "folder-tab-with-title";
    titleDiv.innerHTML = `
      <div class="folder-tab"></div>
      <div class="folder-tab-title">${data.title}</div>
    `;

    const backCard = document.createElement("div");
    backCard.className = "folder-card folder-back";
    backCard.innerHTML = `<div class="folder-body"></div>`;

    const frontCard = document.createElement("div");
    frontCard.className = "folder-card folder-front";
    frontCard.innerHTML = `
      <div class="folder-body">
        <div class="folder-image"><img src="${data.imgThumb}" alt="썸네일 이미지" /></div>
        <p class="folder-description">${data.desc}</p>
        <hr class="folder-divider" />
      </div>
    `;

    const metaDiv = document.createElement("div");
    metaDiv.className = "folder-meta";
    metaDiv.innerHTML = `By <span class="folder-author">${data.author}</span> · ${calculateDaysAgo(data.date)}`;
    frontCard.querySelector(".folder-body").appendChild(metaDiv);

    const buttonDiv = document.createElement("div");
    buttonDiv.className = "folder-buttons";
    buttonDiv.innerHTML = `
      <a href="/mechanik-note/note.html?label=${data.labelIndex}" class="folder-btn">Note</a>


      <a href="${data.githubLink}" target="_blank" class="folder-btn">GitHub</a>
    `;


    gridCard.append(titleDiv, backCard, frontCard, buttonDiv);
    gridContainer.appendChild(gridCard);
  });

  loadedGridCount += nextBatch.length;
  const loadBtn = document.getElementById("loadMoreBtn");
  if (loadedGridCount >= postDataList.length && loadBtn) loadBtn.style.display = "none";
}

async function loadCards() {
  for (let i = 1; i <= totalPosts; i++) {
    try {
      const response = await fetch(`post/post${i}.html`);
      if (!response.ok) continue;

      const html = await response.text();
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      
      

      const title = tempDiv.querySelector("h3")?.textContent || "";
      const desc = tempDiv.querySelector("p")?.textContent || "";
      const imgThumb = tempDiv.querySelector("img.card-thumbnail")?.getAttribute("src") || "";
      const imgBg = tempDiv.querySelector("img.background-image")?.getAttribute("src") || "";


      const date = tempDiv.querySelector(".post-date")?.textContent || "";
      const author = tempDiv.querySelector(".post-author")?.textContent || "";
      
      tempDiv.querySelector(".post-date")?.remove();
      tempDiv.querySelector(".post-author")?.remove();

      const githubLink = tempDiv.querySelector(".post-github")?.getAttribute("href") || "#";

      

      // <h3> 아래에 <hr> 삽입
      const h3 = tempDiv.querySelector("h3");
      if (h3) {
        const hr = document.createElement("hr");
        hr.className = "card-divider";
        h3.insertAdjacentElement("afterend", hr);
      }

      const metaText = `By <span class="folder-author">${author}</span> · ${calculateDaysAgo(date)}`;

      const slide = document.createElement("div");
      slide.classList.add("swiper-slide");

      const swiperCard = document.createElement("div");
      swiperCard.classList.add("card");
      swiperCard.innerHTML = `
        ${tempDiv.innerHTML}
        <div class="card-meta">${metaText}</div>
      `;

      // ✅ 이미지에만 애니메이션 적용
      swiperCard.addEventListener("mouseenter", () => {
        const img = swiperCard.querySelector("img.card-thumbnail") || swiperCard.querySelector(".folder-image img");
        if (img) {
          img.classList.remove("card-image-animated");
          void img.offsetWidth; // 리플로우
          img.classList.add("card-image-animated");
        }
      });

      swiperCard.addEventListener("click", () => {
        updateHero(title, desc, imgBg, i);
      });

      slide.appendChild(swiperCard);
      cardContainer.appendChild(slide);

      postDataList.push({
        html,
        title,
        desc,
        imgThumb,
        imgBg,
        date,
        author,
        githubLink,
        labelIndex: i
      });
    } catch (err) {
      console.warn(`post${i}.html 불러오기 실패`, err);
    }
  }

  loadNextGridBatch();
  initSwiper();

  const loadBtn = document.getElementById("loadMoreBtn");
  if (loadBtn) {
    loadBtn.addEventListener("click", loadNextGridBatch);
  }
}

document.addEventListener("DOMContentLoaded", loadCards);

document.getElementById("discoverBtn").addEventListener("click", () => {
  let labelIndexToUse;

  if (currentLabelIndex !== null) {
    // 사용자가 카드를 클릭해서 currentLabelIndex가 설정된 경우
    labelIndexToUse = currentLabelIndex;
  } else {
    // 아무 카드도 클릭하지 않은 경우: 마지막 포스트로 이동
    labelIndexToUse = postDataList.length;
  }

  // ✅ 여기 이 위치에 이 코드 삽입!
  window.location.href = `/mechanik-note/note.html?label=${labelIndexToUse}`;


});







function filterGridCards(keyword) {
  const kw = (keyword || "").toLowerCase();
  isFiltering = kw.length > 0;           // ← 추가
  gridContainer.innerHTML = "";

  const filtered = postDataList.filter(d =>
    d.title.toLowerCase().includes(kw) ||
    d.desc.toLowerCase().includes(kw) ||
    d.author.toLowerCase().includes(kw)
  );

  setTotalCount(filtered.length);

  if (filtered.length === 0) {
    const msg = document.createElement("div");
    msg.textContent = "검색 결과 없음";
    msg.style.textAlign = "center";
    msg.style.color = "#999";
    gridContainer.appendChild(msg);
    resetLoadMoreVisibility();           // ← 교체 (이전의 display="none" 제거)
    return;
  }

  filtered.forEach(d => gridContainer.appendChild(createBlogItem(d)));
  resetLoadMoreVisibility();             // ← 교체 (이전의 display="none" 제거)
}








function handleResponsiveHero() {
  const heroRight = document.querySelector(".hero-right");
  const heroSection = document.querySelector(".hero");

  if (window.innerWidth <= 768) {
    if (heroRight) heroRight.style.display = "none";
    if (heroSection) heroSection.style.flexDirection = "column";
  } else {
    if (heroRight) heroRight.style.display = "flex";
    if (heroSection) heroSection.style.flexDirection = "row";
  }
}

window.addEventListener("resize", handleResponsiveHero);
window.addEventListener("DOMContentLoaded", handleResponsiveHero);
























document.addEventListener("DOMContentLoaded", () => {

  // ✅ 헤더가 동적으로 로드되는 것을 감지하여 검색 기능 연결
  const observer = new MutationObserver(() => {
    const searchInput = document.querySelector(".search-input-wrapper input[type='text']");
    const searchButton = document.querySelector(".search-button");

    if (searchInput) {
      const runSearch = () => {
        const keyword = searchInput.value.trim();
        filterGridCards(keyword);
      };

      // 🔹 Enter 키로 검색
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          runSearch();
        }
      });

      // 🔹 검색 버튼 클릭으로 검색
      if (searchButton) {
        searchButton.addEventListener("click", (e) => {
          e.preventDefault();
          runSearch();
        });
      }

      observer.disconnect(); // 감지 종료
    }
  });

  const headerPlaceholder = document.getElementById("header-placeholder");
  if (headerPlaceholder) {
    observer.observe(headerPlaceholder, { childList: true, subtree: true });
  }
});











document.addEventListener("DOMContentLoaded", () => {

  // ✅ 정렬 셀렉트 연결
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      const selected = sortSelect.value;

      // 날짜 정렬
      if (selected === "latest") {
        postDataList.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else {
        postDataList.sort((a, b) => new Date(a.date) - new Date(b.date));
      }

      // 현재 검색어 기준으로 다시 필터링
      const keyword = document.querySelector(".search-input-wrapper input[type='text']")?.value || "";
      filterGridCards(keyword);
    });
  }

  // ✅ 검색창 로딩 감지 및 이벤트 연결 (기존 MutationObserver 유지)
  const observer = new MutationObserver(() => {
    const searchInput = document.querySelector(".search-input-wrapper input[type='text']");
    const searchButton = document.querySelector(".search-button");

    if (searchInput) {
      const runSearch = () => {
        const keyword = searchInput.value.trim();
        filterGridCards(keyword);
      };

      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          runSearch();
        }
      });

      if (searchButton) {
        searchButton.addEventListener("click", (e) => {
          e.preventDefault();
          runSearch();
        });
      }

      observer.disconnect();
    }
  });

  const headerPlaceholder = document.getElementById("header-placeholder");
  if (headerPlaceholder) {
    observer.observe(headerPlaceholder, { childList: true, subtree: true });
  }
});




















function createBlogItem(data) {
  const item = document.createElement("article");
  item.className = "blog-item";

  const main = document.createElement("div");
  main.className = "blog-main";
  main.innerHTML = `
    <h3 class="blog-title"><a href="/mechanik-note/note.html?label=${data.labelIndex}">${data.title}</a></h3>
    <div class="blog-meta">By <span class="folder-author">${data.author}</span> · ${calculateDaysAgo(data.date)}</div>
    <p class="blog-excerpt">${data.desc}</p>
    <div class="blog-actions">
      <a class="folder-btn note" href="/mechanik-note/note.html?label=${data.labelIndex}">Note</a>
      <a class="folder-btn" href="${data.githubLink}" target="_blank">GitHub</a>
    </div>
  `;

  const thumb = document.createElement("div");
  thumb.className = "blog-thumb";
  thumb.innerHTML = `<a href="/mechanik-note/note.html?label=${data.labelIndex}">
    <img src="${data.imgThumb}" alt="">
  </a>`;

  item.append(main, thumb);
  return item;
}

function loadNextGridBatch() {
  const nextBatch = postDataList.slice(loadedGridCount, loadedGridCount + gridLoadBatch);
  nextBatch.forEach(data => gridContainer.appendChild(createBlogItem(data)));
  loadedGridCount += nextBatch.length;

  if (loadedGridCount >= postDataList.length) {
    document.getElementById("loadMoreBtn").style.display = "none";
  }
}

function filterGridCards(keyword) {
  const lowerKeyword = keyword.toLowerCase();
  gridContainer.innerHTML = "";

  const filtered = postDataList.filter(d =>
    d.title.toLowerCase().includes(lowerKeyword) ||
    d.desc.toLowerCase().includes(lowerKeyword) ||
    d.author.toLowerCase().includes(lowerKeyword)
  );

  setTotalCount(filtered.length);
  if (filtered.length === 0) {
    const msg = document.createElement("div");
    msg.textContent = "검색 결과 없음";
    msg.style.textAlign = "center";
    msg.style.color = "#999";
    gridContainer.appendChild(msg);
    document.getElementById("loadMoreBtn").style.display = "none";
    return;
  }

  filtered.forEach(d => gridContainer.appendChild(createBlogItem(d)));
  document.getElementById("loadMoreBtn").style.display = "none";
}


function setTotalCount(n){
  const el = document.getElementById("totalCount");
  if (el) el.textContent = `${n} posts`;
}











document.addEventListener("DOMContentLoaded", () => {
  const headerPlaceholder = document.getElementById("header-placeholder");
  if (!headerPlaceholder) return;

  const wireSearch = () => {
    const input = document.querySelector(".search-input-wrapper input[type='text']") ||
                  document.getElementById("postSearchInput"); // fallback
    const btn = document.querySelector(".search-button");

    if (!input) return false;

    const run = () => {
      const kw = input.value.trim();
      filterGridCards(kw);
      setTotalCount(
        kw ? postDataList.filter(d =>
          d.title.toLowerCase().includes(kw.toLowerCase()) ||
          d.desc.toLowerCase().includes(kw.toLowerCase()) ||
          d.author.toLowerCase().includes(kw.toLowerCase())
        ).length : postDataList.length
      );
    };

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        run();
      }
    });
    if (btn) btn.addEventListener("click", (e) => { e.preventDefault(); run(); });

    // 입력하면서 바로 필터(선호 시)
    input.addEventListener("input", () => run());

    return true;
  };

  const observer = new MutationObserver(() => {
    if (wireSearch()) observer.disconnect();
  });
  observer.observe(headerPlaceholder, { childList: true, subtree: true });
});








// 기존
loadNextGridBatch();
initSwiper();

// ➕ 추가
setTotalCount(postDataList.length);

// 기존
const loadBtn = document.getElementById("loadMoreBtn");
if (loadBtn) {
  loadBtn.addEventListener("click", loadNextGridBatch);
}





let isFiltering = false;

function resetLoadMoreVisibility(){
  const btn = document.getElementById("loadMoreBtn");
  if(!btn) return;
  // '필터 중 아님' && '아직 더 불러올 글이 남음' → 보여주기
  const shouldShow = !isFiltering && (loadedGridCount < postDataList.length);
  btn.style.display = shouldShow ? "inline-flex" : "none";
}














document.addEventListener("DOMContentLoaded", () => {
  gridContainer = document.getElementById("postGridContainer");

  // 초기 상태
  isFiltering = false;
  sortPosts("latest");                   // 값이 latest/oldest/title일 때
  setTotalCount(postDataList.length);
  loadedGridCount = 0;
  loadNextGridBatch();                   // 내부에서 resetLoadMoreVisibility 호출됨

  // 헤더 검색(또는 상단 인풋) 이벤트 예시
  const searchInput = document.querySelector(".search-input-wrapper input[type='text']") ||
                      document.getElementById("postSearchInput");
  if (searchInput){
    searchInput.addEventListener("input", () => {
      const kw = searchInput.value.trim();
      if (kw === "") {
        // 검색 해제 → 초기 상태로
        isFiltering = false;
        gridContainer.innerHTML = "";
        loadedGridCount = 0;
        setTotalCount(postDataList.length);
        loadNextGridBatch();
      } else {
        filterGridCards(kw);
      }
      resetLoadMoreVisibility();         // ← 추가
    });
  }

  // 정렬
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect){
    sortSelect.addEventListener("change", () => {
      const v = sortSelect.value;        // "latest" | "oldest" | "title"
      if (v === "latest")  sortPosts("latest");
      if (v === "oldest")  sortPosts("oldest");
      if (v === "title")   sortPosts("title");

      const kw = searchInput?.value.trim() || "";
      if (kw){
        filterGridCards(kw);             // 필터 중이면 그대로 필터 렌더
      }else{
        isFiltering = false;
        gridContainer.innerHTML = "";
        loadedGridCount = 0;
        loadNextGridBatch();
      }
      resetLoadMoreVisibility();         // ← 추가
    });
  }
});
