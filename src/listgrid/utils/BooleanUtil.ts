export function isTrue(
  value: boolean | string | undefined | unknown,
  defaultValue?: boolean,
): boolean {
  if (value === undefined || value === null || value === '') {
    return defaultValue ?? false;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  return value === 'true' || value === '1' || value === 'on' || value === 'yes' || value === '예';
}
