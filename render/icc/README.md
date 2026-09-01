# ICC profile

Place `ISOnewspaper26v4.icc` in this directory (path is set by `render/src/cmyk.ts`
default, overridable via `ICC_PROFILE`).

This file is **not redistributed here** — download it from ECI
(https://www.eci.org/en/downloads, "ISOnewspaper26v4") or your press's supplied
profile, and drop it in this folder.

Do not substitute a *coated* profile (e.g. FOGRA/GRACoL/SWOP coated). Newsprint
is uncoated, absorbs more ink, and has a much smaller gamut — printing with a
coated profile's conversion will look muddy and over-inked on the actual press.
