// First-visit welcome and top-of-page pull gesture. The paths are the original LaB mark from the hairline entrance.
(() => {
  const welcome = document.querySelector(".welcome");
  const mast = document.querySelector(".mast");
  if (!welcome || !mast) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.id = "beaker-motion";
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    left: "0",
    width: "100%",
    zIndex: "20",
    pointerEvents: "none",
  });
  canvas.hidden = true;
  document.body.append(canvas);

  const parts = [
    [
      "M548 24H693C733 24 733 80.5 693 80.5H548C506 80.5 506 24 548 24Z",
      0.45,
      0.91,
    ],
    [
      "M567.5 81V173L428 402C406 446 420 471 463 471H777C825 471 840 445 814 401L675.5 173V81",
      0.6,
      1.46,
    ],
    ["M568 109H601", 0.86, 1.04],
    ["M568 137H593", 0.94, 1.12],
    ["M568 165H605", 1.02, 1.2],
    [
      "M590 439H472Q438 439 460 403L524 298Q546 310 569 307C605 302.3 638 231 691 260L778 404Q798 440 766 440H646",
      1.06,
      1.72,
      "#adc6bb",
    ],
  ].map(([d, start, end, color]) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    return {
      path: new Path2D(d),
      length: path.getTotalLength(),
      start,
      end,
      color,
    };
  });

  let width,
    height,
    density,
    mode,
    origin,
    progress = 0,
    frame = 0;
  const beat = (value, a, b) => {
    const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  function begin(name) {
    mode = name;
    width = innerWidth;
    height = name === "intro" ? innerHeight : 118;
    density = Math.min(devicePixelRatio, 2);
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    canvas.style.height = height + "px";
    canvas.style.top = (name === "intro" ? 0 : mast.offsetHeight) + "px";
    canvas.hidden = false;
  }
  function finish() {
    cancelAnimationFrame(frame);
    frame = 0;
    mode = origin = null;
    progress = 0;
    canvas.hidden = true;
  }
  function draw(t) {
    const intro = mode === "intro";
    ctx.setTransform(density, 0, 0, density, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const depth = intro ? height : progress * height;
    if (depth < 1) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, depth);
    ctx.clip();
    ctx.fillStyle = "#0b0d0c";
    ctx.fillRect(0, 0, width, depth);
    const scale =
      (intro ? Math.min(width * 0.32, height * 0.23, 161) : 65) / 447;
    const x = width / 2 - 621 * scale;
    const y = intro ? height * 0.49 - 247.5 * scale : depth - 15 - 471 * scale;
    const rim = y + 24 * scale;
    ctx.strokeStyle = "#d6ded9";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 548 * scale, Math.max(0, rim) * beat(t, 0.29, 0.72));
    ctx.lineTo(x + 548 * scale, Math.max(0, rim) * beat(t, 0, 0.52));
    ctx.stroke();
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.lineJoin = ctx.lineCap = "round";
    ctx.lineWidth = 1.25 / scale;
    for (const part of parts) {
      const extent = beat(t, part.start, part.end);
      if (!extent) continue;
      ctx.setLineDash(
        extent < 1 ? [part.length * extent, part.length + 1] : [],
      );
      ctx.strokeStyle = part.color || "#eeeae1";
      ctx.stroke(part.path);
    }
    ctx.restore();
    const dot = beat(t, 1.54, 1.72);
    if (dot) {
      ctx.fillStyle = "#dbe1d4";
      ctx.beginPath();
      ctx.arc(x + 618 * scale, y + 439 * scale, 1.35 * dot, 0, 2 * Math.PI);
      ctx.fill();
    }
    if (intro && t > 1.76) {
      const open = beat(t, 1.76, 2.18),
        rise = beat(t, 2.03, 2.48);
      ctx.clearRect(
        (x + 618 * scale) * (1 - open),
        (y + 439 * scale) * (1 - rise),
        width * open,
        1.35 + height * rise,
      );
    }
    ctx.restore();
  }

  const atTop = () => scrollY <= 1 && !document.querySelector("dialog[open]");
  const motionOff = () =>
    reduced.matches ||
    document.documentElement.classList.contains("motion-paused");
  let firstVisit = true;
  try {
    firstVisit = !sessionStorage.getItem("lab-beaker-welcome");
  } catch {}
  if (firstVisit && !location.hash && atTop() && !motionOff()) {
    try {
      sessionStorage.setItem("lab-beaker-welcome", "1");
    } catch {}
    begin("intro");
    const start = performance.now();
    function play(now) {
      const t = (now - start) / 1000;
      if (t >= 2.48 || !atTop() || motionOff()) return finish();
      draw(t);
      frame = requestAnimationFrame(play);
    }
    play(start);
  }

  const passive = { passive: true };
  for (const event of ["wheel", "pointerdown", "keydown"]) {
    window.addEventListener(
      event,
      () => {
        if (mode === "intro") finish();
      },
      passive,
    );
  }
  welcome.addEventListener(
    "touchstart",
    (e) => {
      if (mode === "intro") finish();
      if (mode === "pull") finish();
      if (e.touches.length !== 1 || !atTop() || motionOff()) return;
      origin = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    },
    passive,
  );
  welcome.addEventListener(
    "touchmove",
    (e) => {
      if (!origin) return;
      const finger = e.touches[0],
        dy = finger.clientY - origin.y;
      if (
        e.touches.length !== 1 ||
        !atTop() ||
        dy < -5 ||
        Math.abs(finger.clientX - origin.x) > Math.max(18, dy)
      )
        return finish();
      if (!mode && dy < 10) return;
      // Only this downward pull owns the gesture. Upward and sideways swipes stay native.
      if (e.cancelable) e.preventDefault();
      if (!mode) begin("pull");
      progress = Math.min(1, Math.max(0, (dy - 8) / 150));
      draw(progress * 1.74);
    },
    { passive: false },
  );
  window.addEventListener(
    "touchend",
    () => {
      origin = null;
      if (mode !== "pull") return;
      const start = performance.now(),
        initial = progress;
      function release(now) {
        const t = Math.min(1, (now - start) / 340);
        progress = initial * (1 - beat(t, 0, 1));
        draw(progress * 1.74);
        if (t === 1) finish();
        else frame = requestAnimationFrame(release);
      }
      frame = requestAnimationFrame(release);
    },
    passive,
  );
  for (const event of ["touchcancel", "pagehide"])
    window.addEventListener(event, finish, passive);
  window.addEventListener(
    "resize",
    () => {
      if (mode && width !== innerWidth) finish();
    },
    passive,
  );
  reduced.addEventListener("change", finish);
})();
