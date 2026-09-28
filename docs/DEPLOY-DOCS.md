# Deploying the docs site

The docs site (`apps/docs`, a static-exported Next.js app built with Fumadocs) deploys to Firebase Hosting from `.github/workflows/docs.yml`. The `build` job runs on every push and pull request; the `deploy` job only runs on pushes to `main` and requires a `FIREBASE_SERVICE_ACCOUNT` repo secret that does not exist yet. Until a maintainer completes the steps below, the deploy job stays gated off and the rest of CI is unaffected.

## 1. Create a Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com/) and create a new project (or reuse an existing one).
2. Note the project ID — the default Hosting URL will be `<project-id>.web.app`.

## 2. Enable Hosting

1. In the Firebase console, open **Build > Hosting** and click **Get started**.
2. You can skip the Firebase CLI setup steps shown there — the GitHub Actions workflow deploys on your behalf, and `apps/docs/firebase.json` already configures the `out` directory as the public root.
3. Complete the wizard to enable Hosting for the project.

## 3. Generate a service-account JSON key

The deploy step (`FirebaseExtended/action-hosting-deploy`) authenticates with a Google Cloud service account, not the Firebase CLI login.

1. In the [Google Cloud console](https://console.cloud.google.com/), select the same project.
2. Go to **IAM & Admin > Service Accounts** and create a new service account (or use the default `firebase-adminsdk` account Firebase created for the project).
3. Grant it the **Firebase Hosting Admin** role (`roles/firebasehosting.admin`).
4. Open the service account, go to **Keys > Add key > Create new key**, choose **JSON**, and download the file.

Treat this file as a secret — do not commit it to the repository.

## 4. Add the GitHub secret

1. In the PIX repo on GitHub (<https://github.com/Digital-With-Deep/pix>), go to **Settings > Secrets and variables > Actions**.
2. Click **New repository secret**.
3. Name it `FIREBASE_SERVICE_ACCOUNT`.
4. Paste the full contents of the JSON key file downloaded in step 3 as the value.
5. Save.

Once the secret exists, the next push to `main` that passes the `build` job will trigger `deploy`, which publishes `apps/docs/out` to Firebase Hosting with `entryPoint: apps/docs`.

## 5. Site URL

The site is served at `https://<project-id>.web.app` (and the Firebase-assigned `.firebaseapp.com` alias) until a custom domain is attached in the Firebase console under **Hosting > Add custom domain**.

## Troubleshooting

- **Deploy job skipped**: expected on any branch other than `main`, or on pull requests — the job is gated with `if: github.ref == 'refs/heads/main'`.
- **Deploy job fails with an auth error**: confirm the `FIREBASE_SERVICE_ACCOUNT` secret contains the full JSON key (not a path or a base64-encoded value) and that the service account has the Firebase Hosting Admin role.
- **Build succeeds but the site looks stale**: the `build` job uploads `apps/docs/out` as an artifact and `deploy` downloads it fresh on each run, so a stale site usually means the previous `deploy` run did not complete — check the Actions tab for the workflow run's logs.
