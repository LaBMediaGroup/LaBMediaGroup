# LaB Media contact delivery

The public website stays on GitHub Pages. Its contact form posts to
https://sideways.labmedia.work/api/lab-contact on the existing sideways-studio-demo
Cloudflare Worker. That isolated route uses its existing RESEND_API_KEY secret,
sends from LaB Media <contact@labmedia.work> to Bobby@LaBMediadot.com, and never
copies Sideways recipients or changes its brief/claim routes.

Implementation: worker.mjs here is copied to worker/lab-contact.mjs in
/Volumes/LaB Media/GitHub/sideways-studio-demo. Its worker/index.js supplies the
fixed recipient and dedicated LAB_CONTACT_LIMIT binding (3/minute). Deploy that
project with Wrangler after synchronizing the module. The standalone
wrangler.jsonc is an optional migration target if a separate key is later issued;
it is not the deployed service.

Origin checks, honeypot, server-side validation, rate limiting and a fixed inbox
prevent the browser from choosing recipients. No message contents or email
addresses are logged. The existing direct email link remains available if delivery
fails. Frontend retains the message on errors and clears it only after success.
The live preflight and invalid-request paths can be checked without sending mail.
