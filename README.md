# EduNexus

The educational nexus for DUT students — share notes, past papers, exam tips, post problems, find jobs, and discuss modules.

---

## Tech stack

- **React + Vite** — frontend
- **Firebase** — auth (Google), Firestore (database), Storage (file uploads)
- **Vercel** — free hosting

---

## Setup (step by step)

### 1. Firebase project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it `edunexus` → create
3. In the project, click **Web** (</> icon) → register app → copy the `firebaseConfig`
4. Open `src/lib/firebase.js` and paste your config values

### 2. Enable Authentication

1. Firebase Console → **Authentication** → Get started
2. Sign-in providers → **Google** → Enable → Save
3. Add your domain to Authorized domains when you deploy (Vercel gives you one)

### 3. Enable Firestore

1. Firebase Console → **Firestore Database** → Create database
2. Start in **test mode** for now (update rules before going public)
3. Once live, paste the contents of `firestore.rules` into the Rules tab

### 4. Enable Storage

1. Firebase Console → **Storage** → Get started
2. Start in test mode
3. Add this rule to Storage Rules:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.resource.size < 20 * 1024 * 1024;
       }
     }
   }
   ```

### 5. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 6. Deploy to Vercel (free)

1. Push this folder to a GitHub repo
2. Go to [https://vercel.com](https://vercel.com) → Import project → select repo
3. Framework: **Vite** → Deploy
4. Add your Vercel domain to Firebase Auth → Authorized domains

---

## Features

| Feature | Description |
|---|---|
| Feed | Community timeline — post updates, tips, share things |
| Resources | Upload notes, past papers, exam tips with file attachment |
| Problems | Post a problem, classmates reply with solutions, mark solved |
| Jobs | Post and browse internships and job listings |
| Discussions | Module-specific threads (CLCM301, BSPE301, ITDA301, ITRS301, PRPD201) |
| Auth | Google sign-in — one click, no password needed |
| Upvoting | Upvote any post (once per user) |
| Replies | Threaded replies on every post |

---

## Adding modules

Open `src/pages/Feed.jsx`, `Resources.jsx`, `Discussions.jsx` and add your module code to the `MODULES` array.

---

## Future ideas

- Email notifications when someone replies to your post
- Search across all posts
- Pinned/featured posts by admins
- Student directory
- Anonymous posting option
