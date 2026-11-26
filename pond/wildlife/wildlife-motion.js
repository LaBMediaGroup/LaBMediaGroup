// Shared by the local pond and the brain. Coordinates are metres, time is Unix milliseconds.
const clamp = value => Math.max(0, Math.min(1, value));
const between = (a, b, u) => a.map((v, i) => v + (b[i] - v) * clamp(u));
export function deerPosition(h, now) {
  if (now < h.enter || now >= h.exit) return null;
  if (now < h.graze) return between(h.from, h.to, (now-h.enter)/(h.graze-h.enter));
  if (now < h.leave) return h.to;
  return between(h.to, h.home || h.from, (now-h.leave)/(h.exit-h.leave));
}
export function darnerPosition(f, now) {
  if (!f || now < f.start || now >= f.end) return null;
  const t = (now-f.start)/1000, r = f.response;
  // Ease out to the new patch, hover, then return to the same patrol without jumping.
  let weight = r ? clamp(Math.min((now-r.at)/r.travel, (r.until-now)/r.travel)) : 0;
  weight = weight*weight*(3-2*weight);
  const orbit = 1 - weight*.82;
  const carry = r ? 1-clamp((now-r.at)/r.travel) : 0;
  return [f.x+carry*(r?.fromX||0)+(r?.dx || 0)*weight+.85*orbit*Math.sin(t*1.4),
          .52+Math.min(1,t/3,(f.end-now)/3000)*(.22+.15*Math.sin(t*2.1)*orbit),
          f.z+carry*(r?.fromZ||0)+(r?.dz || 0)*weight+.66*orbit*Math.sin(t*.9)];
}

// Small steps on the east bank. The darner path is just beyond the cattails.
export const fieldSteps = {'white-tailed deer':[1.7,0], 'green darner':[.06,.52]};
