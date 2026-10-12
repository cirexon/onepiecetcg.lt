# Production readiness audit — 2026-10-12

## Release record

| Field | Evidence |
| --- | --- |
| Scope | React/Vite public site, Firebase Authentication integration, Firestore roles and data rules, organiser dashboard, Hosting configuration, bilingual themes, SEO, and release documentation |
| Candidate source | Commit `48c1590` on `main` |
| Candidate URL | `https://onepiecetcglt.web.app` |
| Firebase Hosting release | `c3d60049d8d407fc` |
| Firestore ruleset | `285bfb4f-65d7-455f-b9bb-7683c18384ee` |
| Test window | 2026-10-12 10:40–11:23 UTC |
| Technical tester | OpenAI Codex; automated and code-review evidence recorded below |
| Required human reviewers | Content owner, privacy/legal reviewer, and accessibility reviewer remain unassigned |
| Data migrations | None |
| Rollback target | Hosting release `677b69d6b11948d0`; use the procedure in [OPERATIONS-RUNBOOK.md](OPERATIONS-RUNBOOK.md) |
| Decision | **NO-GO for publishing real participant data or inviting organisers.** The deployed URL is suitable only as a technical preview until all applicable blocked and failed gates are resolved or formally accepted. |

Status totals: **59 PASS**, **2 FAIL**, **36 BLOCKED**, **3 N/A** across 100 gates.

- **PASS:** the stated criterion has evidence for this release.
- **FAIL:** a required product or operational control is absent.
- **BLOCKED:** the control is partly prepared but needs an owner, external-console action, manual exercise, or human review.
- **N/A:** the feature is absent; reviewer and date are recorded in the row.

## Automated evidence

| Check | Result |
| --- | --- |
| Fresh install | `npm ci` passed with the lockfile |
| Unit tests | 13 passed |
| Firestore Rules Emulator | 29 passed, including role boundaries, IDOR, field bounds, private account data, and 128-result batches |
| Local browser suite | 54 passed; six deployed-release cases skipped by design |
| Live browser suite | Six passed on desktop/mobile against the final Hosting release |
| Production dependencies | Zero vulnerabilities from `npm audit --omit=dev --audit-level=high` |
| Development dependencies | 11 upstream toolchain findings: four moderate and seven high; exposure and update policy are recorded in [README.md](../README.md) |
| Secret scan | Gitleaks scanned committed history with zero findings; ignored local configuration and build output were separately excluded from Git |
| License notices | Notices generated for 98 production packages in [THIRD_PARTY_NOTICES.txt](../public/THIRD_PARTY_NOTICES.txt) |
| Lighthouse | Performance 93, Accessibility 100, Best Practices 100, SEO 100; FCP 2.6 s, LCP 2.6 s, TBT 0 ms, CLS 0 |
| Production build | Passed; initial compressed JavaScript is approximately 258 kB and the 3.03 kB organiser module loads separately |

Generated scanner and Lighthouse artifacts are kept under ignored `.tools/`; durable evidence is this release record, the test source, and the Git history.

## 1. Security & Privacy

