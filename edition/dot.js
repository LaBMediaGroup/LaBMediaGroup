(() => {
  const dots = [
    [99.0, 160.0],
    [99.0, 178.3],
    [99.1, 153.9],
    [105.1, 147.9],
    [105.3, 154.0],
    [105.3, 160.0],
    [105.3, 166.0],
    [105.3, 178.0],
    [111.0, 147.7],
    [111.3, 160.0],
    [111.3, 166.0],
    [111.3, 178.0],
    [117.3, 160.0],
    [117.3, 166.0],
    [117.3, 172.0],
    [117.3, 178.0],
    [117.5, 148.0],
    [123.5, 148.0],
    [123.5, 166.0],
    [123.5, 172.0],
    [136.2, 159.8],
    [136.3, 166.0],
    [136.3, 172.0],
    [142.3, 154.0],
    [142.3, 160.0],
    [142.3, 166.0],
    [142.3, 172.0],
    [142.3, 178.0],
    [148.3, 154.0],
    [148.3, 178.0],
    [154.5, 154.0],
    [154.5, 178.0],
    [160.5, 154.0],
    [160.5, 172.0],
    [173.3, 172.0],
    [179.5, 154.0],
    [179.5, 166.0],
    [179.5, 178.0],
    [185.4, 153.8],
    [185.5, 166.0],
    [185.5, 178.0],
    [191.5, 154.0],
    [191.5, 160.0],
    [191.5, 166.0],
    [191.5, 172.0],
    [197.5, 160.0],
    [197.5, 166.0],
    [197.5, 172.0],
    [197.5, 178.0],
    [210.5, 154.0],
    [216.4, 147.8],
    [216.5, 154.0],
    [216.5, 160.0],
    [216.5, 166.0],
    [216.5, 172.0],
    [222.5, 154.0],
    [222.5, 160.0],
    [222.5, 166.0],
    [222.5, 172.0],
    [222.5, 178.0],
    [222.6, 147.8],
    [228.5, 154.0],
    [228.5, 178.0],
    [234.5, 154.0],
    [234.5, 178.0],
    [247.5, 154.0],
    [253.5, 147.5],
    [253.5, 154.0],
    [253.5, 160.0],
    [253.5, 166.0],
    [253.5, 172.0],
    [259.5, 147.5],
    [259.5, 154.0],
    [259.5, 160.0],
    [259.5, 166.0],
    [259.5, 172.0],
    [259.5, 178.0],
    [265.5, 154.0],
    [265.5, 178.0],
    [271.5, 154.0],
    [271.5, 178.0],
    [284.4, 159.8],
    [284.5, 166.0],
    [284.5, 172.0],
    [290.5, 154.0],
    [290.5, 160.0],
    [290.5, 166.0],
    [290.5, 172.0],
    [290.5, 178.0],
    [296.5, 154.0],
    [296.5, 166.0],
    [296.5, 178.0],
    [302.5, 166.0],
    [302.5, 178.0],
    [302.7, 154.0],
    [308.5, 178.0],
    [308.7, 166.0],
    [308.8, 159.8],
    [321.5, 154.0],
    [321.5, 178.0],
    [327.5, 154.0],
    [327.7, 160.0],
    [327.7, 166.0],
    [327.7, 172.0],
    [327.7, 178.0],
    [333.7, 160.0],
    [333.7, 166.0],
    [333.7, 172.0],
    [333.7, 178.0],
    [339.7, 154.0],
    [339.7, 178.0],
    [345.7, 160.0],
    [345.9, 153.9],
    [358.5, 160.0],
    [358.5, 166.0],
    [358.5, 172.0],
    [364.7, 154.0],
    [364.7, 160.0],
    [364.7, 166.0],
    [364.7, 172.0],
    [364.7, 178.0],
    [370.7, 166.0],
    [370.7, 178.0],
    [370.8, 153.8],
    [376.7, 166.0],
    [376.7, 178.0],
    [376.9, 153.9],
    [382.7, 160.0],
    [382.9, 166.1],
    [382.9, 178.1],
    [395.5, 160.0],
    [395.5, 166.0],
    [395.5, 172.0],
    [401.7, 172.0],
    [401.7, 178.0],
    [401.9, 153.9],
    [407.7, 154.0],
    [407.7, 178.0],
    [413.9, 147.9],
    [413.9, 153.9],
    [413.9, 159.9],
    [413.9, 172.1],
    [414.0, 166.0],
    [419.9, 159.9],
    [419.9, 178.1],
    [420.0, 147.7],
    [420.0, 154.0],
    [420.0, 166.0],
    [420.0, 172.0],
  ];
  const film = document.querySelector("#dot-stage"),
    ctx = film.getContext("2d");
  const first = new Image(),
    poster = new Image();
  const clip = document.createElement("video");
  clip.muted = true;
  clip.playsInline = true;
  clip.loop = true;
  const dotX = 259.5,
    dotY = 160,
    radius = 1.55;
  const beat = (v, a, b) => smooth((v - a) / (b - a));
  let width = 1,
    height = 1,
    density = 1,
    visible = false,
    travel = 0,
    frame = 0;
  function cover(source, x, y, w, h) {
    const sw = source.videoWidth || source.naturalWidth,
      sh = source.videoHeight || source.naturalHeight;
    if (!sw || !sh) return;
    const ratio = Math.max(w / sw, h / sh);
    ctx.drawImage(
      source,
      x + (w - sw * ratio) / 2,
      y + (h - sh * ratio) / 2,
      sw * ratio,
      sh * ratio,
    );
  }
  // Feather the paper around the enlarged lettering so its edge never forms a second frame.
  const paper = document.createElement("canvas");
  paper.width = 384;
  paper.height = 76;
  const ink = paper.getContext("2d");
  ink.fillStyle = "#97bdc9";
  ink.fillRect(0, 0, paper.width, paper.height);
  ink.globalCompositeOperation = "destination-in";
  for (const gradient of [
    ink.createLinearGradient(0, 0, 384, 0),
    ink.createLinearGradient(0, 0, 0, 76),
  ]) {
    gradient.addColorStop(0, "transparent");
    gradient.addColorStop(0.06, "black");
    gradient.addColorStop(0.94, "black");
    gradient.addColorStop(1, "transparent");
    ink.fillStyle = gradient;
    ink.fillRect(0, 0, 384, 76);
  }
  function drawShot() {
    ctx.setTransform(density, 0, 0, density, 0, 0);
    ctx.fillStyle = "#0b0d0c";
    ctx.fillRect(0, 0, width, height);
    const p = window.editionMotionOff()
      ? 1
      : 1 - smooth(clamp((travel - 0.09) / 0.82));
    const shot = clip.readyState >= 2 ? clip : first;
    if (p === 0) {
      cover(shot, 0, 0, width, height);
      return;
    }
    const margin = Math.min(24, width * 0.045);
    const endScale = Math.min((width - 2 * margin) / 525, (height - 110) / 700);
    const startScale = (Math.hypot(width, height) / (2 * radius)) * 1.02;
    const zoom = startScale * Math.pow(endScale / startScale, p);
    const anchorX = mix(
      width / 2,
      width / 2 + (dotX - 262.5) * endScale,
      beat(p, 0.45, 1),
    );
    const anchorY = mix(
      height * 0.5,
      height * 0.5 + (dotY - 350) * endScale,
      beat(p, 0.45, 1),
    );
    const left = anchorX - dotX * zoom,
      top = anchorY - dotY * zoom;
    ctx.save();
    ctx.translate(left, top);
    ctx.scale(zoom, zoom);
    if (poster.naturalWidth) ctx.drawImage(poster, 0, 0);
    // Resolve the coarse raster into individual ink dots at macro magnification.
    const macro = clamp((zoom - 3) / 8);
    if (macro) {
      ctx.globalAlpha = macro;
      ctx.drawImage(paper, 70, 125);
      ctx.fillStyle = "#101f28";
      ctx.beginPath();
      for (const [x, y] of dots) {
        ctx.moveTo(x + radius, y);
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
      }
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    const r = radius * zoom;
    ctx.save();
    ctx.beginPath();
    ctx.arc(anchorX, anchorY, r, 0, 2 * Math.PI);
    ctx.clip();
    const apertureWidth = Math.min(width, 2 * r),
      apertureHeight = Math.min(height, 2 * r);
    ctx.globalAlpha = 1 - beat(p, 0.56, 0.75);
    cover(
      shot,
      anchorX - apertureWidth / 2,
      anchorY - apertureHeight / 2,
      apertureWidth,
      apertureHeight,
    );
    ctx.restore();
  }

  function render() {
    frame = 0;
    if (!visible) return;
    drawShot();
    if (!clip.paused && !clip.ended) frame = requestAnimationFrame(render);
  }
  function queue() {
    if (visible && !frame) frame = requestAnimationFrame(render);
  }
  function update() {
    const play =
      visible &&
      travel > 0.35 &&
      !window.editionMotionOff() &&
      !document.hidden &&
      !document.querySelector("dialog").open;
    setVideo(clip, "/pond/film-clips/scattered.mp4", play);
    queue();
  }
  new ResizeObserver(() => {
    width = film.clientWidth;
    height = film.clientHeight;
    density = Math.min(devicePixelRatio, 2);
    film.width = Math.round(width * density);
    film.height = Math.round(height * density);
    queue();
  }).observe(film);
  watchVisibility(film, (on) => {
    visible = on;
    if (on && !poster.src) {
      poster.src = "/assets/scattered-poster.webp";
      first.src = "/assets/scattered-still.webp";
    }
    update();
  });
  ScrollTrigger.create({
    trigger: "#scattered",
    start: () => "top top+=" + headerHeight(),
    end: () =>
      "+=" +
      Math.max(
        1,
        document.querySelector("#scattered").offsetHeight - film.clientHeight,
      ),
    onUpdate: (t) => {
      travel = t.progress;
      update();
    },
  });
  clip.addEventListener("playing", queue);
  poster.onload = first.onload = queue;
  window.addEventListener("edition:media", update);
})();
