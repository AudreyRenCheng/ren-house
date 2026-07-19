# Audrey's Interactive House - UI / Visual Design Audit

Audit date: 2026-07-18  
Scope: the current Next.js, React, and TypeScript implementation in this repository.  
Method: source audit of the real component tree, local styles, state transitions, assets, responsive rules, animation, accessibility, and production checks. No application source was changed during this audit.

## A. Overall Problem Summary

1. **There is no real design-system layer.** `app/globals.css` only defines foreground/background and Arial aliases. The components collectively contain 333 hex-color uses with 216 unique values, 550 `rgba()` uses with 384 unique values, 39 radius values, 114 individually authored shadows, and 12 distinct breakpoint values.
2. **The house metaphor is repeatedly wrapped in web UI.** The map is a decorated paper card inside another framed map; RoomView adds a sticky-note action card beside a clickable door; SongPlayer puts its physical objects inside one large rounded `wood-frame`; Contact and construction states are still conventional modal cards.
3. **Decoration often substitutes for hierarchy.** Entrance, MemoryProjector, and several room objects use many gradients, pseudo-elements, borders, shadows, tapes, dots, bands, and medallions. These details compete rather than establish one focal object.
4. **Rooms are over-unified in structure and under-unified in system rules.** The RoomView doors mostly share one DOM template and differ through color variables, while global controls, shadows, focus styles, breakpoints, and modal behavior vary independently.
5. **The spatial layer model is not enforced.** Global controls and overlays use unrelated z-index values from 20 to 90. Some controls can appear above PuzzleModal, MelodyLock, or construction overlays.
6. **Responsive behavior is component-local and compensatory.** There are breakpoints at 420, 520, 560, 600, 760, 767, 900, 980, 1100, and 1180px. Fixed controls and absolute objects are repositioned one at a time, which explains recent mobile collisions.
7. **Typography has too little role distinction.** Most surfaces use Arial, with frequent weights of 800/850/900. Signage, reading copy, object labels, and system controls consequently feel generated from one bold UI vocabulary.
8. **Accessibility quality is uneven.** ContactInfo and ConstructionNotice have strong focus management, but PuzzleModal lacks dialog semantics/focus trapping and several controls lack shared `:focus-visible`. `app/layout.tsx` keeps `<html lang="en">` even when Chinese is selected.
9. **A few completion gaps remain visible.** `/public/images/profile/music-profile.jpg` is missing, so RoomIntro shows its developer-facing placeholder. Contact data still contains TODO values. These make an otherwise authored world feel unfinished.

## B. Where the AI-Generated Feeling Comes From

### 1. Repeated surface recipe

The common recipe is: pale gradient + dotted texture + translucent border + rounded corners + multi-line shadow. It appears in `.paper-map` (`app/page.tsx:331`), `.projector-table` (`components/MemoryProjector.tsx`), `.melody-panel` (`components/MelodyLock.tsx`), `.construction-notice` (`components/ConstructionNotice.tsx:120`), the Contact panel, and several notes. The recipe is pleasant in isolation but makes unrelated objects feel generated from the same prompt.

Use texture only where material needs it. Paper may have subtle fiber/noise; painted walls should be broad and quiet; wood should communicate direction and thickness; metal should use edge highlights, not paper dots.

### 2. Card-inside-card composition

- HouseMap: `.paper-map` contains the separately bordered HouseMap stage and every room is another bordered rectangle.
- RoomView: `.room-door` and `.room-note` both trigger the same action, so the note acts like a secondary CTA card.
- SongPlayer: `.wood-frame` (`components/SongPlayer.tsx:212`) contains the album object and the already framed `.lyrics-screen` (`:372`).
- ContactInfo: individual contact methods are repeated bordered rows inside a framed drawer.

The fix is not “remove all frames.” Keep frames where the object physically owns one: a door frame, album sleeve, e-ink bezel, picture frame, or projector screen. Remove frames whose only job is to group a page section.

