# Refactor Plan — Remove Host-Project Coupling

**Date:** 2026-04-24
**Target version:** `@rchemist/listgrid` 0.2.12 (patch — to avoid npm org re-approval on minor bump)
**Status:** Planning → Execution

---

## 1. Background

`@rchemist/listgrid` is advertised as a framework-agnostic CRUD engine, yet the current source contains **project-specific hardcoding** from the GJCU academic system: role name literals, API endpoint paths, and auto-injected feature behaviors. This blocks reuse by any host that uses different role names or endpoint conventions.

Interestingly, the library already contains the correct design pattern in several places:

- `ManyToOneView` accepts `modifiable.roles` from the host and evaluates them — the library does not know role names.
- `registerSmsHistoryField()` externalizes the `SmsHistoryField` class.
- `withRequiredPermissions()` at the field level is a pure user-supplied list.
- `configureRuntime()` / `getRuntimeConfig()` is a working registry pattern for bootstrap-time config.

The refactor's job is to extend these patterns consistently to the remaining hardcoded sites.

---

## 2. Goals / Non-goals

### Goals

- Remove all GJCU role literal references from runtime code (`ROLE_ADMIN`, `ROLE_STAFF`, `ROLE_SUPER_ADMIN`).
- Remove GJCU API endpoint literals from runtime code. Library supplies sensible defaults; host may override at bootstrap or per-feature.
- Convert the SMS history tab auto-injection from hardcoded behavior to opt-in registration.
- Clean comments and example strings referencing "academic" / "gjcu".
- Update `listgrid-v2` manual to reflect the new patterns.

### Non-goals

- Rewriting the permission model (`withRequiredPermissions`, `hasAnyRole`) — these are already clean.
- Externalizing `SmsHistoryField` (already done via `registerSmsHistoryField`).
- Changing the `Session` shape.
- Breaking the existing GJCU deployment — migration must be straightforward.

---

## 3. Design

### 3.1 Resolution order (uniform across all three categories)

For every host-injectable decision, the resolution order is:

```
field/feature override  >  global registry  >  library default
```

This matches the user's explicit request: "2a is default, 2b per-field override possible."

### 3.2 Category 2 — URL registry (the largest scope)

Add an `endpoints` section to `RuntimeConfig`. Each hardcoded URL in the library becomes a named entry with a sensible default. Host apps override at bootstrap via `configureRuntime({ endpoints: { ... } })` or at the feature level via existing chainable methods.

```ts
// RuntimeConfig.ts — extended
export interface ListGridEndpoints {
  excelUpload: string;                   // default '/excel-upload' (suffix on entity URL)
  excelDownloadHistory: string;          // default '/excel-download-history/add'
  customOptionByAlias: string;           // default '/option/by-alias'
  customOptionByAliases: string;         // default '/option/by-aliases'
  assetUpload: string;                   // default '/asset/upload-file'
  staticResourcePrefix: string;          // default '/static-resource/'
  smsSenderList: string;                 // default '/api/v1/sms-sender/list'
  smsNotificationSend: string;           // default '/notification/send'
  revisionApi: string;                   // default '/revision'
  noImageFallback: string;               // default '/assets/images/no-image.png'
}

export interface RuntimeConfig {
  // ... existing fields
  endpoints?: Partial<ListGridEndpoints>;
}
```

**Field-level override** where it already makes sense:

```ts
// New chainable overrides on the relevant field classes:
RevisionField.create(...).withApiUrl('/custom-revision');
CustomOptionField.create(...).withFetchUrl('/x').withBulkFetchUrl('/y');
// (others: asset, sms modal — via constructor props or setters)
```

### 3.3 Category 1 — Permission predicate injection

Role literals disappear from runtime code. Each feature exposes a predicate hook; library default is `() => true` (permissive — safer for a library).

| Feature | API |
|---|---|
| PhoneNumberField SMS send button | `field.withSmsPermission((session) => boolean)` |
| ListGrid "Open in new window" | `listGrid.withOpenInNewWindowPermission((session) => boolean)` |
| SMS history auto-inject (see §3.4) | `registerPhoneNumberSmsHistoryInject({ permission: ... })` |

Global defaults are also exposed so the host can set one predicate instead of attaching per-field:

```ts
configureRuntime({
  permissions: {
    canSendSms:          (session) => hasAnyRole(session, 'ROLE_ADMIN'),
    canOpenInNewWindow:  (session) => hasAnyRole(session, 'ROLE_ADMIN', 'ROLE_STAFF'),
  },
});
```

