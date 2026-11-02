// Maracas Springs 500ml bottle, built procedurally in three.js.
// The label is redrawn on a canvas from the client's own bottle photo.
import * as THREE from '../vendor/three.module.min.js';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';

const NAVY = '#1b2a6b';
const LEAF = '#2f7d34';

function loadImg(src) {
  return new Promise((res) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => res(null);
    i.src = src;
  });
}

async function drawLabel() {
  const W = 2048, H = 640;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  try { await document.fonts.load('700 120px "Cormorant Garamond"'); } catch (e) {}
  const serif = '"Cormorant Garamond", Georgia, serif';

  // rainforest wrap, like the waterfall cliffs on the real label
  const forest = await loadImg('/img/jungle.webp');
  if (forest) {
    const s = H / forest.height * 1.15;
    for (let x = 0; x < W; x += forest.width * s) g.drawImage(forest, x, -40, forest.width * s, forest.height * s);
  } else { g.fillStyle = '#2d5a32'; g.fillRect(0, 0, W, H); }

  // front panel: sky into spring water, feathered at the sides
  const cx = W / 2, pw = 820;
  const panel = document.createElement('canvas');
  panel.width = pw; panel.height = H;
  const p = panel.getContext('2d');
  const vg = p.createLinearGradient(0, 0, 0, H);
  vg.addColorStop(0, '#f4f8fb'); vg.addColorStop(0.42, '#e3eef6');
  vg.addColorStop(0.62, '#7fa9cf'); vg.addColorStop(1, '#2f5f95');
  p.fillStyle = vg; p.fillRect(0, 0, pw, H);
  p.globalCompositeOperation = 'destination-in';
  const hg = p.createLinearGradient(0, 0, pw, 0);
  hg.addColorStop(0, 'rgba(0,0,0,0)'); hg.addColorStop(0.16, '#000');
  hg.addColorStop(0.84, '#000'); hg.addColorStop(1, 'rgba(0,0,0,0)');
  p.fillStyle = hg; p.fillRect(0, 0, pw, H);
  g.drawImage(panel, cx - pw / 2, 0);

  // ripples behind the badges
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 3;
  for (let r = 60; r < 360; r += 46) { g.beginPath(); g.ellipse(cx, 420, r, r * 0.22, 0, 0, Math.PI * 2); g.stroke(); }

  const stroked = (txt, x, y, size, fill, stroke, lw, spacing = 0) => {
    g.font = `700 ${size}px ${serif}`;
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    if ('letterSpacing' in g) g.letterSpacing = spacing + 'px';
    g.lineJoin = 'round'; g.strokeStyle = stroke; g.lineWidth = lw; g.strokeText(txt, x, y);
    g.fillStyle = fill; g.fillText(txt, x, y);
  };
  stroked('MARACAS', cx, 168, 150, NAVY, '#ffffff', 10, 6);
  stroked('SPRINGS', cx, 262, 104, NAVY, '#ffffff', 9, 8);
  g.font = `700 46px ${serif}`;
  stroked('NATURAL SPRING WATER', cx, 322, 46, LEAF, '#ffffff', 7, 2);

  // three seals: BPA free, natural spring water, recycle
  const seals = [['BPA', 'FREE'], ['SPRING', 'WATER'], ['RECYCLE', 'ME']];
  seals.forEach((t, i) => {
    const x = cx + (i - 1) * 118, y = 400;
    g.beginPath(); g.arc(x, y, 48, 0, Math.PI * 2);
    g.fillStyle = 'rgba(255,255,255,.92)'; g.fill();
    g.lineWidth = 4; g.strokeStyle = i === 1 ? '#2f5f95' : LEAF; g.stroke();
    g.fillStyle = i === 1 ? '#2f5f95' : LEAF;
    g.font = '700 19px "Satoshi", Arial, sans-serif'; g.textAlign = 'center';
    if ('letterSpacing' in g) g.letterSpacing = '0px';
    g.fillText(t[0], x, y - 2); g.fillText(t[1], x, y + 20);
  });

  // barcode block
  g.fillStyle = '#fff'; g.fillRect(cx - 130, 456, 260, 66);
  g.fillStyle = '#111';
  let bx = cx - 118;
  const seq = [2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 1, 3, 1, 2, 1, 1, 2, 1, 3, 1, 2];
  seq.forEach((w, i) => { if (i % 2 === 0) g.fillRect(bx, 462, w * 2.4, 42); bx += w * 2.4 + 1.5; });

  // bottom band
  g.fillStyle = NAVY; g.fillRect(0, H - 112, W, 112);
  g.fillStyle = '#ffffff'; g.textAlign = 'center';
  g.font = '500 34px "Satoshi", Arial, sans-serif';
  if ('letterSpacing' in g) g.letterSpacing = '4px';
  g.fillText('PURE  •  REFRESHING  •  NATURAL', cx, H - 66);
  g.font = '700 34px "Satoshi", Arial, sans-serif';
  if ('letterSpacing' in g) g.letterSpacing = '1px';
  g.fillText('500ml', cx, H - 22);
  // repeat the wordmark small on the back
  g.font = `700 54px ${serif}`;
  g.fillText('MARACAS SPRINGS', 0, H - 40);
  g.fillText('MARACAS SPRINGS', W, H - 40);
  return c;
}