### 3. Uniform hover lift

`.map-room`, `.room-door`, records, slides, and CTA objects often translate upward on hover. A record or loose slide can lift; a door anchored to a wall should not. In particular, `.room-door:hover` (`components/RoomView.tsx:639`) makes architecture behave like a card.

### 4. Decorative density without semantic ownership

Entrance has many door ornaments, patterns, bands, key tags, a nameplate, a quick-entry pass, and a contact note across roughly 1,300 lines. MemoryProjector has more than 1,200 lines and constructs the projector twice. The strongest objects are present, but the abundance of micro-decoration weakens their silhouette and makes empty areas look algorithmically filled.

### 5. Template-level room differentiation

`music-door`, `story-door`, and `cs-door` (`components/RoomView.tsx:666-681`) share the same door geometry. Story adds small paper symbols and CS adds a few panel lines, but the primary distinction remains color. ConstructionNotice likewise keeps one centered modal structure and changes variables plus three decorative spans.

### 6. Generic web-control intrusions

Pill radii (`999px`) appear 23 times. They are appropriate for compact global toggles, but also appear in map details, back controls, translation, Melody Lock actions, and other object surfaces. Native `<audio controls>` in `SongPlayer.tsx:120` also breaks the otherwise physical visual language.

### 7. Staged reveal pattern

RoomIntro animates multiple elements with `introReveal` over 620ms and delays. This is the familiar “fade + slide every child” entrance. It should become one restrained scene transition, while object interactions use shorter physical movement.

## C. Proposed Whole-House Design System

### 1. What must be unified vs. what should vary

**Unify across the house:** text contrast, spacing scale, focus indication, touch targets, back/language/sound behavior, modal layering, shadow direction, material recipes, interaction timings, and accessibility behavior.

**Vary by room:** wall accent, one signature material, object geometry, decorative motif, content composition, and one accent interaction. Do not vary basic readability or control placement.

### 2. Foundation tokens

Add a compact set to `:root` in a later implementation round:

```css
:root {
  --house-wall: #f4ead7;
  --house-ink: #3f2a1d;
  --house-ink-muted: #76563f;
  --house-paper: #fff7e8;
  --house-wood-light: #e6c18a;
  --house-wood-mid: #b97845;
  --house-wood-dark: #6d4228;
  --house-brass: #b8893f;
  --house-glass: rgba(238, 245, 239, 0.52);
  --state-focus: #126f78;
  --state-success: #4f7f5a;
  --state-danger: #a84943;

  --room-music: #e9bd67;
  --room-story: #d98fa3;
  --room-cs: #78b7b0;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 18px;
  --space-5: 28px;
  --space-6: 44px;

  --radius-detail: 2px;
  --radius-object: 5px;
  --radius-control: 10px;
  --radius-round: 999px;

  --shadow-contact: 0 2px 0 rgba(63, 42, 29, 0.18);
  --shadow-raised: 4px 8px 18px rgba(63, 42, 29, 0.16);
  --shadow-deep: 10px 20px 44px rgba(45, 29, 19, 0.24);

  --duration-fast: 140ms;
  --duration-object: 220ms;
  --duration-room: 420ms;
  --ease-object: cubic-bezier(.2, .8, .2, 1);
  --ease-room: cubic-bezier(.22, .7, .2, 1);

  --z-scene: 0;
  --z-object: 10;
  --z-control: 100;
  --z-overlay: 200;
  --z-dialog: 210;
}
```

Keep room colors connected to the same warm base. Music uses cream, honey yellow, and warm wood; Story uses paper white, dusty pink, and colored-pencil accents; CS uses pale blue-green, soft gray, and muted tool-bench metal. Avoid adding a separate full palette per component.

### 3. Color consolidation

