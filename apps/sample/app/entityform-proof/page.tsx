import { entityFormProofManifest } from '../../lib/entities/entityform-proof-manifest';
import { getSampleDatabasePath } from '../../lib/mock-backend/sqlite';
import { ResetProofButton } from './ResetProofButton';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function EntityFormProofHub() {
  const databaseKind = process.env.LISTGRID_SAMPLE_DB_PATH ? 'isolated test' : 'development';
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1>EntityForm proof lab</h1>
      <p>
        SQLite: <strong>{databaseKind}</strong> — <code>{getSampleDatabasePath()}</code>
      </p>
      <p>
        <a href="/entityform-proof/baseline">baseline form</a> ·{' '}
        <a href="/entityform-proof/list">CRUD list</a>
      </p>
      <ResetProofButton />
      <h2>Public member inventory ({entityFormProofManifest.members.length})</h2>
      <table>
        <thead>
          <tr>
            <th>member</th>
            <th>kind</th>
            <th>branches</th>
          </tr>
        </thead>
        <tbody>
          {entityFormProofManifest.members.map((entry) => (
            <tr key={entry.member} data-proof-member={entry.member}>
              <td>
                <code>{entry.member}</code>
              </td>
              <td>{entry.kind}</td>
              <td>{entry.branches.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Integration proofs</h2>
      <ul>
        {entityFormProofManifest.integrations.map((proof) => (
          <li key={proof.id} data-proof-integration={proof.id}>
            <strong>{proof.id}</strong> — {proof.status} —{' '}
            <a href={`/entityform-proof/${proof.sampleCase}`}>{proof.assertion}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