| ID | Status | Evidence or required action |
| --- | --- | --- |
| SEC-01 | PASS | Firebase redirects HTTP to valid HTTPS; live browser checks found no mixed-content request. |
| SEC-02 | PASS | Live HTML sends CSP, HSTS, nosniff, frame denial, referrer, permissions, opener, and resource policies from [firebase.json](../firebase.json). |
| SEC-03 | PASS | Gitleaks found no committed secret; `.env.local`, `dist`, logs, and `.tools` are ignored and absent from the index. |
| SEC-04 | PASS | Bundle/config review found only Firebase browser identifiers and no service-account, refresh-token, or Admin SDK credential. |
| SEC-05 | PASS | The production dependency audit reports zero vulnerabilities. |
| SEC-06 | PASS | The 11 dev-only Firebase CLI toolchain findings have owner `cirexon`, no browser/runtime exposure, a 2026-10-12 review, and an update-on-compatible-upstream-fix decision in [README.md](../README.md). |
| SEC-07 | PASS | Google is the intended provider; localhost, Firebase app, and Firebase Hosting domains were verified, and the owner previously completed Google sign-in. |
| SEC-08 | PASS | Emulator tests enforce Visitor, Organiser, Editor, Administrator, and Owner permissions at the database boundary. |
| SEC-09 | PASS | Draft and organiser-isolation IDOR tests reject cross-account reads and writes. |
| SEC-10 | PASS | Tests reject self-promotion, peer-admin changes, Owner creation, and Owner demotion. |
| SEC-11 | PASS | Rules tests cover required keys, types, allowed values, numeric bounds, ownership, IDs, and maximum batch size. |
| SEC-12 | PASS | React text rendering is used for user content and code review found no `dangerouslySetInnerHTML` or equivalent unsafe sink. |
| SEC-13 | BLOCKED | Firebase-managed session code and logout exist, but logout, protected-data removal, and session invalidation were not exercised in a live authenticated browser during this audit. |
| SEC-14 | PASS | All writes use authenticated Firebase SDK calls and Firestore rules; the architecture exposes no separate state-changing HTTP endpoint. |
| SEC-15 | BLOCKED | Google Cloud API-key application/API restrictions were not evidenced from the Credentials console. |
| SEC-16 | FAIL | A domain-restricted reCAPTCHA Enterprise provider, seven-day TTL, client integration, and Firestore monitoring mode are configured; enforcement awaits valid-domain deployment and verified metrics, and no tested quota notification exists. |
| SEC-17 | PASS | Expected Firebase failures are mapped to safe localized messages; live tests found no raw exception or provider diagnostic in the UI. |
| SEC-18 | BLOCKED | Production log viewers, configured retention, redaction policy, and a sampled-log review have not been recorded. |
| SEC-19 | BLOCKED | OWASP ZAP 2.17.0 found no high-risk alert and one medium CSP alert; the source fix is prepared, but deployment and an official-domain rescan are still required. See [SECURITY-SCAN-2026-10-12.md](SECURITY-SCAN-2026-10-12.md). |
| SEC-20 | PASS | External new-tab links use `noreferrer`; browser tests and the site-wide referrer policy verify opener protection. |
| SEC-21 | PASS | Architecture, routes, dependencies, and [DATA-GOVERNANCE.md](DATA-GOVERNANCE.md) confirm that uploads, payments, messaging, analytics, and password authentication are absent. |
| SEC-22 | BLOCKED | [SECURITY.md](../SECURITY.md) names an owner and response targets, but the private vulnerability-intake path has not been test-fired. |

## 2. Documentation & Compliance

| ID | Status | Evidence or required action |
| --- | --- | --- |
| DOC-01 | PASS | [DATA-GOVERNANCE.md](DATA-GOVERNANCE.md) inventories sources, purposes, fields, visibility, storage, recipients, and proposed retention. |
| DOC-02 | BLOCKED | The controller must approve and record lawful bases for account administration, public results, and player history. |
| DOC-03 | BLOCKED | No public privacy notice identifies the controller, contact, legal bases, rights, transfers, retention, and complaint route. |
| DOC-04 | BLOCKED | The permission or other legal-basis record for public player names, cities, and history is not selected or tested. |
| DOC-05 | PASS | Code and inventory review found only fields needed for authentication, roles, events, results, content, and functional preferences. |
| DOC-06 | BLOCKED | Retention proposals exist, but approval plus tested deletion/anonymisation for accounts, profiles, logs, events, and backups is absent. |
| DOC-07 | BLOCKED | The rights-request workflow is documented but has no public contact or completed tabletop request. |
| DOC-08 | BLOCKED | Google/Firebase are inventoried, but acceptance/review evidence for current processing terms and subprocessors is not recorded. |
| DOC-09 | BLOCKED | International-transfer mechanisms and supplementary-measure review are not approved and dated. |
| DOC-10 | PASS | Local storage, Firebase authentication storage, service requests, and absent analytics are inventoried. |
| DOC-11 | N/A | No non-essential storage or tracking exists; reviewed by Codex on 2026-10-12 and must be reopened before adding analytics, embeds, advertising, or session replay. |
| DOC-12 | BLOCKED | The owner has not approved the minors, public-name, and guardian process. |
| DOC-13 | BLOCKED | [INCIDENT-RESPONSE.md](INCIDENT-RESPONSE.md) defines the 72-hour workflow, but neither required tabletop scenario has been completed. |
| DOC-14 | BLOCKED | Hosting rollback and a local encrypted Spark-compatible Firestore backup/restore command are documented; an isolated restore drill and retained evidence are still required. |
| DOC-15 | BLOCKED | Public, dated community terms covering acceptable use, disputes, organiser duties, and suspension are absent. |
| DOC-16 | BLOCKED | Official card artwork was removed and the [ASSET-REGISTER.md](ASSET-REGISTER.md) is present, but fan-site names/branding and takedown details need owner/legal review. |
| DOC-17 | PASS | The release includes generated notices for 98 production packages and no known incompatible production license. |
| DOC-18 | BLOCKED | A public accessibility statement with target, limitations, contact, and review date is absent. |
| DOC-19 | BLOCKED | The runbook covers deploy and rollback, but no second maintainer has completed a supervised recovery exercise. |
| DOC-20 | BLOCKED | Source, release IDs, scope, tests, limitations, and rollback are recorded here after deployment; required owner/human approvals remain unsigned. |
| DOC-21 | BLOCKED | Firebase IAM, GitHub access, application roles, justification, MFA, and the quarterly-review record were not fully evidenced. |
| DOC-22 | BLOCKED | DPIA screening has not been completed or approved by the controller/privacy reviewer. |

