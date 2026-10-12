# Security policy

## Supported release

Only the version currently deployed to `https://onepiecetcg.lt` receives security fixes.

## Private reporting

Report suspected vulnerabilities through a private GitHub Security Advisory for `cirexon/onepiecetcg.lt`; do not include credentials, tokens, personal data, or exploit details in a public issue. The security owner is GitHub user `cirexon`. If private advisories are unavailable, contact the repository owner privately before sending technical details.

Include the affected URL or collection, required role, reproduction steps, impact, and a safe proof of concept. Never test against other users' records or disrupt the production service.

## Response targets

| Severity | Acknowledge | Contain or disable | Remediate target |
| --- | ---: | ---: | ---: |
| Critical | 24 hours | 24 hours | 72 hours |
| High | 2 business days | 3 business days | 7 days |
| Medium | 5 business days | As assessed | 30 days |
| Low | 10 business days | As assessed | 90 days |

The owner triages reports, preserves evidence, rotates affected credentials, deploys a fix or rollback, and follows [the incident-response procedure](docs/INCIDENT-RESPONSE.md). Personal-data incidents use the 72-hour assessment timeline in that procedure.

## Security controls

- Firebase Authentication provides Google sign-in; application roles live separately in Firestore.
- Firestore rules enforce visitor, organiser, editor, administrator, and owner boundaries.
- Browser Firebase identifiers are publishable configuration; service-account keys and refresh tokens must never enter this repository or a client bundle.
- Runtime dependency, rules-emulator, browser, accessibility, build, and deployed-header checks are required before release.
- Production role and Firebase IAM access are reviewed at least quarterly and after every maintainer change.