Field-level override wins over global. Library default is permissive (`() => true`).

### 3.4 Category 3 — SMS history tab opt-in

Current `EntityForm.tsx:217-244` auto-injects the SMS history tab whenever a `PhoneNumberField` has `enableSms` **and** the user has admin roles. This is twice-coupled: hardcoded role check + hardcoded decision to inject.

New design: the auto-injection is a registered behavior, disabled by default.

```ts
// Library API
export function registerPhoneNumberSmsHistoryInject(config: {
  enabled: boolean;
  permission?: (session?: Session) => boolean;   // defaults to () => true
  tabInfo?: Partial<TabInfo>;                    // customize label/order
}): void;

// Host bootstrap (GJCU)
registerSmsHistoryField(SmsHistoryField);        // existing
registerPhoneNumberSmsHistoryInject({
  enabled: true,
  permission: (s) => hasAnyRole(s, 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_STAFF'),
});
```

### 3.5 Category 4 — Comment/example cleanup

- `CustomOptionField.tsx:39` — remove commented `/academic/system/option` JSX.
- `FieldExtensions.ts:3` — rewrite comment to generic "SMS history field" without "academic-system".
- `i18n.ts:2` — change example to non-project-specific (e.g., `menu.users`).

---

## 4. File-by-file changes (Library — Phase 1)

| Category | File | Change |
|---|---|---|
| Runtime | `config/RuntimeConfig.ts` | Add `endpoints`, `permissions` sections with defaults |
| URL | `transfer/Type.ts:206` | Replace `url + '/excel-upload'` with `getRuntimeConfig().endpoints.excelUpload` |
| URL | `transfer/Provider/ExcelProvider.ts:29` | Use endpoint registry |
| URL | `components/fields/CustomOptionField.tsx:21-22` | Use endpoint registry; add `withFetchUrl` / `withBulkFetchUrl` |
| URL | `components/fields/view/MultipleAssetUpload.tsx:16-18` | Use endpoint registry |
| URL | `misc/index.ts:423` | Export `ASSET_PREFIX` that reads registry at call time |
| URL | `components/fields/view/SmsModal.tsx:53,109` | Use endpoint registry |
| URL | `components/revision/RevisionField.tsx:17` | Use endpoint registry; add `withApiUrl` |
| URL | `components/fields/ImageField.tsx:155,164` | Use endpoint registry |
| URL | `components/fields/MultipleAssetField.tsx:242` | Use endpoint registry |
| Role | `config/EntityForm.tsx:221` | Replace with registered permission + opt-in inject |
| Role | `components/list/ViewListGrid.tsx:204` | Replace with permission predicate |
| Role | `components/fields/view/PhoneNumberFieldView.tsx:54` | Replace with permission predicate |
| Role | `components/fields/view/PhoneNumberListView.tsx:30` | Replace with permission predicate |
| Inject | `config/EntityForm.tsx:217-244` | Gate behind `registerPhoneNumberSmsHistoryInject` registration |
| Field API | `components/fields/PhoneNumberField.tsx` | Add `withSmsPermission` and propagate to views |
| Field API | `config/ListGrid.ts` | Add `withOpenInNewWindowPermission` |
| Registry | `extensions/FieldExtensions.ts` | Add `registerPhoneNumberSmsHistoryInject` |
| Comment | `components/fields/CustomOptionField.tsx:39` | Remove `/academic/` URL from commented JSX |
| Comment | `extensions/FieldExtensions.ts:3` | Rewrite comment generically |
| Comment | `utils/i18n.ts:2` | Use non-project example |
| Index | `index.ts` | Export new registration functions and `ListGridEndpoints` type |
| Changelog | `CHANGELOG.md` | Entry for 0.3.0 |

---

## 5. Migration Strategy — GJCU host side (Phase 2)

After upgrading `@rchemist/listgrid` to 0.3.0, GJCU must register its role-based defaults and opt into the SMS history auto-inject. All existing feature behavior is preserved by this one-time bootstrap change.

### 5.1 Bootstrap additions

Add to `gjcu-academic-front/packages/shared/providers/` (or an existing bootstrap entrypoint):

