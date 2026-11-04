# WCAG 2.2 Success Criteria Summary

Official sources:

- WCAG 2.2 Recommendation: https://www.w3.org/TR/WCAG22/
- How to Meet WCAG 2.2: https://www.w3.org/WAI/WCAG22/quickref/
- Understanding WCAG 2.2: https://www.w3.org/WAI/WCAG22/Understanding/

Use this file as a lookup table while coding or reviewing. Default target for product UI is **WCAG 2.2 AA**, which means all Level A and Level AA active criteria.

## WCAG 2.2 New Criteria

WCAG 2.2 added:

- `2.4.11 Focus Not Obscured (Minimum)` - AA
- `2.4.12 Focus Not Obscured (Enhanced)` - AAA
- `2.4.13 Focus Appearance` - AAA
- `2.5.7 Dragging Movements` - AA
- `2.5.8 Target Size (Minimum)` - AA
- `3.2.6 Consistent Help` - A
- `3.3.7 Redundant Entry` - A
- `3.3.8 Accessible Authentication (Minimum)` - AA
- `3.3.9 Accessible Authentication (Enhanced)` - AAA

`4.1.1 Parsing` is obsolete and removed in WCAG 2.2. It is listed separately at the end.

## 1. Perceivable

| Criterion | Level | Coding implication | Official links |
|---|---:|---|---|
| `1.1.1 Non-text Content` | A | Meaningful images, icons, controls, charts, CAPTCHA, and media need equivalent text alternatives; decorative content must be ignorable. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#non-text-content) |
| `1.2.1 Audio-only and Video-only (Prerecorded)` | A | Prerecorded audio-only needs text alternative; prerecorded video-only needs equivalent text or audio. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/audio-only-and-video-only-prerecorded.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#audio-only-and-video-only-prerecorded) |
| `1.2.2 Captions (Prerecorded)` | A | Prerecorded synchronized media with audio needs captions. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#captions-prerecorded) |
| `1.2.3 Audio Description or Media Alternative (Prerecorded)` | A | Prerecorded video in synchronized media needs audio description or media alternative. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/audio-description-or-media-alternative-prerecorded.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#audio-description-or-media-alternative-prerecorded) |
| `1.2.4 Captions (Live)` | AA | Live synchronized media with audio needs live captions. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/captions-live.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#captions-live) |
| `1.2.5 Audio Description (Prerecorded)` | AA | Prerecorded synchronized video needs audio description. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/audio-description-prerecorded.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#audio-description-prerecorded) |
| `1.2.6 Sign Language (Prerecorded)` | AAA | Prerecorded synchronized media needs sign language interpretation. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/sign-language-prerecorded.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#sign-language-prerecorded) |
| `1.2.7 Extended Audio Description (Prerecorded)` | AAA | If standard audio description cannot fit pauses, provide extended audio description. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/extended-audio-description-prerecorded.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#extended-audio-description-prerecorded) |
| `1.2.8 Media Alternative (Prerecorded)` | AAA | Prerecorded synchronized media and video-only media need a full media alternative. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/media-alternative-prerecorded.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#media-alternative-prerecorded) |
| `1.2.9 Audio-only (Live)` | AAA | Live audio-only content needs equivalent alternative information. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/audio-only-live.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#audio-only-live) |
| `1.3.1 Info and Relationships` | A | Visual structure must be programmatically available: labels, headings, tables, groups, lists, required states. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#info-and-relationships) |
| `1.3.2 Meaningful Sequence` | A | DOM/read order must preserve meaning when visual layout changes. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#meaningful-sequence) |
| `1.3.3 Sensory Characteristics` | A | Instructions cannot rely only on shape, color, size, visual location, orientation, or sound. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/sensory-characteristics.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#sensory-characteristics) |
| `1.3.4 Orientation` | AA | Do not lock content to portrait or landscape unless essential. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/orientation.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#orientation) |
| `1.3.5 Identify Input Purpose` | AA | Common personal-data inputs need programmatically identifiable purposes, usually via `autocomplete`. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#identify-input-purpose) |
| `1.3.6 Identify Purpose` | AAA | UI components, icons, and regions should expose machine-readable purpose where supported. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/identify-purpose.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#identify-purpose) |
| `1.4.1 Use of Color` | A | Color cannot be the only way to convey information, state, action, or errors. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#use-of-color) |
| `1.4.2 Audio Control` | A | Auto-playing audio over 3 seconds needs pause/stop/control or independent volume control. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#audio-control) |
| `1.4.3 Contrast (Minimum)` | AA | Text contrast must be at least `4.5:1`; large text at least `3:1`, with listed exceptions. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#contrast-minimum) |
| `1.4.4 Resize Text` | AA | Text must resize up to 200 percent without loss of content or function, except captions/images of text. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#resize-text) |
| `1.4.5 Images of Text` | AA | Use real text instead of images of text unless customizable or essential. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/images-of-text.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#images-of-text) |
| `1.4.6 Contrast (Enhanced)` | AAA | Enhanced text contrast: normal text `7:1`, large text `4.5:1`. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#contrast-enhanced) |
| `1.4.7 Low or No Background Audio` | AAA | Speech audio should have no background, very low background, or controllable background. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/low-or-no-background-audio.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#low-or-no-background-audio) |
| `1.4.8 Visual Presentation` | AAA | Provide user control for foreground/background colors, line length, justification, line spacing, and text resizing. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#visual-presentation) |
| `1.4.9 Images of Text (No Exception)` | AAA | Images of text are only acceptable for pure decoration or essential presentation. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/images-of-text-no-exception.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#images-of-text-no-exception) |
| `1.4.10 Reflow` | AA | At 320 CSS px width, content must not lose information/function or require two-dimensional scrolling except true 2D content. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#reflow) |
| `1.4.11 Non-text Contrast` | AA | Meaningful UI boundaries, states, focus indicators, icons, and graphics need `3:1` contrast. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#non-text-contrast) |
| `1.4.12 Text Spacing` | AA | User text-spacing overrides must not cause content or functionality loss. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#text-spacing) |
| `1.4.13 Content on Hover or Focus` | AA | Hover/focus popups must be dismissible, hoverable, and persistent unless exceptions apply. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#content-on-hover-or-focus) |

