# Hospital Management System - Design System & Style Guide

## 1. Design Philosophy

### 1.1 Brand Inspiration - Medifly.ai Analysis
Drawing inspiration from Medifly.ai's approach to healthcare accessibility and trust-building <mcreference link="https://www.medifly.ai/." index="0">0</mcreference>, our design system emphasizes:

- **Trust & Professionalism**: Clean, medical-grade aesthetics that instill confidence
- **Accessibility First**: Removing barriers to healthcare access through intuitive design
- **Global Connectivity**: Seamless user experience across different user types and devices
- **Empathy-Driven**: Human-centered design that understands healthcare anxiety and needs

### 1.2 Core Design Principles
1. **Clarity Over Complexity**: Every element serves a clear purpose
2. **Trust Through Transparency**: Open, honest visual communication
3. **Accessibility by Default**: WCAG 2.1 AA compliance throughout
4. **Responsive Empathy**: Adapts to user context and emotional state
5. **Professional Warmth**: Medical professionalism with human touch

## 2. Color Palette

### 2.1 Primary Colors
```css
/* Medical Trust Blue - Primary brand color */
--primary-50: #eff6ff
--primary-100: #dbeafe
--primary-200: #bfdbfe
--primary-300: #93c5fd
--primary-400: #60a5fa
--primary-500: #3b82f6  /* Main primary */
--primary-600: #2563eb
--primary-700: #1d4ed8
--primary-800: #1e40af
--primary-900: #1e3a8a

/* Medical Green - Success & Health */
--success-50: #f0fdf4
--success-100: #dcfce7
--success-200: #bbf7d0
--success-300: #86efac
--success-400: #4ade80
--success-500: #22c55e  /* Main success */
--success-600: #16a34a
--success-700: #15803d
--success-800: #166534
--success-900: #14532d
```

### 2.2 Neutral Colors
```css
/* Medical Grays - Clean & Professional */
--neutral-50: #fafafa
--neutral-100: #f5f5f5
--neutral-200: #e5e5e5
--neutral-300: #d4d4d4
--neutral-400: #a3a3a3
--neutral-500: #737373
--neutral-600: #525252
--neutral-700: #404040
--neutral-800: #262626
--neutral-900: #171717

/* Pure Medical White */
--white: #ffffff
--medical-white: #fefefe
```

### 2.3 Semantic Colors
```css
/* Status Colors */
--error-500: #ef4444      /* Critical alerts */
--warning-500: #f59e0b    /* Caution states */
--info-500: #06b6d4       /* Information */

/* Appointment Status Colors */
--pending: #f59e0b        /* Pending appointments */
--confirmed: #22c55e      /* Confirmed appointments */
--completed: #6b7280      /* Completed appointments */
--cancelled: #ef4444      /* Cancelled appointments */
```

## 3. Typography

### 3.1 Font Family
```css
/* Primary Font - Inter (Medical Professional) */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Secondary Font - JetBrains Mono (Data/Code) */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### 3.2 Type Scale
```css
/* Heading Styles */
--text-xs: 0.75rem;     /* 12px - Small labels */
--text-sm: 0.875rem;    /* 14px - Body small */
--text-base: 1rem;      /* 16px - Body text */
--text-lg: 1.125rem;    /* 18px - Large body */
--text-xl: 1.25rem;     /* 20px - Small headings */
--text-2xl: 1.5rem;     /* 24px - Section headings */
--text-3xl: 1.875rem;   /* 30px - Page headings */
--text-4xl: 2.25rem;    /* 36px - Hero headings */
```

### 3.3 Font Weights
```css
--font-light: 300;      /* Light text */
--font-normal: 400;     /* Body text */
--font-medium: 500;     /* Emphasis */
--font-semibold: 600;   /* Headings */
--font-bold: 700;       /* Strong emphasis */
```

## 4. Spacing System

### 4.1 Spacing Scale (8px base unit)
```css
--space-1: 0.25rem;     /* 4px */
--space-2: 0.5rem;      /* 8px */
--space-3: 0.75rem;     /* 12px */
--space-4: 1rem;        /* 16px */
--space-5: 1.25rem;     /* 20px */
--space-6: 1.5rem;      /* 24px */
--space-8: 2rem;        /* 32px */
--space-10: 2.5rem;     /* 40px */
--space-12: 3rem;       /* 48px */
--space-16: 4rem;       /* 64px */
--space-20: 5rem;       /* 80px */
--space-24: 6rem;       /* 96px */
```

### 4.2 Layout Spacing
```css
/* Component Spacing */
--component-padding: var(--space-6);
--section-padding: var(--space-12);
--page-padding: var(--space-8);

/* Card Spacing */
--card-padding: var(--space-6);
--card-gap: var(--space-4);
```

## 5. Component Design System

### 5.1 Buttons
```css
/* Primary Button */
.btn-primary {
  background: var(--primary-500);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: 0.5rem;
  font-weight: var(--font-medium);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--primary-600);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--primary-500);
  border: 1px solid var(--primary-500);
  padding: var(--space-3) var(--space-6);
  border-radius: 0.5rem;
  font-weight: var(--font-medium);
}
```

### 5.2 Cards
```css
/* Hospital/Doctor Card */
.card-medical {
  background: white;
  border-radius: 0.75rem;
  padding: var(--card-padding);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--neutral-200);
  transition: all 0.2s ease;
}

