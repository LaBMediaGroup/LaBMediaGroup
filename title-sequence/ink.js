/* Ink in water: a small WebGL pass that makes type smear and ripple where the finger or pointer moves, and
   go turbulent when you scroll fast (after unseen.co's headline). One damped wave field on the CPU (about
   100 x 200 cells), one quad on the GPU. The source is any canvas: the opening titles' film-in-letters
   compositor, or a headline rasterised from the DOM (Ink.text). The DOM text stays in the page for
   reading, selecting and indexing; it is only drawn transparent while the ink copy sits on top.

   const ink = new Ink(glCanvas, {src: canvas2d, dynamic: true});   ink.ok === false → no WebGL, use the source
   ink.size(cssW, cssH, dpr); ink.poke(x, y, strength); ink.turb = 0..1; ink.smear = -1..1; ink.frame(t)
   const t = Ink.text(headingEl);  t.reveal();   (returns null without WebGL) */
(() => {
  const VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  const FS = `precision mediump float;
varying vec2 v;
uniform sampler2D uSrc, uRip;
uniform vec2 uTexel;
uniform float uTime, uTurb, uSmear, uAmp;
float h(vec2 q){ return texture2D(uRip, q).r - .5; }
void main(){
  vec2 uv = vec2(v.x, 1. - v.y);
  float l = h(uv - vec2(uTexel.x, 0.)), r = h(uv + vec2(uTexel.x, 0.));
  float d = h(uv - vec2(0., uTexel.y)), u = h(uv + vec2(0., uTexel.y));
  vec2 g = vec2(r - l, u - d) * uAmp * .05;
  vec2 w = vec2(sin(uv.y * 31. + uTime * 2.1) * sin(uv.x * 7. - uTime * 1.3), sin(uv.x * 19. - uTime * 1.7) * sin(uv.y * 11. + uTime));
  vec2 q = uv + g + w * uTurb * .006;
  // ink drags along the wave's slope and the scroll: four taps, no colour split, so the type stays calm
  vec4 c = vec4(0.);
  for (int i = 0; i < 4; i++) { float f = float(i); c += texture2D(uSrc, q + g * f * .45 + vec2(0., uSmear * f * .007)); }
  c *= .25;
  gl_FragColor = c;
}`;

  class Ripple {
    constructor(w, h) { this.w = w; this.h = h; this.a = new Float32Array(w * h); this.b = new Float32Array(w * h); this.bytes = new Uint8Array(w * h).fill(128); this.energy = 0; }
    drop(x, y, rad, s) {
      const {w, h, a} = this, cx = x * w, cy = y * h;
      for (let j = Math.max(1, Math.floor(cy - rad)); j < Math.min(h - 1, Math.ceil(cy + rad)); j++)
        for (let i = Math.max(1, Math.floor(cx - rad)); i < Math.min(w - 1, Math.ceil(cx + rad)); i++) {
          const d = Math.hypot(i - cx, j - cy) / rad; if (d < 1) a[j * w + i] += s * (Math.cos(d * Math.PI) + 1) * .5;
        }
      this.energy = Math.max(this.energy, .01);
    }
    step(damp) {
      const {w, h, a, b, bytes} = this; let e = 0;
      for (let j = 1; j < h - 1; j++) for (let i = 1, k = j * w + 1; i < w - 1; i++, k++) {
        const n = ((a[k - 1] + a[k + 1] + a[k - w] + a[k + w]) * .5 - b[k]) * damp;
        b[k] = n; e += n < 0 ? -n : n;
        const by = 128 + n * 127; bytes[k] = by < 0 ? 0 : by > 255 ? 255 : by;
      }
      this.a = b; this.b = a; this.energy = e / (w * h);
    }
  }

  class Ink {
    constructor(canvas, {src, dynamic = false, res = 112, amp = 1, damp = .972} = {}) {
      this.canvas = canvas; this.src = src; this.dynamic = dynamic; this.res = res; this.amp = amp; this.damp = damp;
      this.turb = 0; this.smear = 0; this.dirty = true; this.ok = false;
      let gl = null;
      try { gl = canvas.getContext('webgl', {alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: false}); } catch {}
      if (!gl) return;
      const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
      try {
        const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
        const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        const tex = unit => { const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
          for (const [k, val] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, val); return t; };
        this.tSrc = tex(0); this.tRip = tex(1);
        this.u = {}; for (const n of ['uSrc', 'uRip', 'uTexel', 'uTime', 'uTurb', 'uSmear', 'uAmp']) this.u[n] = gl.getUniformLocation(pr, n);
        gl.uniform1i(this.u.uSrc, 0); gl.uniform1i(this.u.uRip, 1);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.clearColor(0, 0, 0, 0);
        this.gl = gl; this.ok = true;
        canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); this.ok = false; this.onlost && this.onlost(); });
      } catch (e) { console.warn('ink: no shader', e); }
    }
    size(w, h, dpr) {
      this.cw = w; this.ch = h;
      this.canvas.width = Math.max(1, Math.round(w * dpr)); this.canvas.height = Math.max(1, Math.round(h * dpr));
      const gw = this.res, gh = Math.max(8, Math.min(260, Math.round(this.res * h / w)));
      if (!this.rip || this.rip.w !== gw || this.rip.h !== gh) this.rip = new Ripple(gw, gh);
      if (this.ok) this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      this.dirty = true;
    }
    poke(x, y, s = 1) { if (!this.rip) return; this.rip.drop(x / this.cw, y / this.ch, 2.2 + Math.min(3, s * 1.6), Math.min(1.1, s) * .9); this.dirty = true; }
    upload() { const gl = this.gl; gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.tSrc); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.src); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); }
    frame(t) {
      if (!this.ok || !this.rip) return false;
      const calm = this.rip.energy < 2e-5 && this.turb < .004 && Math.abs(this.smear) < .004;
      if (calm && !this.dynamic && !this.dirty) return false;
      const gl = this.gl;
      if (this.dynamic || this.srcDirty !== false) { this.upload(); if (!this.dynamic) this.srcDirty = false; }
      if (!calm || this.dirty) { this.rip.step(this.damp); }
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.tRip);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, this.rip.w, this.rip.h, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, this.rip.bytes);
      gl.uniform2f(this.u.uTexel, 1.5 / this.rip.w, 1.5 / this.rip.h);
      gl.uniform1f(this.u.uTime, t / 1000); gl.uniform1f(this.u.uTurb, this.turb); gl.uniform1f(this.u.uSmear, this.smear); gl.uniform1f(this.u.uAmp, this.amp);
      gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      this.dirty = false;
      return true;
    }
  }

  /* A DOM headline drawn into a canvas word by word, at the exact boxes the browser laid it out in. */
  function rasterise(el, pad, dpr, c) {
    const r = el.getBoundingClientRect(), W = r.width + pad * 2, H = r.height + pad * 2;
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
    const range = document.createRange(), walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walk.nextNode())) {
      const p = node.parentElement; if (!p || p.closest('.vh')) continue;
      const cs = getComputedStyle(p);
      x.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      if ('letterSpacing' in x) x.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
      x.fillStyle = p.closest('[data-ink-color]')?.dataset.inkColor || p.dataset.c || cs.color;
      const re = /\S+/g, txt = node.textContent; let m;
      while ((m = re.exec(txt))) {
        range.setStart(node, m.index); range.setEnd(node, m.index + m[0].length);
        const rr = range.getClientRects()[0]; if (!rr) continue;
        const word = cs.textTransform === 'uppercase' ? m[0].toUpperCase() : m[0];
        const mt = x.measureText(word), asc = mt.fontBoundingBoxAscent ?? parseFloat(cs.fontSize) * .8, desc = mt.fontBoundingBoxDescent ?? parseFloat(cs.fontSize) * .2;
        x.fillText(word, rr.left - r.left + pad, rr.top - r.top + pad + (rr.height - asc - desc) / 2 + asc);
      }
    }
    return {W, H};
  }

  Ink.text = function (el, {pad, res = 96} = {}) {
    // pad by the biggest type inside, so long descenders (the y of "yours.") and swashes stay on the canvas
    if (pad == null) { let big = 0; for (const n of [el, ...el.querySelectorAll('*')]) big = Math.max(big, parseFloat(getComputedStyle(n).fontSize) || 0); pad = Math.round(Math.max(40, big * .55)); }
    const gl = document.createElement('canvas'); gl.className = 'ink-canvas'; gl.setAttribute('aria-hidden', 'true');
    const src = document.createElement('canvas');
    const ink = new Ink(gl, {src, res, amp: .6, damp: .94});   // calm: bends under the finger, settles fast
    if (!ink.ok) return null;
    // remember each element's colour before the DOM copy goes transparent
    for (const n of [el, ...el.querySelectorAll('*')]) if (!n.dataset.c) n.dataset.c = getComputedStyle(n).color;
    el.appendChild(gl);
    const api = {ink, el, canvas: gl, shown: false, build() {
      el.classList.remove('inked');
      const dpr = Math.min(devicePixelRatio || 1, 2), {W, H} = rasterise(el, pad, dpr, src);
      el.classList.add('inked');
      Object.assign(gl.style, {left: -pad + 'px', top: -pad + 'px', width: W + 'px', height: H + 'px'});
      ink.size(W, H, dpr); ink.srcDirty = true; ink.dirty = true; ink.frame(performance.now());
    }, reveal() {
      if (api.shown) return; api.shown = true;
      gl.animate([{clipPath: 'inset(0 100% 0 0)'}, {clipPath: 'inset(0 0% 0 0)'}], {duration: 1500, easing: 'cubic-bezier(.65,0,.25,1)', fill: 'both'});
      const t0 = performance.now();
      const splash = () => { const k = (performance.now() - t0) / 1500; if (k > 1) return;
        const e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
        void e;   // a clean wipe, no splash
        requestAnimationFrame(splash); };
      splash();
    }};
    gl.style.clipPath = 'inset(0 100% 0 0)';
    api.build();
    return api;
  };
  window.Ink = Ink;
})();
