const particleSize = 6;
const maxParticles = 75;
const threshold = 120;
const particles = [];
const lines = [];
let width = window.innerWidth;
let height = window.innerHeight;

const body = document.body;
const colorPalette = ['#2b2b2bff', '#999999', '#666666', '#000000'];

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
  return `rgb(${(rgb1.r + rgb2.r) >> 1}, ${(rgb1.g + rgb2.g) >> 1}, ${(rgb1.b + rgb2.b) >> 1})`;
}

function createParticle() {
  const el = document.createElement('div');
  el.className = 'particle';
  body.appendChild(el);
  const color = randomColor();
  el.style.backgroundColor = color;

  particles.push({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    el,
    color
  });
}

function createLineElement() {
  const line = document.createElement('div');
  line.className = 'line';
  body.appendChild(line);
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

function animateParticles() {
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
      const p1 = particles[i], p2 = particles[j];
      const dx = p1.x - p2.x, dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < threshold) {
        if (!lines[lineIndex]) lines[lineIndex] = createLineElement();
        updateLine(lines[lineIndex], p1.x, p1.y, p2.x, p2.y, averageColorHex(p1.color, p2.color), 1 - dist / threshold);
        lineIndex++;
      }
    }
  }

  for (let i = lineIndex; i < lines.length; i++) {
    lines[i].style.width = '0';
  }

  requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;
});

for (let i = 0; i < maxParticles; i++) createParticle();
animateParticles();
