const particleSize = 6;
const maxParticles = 25;
const threshold = 120;
const particles = [];
const lines = [];
let width = window.innerWidth;
let height = window.innerHeight;

// 입자 배경을 위한 고정된 컨테이너
const particleContainer = document.getElementById("particle-background");

// 색상 팔레트
const colorPalette = ['#005830', '#999999', '#0A6B45', '#000000'];

function randomColor() {
  return colorPalette[Math.floor(Math.random() * colorPalette.length)];
}

function hexToRGB(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function averageColorHex(c1, c2) {
  if (c1 === c2) return c1;
  const rgb1 = hexToRGB(c1);
  const rgb2 = hexToRGB(c2);
  const avg = {
    r: Math.floor((rgb1.r + rgb2.r) / 2),
    g: Math.floor((rgb1.g + rgb2.g) / 2),
    b: Math.floor((rgb1.b + rgb2.b) / 2)
  };
  return `rgb(${avg.r},${avg.g},${avg.b})`;
}

function createParticle() {
  const el = document.createElement('div');
  el.className = 'particle';
  particleContainer.appendChild(el);

  const color = randomColor();
  el.style.backgroundColor = color;

  const particle = {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    el,
    color
  };

  particles.push(particle);
}

function createLineElement() {
  const line = document.createElement('div');
  line.className = 'line';
  particleContainer.appendChild(line);
  return line;
}

function updateLine(line, x1, y1, x2, y2, color, opacity) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  line.style.left = `${x1}px`;
  line.style.top = `${y1}px`;
  line.style.width = `${length}px`;
  line.style.background = color;
  line.style.opacity = opacity;
  line.style.transform = `rotate(${angle}deg)`;
}

function animate() {
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;

    p.el.style.left = `${p.x - particleSize / 2}px`;
    p.el.style.top = `${p.y - particleSize / 2}px`;
  }

  let lineIndex = 0;
  for (let i = 0; i < maxParticles; i++) {
    for (let j = i + 1; j < maxParticles; j++) {
      const p1 = particles[i];
      const p2 = particles[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < threshold) {
        if (!lines[lineIndex]) lines[lineIndex] = createLineElement();
        const opacity = 1 - distance / threshold;
        const color = averageColorHex(p1.color, p2.color);
        updateLine(lines[lineIndex], p1.x, p1.y, p2.x, p2.y, color, opacity);
        lineIndex++;
      }
    }
  }

  for (let i = lineIndex; i < lines.length; i++) {
    lines[i].style.width = '0';
  }

  requestAnimationFrame(animate);
}

function updateDimensions() {
  width = window.innerWidth;
  height = window.innerHeight;
}

window.addEventListener('resize', updateDimensions);

updateDimensions();

for (let i = 0; i < maxParticles; i++) {
  createParticle();
}

animate();
