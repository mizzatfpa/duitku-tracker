# DUITku Design System

## Product Overview

- **Product:** DUITku
- **Category:** Personal finance management
- **Platform:** Web application
- **Target users:** University students and young adults
- **Design direction:** Modern fintech, elegant, clean, minimal, trustworthy, premium

DUITku helps users record income and expenses, monitor their balance, and understand
their financial habits through a clear dashboard.

## Brand and Typography

The brand uses a deep purple fintech identity with soft gradients, white surfaces,
rounded components, and data-focused layouts.

- **Primary font:** Figtree
- **Display:** 48px, bold
- **Heading 1:** 32px, semibold
- **Heading 2:** 24px, semibold
- **Heading 3:** 20px, medium
- **Body large:** 16px
- **Body medium:** 14px
- **Caption:** 12px

## Color Tokens

| Token | Value | Usage |
|---|---|---|
| `primary-900` | `#24104F` | Navbar and dark premium surfaces |
| `primary-700` | `#5B21B6` | Primary buttons and active states |
| `primary-500` | `#8B5CF6` | Brand color and gradients |
| `primary-300` | `#C4B5FD` | Soft highlights |
| `primary-100` | `#EDE9FE` | Soft card backgrounds |
| `accent` | `#6366F1` | Charts and interactive elements |
| `success` | `#22C55E` | Income and positive balance |
| `danger` | `#EF4444` | Expenses and warnings |
| `warning` | `#F59E0B` | Notifications |
| `background` | `#FAFAFC` | Application background |
| `surface` | `#FFFFFF` | Cards and content surfaces |
| `border` | `#E5E7EB` | Borders and dividers |
| `text-primary` | `#111827` | Main text |
| `text-secondary` | `#6B7280` | Supporting text |
| `disabled` | `#D1D5DB` | Disabled controls |

### Gradients

- **Primary brand:** `#8B5CF6` to `#6366F1`
- **Premium dark:** `#24104F` to `#5B21B6`

## Layout and Spacing

- Desktop maximum width: `1200px`
- Desktop grid: 12 columns
- Standard gap: `24px`
- Mobile width reference: `390px`
- Mobile horizontal padding: `20px`
- Mobile order: Header, financial summary, quick action, transaction list,
  navigation

## Shape, Shadow, and Motion

- Large radius: `24px` for dashboard cards
- Medium radius: `16px` for buttons and forms
- Small radius: `10px` for inputs
- Soft shadow: `0 8px 24px rgba(0, 0, 0, 0.08)`
- Floating shadow: `0 12px 32px rgba(139, 92, 246, 0.15)`
- Interaction duration: `200ms` to `300ms`
- Motion should be subtle and should not reduce readability

## Component Rules

### Buttons

- Primary: `#8B5CF6` background, white text, `16px` radius, minimum height `48px`
- Secondary: `#EDE9FE` background, `#5B21B6` text
- Touch target: minimum `44px`

### Inputs

- Height: `48px`
- Background: white
- Border: `#E5E7EB`
- Radius: `12px`
- Focus border: `#8B5CF6`

### Financial Summary Card

Each card contains a title, formatted amount, trend or supporting information,
and an optional icon. Income uses green, expenses use red, and balance uses the
primary gradient or a neutral surface.

### Transaction Card

Each item contains an icon or type indicator, category, description, date, and
amount. Income uses a green indicator; expenses use a red indicator.

## Dashboard Specification

The dashboard contains:

1. Welcome header
2. Balance overview
3. Income summary
4. Expense summary
5. Transaction history
6. Financial insight area when data is available

Desktop uses a sidebar and a main content area. Mobile uses a header, summary
cards, recent transactions, and bottom navigation.

For the current Orang 3 scope, the owned dashboard surfaces are:

- `src/app/(dashboard)/**`
- `src/components/dashboard/**`

The dashboard consumes read data from Orang 2 and mounts transaction controls
provided by Orang 4. It must not create Prisma queries or implement transaction
write operations.

## Empty State

When the user has no transactions:

- Show a minimal financial illustration or simple visual placeholder.
- Show the message **"No transactions yet"**.
- Provide the CTA label **"Add Your First Transaction"** through the transaction
  component supplied by Orang 4.

## Accessibility

- Minimum contrast ratio: `4.5:1`
- Minimum touch target: `44px`
- Minimum readable text size: `14px`
- Use semantic headings, table/list semantics, visible focus states, and
  descriptive labels.

## Development Tokens

```ts
const designTokens = {
  colors: {
    primary: "#8B5CF6",
    primaryDark: "#5B21B6",
    background: "#FAFAFC",
    surface: "#FFFFFF",
    text: "#111827",
    muted: "#6B7280",
    success: "#22C55E",
    danger: "#EF4444",
  },
  font: {
    family: "Figtree",
  },
  radius: {
    lg: "24px",
    md: "16px",
    sm: "10px",
  },
};
```