function bottleProfile() {
  // [radius, y] from base to lip. Height about 4.1 units.
  const pts = [[0, 0.02], [0.3, 0], [0.5, 0.03], [0.6, 0.12], [0.63, 0.26]];
  // dense rings through the grip so the twisted grooves below can bend smoothly
  // pinched waist under the label, then the bulge down to the base (as in the photo)
  for (let y = 0.3; y <= 1.75; y += 0.02) {
    const waist = Math.exp(-(((y - 1.28) / 0.26) ** 2));
    pts.push([0.63 - 0.075 * waist, y]);
  }
  pts.push([0.63, 2.9]);
  for (let i = 1; i <= 14; i++) {
    const t = i / 14;
    pts.push([0.63 - 0.4 * (1 - Math.cos(t * Math.PI / 2)) ** 0.8 * (t < 1 ? 1 : 1), 2.9 + t * 0.72]);
  }
  pts.push([0.23, 3.66], [0.3, 3.68], [0.3, 3.72], [0.23, 3.74], [0.22, 3.82]);
  return pts.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.001), y));
}

export async function createBottle(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  const mobile = matchMedia('(max-width: 767px)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.6 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 13);

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(4, 6, 6); scene.add(key);
  scene.add(new THREE.AmbientLight(0xdfeaf2, 0.5));

  const root = new THREE.Group();   // driven by scroll
  const bob = new THREE.Group();    // idle float and pointer tilt
  root.add(bob); scene.add(root);
  const bottle = new THREE.Group();
  bottle.position.y = -2.05;
  bob.add(bottle);

  const prof = bottleProfile();
  const shellGeo = new THREE.LatheGeometry(prof, 160);
  // twisted grip grooves below the label, like the client's bottle
  const sp = shellGeo.attributes.position;
  for (let i = 0; i < sp.count; i++) {
    const x = sp.getX(i), y = sp.getY(i), z = sp.getZ(i);
    const a = Math.atan2(x, z);
    let k = 1;
    if (y < 0.28) k -= 0.07 * (0.5 - 0.5 * Math.cos(a * 5)) * Math.min(1, (0.28 - y) / 0.2); // wavy footed base
    if (y >= 0.2 && y <= 1.75) {
      const fade = Math.min(1, (y - 0.2) / 0.12, (1.75 - y) / 0.12);
      k -= 0.06 * Math.max(0, Math.sin(a * 7 + y * 3.4)) ** 3 * fade;
    }
    sp.setX(i, x * k); sp.setZ(i, z * k);
  }
  shellGeo.computeVertexNormals();
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: 0x8fa6b8, metalness: 0, roughness: 0.03, transparent: true, opacity: 0.16,
    clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.1, specularIntensity: 1, side: THREE.DoubleSide, depthWrite: false,
  });
  // clear PET: see-through face-on, bright only where the plastic turns away (fresnel)
  shellMat.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>', `
      float ms_fr = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 2.2);
      // edges pick up a cool blue-grey like real PET on a light backdrop
      vec3 ms_edge = mix(outgoingLight, vec3(0.32, 0.42, 0.52), ms_fr * 0.75);
      gl_FragColor = vec4(ms_edge, clamp(diffuseColor.a * (0.2 + 5.0 * ms_fr), 0.0, 0.8));`);
  };
  const shell = new THREE.Mesh(shellGeo, shellMat);
  shell.renderOrder = 3;

  // water fills to the shoulder
  const waterPts = prof.filter((v) => v.y < 3.2).map((v) => new THREE.Vector2(Math.max(v.x - 0.03, 0.001), v.y + 0.02));
  waterPts.push(new THREE.Vector2(0.001, 3.2));
  const water = new THREE.Mesh(
    new THREE.LatheGeometry(waterPts, 96),
    new THREE.MeshPhysicalMaterial({ color: 0x6fa7cf, roughness: 0.02, transparent: true, opacity: 0.16, envMapIntensity: 0.6, depthWrite: false })
  );
  water.renderOrder = 1;

  // the client's own printed label, unwrapped from his photo; drawn version as a fallback
  let labelTex = await new Promise((res) => new THREE.TextureLoader().load('/img/label.jpg', res, undefined, () => res(null)));
  if (!labelTex) labelTex = new THREE.CanvasTexture(await drawLabel());
  labelTex.colorSpace = THREE.SRGBColorSpace;
  labelTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.637, 0.637, 1.105, 160, 1, true, Math.PI, Math.PI * 2),
    new THREE.MeshPhysicalMaterial({ map: labelTex, roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.15, side: THREE.FrontSide })
  );
  label.position.y = 2.33;
  label.renderOrder = 2;

  // ridged green cap
  const capGeo = new THREE.CylinderGeometry(0.29, 0.29, 0.42, 96, 1);
  const pos = capGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), r = Math.hypot(x, z);
    if (r > 0.2) {
      const a = Math.atan2(z, x), k = 1 + 0.035 * Math.sign(Math.sin(a * 48));
      pos.setX(i, x * k); pos.setZ(i, z * k);
    }
  }
  capGeo.computeVertexNormals();
  const cap = new THREE.Mesh(capGeo, new THREE.MeshPhysicalMaterial({ color: 0x17663a, roughness: 0.42, clearcoat: 0.5 }));
  cap.position.y = 4.0;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.025, 12, 64), cap.material);
  ring.rotation.x = Math.PI / 2; ring.position.y = 3.78;

  bottle.add(water, label, shell, cap, ring);

  // soft contact shadow
  const sh = document.createElement('canvas'); sh.width = sh.height = 128;
  const sg = sh.getContext('2d');
  const rg = sg.createRadialGradient(64, 64, 0, 64, 64, 64);
  rg.addColorStop(0, 'rgba(16,32,60,.35)'); rg.addColorStop(1, 'rgba(16,32,60,0)');
  sg.fillStyle = rg; sg.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.7), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sh), transparent: true, depthWrite: false }));
  shadow.position.y = -2.1; shadow.rotation.x = -Math.PI / 2;
  bob.add(shadow);

  const state = { x: 0, y: 0, s: 1, ry: -0.35, rz: 0, shadow: 1 };
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', (e) => {
    pointer.tx = (e.clientX / innerWidth - 0.5);
    pointer.ty = (e.clientY / innerHeight - 0.5);
  }, { passive: true });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);

  let active = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    if (!active) return;
    const t = clock.getElapsedTime();
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    root.position.set(state.x, state.y, 0);
    root.scale.setScalar(state.s);
    bottle.rotation.y = state.ry + (reduce ? 0 : Math.sin(t * 0.5) * 0.12);
    bob.rotation.z = state.rz + pointer.x * -0.12;
    bob.rotation.x = pointer.y * 0.12;
    bob.position.y = reduce ? 0 : Math.sin(t * 1.1) * 0.06;
    shadow.material.opacity = state.shadow;
    renderer.render(scene, camera);
  }
  frame();

  // still frame for product cards and the cart
  function snapshot(w = 600, h = 900) {
    const prev = { ...state }, size = new THREE.Vector2();
    renderer.getSize(size);
    Object.assign(state, { x: 0, y: 0.1, s: 1, ry: 0, rz: 0, shadow: 0.9 });
    const pa = camera.aspect;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    root.position.set(0, 0.1, 0); root.scale.setScalar(1); bottle.rotation.y = -0.12; bob.rotation.set(0, 0, 0); bob.position.y = 0;
    renderer.render(scene, camera);
    const url = canvas.toDataURL('image/png');
    renderer.setSize(size.x, size.y, false); camera.aspect = pa; camera.updateProjectionMatrix();
    Object.assign(state, prev);
    return url;
  }

  return { state, setActive: (v) => { active = v; }, snapshot, resize };
}
