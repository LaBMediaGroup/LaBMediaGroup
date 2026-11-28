(() => {
  "use strict";
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const W = window.LAB_WORK;
  const pointer = matchMedia("(hover: hover) and (pointer: fine)");
  const fine = pointer.matches;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const smooth = (a, b, v) => {
    const p = clamp((v - a) / (b - a));
    return p * p * (3 - 2 * p);
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  const vh = () => innerHeight;
  const headerHeight = () => $(".mast").offsetHeight;
  const motionOff = () => window.editionMotionOff();
  const viewerOpen = () => $("#viewer").open;
  const CLIPS = [
    ["lookout", 0.1],
    ["boy", 5.6],
    ["trail", 3.6],
    ["scattered", 1.1],
    ["gone", 0.2],
  ]
    .map(([id, at]) =>
      Object.assign(
        {},
        W.films.find((f) => f.id === id),
        { at },
      ),
    )
    .filter((f) => f.vid);
  function createHero() {
    const sec = $("#open"),
      pin = $(".pin", sec),
      out = $("#openGL");
    const M = document.createElement("canvas"),
      L = document.createElement("canvas");
    const m = M.getContext("2d"),
      l = L.getContext("2d");
    const ink = new Ink(out, {
      src: M,
      dynamic: true,
      res: fine ? 150 : 100,
      amp: 0.75,
    });
    let view = out;
    if (!ink.ok) {
      view = M;
      M.id = "openGL";
      M.setAttribute("aria-hidden", "true");
      out.replaceWith(M);
    }
    const vids = [0, 1].map(() =>
      Object.assign(document.createElement("video"), {
        muted: true,
        playsInline: true,
        loop: true,
        preload: "auto",
        crossOrigin: "anonymous",
      }),
    );
    vids.forEach((v) => {
      v.setAttribute("muted", "");
      v.setAttribute("playsinline", "");
    });
    const posters = CLIPS.map((f) =>
      Object.assign(new Image(), { src: f.img }),
    );
    let cur = 0,
      clip = 0,
      cutAt = 0,
      flash = 0,
      w = 0,
      h = 0,
      dpr = 1,
      letters = [],
      cap = 0,
      p = 0,
      visible = true;
    const setClip = (i) => {
      const f = CLIPS[i];
      $("#nowTitle").textContent = f.title;
      $("#nowMeta").textContent = `${f.year} · ${f.tag}`;
      $("#endTitle").textContent = f.title;
      $("#endMeta").textContent = (f.cred || [])
        .map((c) => c[1])
        .slice(0, 2)
        .join(" · ");
    };
    const cue = (v, i) => {
      v.src = CLIPS[i].vid;
      v.addEventListener(
        "loadedmetadata",
        () => {
          v.currentTime = CLIPS[i].at;
        },
        { once: true },
      );
    };
    cue(vids[0], 0);
    cue(vids[1], 1);
    setClip(0);
    function cut(t) {
      const nextV = vids[1 - cur];
      if (nextV.readyState < 2) return; // wait until the next shot is ready
      vids[cur].pause();
      cur = 1 - cur;
      clip = (clip + 1) % CLIPS.length;
      nextV.currentTime = CLIPS[clip].at;
      nextV.play().catch(() => {});
      setClip(clip);
      cutAt = t;
      flash = 1;
      cue(vids[1 - cur], (clip + 1) % CLIPS.length);
    }
    function layout() {
      w = pin.clientWidth;
      h = pin.clientHeight;
      dpr = Math.min(devicePixelRatio || 1, w < 760 ? 1.6 : 1.25);
      for (const c of [M, L]) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
      if (ink.ok) ink.size(w, h, dpr);
      else {
        M.style.width = "100%";
        M.style.height = "100%";
      }
      const g = w < 760 ? 16 : 40,
        F = '"Bebas Neue"';
      l.font = `400 100px ${F}`;
      const capH = l.measureText("H").actualBoundingBoxAscent / 100 || 0.7;
      const lines = w < 760 ? ["LAB", "MEDIA"] : ["LAB MEDIA"];
      const sizes = lines.map(
        (t) => (w - g * 2) / (l.measureText(t).width / 100),
      );
      if (w < 760) sizes[0] = Math.min(sizes[0], (h * 0.28) / capH);
      letters = [];
      let y =
        w < 760 ? Math.max(50, h * 0.105) : h * 0.5 - sizes[0] * capH * 0.62;
      lines.forEach((t, li) => {
        const s = sizes[li];
        l.font = `400 ${s}px ${F}`;
        y += s * capH;
        const x0 = g - s * 0.012;
        for (let i = 0; i < t.length; i++)
          if (t[i] !== " ") {
            const x = x0 + l.measureText(t.slice(0, i)).width,
              cw = l.measureText(t[i]).width;
            letters.push({ ch: t[i], x, cw, base: y, s, capH: s * capH });
          }
        y += s * 0.06;
      });
      cap = y;
      // the order they fall: the A goes first, Warhol-style ("L B"), then the rest
      const order = [1, 6, 3, 0, 7, 4, 2, 5];
      order.forEach((li, k) => letters[li] && (letters[li].k = k));
      pin.style.setProperty(
        "--h1y",
        `${Math.round(y + (w < 760 ? 18 : 34))}px`,
      );
    }
    function cover(ctx, src, s = 1) {
      const sw = src.videoWidth || src.naturalWidth,
        sh = src.videoHeight || src.naturalHeight;
      if (!sw) return;
      const W2 = ctx.canvas.width,
        H2 = ctx.canvas.height,
        k = Math.max(W2 / sw, H2 / sh) * s;
      ctx.drawImage(src, (W2 - sw * k) / 2, (H2 - sh * k) / 2, sw * k, sh * k);
    }
    // a tiny light meter: night footage gets pushed, bright footage is left alone
    const LM = document.createElement("canvas");
    LM.width = LM.height = 8;
    const lm = LM.getContext("2d", { willReadFrequently: true });
    let gain = 1.3,
      gainT = 1.3,
      metered = 0;
    function meter(src, t) {
      if (t - metered >= 400) {
        metered = t;
        try {
          lm.drawImage(src, 0, 0, 8, 8);
          const d = lm.getImageData(0, 0, 8, 8).data;
          let y = 0;
          for (let i = 0; i < d.length; i += 4)
            y += d[i] * 0.2126 + d[i + 1] * 0.7152 + d[i + 2] * 0.0722;
          gainT = clamp(118 / Math.max(20, y / 64), 0.95, 1.7);
        } catch {}
      }
      gain = lerp(gain, gainT, 0.1);
    }
    function draw(t) {
      const v = vids[cur],
        src = v.readyState >= 2 ? v : posters[clip];
      // letters: white glyphs, then the film poured in (source-in)
      l.setTransform(1, 0, 0, 1, 0, 0);
      l.globalCompositeOperation = "source-over";
      l.clearRect(0, 0, L.width, L.height);
      l.setTransform(dpr, 0, 0, dpr, 0, 0);
      l.fillStyle = "#fff";
      for (const a of letters) {
        const st = 0.05 + a.k * 0.052,
          k = clamp((p - st) / 0.2),
          e = k * k * k;
        if (e >= 1) continue;
        const dir = a.k % 2 ? 1 : -1;
        l.save();
        l.font = `400 ${a.s}px "Bebas Neue"`;
        l.translate(
          a.x + a.cw / 2 + dir * e * 40,
          a.base - a.capH / 2 + e * h * 1.1,
        );
        l.rotate(dir * e * 0.5);
        l.fillText(a.ch, -a.cw / 2, a.capH / 2);
        l.restore();
      }
      // Rasterize the video before compositing. WebKit can paint an accelerated
      // video draw outside a source-in mask; canvas-to-canvas preserves the glyph alpha.
      meter(src, t);
      m.setTransform(1, 0, 0, 1, 0, 0);
      m.globalAlpha = 1;
      m.fillStyle = "#0b0a09";
      m.fillRect(0, 0, M.width, M.height);
      if ("filter" in m)
        m.filter = `brightness(${gain.toFixed(2)}) contrast(1.06) saturate(1.15)`;
      cover(m, src, 1.02);
      if ("filter" in m) m.filter = "none";
      l.setTransform(1, 0, 0, 1, 0, 0);
      l.globalCompositeOperation = "source-in";
      l.drawImage(M, 0, 0);
      // lift the shadows inside the glyphs so dark footage still reads as letters
      l.globalCompositeOperation = "source-atop";
      l.fillStyle = "rgba(243,235,221,.14)";
      l.fillRect(0, 0, L.width, L.height);
      l.globalCompositeOperation = "source-over";
      // the frame: black, then the full shot rising behind as the letters fall away
      m.setTransform(1, 0, 0, 1, 0, 0);
      m.globalAlpha = 1;
      m.fillStyle = "#0b0a09";
      m.fillRect(0, 0, M.width, M.height);
      const a = smooth(0.16, 0.62, p);
      if (a > 0) {
        m.globalAlpha = a;
        cover(m, src, 1.18 - 0.18 * a);
        m.globalAlpha = 1;
        m.fillStyle = `rgba(11,10,9,${0.5 - 0.32 * a})`;
        m.fillRect(0, 0, M.width, M.height);
      }
      m.drawImage(L, 0, 0);
      if (flash > 0) {
        m.fillStyle = `rgba(243,235,221,${flash * 0.22})`;
        m.fillRect(0, 0, M.width, M.height);
        flash = Math.max(0, flash - 0.2);
      }
      if (ink.ok) ink.frame(t);
      if (src.videoWidth || src.naturalWidth) sec.classList.add("has-frame");
    }
    function update(t, scrollV) {
      const r = sec.getBoundingClientRect();
      visible = r.bottom > 0 && r.top < vh();
      p = clamp((headerHeight() - r.top) / Math.max(1, r.height - h));
      if (!visible || motionOff() || document.hidden || viewerOpen()) {
        vids.forEach((v) => v.pause());
        return;
      }
      if (vids[cur].paused) vids[cur].play().catch(() => {});
      if (cutAt === 0) cutAt = t; // the first shot gets its full 3.4 s
      if (p < 0.05 && t - cutAt > 3400) cut(t);
      pin.style.setProperty("--lb", smooth(0.56, 0.8, p).toFixed(3));
      pin.style.setProperty("--endA", smooth(0.72, 0.86, p).toFixed(3));
      const fade = (1 - smooth(0.01, 0.12, p)).toFixed(3);
      for (const el of $$(".open-h1, .open-now, .open-cue, .open-slug", pin))
        el.style.opacity = fade;
      if (ink.ok) {
        ink.turb = lerp(
          ink.turb,
          Math.min(0.4, Math.abs(scrollV) / 6000),
          0.15,
        );
        ink.smear = lerp(ink.smear, clamp(scrollV / 6000, -0.5, 0.5), 0.2);
      }
      draw(t);
    }
    document.fonts.load('400 100px "Bebas Neue"').then(layout);
    layout();
    addEventListener("resize", layout);
    return {
      update,
      ink,
      get view() {
        return view;
      },
      sec,
      vids,
    };
  }
  const email = $(".contact-email");
  email.href = "mailto:" + email.dataset.user + "@" + email.dataset.domain;
  const reel = $("#open"),
    studio = $(".studio-sheet"),
    portrait = $(".director-portrait");
  const strip = $("video", portrait);
  let hero,
    heroFrame = 0,
    previousY = scrollY,
    previousTime = 0,
    heroVisible = false;
  function stopHero() {
    cancelAnimationFrame(heroFrame);
    heroFrame = 0;
    hero?.vids.forEach((video) => video.pause());
  }
  function runHero(now) {
    heroFrame = 0;
    if (!heroVisible || document.hidden || motionOff() || viewerOpen())
      return stopHero();
    if (!hero) hero = createHero();
    const speed =
      ((scrollY - previousY) * 1000) / Math.max(16, now - previousTime);
    hero.update(now, speed);
    previousY = scrollY;
    previousTime = now;
    heroFrame = requestAnimationFrame(runHero);
  }
  function syncHero() {
    if (
      heroVisible &&
      !heroFrame &&
      !motionOff() &&
      !document.hidden &&
      !viewerOpen()
    ) {
      previousY = scrollY;
      previousTime = performance.now();
      heroFrame = requestAnimationFrame(runHero);
    } else if (!heroVisible || motionOff() || document.hidden || viewerOpen())
      stopHero();
  }
  new IntersectionObserver(([e]) => {
    heroVisible = e.isIntersecting;
    syncHero();
  }).observe(reel);

  const heads = new Map();
  let inkFrame = 0;
  function paintInk(t) {
    inkFrame = 0;
    if (motionOff() || document.hidden || viewerOpen()) return;
    let stirring = false;
    for (const ink of heads.values())
      if (ink && ink.ink.frame(t)) stirring = true;
    if (stirring) inkFrame = requestAnimationFrame(paintInk);
  }
  function ripple(target, x, y) {
    if (!target?.ok || motionOff() || viewerOpen()) return;
    const box = target.canvas.getBoundingClientRect();
    target.poke(x - box.left, y - box.top, 0.8);
  }
  function touchInk(e) {
    const finger = e.touches?.[0] || e;
    if (reel.contains(e.target))
      ripple(hero?.ink, finger.clientX, finger.clientY);
    else {
      const headline = e.target.closest("[data-ink]");
      if (!headline) return;
      ripple(heads.get(headline)?.ink, finger.clientX, finger.clientY);
      if (!inkFrame) inkFrame = requestAnimationFrame(paintInk);
    }
  }
  document.addEventListener("pointermove", touchInk, { passive: true });
  document.addEventListener("touchmove", touchInk, { passive: true });
  const headlines = $$("[data-ink]");
  const headlineObserver = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      if (motionOff()) continue;
      const el = e.target;
      if (!heads.has(el)) {
        const item = Ink.text(el);
        heads.set(el, item);
        item?.reveal();
      }
      el.classList.add("revealed");
      headlineObserver.unobserve(el);
    }
  });
  document.fonts.ready.then(() =>
    headlines.forEach((el) => headlineObserver.observe(el)),
  );
  let resizeTimer;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => heads.forEach((item) => item?.build()), 160);
  });

  let portraitOn = false;
  function syncPortrait() {
    const on = portraitOn && !motionOff() && !viewerOpen() && !document.hidden;
    if (on) {
      if (!strip.src) strip.src = strip.dataset.src;
      strip.play().catch(() => {});
    } else strip.pause();
  }
  new IntersectionObserver(([e]) => {
    portraitOn = e.isIntersecting;
    syncPortrait();
    if (portraitOn) studio.classList.add("signed");
  }).observe(portrait);
  function positionStrip(p) {
    portrait.style.setProperty("--strip", clamp(p, 0.04, 0.74) * 100 + "%");
  }
  portrait.addEventListener("pointermove", (e) => {
    if (motionOff() || e.pointerType !== "mouse") return;
    const r = portrait.getBoundingClientRect();
    positionStrip((e.clientX - r.left) / r.width - 0.14);
  });

  const projects = $$(".project[data-site]"),
    rows = $$(".film-row"),
    index = $("#film-list");
  const follower = document.createElement("div");
  follower.className = "tip-screen";
  follower.hidden = true;
  follower.setAttribute("aria-hidden", "true");
  document.body.append(follower);
  function previewVideo() {
    const v = document.createElement("video");
    v.className = "moving-preview";
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = "none";
    v.setAttribute("aria-hidden", "true");
    return v;
  }
  const projectVideo = previewVideo(),
    filmVideo = previewVideo();
  let activeProject = null,
    activeRow = null,
    hoverProject = null,
    hoverRow = null,
    activeMode = null;
  let x = 0,
    y = 0,
    scrollFrame = 0;
  function stopVideo(video) {
    video.pause();
    video.removeAttribute("src");
    video.load();
    video.remove();
  }
  function changeProject(project) {
    if (activeProject === project) return;
    activeProject?.classList.remove("previewing");
    if (activeProject) stopVideo(projectVideo);
    activeProject = project;
    if (!project) return;
    const work = W.websites.find((site) => site.id === project.dataset.site);
    projectVideo.poster = work.img;
    projectVideo.src = pointer.matches
      ? work.vid
      : "/title-sequence/previews/" + work.id + ".mp4";
    project.prepend(projectVideo);
    project.classList.add("previewing");
    projectVideo.play().catch(() => {});
  }
  // Let the film frame trail the hand. Its lag supplies the bank and pitch,
  // so a slow browse barely tips it and a reversal throws its weight across.
  let tipX, tipY, bank = 0, pitch = 0, bankSpeed = 0;
  let tipWidth = 0, tipHeight = 0, tipFrame = 0, lastTick = 0;

  function tickTip(now) {
    tipFrame = 0;
    const dt = Math.min((now - lastTick) / 1000, 1 / 30);
    lastTick = now;
    const margin = 12;
    const side = smooth(0.25, 0.92, x / innerWidth);
    const targetX = clamp(x + 19 - side * (tipWidth + 38), margin, innerWidth - tipWidth - margin);
    const targetY = clamp(y - tipHeight * 0.65, margin, innerHeight - tipHeight - margin);
    tipX ??= targetX;
    tipY ??= targetY;
    const dx = targetX - tipX, dy = targetY - tipY;
    const follow = 1 - Math.exp(-22 * dt);
    tipX += dx * follow;
    tipY += dy * follow;
    const desiredBank = clamp(dx * 0.19, -13, 13);
    bankSpeed += ((desiredBank - bank) * 360 - bankSpeed * 24) * dt;
    bank += bankSpeed * dt;
    pitch += (clamp(-dy * 0.25, -11, 11) - pitch) * follow;
    const moving = Math.abs(dx) + Math.abs(dy) + Math.abs(bank) + Math.abs(pitch) + Math.abs(bankSpeed) > 0.09;
    if (!moving) {
      tipX = targetX;
      tipY = targetY;
      bank = pitch = bankSpeed = 0;
    }
    follower.style.transform = `translate3d(${tipX}px,${tipY}px,0) perspective(720px) rotateZ(${bank}deg) rotateX(${pitch}deg)`;
    if (moving) tipFrame = requestAnimationFrame(tickTip);
  }
  function moveTip() {
    if (tipFrame || follower.hidden) return;
    lastTick = performance.now() - 1000 / 60;
    tipFrame = requestAnimationFrame(tickTip);
  }
  function measureTip() {
    if (follower.hidden) return;
    tipWidth = follower.offsetWidth;
    tipHeight = follower.offsetHeight;
    moveTip();
  }
  addEventListener("resize", measureTip);
  function changeRow(row) {
    if (activeRow === row && activeMode === pointer.matches) return;
    activeRow?.classList.remove("previewing");
    if (activeRow) stopVideo(filmVideo);
    activeRow = row;
    activeMode = pointer.matches;
    if (!row || !pointer.matches) {
      follower.hidden = true;
      cancelAnimationFrame(tipFrame);
      tipFrame = bank = pitch = bankSpeed = 0;
      tipX = tipY = undefined;
    }
    if (!row) return;
    const film = W.films.find((f) => f.id === row.dataset.film);
    filmVideo.poster = film.img;
    filmVideo.src = film.vid;
    if (pointer.matches) {
      follower.append(filmVideo);
      follower.hidden = false;
      measureTip();
    } else row.prepend(filmVideo);
    row.classList.add("previewing");
    filmVideo.play().catch(() => {});
  }
  function touchProject() {
    const r = $(".project-wall").getBoundingClientRect(),
      axis = innerHeight * 0.54;
    if (r.bottom < axis || r.top > axis) return null;
    if (axis < projects[1].getBoundingClientRect().top) return projects[0];
    if (axis >= projects[3].getBoundingClientRect().top) return projects[3];
    const mid = projects[1].getBoundingClientRect();
    return projects[axis < mid.top + mid.height * 0.5 ? 1 : 2];
  }
  function touchRow() {
    const axis = innerHeight * 0.5;
    return rows.find((row) => {
      const r = row.getBoundingClientRect();
      return r.top <= axis && r.bottom > axis;
    });
  }
  function syncPreviews() {
    scrollFrame = 0;
    syncDoor();
    const play = !document.hidden && !viewerOpen() && !motionOff();
    changeProject(
      play ? (pointer.matches ? hoverProject : touchProject()) : null,
    );
    changeRow(play ? (pointer.matches ? hoverRow : touchRow()) : null);
    if (portraitOn && play && !portrait.matches(":hover")) {
      const r = portrait.getBoundingClientRect();
      positionStrip((0.75 * (innerHeight - r.top)) / (innerHeight + r.height));
    }
  }
  function requestSync() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(syncPreviews);
  }
  for (const project of projects) {
    project.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "mouse") {
        hoverProject = project;
        requestSync();
      }
    });
    project.addEventListener("pointerleave", () => {
      hoverProject = null;
      requestSync();
    });
  }
  for (const row of rows)
    row.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "mouse") {
        hoverRow = row;
        x = e.clientX;
        y = e.clientY;
        requestSync();
      }
    });
  index.addEventListener("pointermove", (e) => {
    x = e.clientX;
    y = e.clientY;
    if (!follower.hidden) moveTip();
  });
  index.addEventListener("pointerleave", () => {
    hoverRow = null;
    requestSync();
  });
  // This silent edit is photographed at 24 fps. Seek only after the decoder
  // finishes its last request, always using the latest scroll position.
  const gone = $("#gone"), gonePin = $(".gone-pin"), door = $("#door-shot");
  let doorNearby = false, doorRequested = false;

  async function loadDoor() {
    doorRequested = true;
    door.preload = "auto";
    try {
      // This small local clip must seek in both directions, including on
      // preview servers that do not implement HTTP byte ranges.
      const response = await fetch(door.dataset.src);
      if (!response.ok) throw new Error("Doorway clip unavailable");
      door.src = URL.createObjectURL(await response.blob());
    } catch {
      door.src = door.dataset.src;
    }
  }

  function syncDoor() {
    if (!doorNearby || motionOff() || document.hidden || viewerOpen()) return;
    if (!doorRequested) {
      loadDoor();
      return;
    }
    if (!Number.isFinite(door.duration) || door.readyState < 1 || door.seeking) return;
    const bounds = gone.getBoundingClientRect();
    const travel = Math.max(1, bounds.height - gonePin.offsetHeight);
    const progress = clamp((headerHeight() - bounds.top) / travel);
    const lastFrame = Math.max(0, Math.round(door.duration * 24) - 1);
    const time = Math.round(progress * lastFrame) / 24;
    if (Math.abs(door.currentTime - time) > 1 / 48) door.currentTime = time;
  }
  door.addEventListener("loadeddata", syncDoor);
  door.addEventListener("seeked", syncDoor);
  new ResizeObserver(() => {
    gone.style.setProperty("--gone-panel-height", gonePin.offsetHeight + "px");
    requestSync();
  }).observe(gonePin);
  new IntersectionObserver(([entry]) => {
    doorNearby = entry.isIntersecting;
    syncDoor();
  }, { rootMargin: "65% 0px" }).observe(gone);
  function syncAll() {
    syncHero();
    syncPortrait();
    cancelAnimationFrame(scrollFrame);
    syncPreviews();
  }
  addEventListener("edition:media", syncAll);
  document.addEventListener("visibilitychange", syncAll);
  addEventListener("scroll", requestSync, { passive: true });
  addEventListener("resize", requestSync);
  pointer.addEventListener("change", () => {
    hoverProject = hoverRow = null;
    changeProject(null);
    changeRow(null);
    requestSync();
  });
  requestSync();
})();