```ts
// listgridBootstrap.ts
import { configureRuntime, registerPhoneNumberSmsHistoryInject } from '@rchemist/listgrid';
import { SmsHistoryField } from '@gjcu/entities/...';       // existing
import { hasAnyRole } from '@gjcu/shared/auth';             // existing

configureRuntime({
  endpoints: {
    // leave all fields out if default URLs match GJCU backend
    // (confirm during execution — likely no overrides needed)
  },
  permissions: {
    canSendSms:         (s) => hasAnyRole(s, 'ROLE_ADMIN'),
    canOpenInNewWindow: (s) => hasAnyRole(s, 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_STAFF'),
  },
});

registerSmsHistoryField(SmsHistoryField);                    // existing call
registerPhoneNumberSmsHistoryInject({
  enabled: true,
  permission: (s) => hasAnyRole(s, 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_STAFF'),
});
```

### 5.2 Entity-level overrides (optional)

Entities that need role logic different from the default can inject per-field:

```ts
// example: a page where only ROLE_SUPER_ADMIN may send SMS
new PhoneNumberField('phone', 100)
  .withSms(true)
  .withSmsPermission((s) => hasAnyRole(s, 'ROLE_SUPER_ADMIN'));
```

### 5.3 Backward compatibility

- URL defaults match current hardcoded values ⇒ no server changes required.
- If GJCU bootstrap is not updated, permission predicates default to `() => true` ⇒ SMS/Open-in-new-window buttons would become visible to all users. **Therefore, bootstrap update is mandatory at the same commit that bumps the library version.**

---

## 6. Manual Updates (Phase 3)

Files under `gjcu-academic-front/documents/manual/listgrid-v2/`:

| File | Change |
|---|---|
| `04a-fields-basic.md` | PhoneNumberField section: add `withSmsPermission` |
| `07-permissions.md` | Add "Global permission defaults" subsection covering `configureRuntime({ permissions })` |
| `09-list-grid.md` | `ListGrid` section: add `withOpenInNewWindowPermission` |
| `15-troubleshooting.md` | Add entry: "SMS button visible to wrong users → check bootstrap registration" |
| New file: `16-bootstrap.md` | Dedicated chapter on `configureRuntime`, endpoint registry, permission registry, SMS history opt-in, Next.js adapter registration (`registerSmsHistoryField` + `registerPhoneNumberSmsHistoryInject`) |
| `README.md` | Update index to include 16-bootstrap.md |

---

## 7. Versioning & Breaking Changes

- **Version:** 0.2.11 → 0.2.12 (patch bump — minor-version bumps require npm org re-approval, so we stay within 0.2.x. Content-wise this change adds public APIs and alters defaults for unconfigured hosts, which semver would normally classify as minor, but the host(s) consuming this library are coordinated via GJCU's bootstrap update, so a patch bump is safe in practice).
- **Breaking for hosts that:**
  - Use role literals other than GJCU's (was already broken for them).
  - Rely on SMS history tab auto-injection without registering the new opt-in (this is only GJCU today).
- **Non-breaking for:**
  - URL paths (defaults match current hardcoded values).
  - `Session` shape / `hasAnyRole` signature / `withRequiredPermissions` / `ManyToOneView.modifiable`.

CHANGELOG entry will explicitly list every required host-side bootstrap call.

---

## 8. Execution Order

1. **Library (Phase 1):**
   1. Extend `RuntimeConfig` with `endpoints` and `permissions`
   2. Replace URL literals with registry lookups
   3. Add field/ListGrid predicate overrides (`withSmsPermission`, `withOpenInNewWindowPermission`, etc.)
   4. Replace role literals with predicate lookups
   5. Convert SMS history auto-inject to opt-in registration
   6. Comment/example cleanup
   7. Update tests
   8. Bump version, update CHANGELOG
2. **GJCU host (Phase 2):**
   1. Update `@rchemist/listgrid` dependency
   2. Add bootstrap file with `configureRuntime` + `registerPhoneNumberSmsHistoryInject`
   3. Run type-check + dev smoke test
3. **Manual (Phase 3):**
   1. Update the files listed in §6
4. **Verify end-to-end:** GJCU admin/student/admission apps build; SMS button appears only for admins; excel import/export works; revision field works.

---

## 9. Risk & Rollback

- **Risk:** Missed hardcoded site — the 9 URLs and 4 role sites listed are from grep; there may be less-visible coupling (e.g., inline JSX attrs). Mitigation: full grep sweep after each phase.
- **Risk:** Tests lag behind — existing tests may still reference literals. Update tests alongside code.
- **Rollback:** Revert library to 0.2.11; GJCU reverts bootstrap file. Both repos commit independently, so rollback is per-repo.

---

## 10. Out of Scope (future work)

- Other URL hardcoding that may surface during implementation will be added to this plan rather than fixed ad-hoc.
- Full "library theme" decoupling (colors, Korean strings) — tracked in existing ROADMAP.md, not this plan.
