// Move the crowns and suspended lines in the photographed field using the forecast's wind.
(() => {
  const canvas = document.querySelector("#field-plate");
  const field = document.querySelector("#fly");
  let gl,
    program,
    buffer,
    texture,
    uniforms,
    inView = false,
    frame = 0,
    start = 0,
    speed = 0,
    gust = 0,
    direction = 0;
  const photo = new Image();
  const vert =
    "attribute vec2 pos;varying vec2 uv;void main(){uv=vec2(pos.x*.5+.5,.5-pos.y*.5);gl_Position=vec4(pos,0.,1.);}";
  const frag = `precision mediump float;
  varying vec2 uv;
  uniform sampler2D plate;
  uniform vec2 crop, offset;
  uniform float tick, wind, peak, heading;
  void main(){
    vec2 p=uv*crop+offset;
    float crown=(1.-smoothstep(.34,.73,p.y))*smoothstep(.49,.66,p.x)*(1.-smoothstep(.80,.96,p.x));
    float line=(1.-smoothstep(.1,.52,p.y))*(1.-smoothstep(.46,.60,p.x));
    float breath=(.35+.65*sin(tick*1.5+peak))*sin(tick*2.1+p.y*12.);
    p.x+=heading*crown*wind*.0032*breath;
    p.y+=line*wind*.0009*sin(tick*2.4+p.x*18.);
    vec4 color=texture2D(plate,clamp(p,.001,.999));
    gl_FragColor=vec4(color.rgb,1.);
  }`;
  function shader(kind, src) {
    const s = gl.createShader(kind);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      gl.deleteShader(s);
      return null;
    }
    return s;
  }
  function init() {
    if (gl || !photo.naturalWidth || !inView || window.editionMotionOff())
      return;
    gl = canvas.getContext("webgl", {
      antialias: false,
      depth: false,
      alpha: false,
    });
    if (!gl) return;
    const vs = shader(gl.VERTEX_SHADER, vert),
      fs = shader(gl.FRAGMENT_SHADER, frag);
    if (!vs || !fs) return;
    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const a = gl.getAttribLocation(program, "pos");
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    for (const key of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T])
      gl.texParameteri(gl.TEXTURE_2D, key, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, photo);
    uniforms = Object.fromEntries(
      ["crop", "offset", "tick", "wind", "peak", "heading"].map((k) => [
        k,
        gl.getUniformLocation(program, k),
      ]),
    );
    start = performance.now();
    queue();
  }
  function draw(now) {
    frame = 0;
    if (!inView || !uniforms || document.hidden) return;
    const d = Math.min(1.5, devicePixelRatio),
      w = Math.round(canvas.clientWidth * d),
      h = Math.round(canvas.clientHeight * d);
    if (!w || !h) return;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    const ratio = w / h / (photo.width / photo.height),
      cx = Math.min(1, ratio),
      cy = Math.min(1, 1 / ratio);
    gl.uniform2f(uniforms.crop, cx, cy);
    gl.uniform2f(uniforms.offset, (1 - cx) * 0.66, (1 - cy) * 0.52);
    gl.uniform1f(uniforms.tick, (now - start) / 1000);
    gl.uniform1f(uniforms.wind, Math.min(1, speed / 24));
    gl.uniform1f(uniforms.peak, gust / 15);
    gl.uniform1f(uniforms.heading, Math.sin((direction * Math.PI) / 180));
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    canvas.classList.add("ready");
    if (
      !window.editionMotionOff() &&
      !document.querySelector("dialog").open &&
      speed > 0
    )
      queue();
  }
  function queue() {
    if (!frame && inView && uniforms) frame = requestAnimationFrame(draw);
  }
  watchVisibility(field, (on) => {
    inView = on;
    if (on) {
      if (!photo.src) photo.src = "/pond/img/field-still.webp";
      init();
      queue();
    }
  });
  photo.onload = () => {
    init();
    queue();
  };
  window.addEventListener("edition:wind", (e) => {
    speed = e.detail.wind_speed_10m;
    gust = e.detail.wind_gusts_10m;
    direction = e.detail.wind_direction_10m;
    queue();
  });
  window.addEventListener("edition:media", () => {
    init();
    queue();
  });
  new ResizeObserver(queue).observe(canvas);
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    canvas.classList.remove("ready");
    uniforms = null;
  });
  canvas.addEventListener("webglcontextrestored", () => {
    gl = null;
    init();
  });
  window.addEventListener("pagehide", (e) => {
    if (e.persisted || !gl) return;
    cancelAnimationFrame(frame);
    gl.deleteTexture(texture);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
  });
})();