Most repeated current colors belong to the same brown family: `#7a4a28` (19 uses), `#3f2a1d` (10), `#9b673c` (9), `#5a321d` (6), plus many near-equivalent rgba browns. Consolidate these into ink, muted ink, wood-mid, and wood-dark roles.

Current high-saturation accents should be rationed: `#ffd36f` is useful as a small Entrance highlight but is used 12 times; keep it out of broad reading surfaces. Existing room colors in `data/rooms.ts` are a workable anchor, though Music's `#e7b86a` should be paired with lighter cream rather than used as the only identity.

### 4. Typography

Use no more than three roles and do not add network fonts during the first refactor:

- **Display / signage:** `ui-serif, Georgia, "Noto Serif SC", "Songti SC", serif`; reserved for room names, house signage, and selected titles.
- **Body / reading:** `-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`.
- **Object label:** the body stack at smaller size/stronger weight; monospace only for CS terminal and e-ink metadata.

Replace unsupported-looking `font-weight: 850` and reduce the number of 800/900 labels. English-only letter spacing/uppercase should not be mechanically applied to Chinese.

### 5. Spatial rules

- **Light:** primary warm light from upper-left. Raised objects cast shadows down-right. Recessed/e-ink surfaces use inset shadows only. Night projection may intentionally reverse the environment but not the object itself.
- **Perspective:** front-facing wall/door/map baseline. Add thickness only to removable objects and furniture edges. Avoid perspective transforms on flat labels.
- **Depth:** wall -> fixed furniture -> content object -> interaction object -> global control -> overlay -> dialog. Never use arbitrary z-index outside tokens.
- **PC spacing:** scene margin `clamp(24px, 4vw, 64px)`; reading width 42-66 characters; one primary object per viewport.
- **Mobile spacing:** independent vertical composition, 18-22px side gutter, 44px minimum target, and a reserved top/bottom control zone. Do not scale desktop absolute coordinates proportionally.

### 6. Material recipes

- **Painted wall:** one flat base, optional broad color band, very low-frequency variation; no repeated dot texture.
- **Light/dark wood:** directional grain, 1px edge highlight, one contact shadow, visible side only where thickness is plausible.
- **Paper:** warm base, slight fiber/dot texture, 1-2px irregularity or rotation, soft contact shadow.
- **Fabric:** diffuse color variation, no sharp specular highlight.
- **Brass/metal:** dark edge + narrow highlight + small specular point; use for handles, bells, fasteners.
- **Glass:** transparent surface plus edge/reflection; avoid backdrop blur as the default material.
- **E-ink:** pale gray-green screen, matte inset bezel, low contrast, no glow.

### 7. Controls and icons

- **Global controls:** Back, Language, Sound, Mode share placement logic, 44px target, 2px focus ring, and low-key material. Only these may use compact rounded pills/circles.
- **Spatial interactions:** doors, keys, records, slides, and letters look like their object and respond physically.
- **Content actions:** plain paper/wood tabs with concise verbs; no universal pill treatment.
- **Media controls:** one coherent player face; replace native chrome only when keyboard, screen-reader, seek, duration, volume, and reduced-motion behavior can be preserved.
- **Icons:** one 1.75-2px line language, 18/20/24px sizes. CSS-drawn icons are acceptable only for domain objects already built in CSS. Do not mix emoji with formal controls.

### 8. Motion

- **Micro interaction:** 120-160ms, 1-2px movement, focus/press/knob response.
- **Object movement:** 180-260ms, hinges/slides/lifts with material-appropriate transform origin.
- **Room transition:** 360-480ms, one coordinated spatial transition rather than child-by-child reveals.
- Continuous animation is reserved for a meaningful active state, such as the projector beam. Add reduced-motion handling to Entrance, HouseMap, RoomView, MelodyLock, SongPlayer, SoundToggle, and MemoryProjector; only four components currently declare it.

## D. Page-by-Page Audit

### Entrance (`components/Entrance.tsx`)

