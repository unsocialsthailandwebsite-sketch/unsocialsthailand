---
name: mobile-responsiveness
description: "Guidelines and code patterns for implementing mobile-first responsive web design, fluid typography, safe area handling, and mobile-specific components without breaking desktop layouts."
---

# Mobile Responsiveness Skill

This skill provides best practices, modular patterns, and instructions for implementing mobile-first web design. It focuses on ensuring interfaces scale seamlessly to mobile viewports while preserving the desktop layouts (the "web version") intact.

## Core Principles

1. **Do No Harm to Desktop (Web Version)**: Always scope mobile styling using `@media (max-width: ...)` or mobile-first design where changes are overridden correctly for larger screens, ensuring the desktop view remains completely untouched and functional.
2. **Fluid Over Absolute**: Use percentage, `vw`, `vh`, `rem`, `em`, and CSS grid/flexbox to build layouts that adapt to any screen size.
3. **Fluid Typography**: Use CSS `clamp()` to scale typography fluidly between screen sizes:
   ```css
   font-size: clamp(1rem, 2vw + 0.5rem, 2.5rem);
   ```

## Standard CSS Breakpoints

Use the following breakpoints for styling different device sizes:

| Breakpoint | CSS Media Query | Target Devices |
|------------|-----------------|----------------|
| `sm`       | `@media (min-width: 640px)` | Large phones / small tablets |
| `md`       | `@media (min-width: 768px)` | Tablets |
| `lg`       | `@media (min-width: 1024px)` | Laptops / small desktops |
| `xl`       | `@media (min-width: 1280px)` | Large desktops |

For mobile-specific overrides when writing desktop-first code:
```css
@media (max-width: 767.98px) {
  /* Mobile-only styles go here */
}
```

## Safe Area Handling (iOS Notch & Home Indicator)

Always ensure content, buttons, and navigation elements are clear of the device notches and home indicator.

```css
.safe-padding-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
.safe-padding-top {
  padding-top: env(safe-area-inset-top);
}
```

## Mobile Navigation with Backdrop

For drawer/hamburger mobile navigation menus:
1. Ensure the drawer sits on top of all other page layers (`z-index: 9999`).
2. Add a semi-transparent backdrop overlay to dim the background.
3. Lock body scrolling when the mobile menu is open.

```javascript
// Toggle scroll locking
function toggleMobileMenu(isOpen) {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}
```

## Swipeable Touch Components

Handling swipe/touch gestures for sliders and carousels:

```javascript
let touchStartX = 0;
let touchEndX = 0;

function handleGesture(element, onSwipeLeft, onSwipeRight) {
  element.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  element.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    const threshold = 50; // minimum distance in pixels
    if (touchStartX - touchEndX > threshold) {
      onSwipeLeft();
    } else if (touchEndX - touchStartX > threshold) {
      onSwipeRight();
    }
  }, { passive: true });
}
```
