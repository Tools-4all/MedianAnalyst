# MedianAnalyst

MedianAnalyst now includes a hidden admin panel route at `/sodimeod` for managing newsletter posts.

## Admin Panel (Firebase, Free Tier)

This project uses Firebase Auth + Firestore so it stays fully client-side and works on GitHub Pages.

### 1. Create Firebase project

1. Create a Firebase project (Spark/free plan).
2. Enable **Authentication** with **Email/Password** provider.
3. Create **Cloud Firestore** in production mode.
4. Open **Storage** and click **Get Started** once (required before storage rules can deploy).
5. In Project Settings, copy your web app config values.

### 2. Configure environment variables

1. Copy `.env.example` to `.env`.
2. Fill all `VITE_FIREBASE_*` keys.
3. Set `VITE_ADMIN_EMAILS` to one or more admin emails separated by commas.

### 3. Firestore data model

Collection name: `newsletterPosts`

Document fields:

- `title` (string)
- `summary` (string)
- `content` (string)
- `imageUrl` (string)
- `featured` (boolean)
- `publishedAt` (timestamp)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)
- `contentHtml` (string, rich HTML from WYSIWYG editor)

### 3.1 Newsletter images

- Admin panel supports image upload directly to Firebase Storage (`newsletterImages/...`).
- Uploaded image URL is automatically inserted into the editor and featured image URL field.

### 4. Firestore security rules

Project rules are now versioned in `firestore.rules`.

- Public can read `newsletterPosts`
- Only `mosheanalyst@gmail.com` can create/update/delete
- All other collections are denied by default

When adding another admin, update both:

- `.env` -> `VITE_ADMIN_EMAILS`
- `firestore.rules` -> `isAdmin()`

Deploy rules:

```bash
firebase deploy --only firestore:rules
```

Deploy storage rules:

```bash
firebase deploy --only storage
```

### 5. Run locally

```bash
npm install
npm run dev
```

Visit:

- Public newsletter: `/newsletter`
- Hidden admin panel: `/sodimeod`

If Firebase is not configured, newsletter admin and live post loading are disabled until config is added.

### GitHub Pages note

`404.html` is included to support direct deep-linking for routes like `/sodimeod` on GitHub Pages.
If your deployment uses a different base path depth, update `pathSegmentsToKeep` in `404.html`.

## GitHub Pages End-to-End

This repository is configured for GitHub Pages deployment through GitHub Actions.

### What is already configured

- Base-path-aware routing via `BrowserRouter basename={import.meta.env.BASE_URL}`
- Vite base path via `VITE_BASE_PATH` in `vite.config.js`
- SPA deep-link fallback in `public/404.html`
- `.nojekyll` in `public/` for static hosting compatibility
- Workflow: `.github/workflows/deploy-pages.yml`

### One-time GitHub setup

1. Push to `main`.
2. In GitHub repository settings, open **Pages**.
3. Set **Source** to **GitHub Actions**.
4. Let workflow `Deploy to GitHub Pages` run.

### Required GitHub repository variables

In **Settings -> Secrets and variables -> Actions -> Variables**, add:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_ADMIN_EMAILS`

Without these variables, deployed GitHub Pages builds will run with Firebase disabled.

### Local simulation of project-page base path

```bash
VITE_BASE_PATH=/MedianAnalyst/ npm run build:gh-pages
```

On Windows PowerShell:

```powershell
$env:VITE_BASE_PATH='/MedianAnalyst/'; npm run build:gh-pages
```