**Keep:** the authored double-door silhouette, key-as-mode interaction, asymmetric biography, bold house color, and direct Music Room path. The door still carries the world better than a standard landing-page hero.

**Problems:** the page has too many simultaneous focal labels: name/role/introduction, `quick-music-pass`, door nameplate, two key tags/tooltips, and contact note. The door's many borders, bands, medallions, panels, dots, and shadows reduce readability on mobile. Four component-local breakpoints (1180/900/760/420) reposition independent absolute objects. This is why keys and the contact note are collision-prone.

**Recommendation:** keep one strong door-frame ornament and one panel motif; remove 25-35% of non-semantic door detail. On mobile, make biography -> quick path -> door a true document flow, then place key tags in reserved zones inside the door and move the note below/alongside without overlap. Keep the door grounded; do not wrap it in another card.

**Change type:** mostly CSS, with a small DOM grouping for mobile label zones. Low state risk, high responsive risk.

### HouseMap (`app/page.tsx:212`, `components/HouseMap.tsx`)

**Problems:** `.paper-map` is a rotated/taped/dotted card and HouseMap adds another bordered grid inside it. Rooms are uniform rectangular buttons with hover lift, so this reads as a UI diagram more than a handled paper house guide. The dashed construction badge feels like a web status chip. Fixed controls are manually stacked around the viewport.

**Recommendation:** make the paper itself the only frame. Remove one of the two outer borders/shadows; preserve hand-drawn room geometry but add small spatial cues such as door swing, stair direction, pencil annotations, and wear at entry points. Use muted linework for unvisited rooms and theme tint only after the existing state says a room is unlocked/visited. Attach construction wording as a pinned paper strip, not a badge.

**Change type:** CSS for the outer simplification; DOM/SVG or carefully structured CSS for a future user-drawn map asset. Keep `onRoomClick`, `visitedRooms`, and `unlockedRooms` untouched.

### RoomView (`components/RoomView.tsx`)

**Problems:** all three doors reuse one geometry and palette variables. Story's small symbols and CS's panel lines do not change the architecture. The blurred HouseMap background weakens the idea of standing at a wall. The clickable `.room-note` duplicates the door action, while hover makes the fixed door lift. State is repeated across door text, lock, status, and note.

**Recommendation:** share only structural dimensions and interaction state. Give Music a warm framed wood door with brass and an acoustic panel rhythm; Story an off-center painted/paper-collage door with a softer frame; CS a pale workshop door with module seams, frosted pane, and tool-label typography. Use one action target: the door. Convert the note into non-button status copy or attach it to the door. Under-construction doors should visually remain doors, not open a competing card first.

**Change type:** DOM and CSS. Medium state risk because `handleDoorClick`, MelodyLock, construction focus return, quick entry, and unlocked state share this component.

### Music Room (`components/MusicRoom.tsx`, `RoomIntro.tsx`, `MusicShelf.tsx`)

**Keep:** the continuous page, e-ink song labels, physical album sleeves, and one scroll path from biography to records.

**Problems:** RoomIntro still behaves like a staged web hero: several delayed `introReveal` children, a broad text/photo layout, decorative record/lyric/tape props, and `cursor: pointer` on the non-clickable `.intro-stage`. Its first-paragraph divider uses a fragile `100vw` pseudo-element. The required profile image is missing. MusicShelf is another framed object, and it always fills at least three rows with dashed empty exhibits. JS switches to two columns at 768px while CSS switches at 767px. Dead `.back-link` rules remain in RoomIntro/MusicShelf.

**Recommendation:** make Intro a wall composition with the photo physically mounted and biography printed/pinned beside it, then let the wall material continue into a simpler shelf. Keep real empty shelf space rather than template placeholder cards. Use CSS grid auto-fit or one shared media-query source. Remove misleading cursor/dead CSS during implementation.

**Change type:** safe CSS cleanup first; DOM changes for shelf empties/photo mounting. Missing image is an asset/content blocker, not a code redesign.

