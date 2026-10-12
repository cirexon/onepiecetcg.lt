# Asset and branding register

| Asset | Source / owner | Permission basis | Distribution and action |
| --- | --- | --- | --- |
| Compass logo, card-back motif, leader-card visuals, layout, and social preview | Original project code and generated site screenshot | Project-owned original work | Distributed with the site |
| Inter font declaration | Uses a local system font only; no font file is bundled | No third-party font binary distributed | Browser falls back to Arial/sans-serif |
| Lucide icons | `lucide-react`, Lucide contributors | ISC; included in generated third-party notices | Bundled in application JavaScript |
| One Piece character names, card codes, game title, color terminology, and the 138-entry leader metadata catalog | Official ONE PIECE CARD GAME card list; Eiichiro Oda/Shueisha, Toei Animation, Bandai and respective owners | Descriptive nominative use for an unofficial community results site; legal review remains required | Metadata only is stored in `src/data/leader-catalog.json`; keep source attribution and the unofficial-site disclaimer, and respond to a rights-holder request |
| Three official card preview images (`P-084`, `P-107`, `EB04-061`) | Official ONE PIECE CARD GAME catalog | No written permission is recorded; included at the site owner's request, with source links and an explicit unofficial-site disclaimer | Stored under `public/card-previews` for reliable display; keep the source link, honor a rights-holder request promptly, and obtain legal review before compliance approval |
| Runtime open-source packages | Authors listed in package metadata | Apache-2.0, MIT, BSD-3-Clause, ISC, and 0BSD | Full generated texts: `/THIRD_PARTY_NOTICES.txt` |

The app must not imply endorsement or official status. A dedicated rights/contact address and legal review of the remaining names and branding are required before DOC-16 can be approved.
