# Web security scan — 2026-10-12

## Scope and result

OWASP ZAP 2.17.0 performed a traditional spider and active scan against the final release at `https://onepiecetcg.lt`. The downloaded ZAP archive was checked against SHA-256 `94c8f767b1c2e94f0db66b3ae56514d5e3f5a728ee1b6c798e0c8fe2d61fbff0`. The raw local report is kept in ignored `.tools/zap-onepiecetcg-lt.json` because it contains request details.

No high-risk or medium-risk alert was reported. The earlier `style-src 'unsafe-inline'` alert is resolved: the deployed policy omits `unsafe-inline`, React inline styles were replaced, and dynamic widths use semantic progress elements.

## Alert disposition

| Risk | Finding | Count | Disposition |
| --- | --- | ---: | --- |
| Low | Unix timestamp disclosure | 5 | Reviewed as bundled JavaScript/static-data values with no credential or server-secret disclosure. |
| Informational | Suspicious comments | 4 | Minified Firebase SDK comments; no user-controlled executable comment or secret found. |
| Informational | Cache-control review | 4 | HTML is `no-cache`; hashed assets are intentionally immutable for one year. |
| Informational | Modern web application | 5 | Expected React single-page application classification. |

SEC-19 passes for this release. Rerun the scan after material route, dependency, authentication, or Hosting-policy changes.
