# Blackthorne Institute Website

Standalone static website package for the Blackthorne Institute Halloween invitation.

## Included files

- `index.html` — page structure and invitation content
- `styles.css` — responsive layout, fog, lamp flicker, lightning and visual design
- `script.js` — language switching, check-in, patient assignment, sound (on by default, starts on the first tap) and animations
- `assets/blackthorn-corridor.png` — animated-scene background
- `assets/patient-portraits.png` — four fictional patient portraits
- `google-sheet/checkin.gs` — script for the Google Sheet that receives check-ins (not part of the website)
- `CNAME` — custom domain for GitHub Pages

## How it runs

The site is static and hosted on GitHub Pages at `https://blackthorne.tillaczel.net`. When a guest checks in, the page sends name, party size, patient number and reason for admission to a Google Sheet you own. That sheet is the guest list. Checking in again with the same name updates the guest's row instead of adding a new one.

If the sheet can't be reached, the guest sees an error and no patient card, so nobody thinks they are checked in when they aren't.

## Google Sheet setup (once)

1. Create a new Google Sheet, e.g. "Blackthorne admissions".
2. In the sheet: **Extensions → Apps Script**. Delete the code there, paste in everything from `google-sheet/checkin.gs`, and save.
3. **Deploy → New deployment**. Click the gear next to "Select type" and choose **Web app**. Set **Execute as: Me** and **Who has access: Anyone**, then **Deploy**.
4. Google asks you to authorize. Choose your account; on "Google hasn't verified this app" click **Advanced → Go to … (unsafe)**. It's your own script, so this is expected.
5. Copy the **Web app URL** (ends in `/exec`) and paste it into `script.js`:
   ```js
   const CHECKIN_URL='https://script.google.com/macros/s/…/exec';
   ```
6. Test: open `index.html` in a browser and check in. A tab called **Admissions** appears in the sheet with your row. Delete the test row afterwards.

For a headcount, put `=SUM(B2:B)` in an empty cell. To remove a guest, delete their row.

If you change the Apps Script code later, publish it again: **Deploy → Manage deployments → pencil icon → Version: New version → Deploy**. The URL stays the same.

## GitHub Pages setup (once)

1. Create a **public** repository on GitHub, e.g. `blackthorne`, and push this folder to it:
   ```bash
   git init -b main
   git add .
   git commit -m "Blackthorne Institute invitation"
   git remote add origin git@github.com:tillaczel/blackthorne.git
   git push -u origin main
   ```
2. On GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**, branch `main`, folder `/ (root)`, **Save**.
3. Still under Pages, **Custom domain** should already say `blackthorne.tillaczel.net` (from the `CNAME` file). If not, enter it and save.
4. Cloudflare → `tillaczel.net` → **DNS → Add record**: type `CNAME`, name `blackthorne`, target `tillaczel.github.io`, proxy **DNS only** (grey cloud). Keep it grey: GitHub issues the HTTPS certificate itself and that fails behind the Cloudflare proxy.
5. Wait until the Pages settings show the DNS check as successful (minutes, sometimes up to an hour), then tick **Enforce HTTPS**.

Until the domain works, the site is also at `https://tillaczel.github.io/blackthorne/`.

## Updating

Commit and push. GitHub Pages republishes within a minute or two; browsers may keep the old version for up to 10 minutes.

## Open locally

Open `index.html` in a browser. Check-in works locally too once `CHECKIN_URL` is set (it writes to the real sheet).

## Editing

- Event text and form fields: `index.html`
- Colours, layout and animation appearance: `styles.css`
- Flicker timing, lightning timing, reasons for admission and patient assignment: `script.js`
