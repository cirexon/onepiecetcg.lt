# Custom-domain runbook

## Configuration

- Canonical URL: `https://onepiecetcg.lt`
- Redirect host: `https://www.onepiecetcg.lt`
- Firebase project and Hosting site: `onepiecetcglt`
- DNS provider: Domenai.lt
- Firebase Hosting bindings: created 2026-10-12
- Firebase Authentication authorized domains: apex and `www` added 2026-10-12
- Production Hosting release: `b4676b682fb593c9`, deployed 2026-10-12

## Required DNS changes

Make only these web-hosting changes in the Domenai.lt DNS zone:

| Host | Type | Current value | Required value |
| --- | --- | --- | --- |
| `@` | `A` | `193.46.84.119` | `199.36.158.100` |
| `@` | `TXT` | absent | `hosting-site=onepiecetcglt` |
| `www` | `CNAME` | `onepiecetcg.lt` | `onepiecetcglt.web.app` |

Keep the existing NS, MX, SPF, and DMARC records. In particular, do not remove the MX record for `mx.oradomail.com` or the SPF TXT value containing `_spf.oradomail.com`; those records support domain email.

Use a TTL of 600 seconds while migrating. Keep the Firebase ownership TXT record after activation because Firebase uses it to retain ownership and renew certificates.

## Cutover and verification

1. Add the ownership TXT record and update the apex A and `www` CNAME records.
2. Wait for public DNS to return the required values.
3. Wait for both Firebase custom domains to report active ownership and certificates; certificate issuance can take several hours.
4. Deploy the prepared custom-domain build.
5. Verify apex HTTPS, `www` redirect, Firebase-host redirect, deep links, security headers, Google sign-in, sitemap, social metadata, and email delivery.

Do not deploy the Firebase-host redirect before the apex domain has a valid Firebase certificate. For rollback, redeploy the preceding Hosting release and restore the recorded previous A/CNAME values only if the former web host is intentionally being restored.
