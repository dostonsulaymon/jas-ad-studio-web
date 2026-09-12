// Tailwind v4 ships its PostCSS plugin as a separate package. Naming the v3 plugin
// ("tailwindcss") here produces no CSS at all, silently, so this stays as it is (D-035).
const config = { plugins: { "@tailwindcss/postcss": {} } };

export default config;
