document.addEventListener("DOMContentLoaded", () => {

const grid = document.getElementById("grid");
const cols = 5, rows = 5;
const tiles = [];
let rippleQueue = [];
let mouseX = 2.5, mouseY = 2.5;
const waveSpeed = 0.002;
const colorSpeed = 0.001;
const height = 20;
const wavelength = 0.3;

function createGrid() {
  grid.innerHTML = '';
  tiles.length = 0;
  const labels = ["Personal Journal", "Mechanik Note", "Language Log", "Side Project"];
  const selectedLabels = labels.sort(() => 0.5 - Math.random()).slice(0, 4);
  const labelPositions = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!(x === 2 && y === 2)) labelPositions.push({ x, y });
    }
  }
  const selectedPositions = labelPositions.sort(() => 0.5 - Math.random()).slice(0, 4);
  const labelMap = {};
  selectedPositions.forEach((pos, i) => {
    labelMap[`${pos.x},${pos.y}`] = selectedLabels[i];
  });

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const wrapper = document.createElement("div");
      wrapper.className = "tile-wrapper";
      wrapper.dataset.x = x;
      wrapper.dataset.y = y;

      const tile = document.createElement("div");
      tile.className = "tile";

      const faces = ["front", "back", "right", "left", "bottom", "top"];
      for (const faceType of faces) {
        const face = document.createElement("div");
        face.className = `face ${faceType}`;
        if (faceType === "front") {
          const key = `${x},${y}`;
          if (x === 2 && y === 2) {
            face.classList.add("main-face");
            const imageOptions = ["img1.jpg", "img2.jpg", "img3.jpg"];
            const selectedImage = imageOptions[Math.floor(Math.random() * imageOptions.length)];
            face.innerHTML = `<div>RabE</div><img src="logo.png" alt="main image" style="margin-top: 0.3rem; width: 50%;">`;
          } else if (labelMap[key]) {
            const label = labelMap[key];
            face.textContent = label;
            const labelKey = label.toLowerCase().replace(/\s+/g, "-");
            face.dataset.link = `/${labelKey}/${labelKey}.html`;
          }
        }
        tile.appendChild(face);
      }

      wrapper.appendChild(tile);
      grid.appendChild(wrapper);
      tiles.push({ el: wrapper, tile, x, y, z: 0 });
    }
  }
}

function triggerRipple(cx, cy) {
  const timeNow = performance.now();
  rippleQueue = tiles.map(tile => {
    const dx = tile.x - cx;
    const dy = tile.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return {
      tile,
      startTime: timeNow + dist * 80,
      peakTime: timeNow + dist * 80 + 150,
      endTime: timeNow + dist * 80 + 600
    };
  });
}

function animate(time) {
  tiles.forEach(t => {
    const dx = t.x - mouseX;
    const dy = t.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const baseZ = Math.sin(time * waveSpeed - dist * wavelength) * height;
    t.z = baseZ;
    t.dist = dist;
  });

  rippleQueue.forEach(entry => {
    const { tile, startTime, peakTime, endTime } = entry;
    if (time < startTime) return;
    const progress = (time - startTime) / (endTime - startTime);
    if (progress > 1) return;
    let rippleZ = 0;
    if (time < peakTime) {
      const rise = (time - startTime) / (peakTime - startTime);
      rippleZ = Math.sin(rise * Math.PI / 2) * 30;
    } else {
      const fall = (time - peakTime) / (endTime - peakTime);
      rippleZ = (1 - Math.sin(fall * Math.PI / 2)) * 30;
    }
    tile.z += rippleZ;
  });

  tiles.forEach(({ el, tile, z, dist }) => {
    el.style.transform = `translateZ(${z}px)`;
    const front = el.querySelector(".face.front");
    if (front) {
      const colorZ = Math.sin(time * colorSpeed - dist * wavelength) * height;
      let brightness = 1 - (colorZ / 40);
      brightness = Math.max(0.85, Math.min(1.1, brightness));
      const shadowIntensity = (1 - brightness) * 0.5;
      front.style.filter = `brightness(${brightness}) hue-rotate(${(1 - brightness) * 30}deg)`;
      front.style.boxShadow = `0 ${shadowIntensity * 25}px ${shadowIntensity * 60}px rgba(0, 0, 0, ${shadowIntensity})`;
    }
  });

  requestAnimationFrame(animate);
}

document.addEventListener("mousemove", e => {
  const rect = grid.getBoundingClientRect();
  mouseX = ((e.clientX - rect.left) / rect.width) * cols;
  mouseY = ((e.clientY - rect.top) / rect.height) * rows;
});

document.addEventListener("click", e => {
  const face = e.target.closest(".face.front");
  const wrapper = e.target.closest(".tile-wrapper");
  if (!wrapper) return;
  const x = +wrapper.dataset.x;
  const y = +wrapper.dataset.y;
  triggerRipple(x, y);
  if (face && face.dataset.link) {
    setTimeout(() => {
      window.location.href = face.dataset.link;
    }, 400);
  }
});

createGrid();
requestAnimationFrame(animate);


});