.card-medical:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
```

### 5.3 Form Elements
```css
/* Input Fields */
.input-medical {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--neutral-300);
  border-radius: 0.5rem;
  font-size: var(--text-base);
  transition: border-color 0.2s ease;
}

.input-medical:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

## 6. Layout Principles

### 6.1 Grid System
```css
/* Container Sizes */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;

/* Grid Layout */
.grid-medical {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
```

### 6.2 Responsive Breakpoints
```css
/* Mobile First Approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

## 7. Iconography

### 7.1 Icon System
- **Library**: Lucide React (medical-friendly icons)
- **Size Scale**: 16px, 20px, 24px, 32px, 48px
- **Style**: Outline style for consistency
- **Color**: Inherit from parent or semantic colors

### 7.2 Medical Icons
```jsx
// Common medical icons
import { 
  Stethoscope,      // Doctors
  Building2,        // Hospitals
  Calendar,         // Appointments
  Clock,           // Availability
  User,            // Patients
  Shield,          // Security
  Heart,           // Health
  Activity         // Vital signs
} from 'lucide-react';
```

## 8. Status Indicators

### 8.1 Appointment Status
```css
/* Status Badge Styles */
.status-pending {
  background: var(--warning-100);
  color: var(--warning-700);
  border: 1px solid var(--warning-200);
}

.status-confirmed {
  background: var(--success-100);
  color: var(--success-700);
  border: 1px solid var(--success-200);
}

.status-completed {
  background: var(--neutral-100);
  color: var(--neutral-700);
  border: 1px solid var(--neutral-200);
}

.status-cancelled {
  background: var(--error-100);
  color: var(--error-700);
  border: 1px solid var(--error-200);
}
```

### 8.2 Doctor Availability
```css
.availability-available {
  background: var(--success-500);
  color: white;
}

.availability-busy {
  background: var(--warning-500);
  color: white;
}

.availability-offline {
  background: var(--neutral-400);
  color: white;
}
```

## 9. Animation & Transitions

### 9.1 Transition Timing
```css
/* Standard Transitions */
--transition-fast: 0.15s ease;
--transition-normal: 0.2s ease;
--transition-slow: 0.3s ease;

/* Easing Functions */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
```

### 9.2 Hover Effects
```css
/* Card Hover */
.hover-lift {
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

## 10. Accessibility Guidelines

### 10.1 Color Contrast
- **Normal Text**: Minimum 4.5:1 contrast ratio
- **Large Text**: Minimum 3:1 contrast ratio
- **Interactive Elements**: Minimum 3:1 contrast ratio

### 10.2 Focus States
```css
/* Focus Ring */
.focus-ring:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* Focus Visible (keyboard only) */
.focus-visible:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

### 10.3 Screen Reader Support
- Use semantic HTML elements
- Provide alt text for images
- Use ARIA labels for complex interactions
- Ensure keyboard navigation works throughout

## 11. Component Library Integration

### 11.1 Shadcn/ui Customization
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        // ... other colors
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
}
```

### 11.2 Custom Component Variants
```typescript
// Button variants for medical context
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        medical: "bg-primary-500 text-white hover:bg-primary-600",
        emergency: "bg-red-500 text-white hover:bg-red-600",
        success: "bg-green-500 text-white hover:bg-green-600",
      },
    },
  }
);
```

## 12. Implementation Guidelines

### 12.1 CSS Custom Properties Setup
```css
:root {
  /* Import all design tokens */
  @import './tokens/colors.css';
  @import './tokens/typography.css';
  @import './tokens/spacing.css';
}
```

### 12.2 Component Structure
```jsx
// Example: Medical Card Component
const MedicalCard = ({ children, variant = "default", ...props }) => {
  return (
    <div 
      className={cn(
        "card-medical",
        variant === "highlighted" && "border-primary-200 bg-primary-50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
```

## 13. Brand Guidelines

### 13.1 Logo Usage
- Maintain clear space equal to the height of the logo
- Use on white or light backgrounds primarily
- Ensure minimum size of 24px height for digital use

### 13.2 Voice & Tone
- **Professional**: Medical expertise and reliability
- **Empathetic**: Understanding patient concerns
- **Clear**: Simple, jargon-free communication
- **Trustworthy**: Honest and transparent information

## 14. Mobile-First Considerations

### 14.1 Touch Targets
- Minimum 44px touch target size
- Adequate spacing between interactive elements
- Consider thumb-friendly navigation patterns

### 14.2 Mobile Optimizations
```css
/* Mobile-specific adjustments */
@media (max-width: 640px) {
  .card-medical {
    padding: var(--space-4);
    margin: var(--space-2);
  }
  
  .btn-primary {
    width: 100%;
    padding: var(--space-4);
  }
}
```

This design system provides a comprehensive foundation for building a trustworthy, accessible, and professional hospital management system that draws inspiration from modern healthcare platforms while maintaining its own unique identity focused on appointment booking and medical care coordination.