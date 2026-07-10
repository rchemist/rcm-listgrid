// Transplanted from src/listgrid/validations/IpAddressValidation.ts (0.3.x).
// The `validateIpAddressTag` free function (0.3.x TagField/withTagValidation
// helper) is a React-adjacent UI wiring concern, not a Validation — it is NOT
// transplanted here; only the IpAddressValidation class + its regex.
//
// Preserved faithfully: this validation reads `value?.current` directly (NOT
// getCurrentValue/renderType fallback) — 0.3.x never consulted
// default/fetched for this one, only the live edited array.
import type { FieldEvalContext } from '../field/eval-context';
import type { FieldValue } from '../field/types';
import { ValidateResult, ValidationItem } from '../validation';

// IP 주소 검증 정규식: XXX.XXX.XXX.XXX, XXX.XXX.XXX.*, XXX.XXX.*, XXX.*
const ipSegment = '(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])';
export const RegexAllowedIpAddr = new RegExp(
  `^(${ipSegment}\\.${ipSegment}\\.${ipSegment}\\.${ipSegment}|` +
    `${ipSegment}\\.${ipSegment}\\.${ipSegment}\\.\\*|` +
    `${ipSegment}\\.${ipSegment}\\.\\*|` +
    `${ipSegment}\\.\\*)$`,
);

/**
 * IP 주소 형식 검증 클래스
 *
 * 허용 형식:
 * - XXX.XXX.XXX.XXX (일반 IP 주소, 예: 192.168.1.1)
 * - XXX.XXX.XXX.* (와일드카드, 예: 192.168.1.*)
 * - XXX.XXX.* (와일드카드, 예: 192.168.*)
 * - XXX.* (와일드카드, 예: 192.*)
 */
export class IpAddressValidation extends ValidationItem {
  constructor(id: string = 'ip-address-format', message?: string) {
    super(
      id,
      message ??
        '유효하지 않은 IP 주소 형식입니다. 허용 형식: XXX.XXX.XXX.XXX, XXX.XXX.XXX.*, XXX.XXX.*, XXX.*',
    );
  }

  async validate(_ctx: FieldEvalContext, value: FieldValue | undefined): Promise<ValidateResult> {
    const ipAddresses = value?.current as string[] | undefined;

    if (!ipAddresses || ipAddresses.length === 0) {
      return ValidateResult.success();
    }

    for (const ip of ipAddresses) {
      if (!ip || ip.trim() === '') continue;

      if (!RegexAllowedIpAddr.test(ip.trim())) {
        const errorMessage = `유효하지 않은 IP 주소 형식입니다: ${ip}. 허용 형식: 숫자 XXX.XXX.XXX.XXX, XXX.XXX.XXX.*, XXX.XXX.*, XXX.*`;
        return ValidateResult.fail(errorMessage);
      }
    }

    return ValidateResult.success();
  }
}
