// W4-2 E2E fixture — plain post-save landing page (see
// lib/entities/steps-demo.ts header). No list/ListGrid is wired up for this
// fixture (out of this task's scope); the redirect here IS the E2E's proof
// that controller.save() actually round-tripped through POST
// /api/steps-demo (college.tsx precedent: redirect-on-success, not a toast).
export default function StepsDemoDonePage() {
  return (
    <main style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1>저장 완료</h1>
    </main>
  );
}
