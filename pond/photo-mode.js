/* Photo mode: a snapshot of the field (no HUD) framed as a LaB postcard, 1080×1350 (4:5, made for phones and posts).
   takePhoto({renderer, scene, camera, caption, sound}) renders one clean frame, composes the card, and shows it
   with Share (the phone's share sheet, when it can share files) and Save. Nothing is uploaded anywhere. */
const W = 1080, H = 1350, PAD = 44, PHOTO_H = 1010;
function rounded(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function wrap(c, text, x, y, maxW, lh, maxLines) {
  const words = text.split(/\s+/); let line = '', n = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line ? line + ' ' + words[i] : words[i];
    if (c.measureText(test).width > maxW && line) {
      if (++n === maxLines) { c.fillText(line.replace(/[,;:]?$/, '…'), x, y); return; }
      c.fillText(line, x, y); y += lh; line = words[i];
    } else line = test;
  }
  c.fillText(line, x, y);
}
export async function takePhoto({renderer, scene, camera, caption = '', sound = () => {}}) {
  renderer.render(scene, camera);                                   // one fresh frame, read before the browser clears it
  const shot = renderer.domElement.toDataURL('image/jpeg', .92);
  flash(); sound('shutter');
  try { await Promise.all([document.fonts.load('92px "Bebas Neue"'), document.fonts.load('800 34px Nunito'), document.fonts.load('700 26px Nunito')]); } catch {}
  const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = shot; });
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  c.fillStyle = '#f5ecdc'; c.fillRect(0, 0, W, H);
  // the photo, cropped to fill its frame
  const fw = W - PAD * 2, fh = PHOTO_H, s = Math.max(fw / img.width, fh / img.height), sw = fw / s, sh = fh / s;
  c.save(); rounded(c, PAD, PAD, fw, fh, 30); c.clip(); c.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, PAD, PAD, fw, fh); c.restore();
  c.lineWidth = 7; c.strokeStyle = '#22302f'; rounded(c, PAD, PAD, fw, fh, 30); c.stroke();
  // the label
  const y0 = PAD + fh + 86;
  c.fillStyle = '#f2a33a'; c.beginPath(); c.arc(PAD + 14, y0 - 30, 13, 0, Math.PI * 2); c.fill(); c.lineWidth = 5; c.stroke();
  c.fillStyle = '#22302f'; c.font = '92px "Bebas Neue", sans-serif'; c.textBaseline = 'alphabetic'; c.fillText('LABCOON', PAD + 40, y0);
  c.font = '800 34px Nunito, sans-serif'; wrap(c, caption, PAD, y0 + 52, W - PAD * 2, 40, 2);
  const when = new Date().toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'});
  c.font = '700 26px Nunito, sans-serif'; c.fillStyle = 'rgba(34,48,47,.62)'; c.fillText(`at the LaB pond · labmedia.work · ${when}`, PAD, H - 40);
  const blob = await new Promise(ok => cv.toBlob(ok, 'image/jpeg', .9));
  show(blob, sound);
}
function flash() {
  const f = document.createElement('div'); f.className = 'photo-flash'; document.body.appendChild(f); setTimeout(() => f.remove(), 600);
}
function show(blob, sound) {
  const url = URL.createObjectURL(blob), file = new File([blob], 'labcoon.jpg', {type: 'image/jpeg'});
  const canShare = !!navigator.canShare?.({files: [file]});
  const root = document.createElement('div'); root.className = 'photo-scrim pe';
  root.innerHTML = `<div class="photo-card st-card"><img alt="Your snapshot with Labcoon" src="${url}">
    <div class="row">${canShare ? '<button class="st-pill primary" type="button" data-share>Share</button>' : ''}<a class="st-pill${canShare ? '' : ' primary'}" download="labcoon.jpg" href="${url}" data-save>Save</a><button class="st-pill" type="button" data-close>Back to the pond</button></div>
    <p class="photo-hint">${canShare ? '' : 'On a phone you can also press and hold the picture to save it.'}</p></div>`;
  document.getElementById('hud2').appendChild(root);
  requestAnimationFrame(() => root.classList.add('on'));
  const close = () => { root.classList.remove('on'); setTimeout(() => { root.remove(); URL.revokeObjectURL(url); }, 250); sound('close'); };
  root.addEventListener('click', e => {
    if (e.target === root || e.target.closest('[data-close]')) close();
    if (e.target.closest('[data-share]')) navigator.share({files: [file], title: 'Labcoon', text: 'Me and Labcoon at the LaB pond · labmedia.work'}).catch(() => {});
  });
}
