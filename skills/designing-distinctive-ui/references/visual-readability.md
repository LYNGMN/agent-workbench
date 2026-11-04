# Visual Readability

Use this axis to judge whether users can understand the screen in the order
required by their task.

## Checks

| Signal | Good response |
| --- | --- |
| Every section has equal visual weight | Establish one primary action or conclusion and reduce supporting contrast |
| The screen is a wall of cards | Reserve containers for information that must be grouped |
| Large numbers or headings replace structure | Order content by the user's decision, not by decorative scale |
| Desktop simply stacks on mobile | Reprioritize, shorten, collapse, or move secondary content |
| Korean text breaks the composition | Apply `word-break: keep-all;` (with `overflow-wrap: break-word;`), prevent mid-word breaks in tooltips and menus (`white-space: nowrap;`), and test text zoom |
| Dense data is hard to scan | Align comparable values and expose units, periods, and states |

## Review Questions

1. What is the single job on this surface?
2. What must the user notice first, second, and third?
3. Do display, body, and utility or code typography have distinct jobs?
4. Does the hierarchy emerge from product decisions and artifacts, or could its
   nouns be swapped for an unrelated product?
5. Can sparse, typical, and dense content use the same structure?
6. At narrow mobile width and 200% zoom, does reading order remain meaningful?

## Finding Shape

```text
[P1 Visual Readability] [evidence] → [user impact] → [smallest useful correction]
```

Use P1 when the primary task becomes difficult or content is lost. Use P2 for
hierarchy and density problems that slow comprehension. Use P3 for local polish.

Do not prescribe a fashionable layout before identifying the lost reading order.
