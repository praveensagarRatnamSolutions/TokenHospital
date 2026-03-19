# Dark Mode & Light Mode Implementation Guide

## Overview

The Hospital Token application now includes a complete dark mode and light mode system with professional medical-themed colors. The system uses `next-themes` for seamless theme management with automatic system preference detection.

## Features

✅ **Light Mode** - Professional medical blue theme with clean white backgrounds  
✅ **Dark Mode** - Professional dark blue theme with dark backgrounds  
✅ **System Preference Detection** - Automatically detects and respects system theme preference  
✅ **Persistent Storage** - User theme choice is saved to localStorage  
✅ **Smooth Transitions** - Elegant theme switching animations  
✅ **Keyboard Shortcut** - Press `Ctrl+Shift+L` (or `Cmd+Shift+L` on Mac) to toggle theme  
✅ **Theme Toggle Button** - Visual toggle in the header/topbar

## Color Scheme

### Light Mode Colors

- **Primary**: Medical Blue (`oklch(0.45 0.12 260)`)
- **Secondary**: Healthcare Teal (`oklch(0.52 0.13 255)`)
- **Accent**: Healthcare Green (`oklch(0.55 0.16 145)`)
- **Background**: Clean White (`oklch(0.98 0 0)`)
- **Foreground**: Dark Slate (`oklch(0.15 0 0)`)

### Dark Mode Colors

- **Primary**: Bright Medical Blue (`oklch(0.65 0.12 260)`)
- **Secondary**: Bright Healthcare Teal (`oklch(0.65 0.13 255)`)
- **Accent**: Bright Healthcare Green (`oklch(0.65 0.16 145)`)
- **Background**: Dark Slate (`oklch(0.12 0 0)`)
- **Foreground**: Light Text (`oklch(0.95 0 0)`)

## Usage

### 1. Using the Theme Toggle Component

The `ThemeToggle` component is already integrated into the admin and superadmin topbars:

```tsx
import { ThemeToggle } from "@/components/ThemeToggle";

export function MyComponent() {
  return (
    <header>
      <ThemeToggle />
    </header>
  );
}
```

### 2. Using the Custom Hook

Use the `useThemeMode` or `useSafeTheme` hook in your client components:

```tsx
"use client";

import { useThemeMode } from "@/hooks/useTheme";

export function MyComponent() {
  const { theme, setTheme, isDark, isLight, toggleTheme } = useThemeMode();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Is dark mode: {isDark}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

### 3. Using Tailwind CSS Dark Mode Classes

Apply styles based on theme using Tailwind's `dark:` prefix:

```tsx
<div className="bg-white dark:bg-slate-950">
  <p className="text-slate-900 dark:text-white">Content</p>
  <button className="bg-primary dark:bg-primary hover:bg-primary/90">
    Action
  </button>
</div>
```

### 4. Using CSS Custom Properties

CSS variables are automatically available and switch based on theme:

```css
.my-component {
  background-color: var(--background);
  color: var(--foreground);
  border-color: var(--border);
}

.my-button {
  background-color: var(--primary);
  color: var(--primary-foreground);
}
```

## Available CSS Variables

### Colors

- `--primary` / `--primary-foreground`
- `--secondary` / `--secondary-foreground`
- `--accent` / `--accent-foreground`
- `--destructive` - Red for errors/alerts
- `--background` / `--foreground`
- `--card` / `--card-foreground`
- `--popover` / `--popover-foreground`
- `--muted` / `--muted-foreground`
- `--border` - Border lines
- `--input` - Input field backgrounds
- `--ring` - Focus ring color

### Sidebar Colors

- `--sidebar`
- `--sidebar-foreground`
- `--sidebar-primary` / `--sidebar-primary-foreground`
- `--sidebar-accent` / `--sidebar-accent-foreground`
- `--sidebar-border`
- `--sidebar-ring`

### Chart Colors

- `--chart-1` through `--chart-5` - For data visualization

### Spacing & Radius

- `--radius` - Base border radius
- `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl`, `--radius-3xl`, `--radius-4xl`

## Component Examples

### Example: Custom Styled Card

```tsx
"use client";

