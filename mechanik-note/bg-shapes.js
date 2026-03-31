/* ════════════════════════════════════════
   bg-shapes.js  — mechanik-note 배경 도형
   Three.js 파스텔 블루 와이어프레임
   ════════════════════════════════════════
   mechanik-note.html  </body> 바로 위에 추가:

   <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"></script>
   <script src="bg-shapes.js"></script>
   ════════════════════════════════════════ */

(function () {
  if (document.getElementById('canvas-bg-mechanik')) return;

  /* ── CANVAS 생성 ── */
  const canvas = document.createElement('canvas');
  canvas.id = 'canvas-bg-mechanik';
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;' +
    'pointer-events:none;z-index:0;opacity:0.38;';
  document.body.prepend(canvas);

  function setupScene() {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 28;

    /* ── MATERIALS ── */
    const mA = new THREE.MeshBasicMaterial({ color: 0xA8C4DF, wireframe: true, transparent: true, opacity: 0.30 });
    const mB = new THREE.MeshBasicMaterial({ color: 0x7AAFD4, wireframe: true, transparent: true, opacity: 0.20 });
    const mC = new THREE.MeshBasicMaterial({ color: 0xCDE0F0, wireframe: true, transparent: true, opacity: 0.14 });

    /* ── SHAPES ── */
    const shapes = [];
    function addShape(geo, mat, x, y, z, rx, ry, rz) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.userData = { rx, ry, rz,
        fo: Math.random() * Math.PI * 2,
        fs: 0.28 + Math.random() * 0.38,
        fa: 0.22 + Math.random() * 0.32 };
      scene.add(m);
      shapes.push(m);
    }

    addShape(new THREE.IcosahedronGeometry(4.2, 0), mA, -21,  8, -9,  0.003, 0.005, 0.002);
    addShape(new THREE.IcosahedronGeometry(2.4, 0), mB,  21, -5, -7, -0.004, 0.003, 0.005);
    addShape(new THREE.IcosahedronGeometry(1.7, 0), mC,   5, 15,-13,  0.006,-0.004, 0.003);
    addShape(new THREE.OctahedronGeometry(3.0, 0),  mC,  15,  9, -5,  0.004,-0.003, 0.006);
    addShape(new THREE.OctahedronGeometry(1.9, 0),  mA, -15, -9,-11, -0.005, 0.004,-0.003);
    addShape(new THREE.TorusGeometry(4.8, 0.24, 6, 22), mB, -7,-12,-17, 0.005, 0.003, 0.004);
    addShape(new THREE.BoxGeometry(2.8, 2.8, 2.8), mC,  18,-14,-10, 0.003, 0.005, 0.003);
    addShape(new THREE.BoxGeometry(1.9, 1.9, 1.9), mA, -18, 14,-16,-0.004, 0.003, 0.005);

    /* ── PARTICLES ── */
    const pPos = new Float32Array(160 * 3);
    for (let i = 0; i < 160; i++) {
      pPos[i*3]   = (Math.random()-0.5)*88;
      pPos[i*3+1] = (Math.random()-0.5)*68;
      pPos[i*3+2] = (Math.random()-0.5)*48 - 10;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0x7AAFD4, size: 0.15, transparent: true, opacity: 0.32
    })));

    /* ── MOUSE PARALLAX ── */
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', e => {
      tx = (e.clientX / window.innerWidth  - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const el = clock.getElapsedTime();
      cx += (tx * 2.4 - cx) * 0.024;
      cy += (-ty * 1.7 - cy) * 0.024;
      camera.position.x = cx;
      camera.position.y = cy;
      camera.lookAt(scene.position);
      shapes.forEach(s => {
        s.rotation.x += s.userData.rx;
        s.rotation.y += s.userData.ry;
        s.rotation.z += s.userData.rz;
        s.position.y += Math.sin(el * s.userData.fs + s.userData.fo) * s.userData.fa * 0.007;
      });
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  /* Three.js 로드 확인 후 실행 */
  function init() {
    if (typeof THREE !== 'undefined') {
      setupScene();
    } else {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js';
      s.onload = setupScene;
      document.head.appendChild(s);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