### SongPlayer (`components/SongPlayer.tsx`, `MemoryProjector.tsx`)

**Problems:** `.wood-frame` groups already independent objects into a dashboard-like card. Native audio chrome conflicts with the custom album/e-ink system. The translation action is another pill. MemoryProjector is visually rich but extremely large, duplicates projector markup, and its modal has no focus trap/initial focus/body lock. Its beam animates continuously without a reduced-motion rule.

**Recommendation:** treat album sleeve, player deck, and lyrics display as three physically adjacent objects on one shelf/table, without one giant rounded wrapper. Keep native audio until a fully accessible custom control is implemented. Make translation a small e-ink toggle. Extract the projector visual into one reusable internal component and give projection mode the same dialog behavior as ContactInfo.

**Change type:** CSS/DOM for composition; high accessibility/audio risk for custom player controls; medium DOM risk for projector extraction.

### Contact (`components/ContactInfo.tsx`)

**Keep:** accessible dialog semantics, Escape handling, focus trap/return, body-scroll lock, and theme variables.

**Problems:** the fixed trigger solves placement per page with theme-specific styling but has caused content collisions. The panel remains a standard right drawer with a large heading and repeated contact cards. Five themes mainly recolor the same envelope/drawer. `z-index: 45/90` is outside a shared layer system.

**Recommendation:** keep one accessible communication drawer across the site; make the trigger's mounting slot page-owned rather than arbitrary viewport-owned. Present methods as lines/slots on one letter sheet, not cards. Room-specific flavor should live in the trigger object and one accent, not a complete modal reskin.

**Change type:** CSS plus a shared global-control rail/slot. Medium responsive risk; preserve the current dialog mechanics.

### Construction Notice (`components/ConstructionNotice.tsx`)

**Keep:** focus management, close behavior, localized content, and playful but restrained copy.

**Problems:** it is visually a centered modal card, not a notice attached to a door. Story and CS use the same shape with variable swaps. It uses `z-index: 50`, conflicting with other global layers.

**Recommendation:** retain modal semantics when opened, but visually anchor the notice to a larger door-sign surface. Story can use taped folded paper/unfinished binding; CS can use a clipped work order/soft terminal printout. Do not merely recolor identical tape and decoration.

**Change type:** DOM/CSS; low logic risk if focus refs and dismissal remain intact.

### Locks and Global Controls

`MelodyLock` is a meaningful room-specific interaction, but its centered paper panel still reads as a generic modal. Integrate it visually as a mechanism mounted on/next to the Music door. `PuzzleModal` is the largest accessibility gap: inline styles, `z-index: 25`, no `role="dialog"`, no `aria-modal`, no focus trap, no Escape behavior, and generic pill actions.

`LanguageSwitcher`, `ModeSwitcher`, `SoundToggle`, Back, and Contact use independent fixed coordinates and z-indices. Build a shared `GlobalControls` layout owner or CSS control rail; keep the existing callbacks and screen state.

## E. Priority Plan

### P0 - before launch / before deeper visual work

1. Establish shared layer tokens and ensure every modal is above every global control. Current examples: Puzzle 25, Mode 30, Melody 40, Contact trigger 45, Language/Construction 50, Sound 60, Contact panel/Projection 90.
2. Bring PuzzleModal and MemoryProjector projection up to dialog accessibility parity: semantics, labelled title, initial focus, focus trap/return, Escape, and background isolation.
3. Add the real Music Room profile image or replace the developer placeholder with intentional launch copy/artwork.
4. Replace TODO contact values before publishing.
5. Synchronize `document.documentElement.lang` with the selected language.
6. Resolve mobile collisions by reserving shared global-control zones rather than adding more one-off offsets.

### P1 - largest completion gain