## 2. Operable

| Criterion | Level | Coding implication | Official links |
|---|---:|---|---|
| `2.1.1 Keyboard` | A | All functionality must be operable with keyboard alone, except path-dependent input. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#keyboard) |
| `2.1.2 No Keyboard Trap` | A | Users must be able to move focus into and out of components using keyboard. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#no-keyboard-trap) |
| `2.1.3 Keyboard (No Exception)` | AAA | All functionality must be keyboard operable without the path-dependent exception. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/keyboard-no-exception.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#keyboard-no-exception) |
| `2.1.4 Character Key Shortcuts` | A | Single-character shortcuts need off/remap/focus-only behavior. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#character-key-shortcuts) |
| `2.2.1 Timing Adjustable` | A | Time limits need turn-off, adjust, or extend mechanisms unless exceptions apply. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#timing-adjustable) |
| `2.2.2 Pause, Stop, Hide` | A | Moving, blinking, scrolling, or auto-updating content needs pause/stop/hide when required. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#pause-stop-hide) |
| `2.2.3 No Timing` | AAA | Timing must not be an essential part of the event or activity, except listed exceptions. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/no-timing.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#no-timing) |
| `2.2.4 Interruptions` | AAA | Interruptions must be postponable or suppressible except emergencies. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/interruptions.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#interruptions) |
| `2.2.5 Re-authenticating` | AAA | After re-authentication, users should continue without data loss. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/re-authenticating.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#re-authenticating) |
| `2.2.6 Timeouts` | AAA | Warn users about inactivity timeouts that could cause data loss, unless exceptions apply. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/timeouts.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#timeouts) |
| `2.3.1 Three Flashes or Below Threshold` | A | Do not flash more than three times per second or exceed flash thresholds. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#three-flashes-or-below-threshold) |
| `2.3.2 Three Flashes` | AAA | No content should flash more than three times per second. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#three-flashes) |
| `2.3.3 Animation from Interactions` | AAA | Motion animation triggered by interaction must be disableable unless essential. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#animation-from-interactions) |
| `2.4.1 Bypass Blocks` | A | Provide a way to skip repeated blocks, such as skip links or landmarks. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#bypass-blocks) |
| `2.4.2 Page Titled` | A | Pages need descriptive titles. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#page-titled) |
| `2.4.3 Focus Order` | A | Focus order must preserve meaning and operability. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#focus-order) |
| `2.4.4 Link Purpose (In Context)` | A | Link purpose must be clear from link text or programmatically determined context. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#link-purpose-in-context) |
| `2.4.5 Multiple Ways` | AA | Provide more than one way to locate pages in a set, with exceptions. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/multiple-ways.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#multiple-ways) |
| `2.4.6 Headings and Labels` | AA | Headings and labels must describe topic or purpose. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#headings-and-labels) |
| `2.4.7 Focus Visible` | AA | Keyboard focus indicator must be visible. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#focus-visible) |
| `2.4.8 Location` | AAA | Users should know their location within a set of pages. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/location.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#location) |
| `2.4.9 Link Purpose (Link Only)` | AAA | Link purpose must be clear from link text alone, except ambiguous-to-all cases. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-link-only.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#link-purpose-link-only) |
| `2.4.10 Section Headings` | AAA | Use section headings to organize content where appropriate. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/section-headings.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#section-headings) |
| `2.4.11 Focus Not Obscured (Minimum)` | AA | Focused UI components must not be entirely hidden by author-created content. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#focus-not-obscured-minimum) |
| `2.4.12 Focus Not Obscured (Enhanced)` | AAA | Focused UI components must not be partially hidden by author-created content. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#focus-not-obscured-enhanced) |
| `2.4.13 Focus Appearance` | AAA | Visible focus indicator area and contrast must meet the enhanced focus appearance rules. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#focus-appearance) |
| `2.5.1 Pointer Gestures` | A | Multipoint or path-based gestures need single-pointer alternatives unless essential. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#pointer-gestures) |
| `2.5.2 Pointer Cancellation` | A | Avoid irreversible action on pointer down; support cancel/abort/undo where required. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#pointer-cancellation) |
| `2.5.3 Label in Name` | A | Accessible name must contain the visible label text for labeled controls. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#label-in-name) |
| `2.5.4 Motion Actuation` | A | Motion-operated functions need UI alternatives and a way to disable motion activation. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/motion-actuation.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#motion-actuation) |
| `2.5.5 Target Size (Enhanced)` | AAA | Pointer targets should be at least `44 by 44 CSS px`, with exceptions. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#target-size-enhanced) |
| `2.5.6 Concurrent Input Mechanisms` | AAA | Do not restrict available input methods unless essential, secure, or user-configured. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/concurrent-input-mechanisms.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#concurrent-input-mechanisms) |
| `2.5.7 Dragging Movements` | AA | Dragging functionality needs a single-pointer non-drag alternative unless essential. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#dragging-movements) |
| `2.5.8 Target Size (Minimum)` | AA | Pointer targets must be at least `24 by 24 CSS px`, or meet listed exceptions. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#target-size-minimum) |