## 3. Performance & SEO Basics

| ID | Status | Evidence or required action |
| --- | --- | --- |
| PERF-01 | PASS | Fresh `npm ci` and `npm run build` completed with locked versions and no TypeScript/bundler error. |
| PERF-02 | BLOCKED | All public and login-entry live checks pass, but live sign-in, logout, and authorized organiser/role workflows were not completed end to end in this audit. |
| PERF-03 | BLOCKED | No 75th-percentile field data exists yet; lab LCP was 2.6 s, so field LCP/INP/CLS cannot be certified. |
| PERF-04 | PASS | Lighthouse scores are 93/100/100/100, above the agreed 90 baseline. |
| PERF-05 | PASS | Initial compressed JavaScript is about 258 kB, below the 350 kB budget. |
| PERF-06 | PASS | Visible leader art is CSS-generated; the social image is correctly sized and no oversized-image warning appeared. |
| PERF-07 | PASS | The primary shell renders immediately and the organiser module is a separate lazy-loaded chunk. |
| PERF-08 | PASS | Live hashed assets use one-year immutable caching and HTML uses `no-cache`. |
| PERF-09 | PASS | Live text responses use compression, correct MIME types, and `nosniff`. |
| PERF-10 | PASS | Lighthouse mobile throttling and responsive interaction tests showed visible primary content with TBT 0 ms. |
| PERF-11 | PASS | Local and deployed Playwright routes produced no uncaught error, CSP error, or required-resource failure. |
| PERF-12 | PASS | Browser tests verify route-specific title and description updates. |
| PERF-13 | PASS | Browser tests verify one absolute HTTPS canonical per indexable route. |
| PERF-14 | PASS | Live `robots.txt` and sitemap resolve and list only intended public canonical routes. |
| PERF-15 | PASS | Deployed rendered routes expose headings, event content, and navigation without authentication. |
| PERF-16 | PASS | Missing SPA routes show a clear not-found view and `noindex,nofollow`; the Hosting 200 status is the documented SPA tradeoff. |
| PERF-17 | PASS | Axe, heading review, and browser journeys verify a single clear page heading, logical structure, and descriptive links. |
| PERF-18 | N/A | No structured data is shipped; reviewed by Codex on 2026-10-12 because the current dynamic event data lacks a stable schema decision. |
| PERF-19 | PASS | Live Open Graph/Twitter metadata and the original 1200×630 social card resolve successfully. |
| PERF-20 | N/A | Only the default Lithuanian canonical URLs are intended for indexing; English remains an in-page preference, reviewed by Codex on 2026-10-12. |
| PERF-21 | PASS | Desktop/mobile tests plus 320 px reflow and text-spacing checks found no unreachable required content. |
| PERF-22 | PASS | All public internal routes and declared crawl/social resources resolve; intended routes are linked through navigation or sitemap. |
| PERF-23 | BLOCKED | No owner-routed uptime, client-error, or quota alert has been configured and test-fired. |
| PERF-24 | PASS | Automated Lithuanian/English route assertions and UTF-8 responses found no replacement character or browser mojibake. |

## 4. Accessibility & Usability

