# System Cohesion

Use this axis to keep the interface recognizably one product rather than a
collage of templates or references.

## Checks

1. Derive typography, color, spacing, radius, borders, shadow, and motion from the
   approved direction or incumbent tokens.
2. Keep elements that must change together close: component state, visual state,
   and its token decisions.
3. Give the brand color a semantic role. A purple brand may remain purple; use it
   for selection, status, emphasis, or identity rather than coating everything.
4. Spend visual boldness in one justified signature decision. Supporting
   elements should clarify it.
5. Reuse sound behavior from existing components while treating their default
   theme as implementation material, not the design direction.
6. Keep one action vocabulary, one content voice, and one meaning for each
   status color across the surface.

## Reference Integration

Each reference owns only one role:

- visual language and typography;
- information structure or flow;
- component behavior or interaction.

Record what is reused, rejected, and adapted. The combined result must survive
without the source's logo, copy, illustration, or proprietary identity.

Remove the logo and accent color mentally. If the composition could belong to an
unrelated product after swapping nouns, return to the product material and
replace the generic pattern.

## Common Failures

- Arbitrary radii and spacing values added per component.
- Multiple display fonts competing on one surface.
- Award-site motion pasted into an operational dashboard.
- Cards nested inside cards because every block needs a background.
- A brand color removed only because it resembles an AI anti-pattern.

Use P1 when inconsistency hides meaning or breaks brand recognition, P2 when it
creates template-like repetition, and P3 for token cleanup.
