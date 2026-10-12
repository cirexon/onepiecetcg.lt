# Operations runbook

## Owners and prerequisites

The primary operator is GitHub user `cirexon`. A second authorized maintainer must be named and complete one supervised deploy and rollback before production approval. Operators need repository access, Firebase project access with the least role required, Node.js, Firebase CLI, and Java 21 for rules tests. Require MFA on GitHub and Google accounts.

## Release

1. Pull the intended commit and confirm the working tree and release record identify the exact revision.
2. Copy `.env.example` to `.env.local` and enter only the Firebase web-app identifiers; never add a service-account key.
3. Run `npm ci`, `npm run notices`, `npm run audit:prod`, `npm test`, `npm run build`, `npm run test:browser`, and `npm run test:rules`.
4. Create a Firebase Hosting preview channel when practical and run production-target browser, header, deep-link, and login checks against it.
5. Deploy with `npm run deploy -- --project onepiecetcglt` and record the Firebase release/version identifiers.
6. Recheck HTTPS redirect, security headers, public routes, `robots.txt`, `sitemap.xml`, Google login, and an authorized role workflow.

## Rollback

If a release harms availability, access control, privacy, or data integrity, stop writes when necessary and use **Firebase Console → Hosting → Release history → previous known-good release → Roll back**. Restore the previous `firestore.rules` from the known-good commit with `firebase deploy --only firestore:rules --project onepiecetcglt` if rules caused the incident. Validate public and role-gated behavior, then record the rollback release ID and incident link.

## Firestore recovery

Spark does not provide a completed project backup procedure in this repository. Before real participant data is accepted, select and document an export method, encrypted storage location, frequency, retention, access list, and deletion schedule; then restore into a separate test project and verify document counts and application behavior. Until that drill exists, DOC-14 remains blocked.

## Quota and outage response

- Review Firebase usage for Firestore reads/writes, Authentication, and Hosting transfer at least weekly during launch and after traffic spikes.
- If quota is near its threshold, pause organiser writes, investigate abnormal clients, tighten rules or App Check, and communicate degraded functionality.
- If Hosting is unavailable, confirm Firebase status, preserve the current release ID, and avoid repeated deployments until the cause is understood.
- If Firestore fails, the public shell remains available; verify the user-facing error and retry path, then restore service or roll back the relevant rules/data change.

## Access and account recovery

Review Firebase IAM, GitHub collaborators, Firebase Authentication users, and application `roles` quarterly and after every personnel change. Remove unused access promptly. Only the Owner role may grant Administrator; no client path may grant Owner. Recover a lost owner account through the secured Google account and Firebase IAM owner, then verify the owner role document and revoke the old identity. Never share accounts.

## Domain and DNS

The canonical host is `onepiecetcg.lt`, with `www.onepiecetcg.lt` redirected to the apex. Domenai.lt owns the DNS zone and Firebase Hosting serves the site and certificate. Keep the Firebase ownership TXT record, apex Hosting A record, email MX/SPF/DMARC records, registrar renewal protection, and both custom domains in Firebase Authentication. After any DNS or domain change, retest TLS, apex and `www` behavior, Firebase URL redirects, login, canonicals, sitemap, Open Graph URLs, and email delivery.
