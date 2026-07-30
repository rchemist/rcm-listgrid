import type { Session } from '../auth';
import type { FieldValue, RenderType } from './types';

/**
 * The narrow, React-free snapshot passed to every field predicate and
 * conditional value (charter C2: policy is "폼 상태(렌더 타입 create/update,
 * 다른 필드 값, 세션)의 함수").
 *
 * This REPLACES the 0.3.x `ConditionalValue`/`FieldInfoParameters`, which
 * bundled the whole `EntityForm` (a render/runtime object) into every "pure"
 * predicate call (Config.ts:69-74, EntityField.ts:188-192). Carrying EntityForm
 * was the single biggest blocker to schema-core being React-free (ADR-0003
 * §Decision 4: "세션은 인자 주입으로 관통"). EntityForm was used for exactly two
 * things — `getRenderType()` and reading sibling field values — both captured
 * here directly:
 *   - `renderType`  ← was `entityForm.getRenderType()`
 *   - `values`      ← was reading `entityForm.fields[other].value.current`
 *
 * BREAKING (consumer-facing, ADR-0003 0.5.x window): host-authored conditional
 * functions `withHidden((props) => ...)` receive `FieldEvalContext` instead of
 * the EntityForm-carrying `ConditionalValue`. MIGRATION carries the 1:1 map.
 */
export interface FieldEvalContext<TValues = Record<string, unknown>> {
  /**
   * Identity declared on the owning EntityForm. This is deliberately separate
   * from `values`: record identity must never require a synthetic `id` field.
   */
  entityId?: string | undefined;
  /** create vs update — the primary conditional discriminant. */
  renderType?: RenderType;
  /** host-injected session; permission/role reads go through ./permission. */
  session?: Session;
  /** this field's own value slice (for HAS_VALUE_* presets, dirty-aware conditions). */
  value?: FieldValue;
  /** snapshot of sibling fields' current values, for cross-field conditionals. */
  values?: TValues;
}
