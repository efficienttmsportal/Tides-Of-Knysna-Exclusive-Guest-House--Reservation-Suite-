# Implementation Plan - Guest Profile Slide-in Animation & Attractions KPI Trend Charts

## Proposed Changes

### 1. CheckInModule (`/src/components/CheckInModule.tsx`)
- Add smooth slide-in and fade-in entrance animations for guest profile cards when a reservation is selected.
- Use Tailwind CSS transition classes (`transition-all duration-300 transform translate-y-0 opacity-100` / `translate-y-4 opacity-0`) or keyframe animations styled with Tailwind.
- Enhance visual polish in accordance with the "Guest Portal Hub" preference and frontend design guidelines (no generic AI slop, premium spacing, refined typography).

### 2. Attractions & KPI Trend Charts (`/src/components/AttractionsModule.tsx` or new/existing KPI chart component)
- Implement attraction-focused KPI Trend Charts (e.g. daily/weekly visitor attraction popularity trends, ticket conversion rates, revenue by attraction category, and peak hours distribution).
- Ensure gorgeous D3/SVG or Recharts/Tailwind data visualization matching the luxury guest house aesthetic.
- Include interactive metric toggles (e.g., Visitors, Revenue, Satisfaction) and responsive container layouts.

## Verification Plan
- Compile applet with `compile_applet`.
- Verify TypeScript types and linting with `lint_applet`.
- Visually test CheckInModule reservation selection animation and Attractions KPI Trend Charts rendering.