## 3. Understandable

| Criterion | Level | Coding implication | Official links |
|---|---:|---|---|
| `3.1.1 Language of Page` | A | Set the page language programmatically, usually `html lang`. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#language-of-page) |
| `3.1.2 Language of Parts` | AA | Mark language changes inside content where needed. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#language-of-parts) |
| `3.1.3 Unusual Words` | AAA | Provide definitions for unusual or restricted-use words. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/unusual-words.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#unusual-words) |
| `3.1.4 Abbreviations` | AAA | Provide expanded forms or meanings for abbreviations. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/abbreviations.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#abbreviations) |
| `3.1.5 Reading Level` | AAA | Provide supplemental content when text requires advanced reading ability. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/reading-level.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#reading-level) |
| `3.1.6 Pronunciation` | AAA | Provide pronunciation help when meaning is ambiguous without pronunciation. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/pronunciation.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#pronunciation) |
| `3.2.1 On Focus` | A | Receiving focus must not unexpectedly change context. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/on-focus.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#on-focus) |
| `3.2.2 On Input` | A | Changing an input value must not unexpectedly change context unless users are informed first. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#on-input) |
| `3.2.3 Consistent Navigation` | AA | Repeated navigation must appear in the same relative order across pages. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#consistent-navigation) |
| `3.2.4 Consistent Identification` | AA | Components with the same function must be identified consistently. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#consistent-identification) |
| `3.2.5 Change on Request` | AAA | Context changes should happen only by user request or with a way to turn them off. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/change-on-request.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#change-on-request) |
| `3.2.6 Consistent Help` | A | Repeated help mechanisms must appear in the same relative order across pages. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#consistent-help) |
| `3.3.1 Error Identification` | A | Detected input errors must be identified and described in text. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#error-identification) |
| `3.3.2 Labels or Instructions` | A | Inputs need labels or instructions when user input is required. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#labels-or-instructions) |
| `3.3.3 Error Suggestion` | AA | When known and safe, provide suggestions to fix detected input errors. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#error-suggestion) |
| `3.3.4 Error Prevention (Legal, Financial, Data)` | AA | High-impact submissions need reversible, checked, or confirmed workflows. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#error-prevention-legal-financial-data) |
| `3.3.5 Help` | AAA | Provide context-sensitive help. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/help.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#help) |
| `3.3.6 Error Prevention (All)` | AAA | All information submissions need reversible, checked, or confirmed workflows. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-all.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#error-prevention-all) |
| `3.3.7 Redundant Entry` | A | Do not require users to re-enter information already provided in the same process unless an exception applies. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#redundant-entry) |
| `3.3.8 Accessible Authentication (Minimum)` | AA | Authentication cannot require cognitive function tests unless alternative, mechanism, object recognition, or personal-content exceptions apply. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#accessible-authentication-minimum) |
| `3.3.9 Accessible Authentication (Enhanced)` | AAA | Authentication cannot require cognitive function tests unless alternative or mechanism exceptions apply. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-enhanced.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#accessible-authentication-enhanced) |

## 4. Robust

| Criterion | Level | Coding implication | Official links |
|---|---:|---|---|
| `4.1.2 Name, Role, Value` | A | UI components must expose accessible name, role, state, properties, values, and change notifications. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#name-role-value) |
| `4.1.3 Status Messages` | AA | Status messages must be programmatically determinable without moving focus. | [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#status-messages) |

## Obsolete And Removed

| Criterion | Status | How to handle |
|---|---|---|
| `4.1.1 Parsing` | Obsolete and removed in WCAG 2.2 | Do not report active WCAG 2.2 failures against this criterion. If markup problems cause real accessibility issues, report the effect under criteria such as `1.3.1`, `2.1.1`, `2.4.3`, `4.1.2`, or `4.1.3`. Official links: [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/parsing.html), [Quickref](https://www.w3.org/WAI/WCAG22/quickref/#parsing). |
