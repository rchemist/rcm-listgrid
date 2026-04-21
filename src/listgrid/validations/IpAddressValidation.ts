import { ValidateResult, ValidationItem } from './Validation';
import { EntityForm } from '../config/EntityForm';
import { FieldValue } from '../config/Config';
import { TagValidationResult } from '../form/TagsInput/types';

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

  validate(entityForm: EntityForm, value: FieldValue, message?: string): Promise<ValidateResult> {
    const ipAddresses = value?.current as string[] | undefined;

    if (!ipAddresses || ipAddresses.length === 0) {
      return Promise.resolve(this.returnValidateResult(false, message));
    }

    for (const ip of ipAddresses) {
      if (!ip || ip.trim() === '') continue;

      if (!RegexAllowedIpAddr.test(ip.trim())) {
        const errorMessage = `유효하지 않은 IP 주소 형식입니다: ${ip}. 허용 형식: 숫자 XXX.XXX.XXX.XXX, XXX.XXX.XXX.*, XXX.XXX.*, XXX.*`;
        return Promise.resolve(this.returnValidateResult(true, errorMessage));
      }
    }

    return Promise.resolve(this.returnValidateResult(false, message));
  }
}

/**
 * TagField의 withTagValidation에서 사용할 IP 주소 검증 함수
 * 각 태그가 추가될 때 실시간으로 검증합니다.
 *
 * @param value - 검증할 IP 주소 값
 * @returns TagValidationResult
 */
export function validateIpAddressTag(value: string): TagValidationResult {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return { valid: true };
  }

  if (RegexAllowedIpAddr.test(trimmedValue)) {
    return { valid: true };
  }

  return {
    valid: false,
    message: `유효하지 않은 IP 주소 형식입니다: ${value}. 허용 형식: XXX.XXX.XXX.XXX, XXX.XXX.XXX.*, XXX.XXX.*, XXX.*`,
  };
}