| ID | Status | Evidence or required action |
| --- | --- | --- |
| A11Y-01 | BLOCKED | Automated coverage is strong, but a complete manual WCAG 2.2 AA audit of authenticated and failure states is unfinished. |
| A11Y-02 | BLOCKED | Axe reports no serious violations on public routes in light/dark desktop/mobile states; authenticated role states remain unscanned. |
| A11Y-03 | BLOCKED | Public keyboard navigation and bypass pass; authenticated forms, Google sign-in, and admin workflows need a manual keyboard run. |
| A11Y-04 | PASS | Route changes move focus to the main region and visual/DOM order stays aligned. |
| A11Y-05 | PASS | Global focus-visible styling is present and automated viewport checks found no obscured required control. |
| A11Y-06 | PASS | The first focusable element is a working skip link and unique header, navigation, main, and footer landmarks exist. |
| A11Y-07 | PASS | The interface uses text/CSS visuals and decorative icons; no informative image lacks an accessible alternative. |
| A11Y-08 | PASS | Axe/Lighthouse and reviewed light/dark color tokens meet required text and control contrast. |
| A11Y-09 | PASS | Leader colors, publication state, selection, and rankings also use visible text or programmatic state. |
| A11Y-10 | PASS | The 320 CSS px test passes without page-level horizontal scrolling or lost controls. |
| A11Y-11 | PASS | WCAG text-spacing overrides pass without clipping or lost content. |
| A11Y-12 | BLOCKED | Public/native controls are labelled, but all authenticated administrator fields still require an assistive-technology inspection. |
| A11Y-13 | BLOCKED | Native constraints preserve input, but authenticated invalid-form errors have not had a manual announcement/focus review. |
| A11Y-14 | PASS | Loading, errors, and save notices use status/alert semantics without programmed focus theft. |
| A11Y-15 | PASS | Public controls use native elements and expose accessible names, disabled, expanded, selected, and checked states. |
| A11Y-16 | PASS | Visible button/link text is included in each accessible name. |
| A11Y-17 | PASS | Axe WCAG 2.2 target-size checks pass at desktop and mobile sizes. |
| A11Y-18 | PASS | Automated landscape checks keep navigation and essential content available. |
| A11Y-19 | PASS | The stylesheet respects `prefers-reduced-motion` and the interface has no flashing content. |
| A11Y-20 | PASS | Root language follows the active Lithuanian/English preference. |
| A11Y-21 | PASS | Standings use semantic table headers/context and remain reachable in the small-screen scroll container. |
| A11Y-22 | BLOCKED | Google Sign-In avoids a site password, but the full provider flow and recovery path were not tested with assistive technology. |
| A11Y-23 | BLOCKED | NVDA/Firefox and VoiceOver/Safari journeys have not been completed. |
| A11Y-24 | PASS | Navigation, labels, icons, and core interaction patterns remain consistent across routes and both languages. |
| UX-01 | BLOCKED | Rules cover the permission matrix, but browser acceptance journeys for every authenticated role have not been completed. |
| UX-02 | BLOCKED | Loading and standard error/retry states exist; offline, quota-exceeded, and every authenticated data-state combination remain untested. |
| UX-03 | PASS | Save controls disable while busy and tournament/result writes use one atomic bounded batch. |
| UX-04 | PASS | Privileged role changes require an explicit target/consequence confirmation; result removal remains local until save and can be cancelled. |
| UX-05 | PASS | Controlled edit forms preserve values during validation and recoverable save failures. |
| UX-06 | BLOCKED | Chrome desktop/mobile automation passes; Firefox, Edge, Safari, and physical mobile coverage has not been completed. |
| UX-07 | BLOCKED | Automated UTF-8 and layout checks pass, but Lithuanian and English copy needs native-speaker review. |
| UX-08 | FAIL | Public contact, privacy, accessibility, community-rule, and issue-reporting pages are not reachable from the site. |

## Required remediation before real participant data

1. Name the legal controller and provide a public privacy/contact email, then approve lawful bases, retention, public-player handling, minors handling, transfers, and DPIA screening.
2. Publish privacy, accessibility, community-rules, contact, correction/removal, and issue-reporting pages in Lithuanian and English.
3. Configure App Check or approved compensating controls, quota/uptime alerts, API-key restrictions, production-log governance, and privileged-account/MFA review.
4. Complete and record an OWASP ZAP baseline, authenticated role/logout/offline journeys, screen-reader/keyboard checks, supported-browser checks, and native-language copy review.
5. Run the incident, data-subject-request, Hosting rollback, and Firestore backup/restore exercises; name a second maintainer.

Re-run every blocked or failed gate after these inputs. A later release may be marked **GO** only when all applicable rows pass or each exception has a named owner, approver, expiry, and remediation issue.
