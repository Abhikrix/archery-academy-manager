# Deployment Guide

This app is a Vite React single-page app deployed to Vercel and connected to Firebase Authentication and Firestore.

## Production Files

- `vercel.json` configures Vercel for Vite, immutable asset caching, security headers, and SPA refresh support.
- `firebase.json` points the Firebase CLI at `firestore.rules`.
- `.env.example` lists the Firebase web app variables required in local and Vercel environments.
- `firestore.rules` contains the role-based security rules for Admin, Coach, and Student access.

## Deploy To Vercel

1. Push the project to GitHub, GitLab, or Bitbucket.
2. In Vercel, create a new project and import the repository.
3. Use these settings:
   - Framework Preset: `Vite`
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add the Firebase environment variables listed below.
5. Deploy the project.
6. After the first deploy, copy the Vercel domain, for example `your-app.vercel.app`.
7. In Firebase Console, add that domain under Authentication -> Settings -> Authorized domains.

The `vercel.json` rewrite sends all app routes back to `index.html`, so pages like `/admin/reports` and `/coach/fees` keep working after a browser refresh.

## Environment Variables

Add these variables in Vercel Project Settings -> Environment Variables for Production, Preview, and Development as needed:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Use the same values from Firebase Console -> Project settings -> Your apps -> Web app config.

Firebase web config values are public client configuration, not admin secrets. They are still safe only when paired with Firebase Authentication, authorized domains, and strict Firestore rules. Never add Firebase Admin SDK credentials or service account JSON to this frontend app.

After changing any `VITE_*` variable in Vercel, redeploy the app. Vite embeds these values during the production build.

## Firebase Production Setup

1. Enable Email/Password Authentication in Firebase.
2. Add the Vercel production domain and any custom domain to Firebase Authentication authorized domains.
3. Create or confirm the Firestore database.
4. Deploy Firestore rules:

```bash
firebase deploy --only firestore:rules
```

5. Confirm the first Admin user can sign in. First-login profiles default to Admin in this app.
6. Use the Admin Users screen to assign Coach and Student roles.
7. For Student users, set `studentId` to the matching document ID in the `students` collection.

## Local Production Check

Run this before deploying:

```bash
npm install
npm run build
npm run preview
```

Then open the preview URL and check:

- Login page renders.
- Email/password authentication works.
- Admin redirects to `/admin/dashboard`.
- Coach redirects to `/coach/attendance`.
- Student redirects to `/student/overview`.
- Refreshing protected routes does not produce a 404.
- Firestore reads and writes work for students, attendance, fees, users, and reports.

## Security Checklist

- Keep `.env.local` out of Git.
- Do not commit service account keys.
- Restrict Firebase Authentication authorized domains to your real app domains.
- Deploy `firestore.rules` before using the production app.
- Confirm Admin can manage users and students.
- Confirm Coach cannot access Users or Settings and cannot delete students.
- Confirm Student can only view their own profile, attendance, and fee status.
- Review Firebase usage and billing alerts before sharing the app publicly.

## Performance Notes

- Vite minifies production JS and CSS during `npm run build`.
- Vendor code is split into React, Firebase, icon, and vendor chunks for better Vercel CDN caching.
- Vercel serves hashed assets from `/assets/*` with immutable cache headers.
- The login image is imported through Vite so it is fingerprinted in production.

## Updating The App Later

1. Make code changes locally.
2. Run `npm run build`.
3. Commit and push changes.
4. Vercel will create a preview deployment for branches or a production deployment for the production branch.
5. If Firestore rules changed, deploy them separately with:

```bash
firebase deploy --only firestore:rules
```

6. If environment variables changed, update them in Vercel and redeploy.

## Troubleshooting

- Blank app or "Firebase env values are not configured": check Vercel environment variables and redeploy.
- Firebase login says the domain is unauthorized: add the Vercel or custom domain in Firebase Authentication authorized domains.
- Route refresh returns 404: confirm `vercel.json` is deployed with the SPA rewrite.
- Firestore permission denied: deploy `firestore.rules` and confirm the signed-in user has the correct role document in `users/{uid}`.
- Student dashboard says profile incomplete: set the user's `studentId` to the matching student document ID.
