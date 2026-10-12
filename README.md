# One Piece TCG Lietuva

A Lithuanian / English community website built with React, TypeScript, Vite, Firebase Authentication, Cloud Firestore, and **standard Firebase Hosting**. It uses an original dark navy and gold interface, CSS-generated leader visuals, responsive layouts, and a matching light theme.

The application is connected to Firebase project `onepiecetcglt` and deployed at https://onepiecetcglt.web.app. A local checkout without Firebase variables uses fictional demo content. **Every demo event, venue, player, and result is fictional.** Configuring Firebase switches to your database; sample content is never silently uploaded.

## Run the preview

1. Install Node.js 24 LTS from https://nodejs.org/ if needed.
2. Open this repository in your editor and open a terminal.
3. Run:

```sh
npm ci
npm run dev
```

Open the localhost address printed in the terminal. On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`. If Node was just installed, restart the editor so its PATH refreshes.

## What works

- Homepage: upcoming tournaments, recent winners, leader trends.
- Tournament archive: search, city / format filters, upcoming / results tabs, individual standings.
- Player directory, community points, public profiles, and tournament history.
- Leader popularity and top-four rate with recorded sample sizes and partial-results caveats.
- Lithuanian / English text and light / dark preferences saved on this device.
- Google sign-in; unapproved users have read-only visitor access.
- Approved organisers: create / edit their own events, private drafts, publish, add players, and enter / correct results.
- Content editors: maintain players, leader data, and bilingual community news without access to tournaments or account permissions.
- Administrators: manage all events and assign Visitor, Organiser, or Content Editor access.
- The Owner: has full access and is the only role that can grant Administrator access.
- Firestore rules enforce ownership and roles independently of the interface.

## Connect Firebase step by step

These steps require your Google account. There is no Firebase account connector or Cloud Environment Onboarding tool available in this workspace, so the application and configuration are prepared locally.

### 1. Create the free project

1. Open https://console.firebase.google.com/ and choose **Create a project**.
2. Name it `onepiecetcg-lt` (the generated project ID may differ).
3. Disable Google Analytics for this initial setup; it is not needed.
4. Keep the **Spark** plan. Do not add a billing account.
5. Project overview → add a **Web app** (`</>`) → name it `One Piece TCG Lietuva`.
6. Copy the web app's `apiKey`, `authDomain`, `projectId`, and `appId`.

### 2. Add the app configuration

Copy `.env.example` to `.env.local`. Fill in:

```dotenv
VITE_FIREBASE_API_KEY=your-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-web-app-id
```

These identify the browser application; they are not administrator credentials. Rules protect the data. Never put a service-account private key in the website or GitHub. Restart the development server after changing environment variables.

### 3. Enable Google sign-in

1. Firebase → **Build → Authentication → Get started**.
2. **Sign-in method → Google → Enable**.
3. Set the support email and save.
4. **Settings → Authorized domains**: add `localhost` for local development (new projects may not include it), your `PROJECT_ID.web.app` domain, and later `onepiecetcg.lt` if you own it.

Google users register their own accounts. They cannot edit events until you approve an organiser role. There are no passwords for you to create or distribute.

### 4. Create the database

1. **Build → Firestore Database → Create database**.
2. Select **Standard edition**, a European location, and **Production mode**.
3. Do not enable test-mode public writes. The next step installs this repository's rules.

### 5. Deploy the prepared configuration

The Firebase CLI is included in the project's development dependencies. In your terminal:

```sh
npx firebase login
npx firebase use --add
```

Choose your Firebase project and use the alias `default`. This creates `.firebaserc` with your project ID. Then:

```sh
npm run deploy
```

This builds the site and deploys Hosting, Firestore rules, and indexes. Open the `https://PROJECT_ID.web.app` address returned by Firebase. Deploy again after code changes. Environment values are included at build time, so configure `.env.local` before building.

### 6. Make yourself the Owner

This one-time step must be done in the Firebase console because website users cannot promote themselves.

1. Open your deployed website and sign in with Google.
2. The approval page shows your account **UID**. You can also find it in Firebase → Authentication → Users.
3. Firebase → Firestore Database → **Start collection** → collection ID `roles`.
4. Document ID: paste your exact UID.
5. Add a field named `role`, type **string**, value `owner`.
6. Save, then sign out and back into the website so your new role loads.
7. Open **Dashboard** and click **Add starter leaders**.
8. Add real player display names, create your first tournament, enter results, and publish.

The starter leaders are a small example catalog, not a claim about the current competitive meta. Additional leaders can be added in the Firestore console using the same document structure. Use the printed card code as the document ID; different versions of a character are separate leaders.

### 7. Approve other accounts

Ask someone to sign in once using Google. Their account then appears in your Dashboard under Account permissions. Assign the narrowest role they need. They should sign out and back in to load their new permissions. Administrators can assign routine roles; only the Owner can create or change Administrator accounts. The Owner role cannot be granted from the website, and nobody can change their own role.

| Role | Permission layer |
| --- | --- |
| Visitor | Browse public content; signed-in accounts remain read-only until approved |
| Organiser | Add players and manage only their own tournaments, drafts, and results |
| Content Editor | Add or correct players, maintain leaders, and publish news |
| Administrator | All Organiser and Content Editor permissions, all tournaments, and routine role assignment |
| Owner | Full access, including granting or removing Administrator access |

