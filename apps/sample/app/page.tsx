// Home page — P1 scaffold (documents/prd/sample-site-spec.md §페이즈별 성장,
// row "P1"): "스캐폴드: 홈 + 목업 백엔드 + 패키지 로드 확인 페이지".
//
// Proves two things load correctly:
//  1. workspace-package wiring — SCHEMA_CORE_VERSION from @listgrid/schema-core
//     resolves via the npm-workspaces symlink and live-reloads.
//  2. the published library version — read from the repo-root package.json.
//
// NOTE: does not import '@rchemist/listgrid' itself — the root package is
// not (yet) a workspace member and consuming the old src/ engine is out of
// P1 scope. Engine consumption is wired in P5.

import { SCHEMA_CORE_VERSION } from '@listgrid/schema-core';
import { ROOT_PACKAGE_NAME, ROOT_PACKAGE_VERSION } from '../lib/root-package';
import { EmployeeSearchDemo } from './components/EmployeeSearchDemo';

export default function HomePage() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1>@rchemist/listgrid — sample</h1>
      <p>
        Embedded sample site (<code>apps/sample</code>) — P1 scaffold: home + mock rcm backend +
        package-load-proof page.
      </p>

      <section style={{ margin: '2rem 0' }}>
        <h2>package load</h2>
        <ul>
          <li>
            workspace package <code>@listgrid/schema-core</code> — <code>SCHEMA_CORE_VERSION</code>{' '}
            = <strong>{SCHEMA_CORE_VERSION}</strong>
          </li>
          <li>
            published library <code>{ROOT_PACKAGE_NAME}</code> — version{' '}
            <strong>{ROOT_PACKAGE_VERSION}</strong>
          </li>
        </ul>
      </section>

      <section style={{ margin: '2rem 0' }}>
        <h2>mock API — employee search</h2>
        <p>
          Fetched client-side from <code>POST /api/employee/search</code> (in-memory fixture store,
          resets on restart):
        </p>
        <EmployeeSearchDemo />
      </section>
    </main>
  );
}
