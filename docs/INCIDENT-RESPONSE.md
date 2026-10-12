# Security and personal-data incident response

## Ownership and severity

The project owner, GitHub user `cirexon`, is incident commander and privacy decision owner until another named person is recorded. Use the response targets in [SECURITY.md](../SECURITY.md). Treat active credential theft, unauthorized owner/admin access, exposed private drafts or account data, or broad Firestore-rule bypass as critical.

## Procedure

1. **Receive and timestamp:** open a private incident record, note the reporter and UTC discovery time, and avoid public exploit details.
2. **Preserve evidence:** save relevant release IDs, rules versions, role assignments, headers, minimal logs, and screenshots in access-controlled storage; do not copy tokens into the record.
3. **Contain:** disable the affected provider or account, revoke sessions or credentials, remove a role, deploy restrictive rules, or roll back Hosting as appropriate.
4. **Assess:** identify affected data, people, time range, attacker access, confidentiality/integrity/availability impact, and whether the event is a personal-data breach.
5. **Notify:** start the GDPR 72-hour clock when a personal-data breach becomes known; record the supervisory-authority decision and whether affected people face high risk. Obtain legal/privacy review before notification.
6. **Eradicate and recover:** fix the root cause, rotate credentials, run rules and browser regression suites, deploy, and verify the live service.
7. **Close:** document cause, timeline, scope, decisions, communications, evidence location, and preventive actions with owners and due dates.

## Minimum incident record

Record incident ID, severity, UTC times, commander, systems, data categories, approximate people/records, containment, credential actions, notification decision, release/rollback ID, validation results, and follow-up owners. Restrict the record because it may itself contain sensitive operational data.

## Tabletop scenarios

Before launch, execute and date at least these two exercises: an organiser can read another organiser's draft after a rules change; and an owner Google account is lost or compromised. The current repository has the procedure but no completed tabletop evidence, so DOC-13 is not yet a pass.
