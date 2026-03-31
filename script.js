// ── CURSOR ──
const cursor=document.getElementById('cursor');
const ring=document.getElementById('cursorRing');
let mx=0,my=0;
document.addEventListener('mousemove',e=>{
  mx=e.clientX;my=e.clientY;
  cursor.style.left=mx+'px';cursor.style.top=my+'px';
  setTimeout(()=>{ring.style.left=mx+'px';ring.style.top=my+'px';},60);
});
document.querySelectorAll('button,a,.card,.ablock').forEach(el=>{
  el.addEventListener('mouseenter',()=>{cursor.style.width='18px';cursor.style.height='18px';});
  el.addEventListener('mouseleave',()=>{cursor.style.width='12px';cursor.style.height='12px';});
});

// ── INTRO CLOCK ──
let t=0;
const itel=document.getElementById('introTime');
setInterval(()=>{
  t++;
  const h=String(Math.floor(t/3600)).padStart(2,'0');
  const m=String(Math.floor((t%3600)/60)).padStart(2,'0');
  const s=String(t%60).padStart(2,'0');
  itel.textContent=`${h}:${m}:${s}`;
},1000);

// ── INTRO OUT ──
setTimeout(()=>{
  const intro=document.getElementById('intro');
  const main=document.getElementById('main');
  const nav=document.getElementById('nav');
  intro.style.transition='opacity .9s ease, transform .9s cubic-bezier(.16,1,.3,1)';
  intro.style.opacity='0';intro.style.transform='scale(1.04)';
  setTimeout(()=>{
    intro.style.display='none';
    main.classList.add('visible');
    nav.classList.add('show');
  },900);
},2800);

// ── MARQUEE ──
const items=['Brand Identity','Web Experience','Motion Design','Art Direction','Digital Strategy','3D & XR','Sound Branding','Editorial Design'];
const track=document.getElementById('marqueeTrack');
[...items,...items,...items,...items].forEach(txt=>{
  const el=document.createElement('div');
  el.className='marquee-item';el.textContent=txt;
  track.appendChild(el);
});

// ── WAVEFORM ──
const wf=document.getElementById('waveform1');
[22,48,68,38,82,56,92,42,72,52,86,32,62,76,46,56,38,68,52,74,44,82,36,60,66].forEach(h=>{
  const b=document.createElement('div');
  b.className='wave-bar';b.style.height=h+'%';
  wf.appendChild(b);
});

// ── PROGRESS ──
window.addEventListener('scroll',()=>{
  document.getElementById('pageProgress').style.width=
    (window.scrollY/(document.body.offsetHeight-window.innerHeight)*100)+'%';
});

// ── THREE.JS — pastel blue wireframes on white/gray bg ──
const canvas=document.getElementById('canvas-bg');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setClearColor(0x000000,0);

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(70,window.innerWidth/window.innerHeight,0.1,1000);
camera.position.z=28;

// muted pastel blue wireframe materials
const mA=new THREE.MeshBasicMaterial({color:0xA8C4DF,wireframe:true,transparent:true,opacity:.22});
const mB=new THREE.MeshBasicMaterial({color:0x7AAFD4,wireframe:true,transparent:true,opacity:.14});
const mC=new THREE.MeshBasicMaterial({color:0xC8DDEF,wireframe:true,transparent:true,opacity:.10});

const shapes=[];
function add(geo,mat,x,y,z,rs){
  const m=new THREE.Mesh(geo,mat);
  m.position.set(x,y,z);
  m.userData={rs,fo:Math.random()*Math.PI*2,fs:.3+Math.random()*.4,fa:.2+Math.random()*.35};
  scene.add(m);shapes.push(m);
}

add(new THREE.IcosahedronGeometry(4.5,0),mA,-22,9,-8,{x:.003,y:.005,z:.002});
add(new THREE.IcosahedronGeometry(2.5,0),mB,22,-6,-7,{x:-.004,y:.003,z:.005});
add(new THREE.IcosahedronGeometry(1.8,0),mC,6,16,-14,{x:.006,y:-.004,z:.003});
add(new THREE.OctahedronGeometry(3.2,0),mC,16,10,-5,{x:.004,y:-.003,z:.006});
add(new THREE.OctahedronGeometry(2,0),mA,-16,-10,-12,{x:-.005,y:.004,z:-.003});
add(new THREE.TorusGeometry(5,.25,6,24),mB,-7,-13,-18,{x:.005,y:.003,z:.004});
add(new THREE.BoxGeometry(3,3,3),mC,19,-15,-10,{x:.003,y:.005,z:.003});
add(new THREE.BoxGeometry(2,2,2),mA,-19,15,-16,{x:-.004,y:.003,z:.005});

const pPos=new Float32Array(160*3);
for(let i=0;i<160;i++){
  pPos[i*3]=(Math.random()-.5)*90;
  pPos[i*3+1]=(Math.random()-.5)*70;
  pPos[i*3+2]=(Math.random()-.5)*50-10;
}
const pGeo=new THREE.BufferGeometry();
pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3));
scene.add(new THREE.Points(pGeo,new THREE.PointsMaterial({color:0x7AAFD4,size:.15,transparent:true,opacity:.28})));

let tx=0,ty=0,cx=0,cy=0;
document.addEventListener('mousemove',e=>{
  tx=(e.clientX/window.innerWidth-.5)*2;
  ty=(e.clientY/window.innerHeight-.5)*2;
});
const clock=new THREE.Clock();
(function animate(){
  requestAnimationFrame(animate);
  const el=clock.getElapsedTime();
  cx+=(tx*2.2-cx)*.022;cy+=(-ty*1.6-cy)*.022;
  camera.position.x=cx;camera.position.y=cy;
  camera.lookAt(scene.position);
  shapes.forEach(s=>{
    s.rotation.x+=s.userData.rs.x;
    s.rotation.y+=s.userData.rs.y;
    s.rotation.z+=s.userData.rs.z;
    s.position.y+=Math.sin(el*s.userData.fs+s.userData.fo)*s.userData.fa*0.007;
  });
  renderer.render(scene,camera);
})();

window.addEventListener('resize',()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});