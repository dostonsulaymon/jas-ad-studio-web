export default function Home() {
  // Temporary: Task 2's font verification surface. Task 7 replaces this with the hero.
  return (
    <main style={{ padding: '48px 56px' }}>
      <p style={{ fontSize: 13, letterSpacing: '0.14em', color: 'var(--color-muted)' }}>
        U+02BB RENDER CHECK
      </p>
      <h1 style={{ fontSize: 72, fontWeight: 800, letterSpacing: '-0.04em', margin: '8px 0 0' }}>
        Reklama g&#x2BB;oyasi-chi?
      </h1>
      <p style={{ fontSize: 26, margin: '16px 0 0' }}>
        Mahsulot aniq ko&#x2BB;rinadi, yorug&#x2BB;lik sirt bo&#x2BB;ylab yuradi. A&#x2BC;lo.
      </p>
      <p style={{ fontSize: 26, margin: '4px 0 0', color: 'var(--color-muted)' }}>
        Reklama g&#x2018;oyasi &#x2014; wrong codepoint, for comparison
      </p>
    </main>
  );
}