1. Add global color/spacing/radius/shadow/motion/layer tokens; consolidate repeated browns and paper recipes.
2. Simplify HouseMap to one paper surface and make its marks feel drawn/handled.
3. Restructure RoomView so doors differ by geometry/material and the door is the single action target.
4. Integrate ConstructionNotice and MelodyLock with the physical door scene.
5. Simplify Entrance decoration and create explicit mobile key/note zones without reducing the door's importance.
6. Unify Music Room wall continuity; remove Intro's staged hero behavior and Shelf's placeholder-grid feeling.
7. Remove the outer SongPlayer card composition while preserving native audio accessibility.

### P2 - refinement

1. Extract reusable material recipes and internal projector/door primitives after the visual rules settle.
2. Build a complete accessible custom audio deck only if native controls remain visually unacceptable.
3. Add subtle wear/life traces tied to real content, not generic sparkles or random dots.
4. Tune bilingual typography per language and test long English/Chinese strings.
5. Optimize album images with `next/image` where it does not interfere with sleeve layout.
6. Add screenshot-based responsive regression checks for Entrance, Map, RoomView, Music Intro/Shelf, SongPlayer, and every modal.

## F. Technical Risk Matrix

| Area | CSS only | DOM change | State/logic risk | Responsive risk | Accessibility/audio risk |
| --- | --- | --- | --- | --- | --- |
| Tokens, shadows, radii, typography | Mostly | No | Low | Medium | Focus contrast |
| Global control rail and z-index | Some | Likely | Low | High | Modal isolation |
| Entrance simplification | Mostly | Small grouping | Low | High | Key target labels |
| HouseMap paper treatment | Yes initially | Future map asset | Preserve click/state | High | Room button names |
| Room-specific doors | No | Yes | Medium | High | Door status/action |
| Construction/Melody integration | No | Yes | Medium | Medium | Focus return/trap |
| Music Intro/Shelf continuity | Mixed | Yes | Low | High | Reading order |
| SongPlayer composition | Mixed | Yes | Medium | High | Native audio/custom player |
| Contact trigger placement | Mixed | Small | Low | High | Preserve dialog behavior |
| Page/room transitions | Mostly | Maybe | Screen timing | Medium | Reduced motion/UI sound |

The current screen-state system in `app/page.tsx` should remain unchanged. The highest logic-risk paths are quick Music entry, RoomIntro back source, Explore unlock state, MelodyLock completion, construction focus return, SongPlayer back behavior, and UI sound de-duplication.

## G. Recommended Implementation Sequence

1. **Foundation pass:** add tokens, z-index contract, focus standard, language synchronization, modal accessibility, and a responsive global-control rail. No visual re-theme yet.
2. **House navigation pass:** simplify HouseMap paper and rebuild RoomView/ConstructionNotice around three genuinely different doors while preserving all state callbacks.
3. **Entrance pass:** reduce decorative noise, formalize the mobile flow, and keep the double door and quick Music path as the two clear routes.
4. **Music Room pass:** mount the real photo, simplify Intro, continue one wall/material into the shelf, remove dead CSS and placeholder-grid behavior.
5. **Song experience pass:** separate album/player/lyrics physical objects, align e-ink controls, then refactor MemoryProjector accessibility and duplication.
6. **Contact pass:** retain one accessible drawer, reduce cardification, and mount themed triggers in page-owned slots.
7. **Verification pass:** test 360/390/430px mobile, 768px tablet, 1280/1440px desktop, both languages, keyboard-only use, reduced motion, Explore/Casual states, and UI sound once-per-action behavior.

## Verification Baseline

- `npm.cmd run build`: passed, including TypeScript and static generation.
- `npm.cmd run lint`: passed with two warnings, both `@next/next/no-img-element` in `MusicShelf.tsx:185` and `SongPlayer.tsx:105`.
- CSS Modules: none found.
- Tailwind utility usage: no meaningful component usage found; styling is predominantly styled-jsx and inline styles.
- Application source changes: none. Only audit documentation was added.
