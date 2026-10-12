# Web security scan — 2026-10-12

## Scope and result

OWASP ZAP 2.17.0 performed a traditional spider and active scan against the current Firebase Hosting release at `https://onepiecetcglt.web.app`. The downloaded ZAP archive was checked against SHA-256 `94c8f767b1c2e94f0db66b3ae56514d5e3f5a728ee1b6c798e0c8fe2d61fbff0`. The raw local report is kept in ignored `.tools/zap-baseline.json` because it contains request details.

No high-risk alert was reported. One medium-confidence alert found `style-src 'unsafe-inline'` in the Content Security Policy. The release candidate removes all React inline styles, replaces dynamic widths with semantic progress elements, and removes `unsafe-inline` from `firebase.json`. This must be rescanned after the custom-domain release is deployed.

## Alert disposition

| Risk | Finding | Count | Disposition |
| --- | --- | ---: | --- |
| Medium | CSP permits inline styles | 5 | Fixed in the prepared source; deployment and official-domain rescan pending. |
| Low | Unix timestamp disclosure | 5 | Reviewed as bundled JavaScript/static-data values with no credential or server-secret disclosure. |
| Informational | Suspicious comments | — | Minified Firebase SDK comments; no user-controlled executable comment or secret found. |
| Informational | Cache-control review | — | HTML is `no-cache`; hashed assets are intentionally immutable for one year. |
| Informational | Modern web application | — | Expected React single-page application classification. |

SEC-19 remains blocked until the fixed Hosting configuration is deployed to `https://onepiecetcg.lt`, ZAP is rerun against that host, and any remaining medium/high finding is fixed or formally accepted.
