// Reads the repo-root package.json so the sample home page can display the
// published library's name/version alongside the workspace-package marker —
// proving both the workspace path (@listgrid/schema-core) and the published
// artifact (@rchemist/listgrid) are visible from apps/sample.
//
// A plain JSON import (resolveJsonModule) is simplest and robust: no fs
// access, works identically in server components and at build time.
import pkg from '../../../package.json';

export const ROOT_PACKAGE_NAME: string = pkg.name ?? '@rchemist/listgrid';
export const ROOT_PACKAGE_VERSION: string = pkg.version ?? '0.0.0';