import { useThemeMode } from "@/hooks/useTheme";

export function CustomCard({ title, children }) {
  const { isDark } = useThemeMode();

  return (
    <div
      className={`
      p-6 rounded-lg border
      bg-white dark:bg-slate-900
      border-slate-200 dark:border-slate-700
      text-slate-900 dark:text-white
      shadow-sm dark:shadow-md
    `}
    >
      <h3 className="text-lg font-semibold mb-4 text-primary">{title}</h3>
      <div className="text-slate-600 dark:text-slate-300">{children}</div>
    </div>
  );
}
```

### Example: Theme-Aware Badge

```tsx
<div className="badge-success">Success Status</div>
<div className="badge-error">Error Status</div>
<div className="badge-warning">Warning Status</div>
<div className="badge-info">Info Status</div>
```

## Keyboard Shortcuts

- **Ctrl+Shift+L** (Windows/Linux) or **Cmd+Shift+L** (Mac) - Toggle between light and dark mode

## Configuration

### Theme Provider Settings

The theme provider is configured in `src/components/theme-provider.tsx`:

```tsx
<NextThemesProvider
  attribute="class"              // Uses class attribute for theme
  defaultTheme="system"          // Default to system preference
  enableSystem                   // Respect system preferences
  enableColorScheme              // Enable color-scheme meta tag
  disableTransitionOnChange      // Instant theme switch (no fade)
  storageKey="hospital-theme"    // localStorage key for saving theme
>
```

## Best Practices

1. **Always include dark: classes** - Don't assume light mode styling

   ```tsx
   ❌ <div className="bg-white">
   ✅ <div className="bg-white dark:bg-slate-950">
   ```

2. **Use semantic colors** - Prefer theme variables over hardcoded colors

   ```tsx
   ❌ <button className="bg-blue-600">
   ✅ <button className="bg-primary">
   ```

3. **Test both modes** - Always verify components in dark mode
   - Use the theme toggle to switch modes
   - Or press Ctrl+Shift+L keyboard shortcut

4. **Use high contrast** - Ensure text is readable in both modes

   ```tsx
   ✅ Text: oklch(0.95 0 0) on dark, oklch(0.15 0 0) on light
   ```

5. **Avoid flash of wrong theme** - Use `suppressHydrationWarning` on `<html>` tag

## Troubleshooting

### Theme not persisting after refresh

- Check browser localStorage settings
- Ensure `storageKey="hospital-theme"` is set in theme provider
- Clear browser cache and try again

### Hydration mismatch warning

- Use `useSafeTheme()` hook instead of `useThemeMode()` for safer hydration
- Components should have `suppressHydrationWarning` where needed

### Toggle button not showing

- Ensure ThemeToggle is imported from `@/components/ThemeToggle`
- Check that component is marked with `'use client'`

## File Structure

```
src/
├── components/
│   ├── theme-provider.tsx      # Theme provider configuration
│   └── ThemeToggle.tsx         # Toggle button component
│   └── admin/
│       └── Topbar.tsx          # Admin topbar with toggle
│   └── superadmin/
│       └── Topbar.tsx          # Superadmin topbar with toggle
├── hooks/
│   └── useTheme.ts             # Custom theme hook
├── app/
│   └── globals.css             # Theme variables & styles
└── ...
```

## Migration Guide (If Updating Existing Components)

If you have existing components without dark mode support:

1. Add `dark:` classes to styled elements
2. Use CSS variables instead of hardcoded colors
3. Test using the theme toggle
4. Submit PR with theme support for review

Example migration:

```tsx
// Before
<div className="bg-white text-black border border-gray-200">
  <button className="bg-blue-600 text-white">Click me</button>
</div>

// After
<div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
  <button className="bg-primary text-primary-foreground dark:bg-primary">Click me</button>
</div>
```

## Support

For questions or issues with the dark mode implementation:

1. Check the existing component examples in `src/components/`
2. Review the color system in `src/app/globals.css`
3. Refer to [next-themes documentation](https://github.com/pacocoursey/next-themes)
