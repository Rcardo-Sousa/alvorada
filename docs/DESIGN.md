# DESIGN.md — Alvorada

## World
Warm cinematic editorial: linen paper, terracotta carpet (`--tapete`), soft gold (`--dourado`), sage and blush accents. Display voice is **Marcellus** (serif); UI/body is **Jost** (sans, light). Dark mode is candlelit stone, not pure black — neutrals stay hue-tinted from umber/cream.

## Mode
Persuade + Experience on the marketing scroll. The drone sequence is the authored focal moment; the editorial site continues that atmosphere with quieter motion.

## Hierarchy
1. Brand name / display headlines (serif, large, tight tracking ≥ −0.04em)
2. Section stories and manifesto body (comfortable measure ~55–70ch)
3. Metadata / etiquetas (small caps tracking, accent color sparingly)
4. Controls (menu, CTA pill, theme toggle)

## Spatial rhythm
Tight groups inside a section; generous separation between scenes. More space above a heading than below it. Asymmetric gallery (large + portrait + detail) is intentional — not equal cards.

## Motion thesis
One focal sequence: drone arrival → paper handoff. Editorial motion is supporting only — soft parallax, image breath, marquee drift, hover acknowledgment. Easing: confident deceleration `cubic-bezier(0.16, 1, 0.3, 1)`. No bounce/elastic. Default state stays visible if JS fails.

## Browser chrome (craft floor)
Selection, focus rings, scrollbars, caret, and underline offsets inherit the palette (`--dourado` / `--tapete` / tinted paper). These are part of the design system.

## Anti-references
Inter/Roboto defaults · purple SaaS gradients · nested cards · gray text on colored fields · zero-offset neon glows · identical fade-up on every section · emoji/Unicode-as-icons · eyebrow/kicker labels above headings · decorative 01/02 section numbering.

## Applied craft-floor habits
Browser chrome themed · display capped at 6rem · tracking ≥ −0.04em · body measure ~62ch · dark mode weight/leading compensation · motion only on authored beats (manifesto + gallery images) · separators tinted from surface hue on `--tapete`.

## Tokens (source of truth)
`css/base.css` — semantic roles on `:root` and theme overrides. Prefer extending tokens over one-off hex in components.
