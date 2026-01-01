# LaB Media Group Resources

This repository holds the static assets for the LaB Media Group resource hub, including the updated Film Festivals category, LaB Picks badges, and cleaned Inspiration entries.

## How to publish the latest changes to your live site

Follow these steps to ensure the live site reflects the current repository state:

1. Make sure your local clone is on the correct branch (usually `main`) and up to date:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Confirm the key files contain the latest data and layout (no partial copy/paste):
   - `resources-data.js`
   - `resources.html`
3. Deploy the updated files to your hosting provider:
   - **GitHub Pages (static site):** push your commits to the published branch (`main` or `gh-pages`). Pages will rebuild automatically after the push.
   - **Other static hosting (Netlify, Vercel, etc.):** trigger a deploy with the current repository contents or upload the two files above if you deploy manually.
4. Hard refresh the live site (or clear cache) to ensure the new festival info, FilmFreeway links, and LaB Picks badges appear.

If you prefer not to pull the whole repository, copy and replace the _entire contents_ of `resources-data.js` and `resources.html` from this branch into your project before deploying.
