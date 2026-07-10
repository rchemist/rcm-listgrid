'use client';

// Client-side proof that the mock rcm backend loop works end-to-end in the
// browser: POST /api/employee/search on mount, render the returned rows.
// This is the same envelope (content/totalElements/totalPages/searchRequest)
// the future backend-rcm adapter will consume (P5+) — engine consumption
// itself is wired in P5, this page only proves the mock endpoint round-trips.

import { useEffect, useState } from 'react';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  status: string;
  hireDate: string;
}

interface SearchResponse {
  content: Employee[];
  totalElements: number;
  totalPages: number;
}

export function EmployeeSearchDemo() {
  const [rows, setRows] = useState<Employee[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/employee/search', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    })
      .then((res) => res.json())
      .then((body: SearchResponse) => {
        if (!cancelled) setRows(body.content);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p style={{ color: 'crimson' }}>mock API error: {error}</p>;
  if (!rows) return <p>loading employee search results…</p>;

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          {['id', 'name', 'email', 'department', 'status', 'hireDate'].map((col) => (
            <th key={col} style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '4px 8px' }}>
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td style={{ padding: '4px 8px' }}>{row.id}</td>
            <td style={{ padding: '4px 8px' }}>{row.name}</td>
            <td style={{ padding: '4px 8px' }}>{row.email}</td>
            <td style={{ padding: '4px 8px' }}>{row.department}</td>
            <td style={{ padding: '4px 8px' }}>{row.status}</td>
            <td style={{ padding: '4px 8px' }}>{row.hireDate}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
