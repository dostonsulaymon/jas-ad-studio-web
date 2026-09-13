// Tailwind v4's PostCSS plugin is its own package. Naming "tailwindcss" here emits no CSS, silently.
const config = { plugins: { '@tailwindcss/postcss': {} } };

export default config;
