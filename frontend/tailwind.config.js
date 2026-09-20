import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'var(--font-primary)',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        heading: [
          'var(--font-heading)',
          'var(--font-primary)',
          'Inter',
          'sans-serif',
        ],
        mono: [
          'var(--font-mono)',
          'JetBrains Mono',
          'ui-monospace',
          'monospace',
        ],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'hsl(var(--primary) / 0.9)',
          active: 'hsl(var(--primary) / 0.8)',
          subtle: 'hsl(var(--primary) / 0.1)',
          'subtle-text': 'hsl(var(--primary))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
          border: 'hsl(var(--border))',
          'hover-border': 'hsl(var(--border))',
          dark: 'hsl(var(--card))',
          'dark-border': 'hsl(var(--border))',
          elevated: 'hsl(var(--muted))',
          'elevated-border': 'hsl(var(--border))',
        },
        modal: {
          DEFAULT: 'hsl(var(--card))',
          border: 'hsl(var(--border))',
          overlay: 'rgba(0, 0, 0, 0.5)',
        },
        header: {
          DEFAULT: 'hsl(var(--background))',
          border: 'hsl(var(--border))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--card))',
          border: 'hsl(var(--border))',
          text: 'hsl(var(--muted-foreground))',
          active: {
            bg: 'hsl(var(--secondary))',
            text: 'hsl(var(--foreground))',
            pill: 'hsl(var(--primary))',
          },
        },
        txt: {
          main: 'hsl(var(--foreground))',
          heading: 'hsl(var(--foreground))',
          muted: 'hsl(var(--muted-foreground))',
          subtle: 'hsl(var(--muted-foreground))',
          inverse: 'hsl(var(--background))',
        },
        badge: {
          emerald: {
            bg: 'rgba(16, 185, 129, 0.1)',
            text: '#10b981',
            border: 'rgba(16, 185, 129, 0.2)',
          },
          amber: {
            bg: 'rgba(245, 158, 11, 0.1)',
            text: '#f59e0b',
            border: 'rgba(245, 158, 11, 0.2)',
          },
          rose: {
            bg: 'rgba(244, 63, 94, 0.1)',
            text: '#f43f5e',
            border: 'rgba(244, 63, 94, 0.2)',
          },
          blue: {
            bg: 'rgba(59, 130, 246, 0.1)',
            text: '#3b82f6',
            border: 'rgba(59, 130, 246, 0.2)',
          },
          slate: {
            bg: 'hsl(var(--secondary))',
            text: 'hsl(var(--muted-foreground))',
            border: 'hsl(var(--border))',
          },
        },
        alert: {
          info: {
            bg: 'rgba(59, 130, 246, 0.1)',
            text: '#3b82f6',
            border: 'rgba(59, 130, 246, 0.2)',
          },
          success: {
            bg: 'rgba(16, 185, 129, 0.1)',
            text: '#10b981',
            border: 'rgba(16, 185, 129, 0.2)',
          },
          warning: {
            bg: 'rgba(245, 158, 11, 0.1)',
            text: '#f59e0b',
            border: 'rgba(245, 158, 11, 0.2)',
          },
          danger: {
            bg: 'rgba(239, 68, 68, 0.1)',
            text: '#ef4444',
            border: 'rgba(239, 68, 68, 0.2)',
          },
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(to bottom right, hsl(var(--primary)), hsl(var(--muted-foreground)))',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        'premium': '0 20px 40px -15px rgba(0, 0, 0, 0.07)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'page-enter': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'page-enter': 'page-enter 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
