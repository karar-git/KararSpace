/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}', './public/**/*.html'],
    theme: {
        extend: {
            fontSize: {
                xs: ['0.75rem', { lineHeight: '1.5' }],
                sm: ['0.875rem', { lineHeight: '1.5' }],
                base: ['1rem', { lineHeight: '1.7' }],
                lg: ['1.125rem', { lineHeight: '1.7' }],
                xl: ['1.25rem', { lineHeight: '1.6' }],
                '2xl': ['1.5rem', { lineHeight: '1.4' }],
                '3xl': ['1.875rem', { lineHeight: '1.3' }],
                '4xl': ['2.25rem', { lineHeight: '1.2' }],
                '5xl': ['3rem', { lineHeight: '1.1' }],
                '6xl': ['3.75rem', { lineHeight: '1.05' }],
                '7xl': ['4.5rem', { lineHeight: '1' }],
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Menlo', 'monospace'],
            },
            colors: {
                // Monochrome palette
                background: '#0a0a0a',
                foreground: '#fafafa',
                muted: '#a1a1a1',
                border: '#262626',
                'border-hover': '#404040',
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
            },
            maxWidth: {
                'content': '680px',
                'wide': '1200px',
            },
            letterSpacing: {
                'tight': '-0.02em',
                'tighter': '-0.03em',
            },
        },
    },
    future: {
        hoverOnlyWhenSupported: true,
    },
    plugins: [require('@tailwindcss/container-queries'), require('@tailwindcss/typography')],
}
