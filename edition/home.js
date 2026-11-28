"use strict";
const $ = (selector) => document.querySelector(selector);
const all = (selector) => [...document.querySelectorAll(selector)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const phone = matchMedia("(max-width:720px)");
const clamp = (value) => Math.min(1, Math.max(0, value));
const smooth = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
const mix = (a, b, t) => a + (b - a) * t;
const headerHeight = () => $(".mast").offsetHeight;
const viewer = $("#viewer"),
  viewerBody = $("#viewer-body");
const films = window.LAB_WORK.films;
const sites = ["sweetbabe", "ballcap", "sideways", "splitbone"].map((id) =>
  window.LAB_WORK.websites.find((site) => site.id === id),
);
const siteNames = [
  "Sweet Babe",
  "Ballcap Productions",
  "Sideways Studios",
  "Splitbone",
];
const descriptions = [
  "Kyle’s live acoustic site. Spin a record, find a show, book a date.",
  "A tunnel into the films and the crew that made them.",
  "A hand-drawn animation studio, in motion.",
  "A studio concept. Walk the room, check the rates, find a session.",
];
let selected = 0,
  ribbonProgress = 0,
  sitesVisible = false,
  newsVisible = false;
let paused = false,
  soundOn = false,
  audioContext,
  lastTrigger,
  viewerTimer,
  fieldNoise;
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
const stopMotion = () => reduced.matches || paused;
function button(label, className) {
  const el = document.createElement("button");
  el.type = "button";
  el.textContent = label;
  if (className) el.className = className;
  return el;
}
function still(src, alt = "") {
  const img = new Image();
  img.alt = alt;
  img.loading = "lazy";
  img.src = src;
  return img;
}
function cue(kind) {
  if (!soundOn || !audioContext || viewer.open || document.hidden) return;
  const ctx = audioContext,
    length = kind === "field" ? 1.55 : kind === "record" ? 0.38 : 0.045;
  const data = ctx.createBuffer(
    1,
    Math.ceil(ctx.sampleRate * length),
    ctx.sampleRate,
  );
  const samples = data.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource(),
    filter = ctx.createBiquadFilter(),
    gain = ctx.createGain();
  filter.type = "lowpass";
  filter.frequency.value =
    kind === "type" ? 2700 : kind === "record" ? 900 : 460;
  source.buffer = data;
  source.connect(filter).connect(gain).connect(ctx.destination);
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(
    kind === "type" ? 0.12 : 0.045,
    now + Math.min(0.12, length * 0.1),
  );
  gain.gain.exponentialRampToValueAtTime(0.0001, now + length);
  source.onended = () => {
    source.disconnect();
    filter.disconnect();
    gain.disconnect();
  };
  if (kind === "field") fieldNoise = source;
  source.start();
  source.stop(now + length);
}
$("#sound").onclick = async () => {
  if (!audioContext) {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    audioContext = new Audio();
  }
  soundOn = !soundOn;
  if (soundOn) {
    await audioContext.resume();
    cue("type");
  } else {
    await audioContext.suspend();
  }
  $("#sound small").textContent = soundOn ? "On" : "Off";
  $("#sound").setAttribute("aria-pressed", String(soundOn));
  $("#sound").setAttribute(
    "aria-label",
    soundOn ? "Mute sound" : "Enable sound",
  );
};
function watchVisibility(el, callback, margin = "0px") {
  new IntersectionObserver((entries) => callback(entries[0].isIntersecting), {
    rootMargin: margin,
  }).observe(el);
}
function setVideo(video, src, active) {
  if (!active) {
    video.pause();
    return;
  }
  if (!video.getAttribute("src")) video.src = src;
  if (video.paused) video.play().catch(() => {});
}
const cards = [],
  names = [];
sites.forEach((site, i) => {
  const card = button("", "site-card");
  card.setAttribute("aria-label", "Open " + siteNames[i]);
  const video = document.createElement("video");
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = "none";
  card.append(still(site.img), video);
  $("#cards").append(card);
  card.onclick = () => {
    chooseSite(i);
    openSite(i);
  };
  cards.push(card);
  const name = button(siteNames[i]);
  name.onclick = () => {
    chooseSite(i);
    openSite(i);
  };
  $("#site-names").append(name);
  names.push(name);
});
function media() {
  const permitted = !stopMotion() && !viewer.open && !document.hidden;
  cards.forEach((card, i) => {
    const src = phone.matches
      ? "/title-sequence/previews/" + sites[i].id + ".mp4"
      : sites[i].vid;
    setVideo(card.lastChild, src, permitted && sitesVisible && selected === i);
  });
  const news = $("#newscast");
  setVideo(news, news.dataset.src, permitted && newsVisible);
  window.dispatchEvent(new Event("edition:media"));
}
function drawRibbon(value, exit = 0) {
  const pos = Math.max(0, Math.min(3, value)),
    active = Math.round(pos);
  cards.forEach((card, i) => {
    const d = i - pos,
      side = phone.matches;
    gsap.set(card, {
      xPercent: (side ? -50 : 0) + d * (side ? 106 : 101),
      yPercent: -50 + Math.abs(d) * 9,
      rotationY: stopMotion() ? 0 : -d * 29 - exit * 77,
      rotationZ: stopMotion() ? 0 : d * 2.1,
      scale: 1 - Math.min(2, Math.abs(d)) * 0.07,
      opacity: Math.abs(d) > 1.75 ? 0 : 1,
      zIndex: 5 - Math.round(Math.abs(d) * 2),
    });
    card.tabIndex = i === active ? 0 : -1;
    card.setAttribute("aria-hidden", String(i !== active));
  });
  if (active !== selected || !$("#site-copy").textContent) {
    selected = active;
    $("#site-copy").textContent = descriptions[active];
    $("#visit").textContent = "Open " + siteNames[active] + " ↗";
    names.forEach((name, i) =>
      name.setAttribute("aria-current", String(i === active)),
    );
    media();
  }
}
const track = $("#sites");
function chooseSite(i) {
  if (stopMotion()) {
    drawRibbon(i);
    return;
  }
  const top = track.getBoundingClientRect().top + scrollY - headerHeight();
  window.scrollTo(
    0,
    Math.max(
      0,
      top +
        (track.offsetHeight - $(".ribbon-pin").offsetHeight) *
          ((i / 3) * 0.86 + 0.035),
    ),
  );
  drawRibbon(i);
}
const syncRibbon = () => {
  if (!stopMotion())
    drawRibbon(
      ((ribbonProgress - 0.035) / 0.86) * 3,
      smooth((ribbonProgress - 0.93) / 0.07),
    );
};
ScrollTrigger.create({
  trigger: track,
  start: () => "top top+=" + headerHeight(),
  end: () => "+=" + (track.offsetHeight - $(".ribbon-pin").offsetHeight || 1),
  onUpdate: (t) => {
    ribbonProgress = t.progress;
    syncRibbon();
  },
});
watchVisibility($(".ribbon-pin"), (on) => {
  sitesVisible = on;
  media();
});
watchVisibility($(".gone-pin"), (on) => {
  newsVisible = on;
  media();
});
function syncSources() {
  cards.forEach((card, i) => {
    card.firstChild.src = phone.matches
      ? "/title-sequence/previews/" + sites[i].id + ".webp"
      : sites[i].img;
    const video = card.lastChild;
    video.pause();
    video.removeAttribute("src");
    video.load();
  });
  drawRibbon(selected);
  media();
}
phone.addEventListener("change", syncSources);
$("#motion").onclick = () => {
  paused = !paused;
  $("#motion").setAttribute("aria-pressed", String(paused));
  $("#motion").textContent = paused ? "Resume motion" : "Pause motion";
  document.documentElement.classList.toggle("motion-paused", paused);
  syncRibbon();
  media();
  ScrollTrigger.refresh();
};
reduced.addEventListener("change", () => {
  syncRibbon();
  media();
  ScrollTrigger.refresh();
});
function openViewer(title) {
  lastTrigger = document.activeElement;
  $("#viewer-title").textContent = title;
  viewerBody.replaceChildren();
  viewer.showModal();
  if (fieldNoise) {
    try {
      fieldNoise.stop();
    } catch {}
  }
  media();
  $("#close-viewer").focus({ preventScroll: true });
}
function closeViewer() {
  viewer.close();
}
$("#close-viewer").onclick = closeViewer;
viewer.addEventListener("click", (e) => {
  if (e.target === viewer) {
    const r = viewer.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      closeViewer();
  }
});
viewer.addEventListener("close", () => {
  clearTimeout(viewerTimer);
  viewerBody.querySelectorAll("video").forEach((v) => {
    v.pause();
    v.removeAttribute("src");
    v.load();
  });
  viewerBody.replaceChildren();
  lastTrigger?.focus({ preventScroll: true });
  media();
});
function openSite(i) {
  const site = sites[i];
  openViewer(siteNames[i]);
  const foot = document.createElement("div");
  foot.className = "view-foot";
  const status = document.createElement("span");
  status.setAttribute("role", "status");
  const mode = button("Watch recording", "view-mode");
  foot.append(status, mode);
  function show(recorded) {
    clearTimeout(viewerTimer);
    viewerBody.replaceChildren();
    const surface = document.createElement(recorded ? "video" : "iframe");
    surface.className = "site-frame";
    viewerBody.append(surface, foot);
    if (recorded) {
      status.textContent = "Recorded walkthrough";
      mode.textContent = "Try live site";
      surface.controls = true;
      surface.playsInline = true;
      surface.muted = true;
      surface.src = phone.matches
        ? "/title-sequence/previews/" + site.id + ".mp4"
        : site.vid;
      surface.play().catch(() => {});
    } else {
      status.textContent = "Opening live site…";
      mode.textContent = "Watch recording";
      surface.title = siteNames[i] + " live website";
      surface.setAttribute(
        "sandbox",
        "allow-scripts allow-same-origin allow-forms allow-presentation",
      );
      viewerTimer = setTimeout(() => show(true), 9500);
      surface.onload = () => {
        if (surface.isConnected) {
          clearTimeout(viewerTimer);
          status.textContent = "Live site";
        }
      };
      surface.onerror = () => {
        if (surface.isConnected) show(true);
      };
      surface.src = site.links[0][1];
    }
    mode.onclick = () => show(!recorded);
  }
  show(false);
}
$("#visit").onclick = () => openSite(selected);
const extras = {
  scattered: "/assets/scattered-poster.webp",
  brass: "/assets/hero-v4/AnthonyBrass-Paintingclip.jpg",
  trail: "/assets/trail-on-set.webp",
};
function openFilm(id) {
  const f = films.find((f) => f.id === id);
  if (!f) return;
  openViewer(f.title);
  const section = document.createElement("div");
  section.className = "screening " + id + "-film";
  const player = document.createElement("video");
  player.controls = true;
  player.playsInline = true;
  player.poster = f.img;
  player.src = f.full;
  const aside = document.createElement("aside");
  const meta = document.createElement("small");
  meta.textContent = f.year + " / " + f.tag;
  const title = document.createElement("h3");
  title.textContent = f.title;
  const line = document.createElement("p");
  line.textContent = f.line;
  aside.append(meta, title, line);
  if (extras[id]) {
    const art = still(extras[id]);
    art.className = "film-detail";
    aside.prepend(art);
  }
  if (id === "boy") {
    const strip = document.createElement("div");
    strip.className = "strip";
    ["boy-img_3354.jpg", "boy-test-3.jpg", "boy-text-2.jpg"].forEach((src) =>
      strip.append(still("/assets/" + src)),
    );
    aside.prepend(strip);
  }
  const credit = document.createElement("dl");
  f.cred.forEach(([k, v]) => {
    const dt = document.createElement("dt"),
      dd = document.createElement("dd");
    dt.textContent = k;
    dd.textContent = v;
    credit.append(dt, dd);
  });
  aside.append(credit);
  section.append(player, aside);
  viewerBody.append(section);
  player.play().catch(() => {});
  const starts = {
    gone: "inset(32% 32% 35% 32% round 12px)",
    scattered: "circle(2% at 50% 35%)",
    trail: "inset(48% 9% 46% 9%)",
    lookout: "inset(0 0 95% 0)",
    boy: "inset(20% 80% 40% 0)",
    moz: "inset(0 0 0 92%)",
    brass: "polygon(0 0, 5% 0, 0 100%, 0 100%)",
  };
  const ends = {
    scattered: "circle(150% at 50% 35%)",
    brass: "polygon(0 0,100% 0,100% 100%,0 100%)",
  };
  if (!stopMotion())
    section.animate(
      [
        { clipPath: starts[id] },
        { clipPath: ends[id] || "inset(0% 0% 0% 0% round 0px)" },
      ],
      { duration: 390, easing: "cubic-bezier(.15,.7,.2,1)" },
    );
}
films.forEach((f) => {
  const row = button("", "film-row");
  row.dataset.film = f.id;
  const title = document.createElement("strong");
  title.textContent = f.title;
  const year = document.createElement("small");
  year.textContent = f.year + "　▶";
  row.append(still(f.img), title, year);
  $("#film-list").append(row);
});
all("[data-film]").forEach(
  (el) => (el.onclick = () => openFilm(el.dataset.film)),
);
const period = $("#period"),
  spindle = $("#spindle");
function spinTransition(p) {
  if (stopMotion() || p < 0.006 || p > 0.995) {
    spindle.style.display = "none";
    return;
  }
  const a = period.getBoundingClientRect(),
    b = cards[0].getBoundingClientRect(),
    t = smooth(p);
  const startY = a.bottom + scrollY - a.height * 0.13;
  const endX = b.left + b.width * 0.5,
    endY = b.top + b.height * (phone.matches ? 0.36 : 0.33);
  const centerY =
    mix(startY, Math.min(innerHeight * 0.57, endY), smooth(p / 0.58)) +
    Math.max(0, endY - innerHeight * 0.57) * smooth((p - 0.83) / 0.17);
  const diameter = mix(5, Math.min(b.width * 0.43, 145), smooth(p / 0.76));
  gsap.set(spindle, {
    display: "block",
    width: diameter,
    height: diameter,
    x: mix(a.left + 2, endX, t) - diameter / 2,
    y: centerY - diameter / 2,
    rotation: p * 92,
    opacity: 1 - smooth((p - 0.85) / 0.15),
  });
}
ScrollTrigger.create({
  trigger: ".welcome",
  start: "top top",
  endTrigger: "#sites",
  end: () => "top top+=" + headerHeight(),
  onUpdate: (t) => spinTransition(t.progress),
  onLeave: () => (spindle.style.display = "none"),
  onLeaveBack: () => (spindle.style.display = "none"),
});
ScrollTrigger.create({
  trigger: "#sites",
  start: "top 65%",
  onEnter: () => cue("record"),
});
ScrollTrigger.create({
  trigger: "#films",
  start: "top 96%",
  end: "top 3%",
  onUpdate: (t) => {
    const p = smooth(t.progress);
    gsap.set(".room", {
      scale: stopMotion() ? 1 : mix(1.65, 1, p),
      rotationY: stopMotion() ? 0 : mix(-14, 0, p),
    });
  },
});
const field = $("#fly");
function fieldProgress(p) {
  const t = stopMotion() ? 1 : smooth((p - 0.08) / 0.7);
  gsap.set(".field-mask", {
    scale: 1 + 8 * t,
    opacity: 1 - smooth((t - 0.35) / 0.65),
  });
  gsap.set(".field-info", {
    y: 30 * (1 - t),
    opacity: stopMotion() ? 1 : clamp(0.05 + t * 1.6),
  });
}
ScrollTrigger.create({
  trigger: field,
  start: () => "top top+=" + headerHeight(),
  end: () =>
    "+=" + Math.max(1, field.offsetHeight - $(".field-pin").offsetHeight),
  onUpdate: (t) => fieldProgress(t.progress),
  onEnter: () => cue("field"),
});
function sceneFrame(title, src) {
  const f = document.createElement("iframe");
  f.title = title;
  f.tabIndex = -1;
  f.setAttribute("aria-hidden", "true");
  f.src = src;
  return f;
}
let forecastTimer;
async function fieldReading() {
  try {
    const { current: w, stale } = await LaBFieldForecast.load();
    window.dispatchEvent(new CustomEvent("edition:wind", { detail: w }));
    $("#speed").textContent = Math.round(w.wind_speed_10m);
    $("#gust").textContent = Math.round(w.wind_gusts_10m) + " mph";
    $("#bearing").textContent = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][
      Math.round(w.wind_direction_10m / 45) % 8
    ];
    $("#wx-time").textContent =
      (stale ? "Last available · " : "Open-Meteo · ") +
      w.time.replace("T", " ") +
      " · Michigan time";
  } catch {
    $("#wx-time").textContent = "Live readings unavailable";
    ["#speed", "#gust", "#bearing"].forEach((k) => ($(k).textContent = "—"));
  }
}
watchVisibility(
  field,
  (on) => {
    clearInterval(forecastTimer);
    if (on) {
      fieldReading();
      forecastTimer = setInterval(() => {
        if (!document.hidden) fieldReading();
      }, 600000);
    }
  },
  "280px",
);
watchVisibility(
  $("#pond"),
  (on) => {
    const mask = $(".pond-aperture");
    if (!on || stopMotion()) {
      mask.replaceChildren();
      return;
    }
    if (!mask.firstChild)
      mask.append(
        sceneFrame(
          "Labcoon at the pond",
          "/title-sequence/peek/explore.html?shot=coon",
        ),
      );
  },
  "150px",
);
window.editionMotionOff = stopMotion;
document.addEventListener("visibilitychange", media);
syncSources();
fieldProgress(0);
window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