Role changes store the granting account and server timestamp for an audit trail. Firestore rules enforce the same matrix independently of the interface.

Players are separate records and do not need a Google account. Use agreed public names or nicknames; login email addresses are restricted to the account owner and administrators.

### 8. Optional custom domain

Firebase → **Hosting → Add custom domain** → enter `onepiecetcg.lt` and follow the DNS instructions at your domain registrar. Add the domain under Authentication's authorized domains too. Firebase supports custom domains and SSL on Spark, but purchasing and renewing the `.lt` domain costs separately.

## Keeping monthly service costs at €0

Stay on **Spark** and use standard Firebase Hosting, Firestore, and Google Authentication. This application does not require Cloud Functions, App Hosting, Cloud Storage, or any paid API. Leader visuals are generated by the site from names, card codes, and gameplay colors; no official card artwork is distributed. This is an unofficial fan project.

Firebase's published Spark quotas currently include Hosting storage of 10 GB and 360 MB/day transfer, Firestore storage of 1 GiB, 50,000 reads/day, and 20,000 writes/day. Free quotas are limits, not unlimited service. Check Firebase → Usage regularly. A Spark quota interruption may require waiting for reset or reducing usage. Do not upgrade to Blaze if strict no-billing operation is your priority.

Source: https://firebase.google.com/pricing

The site loads data once per session/sign-in change and after saves, rather than using live subscriptions. Queries are bounded to 100 tournaments, 1000 players, 200 leaders, and 30 news posts (admin account list: 200). This is suitable for a first local community release; add proper cursor pagination before the archive grows beyond these limits. The bounded event query is not a guarantee of the latest 100 events. No paid service is needed for adding pagination later.

## Data and calculations

| Collection | Document ID | Contents |
| --- | --- | --- |
| `players` | generated ID | `name`, `city` |
| `leaders` | card code | `name`, `colors` |
| `tournaments` | generated ID | event fields, `organiserId`, `published` |
| `tournaments/{id}/results` | player ID | player / leader IDs, placement, wins, losses, draws |
| `accounts` | Google UID | private `email`, `name` |
| `roles` | Google UID | `role`: `viewer`, `organiser`, `editor`, `admin`, or `owner`; optional `grantedBy` and `grantedAt` audit fields |
| `news` | generated ID | bilingual titles / bodies and date |

One result document per player prevents duplicate players in an event. The interface validates unique placements and existing catalog references; database rules enforce shape, value bounds, ownership, and matching player/document IDs. Trusted organisers remain responsible for the accuracy of results; referential and cross-document placement checks are performed by the app. Event and result updates are saved in one atomic batch, including removals, with up to 128 participants. If two organisers/admins edit the same event concurrently, the last save wins; refresh before editing.

Leader popularity = entries using the leader / all recorded entries. Top-four rate = top-four finishes / recorded entries using the leader. If only four placements are recorded, those four entries do not describe every attendee's deck choices. No match win-rate claim is made. Player community points award 8 points for first through 1 for eighth, zero afterward; these are illustrative and not Bandai rankings.

Dates and event times use Europe/Vilnius. Historical dates are sample data. Upcoming status uses the actual current date in Vilnius.

## Checks

Use the mandatory [production readiness checklist](docs/PRODUCTION-READINESS-CHECKLIST.md) before every live release. It defines the security, privacy, compliance, performance, SEO, accessibility, and usability pass/fail gates and required evidence. The current findings and launch decision are in the [2026-10-12 production audit](docs/PRODUCTION-AUDIT-2026-10-12.md). Supporting records include the [security policy](SECURITY.md), [data inventory](docs/DATA-GOVERNANCE.md), [incident procedure](docs/INCIDENT-RESPONSE.md), [operations runbook](docs/OPERATIONS-RUNBOOK.md), and [asset register](docs/ASSET-REGISTER.md).

```sh
npm test
npm run notices
npm run build
npm run test:browser
npm run test:rules
```

Browser tests use locally installed Chrome. For Firestore emulator tests, install Java 21+ and make `java` available in PATH. `test:rules` uses the isolated `demo-onepiecetcg` emulator project, not your production data. Rules tests verify visitor restrictions, draft privacy, organiser isolation, role escalation protection, private emails, input bounds, and atomic 128-result saves.

Run the deployed-release checks separately by setting `PLAYWRIGHT_BASE_URL=https://onepiecetcglt.web.app` for the Playwright command. These checks use the real Hosting headers and Firebase configuration without attempting a Google sign-in.

The production dependency audit passes with zero reported vulnerabilities. The current Firebase CLI still brings 11 development-only advisory findings through its upstream dependencies; these tools are not shipped in the website. A compatible gRPC override patches the Firebase SDK's older transitive dependency. Recheck `npm audit` when updating the CLI rather than forcing unrelated major transitive upgrades.

## GitHub and cloud environment

The repository is `cirexon/onepiecetcg.lt` and the production branch is `main`. Do not commit `.env.local`, `node_modules`, or `dist`.

For a separate Codex cloud environment, after the repository has code on `main`, set the installation command to `npm ci`. Use `npm run build` for validation and `npm run dev -- --host 0.0.0.0` if its preview runner requires external binding. Java 21 is needed only for emulator tests. The Cloud Environment Onboarding: Setup workflow mentioned in the pasted conversation is not exposed as a tool in this session; this file supplies its application setup commands.
