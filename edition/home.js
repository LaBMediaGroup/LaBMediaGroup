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
    length = kind === "field" ? 1.55 : 0.045;
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
  filter.frequency.value = kind === "type" ? 2700 : 460;
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
function media() {
  window.dispatchEvent(new Event("edition:media"));
}
$("#motion").onclick = () => {
  paused = !paused;
  $("#motion").setAttribute("aria-pressed", String(paused));
  $("#motion").textContent = paused ? "Resume motion" : "Pause motion";
  document.documentElement.classList.toggle("motion-paused", paused);
  media();
  ScrollTrigger.refresh();
};
reduced.addEventListener("change", () => {
  media();
  ScrollTrigger.refresh();
});
function openViewer(title) {
  clearTimeout(viewerTimer);
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
  if (viewer.open) return;
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
function openSite(i, trigger) {
  const site = sites[i];
  openViewer(siteNames[i]);
  lastTrigger = trigger;
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
  if (!stopMotion()) {
    const from = trigger.getBoundingClientRect();
    const to = viewer.getBoundingClientRect();
    const x = Math.max(
      0,
      Math.min(to.width, from.left + from.width / 2 - to.left),
    );
    const y = Math.max(
      0,
      Math.min(to.height, from.top + from.height / 2 - to.top),
    );
    viewer.animate(
      [
        {
          clipPath: `inset(${y * 0.8}px ${(to.width - x) * 0.8}px ${(to.height - y) * 0.8}px ${x * 0.8}px)`,
        },
        { clipPath: "inset(0px 0px 0px 0px)" },
      ],
      { duration: 280, easing: "cubic-bezier(.2,.8,.2,1)" },
    );
  }
}
for (const project of all("[data-site]")) {
  const i = sites.findIndex((site) => site.id === project.dataset.site);
  project.onclick = () => openSite(i, project);
}
const extras = {
  scattered: "/assets/scattered-poster.webp",
  brass: "/assets/hero-v4/AnthonyBrass-Paintingclip.jpg",
  trail: "/assets/trail-on-set.webp",
};
function openFilm(id, trigger) {
  const f = films.find((f) => f.id === id);
  if (!f) return;
  openViewer(f.title);
  lastTrigger = trigger;
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
  (el) => (el.onclick = () => openFilm(el.dataset.film, el)),
);
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
media();
fieldProgress(0);
window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
